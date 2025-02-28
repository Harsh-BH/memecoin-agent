import datetime
from pydantic import BaseModel
import yaml
import json

from .utils import calculate_token_length
from .tools import get_tools, ToolCallSchema

class SystemPromptSchema(BaseModel):
    """Description of the agent's system prompt."""
    Role: str
    Objective: str
    Tools: str

class PromptGenerator:
    def __init__(self, config: dict):
        # Chat ML config
        self.user_prepend = config["chat_ml"]["user_prepend"]
        self.user_append = config["chat_ml"]["user_append"]
        self.line_separator = "\n"

        # Load and parse the system prompt template from YAML
        with open(config["agent"]["system_prompt_template"], "r") as system_prompt_file:
            yaml_content = yaml.safe_load(system_prompt_file)
            self.system_prompt_schema = SystemPromptSchema(
                Role=yaml_content.get("Role", ""),
                Objective=yaml_content.get("Objective", ""),
                Tools=yaml_content.get("Tools", ""),
            )

    def system_prompt(self, token_limit: int) -> tuple[dict, int]:
        """Build the system prompt message (role: system) within a token limit."""
        now = datetime.datetime.now().strftime("%A, %B %d, %Y @ %H:%M:%S")
        variables = {
            "date": now,
            "tools": json.dumps(get_tools()),
            "tool_schema": json.dumps(ToolCallSchema.model_json_schema()),
        }
        content = ""
        for _, value in self.system_prompt_schema.dict().items():
            formatted_value = value.format(**variables).replace("\n", " ")
            content += f"{formatted_value} "
        content = content.strip()
        used_tokens = calculate_token_length(content)
        if used_tokens > token_limit:
            raise OverflowError("PromptGenerator::system_prompt: exceeding token limit")
        final_content = f"{self.user_prepend} {content} {self.user_append}".strip()
        return {"role": "system", "content": final_content}, used_tokens

    def user_prompt(self, message: str, token_limit: int) -> tuple[dict, int]:
        """Build the user prompt message (role: user) within a token limit."""
        content = f"{self.user_prepend} {message} {self.user_append}".strip()
        used_tokens = calculate_token_length(content)
        if used_tokens > token_limit:
            raise OverflowError("PromptGenerator::user_prompt: exceeding token limit")
        return {"role": "user", "content": content}, used_tokens

    def tool_prompt(self, tool_message: str) -> dict:
        """Build a tool message (role: assistant) containing tool output."""
        content = f"{tool_message}"
        return {"role": "assistant", "content": content}
