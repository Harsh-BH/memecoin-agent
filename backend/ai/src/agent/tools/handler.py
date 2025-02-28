import json
import os
import sys
from logger import logger
from .functions import get_tools

sys.path.append(os.path.join(os.path.dirname(__file__), "."))
import functions

def parse_json(message: str):
    message = message[next(i for i, char in enumerate(message) if char in "{["):]
    try:
        return json.loads(message)
    except json.JSONDecodeError as e:
        return json.loads(message[:e.pos])

class ToolsHandler:
    def __init__(self):
        self.tools = get_tools()
        self.line_separator = "\n"

    def extract_tool_calls(self, message: str) -> tuple[str, list[dict]]:
        """
        Extracts any tool call block from the assistant's message and returns:
          - the cleaned message (with the <tool_call> block removed)
          - a list of tool call dictionaries.
        """
        print("[DEBUG] extract_tool_calls received message:")
        print(message)
        tool_calls = []
        cleaned_message = message
        if "<tool_call>" in message and "</tool_call>" in message:
            try:
                start = message.find("<tool_call>")
                end = message.find("</tool_call>") + len("</tool_call>")
                json_str = message[start + len("<tool_call>"): end - len("</tool_call>")].strip()
                print("[DEBUG] Extracted JSON string:", json_str)
                json_data = json.loads(json_str)
                if 'arguments' in json_data and 'name' in json_data:
                    tool_calls.append(json_data)
                    # Remove the tool call block so it is not processed again
                    cleaned_message = message[:start] + message[end:]
                else:
                    print("[DEBUG] Parsed JSON is missing 'name' or 'arguments':", json_data)
            except Exception as e:
                print("[DEBUG] extract_tool_calls exception:", e)
        else:
            print("[DEBUG] No <tool_call> tags found in the message.")
        return cleaned_message, tool_calls

    async def execute_tool_call(self, tool_call: dict) -> str:
        # Ensure the tool call contains a "name" key
        if "name" not in tool_call:
            raise ValueError("Tool call is missing the 'name' key. Full tool_call: " + str(tool_call))
        function_name = tool_call.get("name")
        print(f"[DEBUG] Executing tool call for function: {function_name}")
        # Import raw implementations for each function call
        from .functions import get_testnet_tokens_raw, mint_near_nft_raw, get_near_transaction_info_raw
        function_map = {
            "get_testnet_tokens": get_testnet_tokens_raw,
            "mint_near_nft": mint_near_nft_raw,
            "get_near_transaction_info": get_near_transaction_info_raw,
        }
        function_to_call = function_map.get(function_name)
        if not function_to_call:
            raise ValueError(f"Function {function_name} not found")
        function_args = tool_call.get("arguments", {})
        print(f"[DEBUG] Calling {function_name} with arguments: {function_args}")
        function_response = await function_to_call(*function_args.values())
        results = f'{{"name": "{function_name}", "content": {json.dumps(function_response)}}}'
        return results

    async def complete(self, tool_calls: list[dict], depth: int) -> str | None:
        tool_message = f"Current call depth: {depth}{self.line_separator}"
        if tool_calls:
            for tool_call in tool_calls:
                try:
                    function_response = await self.execute_tool_call(tool_call)
                    tool_message += f"<tool_response>{self.line_separator}{function_response}{self.line_separator}</tool_response>{self.line_separator}"
                except Exception as e:
                    tool_name = tool_call.get("name")
                    tool_message += (
                        f"<tool_response>{self.line_separator}"
                        f"There was an error when executing the function: {tool_name}{self.line_separator}"
                        f"Error traceback: {e}{self.line_separator}"
                        f"Please call this function again with correct arguments within XML tags <tool_call></tool_call>{self.line_separator}"
                        f"</tool_response>{self.line_separator}"
                    )
            return tool_message
        return None
