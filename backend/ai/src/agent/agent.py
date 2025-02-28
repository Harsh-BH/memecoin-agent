import os
import aiohttp

from logger import logger
from config import env
from .prompt import PromptGenerator
from .tools import ToolsHandler
from .utils import calculate_token_length

class Agent:
    def __init__(self, config: dict):
        # Model settings for ChatGPT
        self.model_api_url: str = config["model"].get("api_url", "https://api.openai.com/v1/chat/completions")
        self.model_name: str = config["model"].get("model_name", "gpt-3.5-turbo")
        self.max_prompt_tokens: int = config["model"]["max_prompt_tokens"]
        self.max_completion_tokens: int = config["model"]["max_completion_tokens"]
        self.temperature: float = config["model"]["temperature"]
        self.top_p: float = config["model"]["top_p"]

        # Agent configuration
        self.max_completion_tries = config["agent"]["max_completion_tries"]
        self.max_recurse_depth: int = config["agent"]["max_recurse_depth"]
        self.stop_sequences = config["chat_ml"]["stop_sequences"]

        # Utilities
        self.prompt_generator = PromptGenerator(config)
        self.tools_handler = ToolsHandler()

    async def generate_prompt(self, message: str) -> tuple[list[dict], int]:
        system_msg, sys_tokens = self.prompt_generator.system_prompt(self.max_prompt_tokens)
        user_msg, user_tokens = self.prompt_generator.user_prompt(message, self.max_prompt_tokens - sys_tokens)
        messages = [system_msg, user_msg]
        total_tokens = sys_tokens + user_tokens
        return messages, total_tokens

    async def complete(self, messages: list[dict]) -> tuple[str, int]:
        session = aiohttp.ClientSession()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {env.openai_api_key}"
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_completion_tokens,
            "top_p": self.top_p,
        }
        tries = 0
        errors = []
        full_result = ""
        while tries < self.max_completion_tries:
            try:
                async with session.post(self.model_api_url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        response_data = await response.json()
                        result = response_data["choices"][0]["message"]["content"]
                        full_result += result
                        token_count = calculate_token_length(full_result)
                        await session.close()
                        return full_result, token_count
                    else:
                        error_text = await response.text()
                        raise RuntimeError(f"Agent::complete: Request failed with status {response.status}: {error_text}")
            except Exception as e:
                logger.debug(f"Agent::complete: Error completing prompt: {e}")
                errors.append(e)
            finally:
                tries += 1
        raise RuntimeError(f"Agent::complete: Failed to complete prompt after {tries} tries: {errors}")

    async def yield_response(self, message: str):
        messages, _ = await self.generate_prompt(message)
        logger.debug(f"Agent::yield_response: initial messages: {messages}")
        recurse_depth = 0
        while recurse_depth < self.max_recurse_depth:
            completion, _tokens = await self.complete(messages)
            logger.debug(f"Agent::yield_response: raw completion: {completion}")

            # Extract tool calls and remove the block from the response
            cleaned_completion, tool_calls = self.tools_handler.extract_tool_calls(completion)
            # If no tool calls are present, use the plain ChatGPT answer.
            if not tool_calls:
                final_response = cleaned_completion.strip()
                yield final_response
                return

            # Execute the extracted tool calls.
            tool_message = await self.tools_handler.complete(tool_calls, self.max_recurse_depth)
            # Append the cleaned assistant response to the conversation context.
            messages.append({"role": "assistant", "content": cleaned_completion})
            # Append the tool response (wrapped as an assistant message).
            tool_msg_dict = self.prompt_generator.tool_prompt(tool_message)
            messages.append(tool_msg_dict)
            logger.debug(f"Agent::yield_response: updated messages: {messages}")
            if env.debug:
                yield "Processing the gathered information..."
            recurse_depth += 1

        # If maximum recursion depth is reached, yield the final answer.
        yield messages[-1]["content"]
