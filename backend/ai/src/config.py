import os
import yaml
from dotenv import load_dotenv

class _Config:
    debug: bool
    ai_config: dict

    near_rpc_url: str
    near_account_id: str
    near_account_private_key: str

    openai_api_key: str  # ChatGPT API key

    def __init__(self):
        load_dotenv()

        self.debug = os.getenv("DEBUG", "False") == "True"

        # Load AI configuration (includes ChatGPT settings) from YAML
        ai_config_path = os.getenv("GENERAL_CONFIG_PATH", "config/general.yaml")
        with open(ai_config_path) as ai_config_file:
            self.ai_config = yaml.safe_load(ai_config_file)


        self.near_rpc_url = os.getenv("NEAR_RPC_URL")
        self.near_account_id = os.getenv("NEAR_ACCOUNT_ID")
        self.near_account_private_key = os.getenv("NEAR_ACCOUNT_PRIVATE_KEY")

        # Load the OpenAI API key required for ChatGPT
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

env = _Config()
