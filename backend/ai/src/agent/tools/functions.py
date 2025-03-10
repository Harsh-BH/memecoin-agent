import requests
from requests.auth import HTTPBasicAuth
from langchain.tools import tool
from langchain_core.utils.function_calling import convert_to_openai_tool
from py_near.account import Account
from py_near.dapps.core import NEAR
from py_near.providers import JsonProvider

from config import env

@tool()
def get_testnet_tokens(receiver: str):

    """Send some Near testnet tokens to a Near account
    Args:
        receiver (str): The receiver of the tokens
    Returns:
        String explaining what happened"""

async def get_testnet_tokens_raw(receiver: str) -> str:
    print(f"[DEBUG] get_testnet_tokens_raw called with receiver: {receiver}")
    response = requests.post(
        "https://near-faucet.io/api/faucet/tokens",
        json={"contractId":"near_faucet","receiverId": receiver,"amount":"10000000000000000000000000"}
    )
    data = response.json()
    print("[DEBUG] data is recieved")

    error_message = data.get('error')
    if error_message is None:
        return f"Successfully sent 10 Near tokens with transaction hash {data.get('txh')}"
    else:
        return f"An error occured: {error_message}"

# @tool()
# def google_search(query: str):
#     """Search Google results, call this if you need more information on a subject
#     Args:
#         query (str): The query to search for
#     Returns:
#         list: A list of dictionaries containing the title, link, snippet, and other information about the search results."""

# async def google_search_raw(query: str) -> list[dict]:
#     basic_auth = HTTPBasicAuth(env.oxylabs_username, env.oxylabs_password)

#     response = requests.post(
#         'https://realtime.oxylabs.io/v1/queries',
#         auth=basic_auth,
#         json={"source": "google_search", "query": query, "parse": True}
#     )

#     data = response.json()
#     organic_results = data.get('results')[0].get('content').get('results').get('organic')
#     return [{ "pos": r['pos'], "url": r['url'], "desc": r['desc'], "title": r['title'] } for r in organic_results]

@tool()
def mint_near_nft(receiver: str):
    """Create an NFT and send it to a Near account
    Args:
        receiver (str): The receiver of the tokens
    Returns:
        String explaining what happened"""

async def mint_near_nft_raw(receiver: str) -> str:
    account = Account(env.near_account_id, env.near_account_private_key, env.near_rpc_url)
    await account.startup()

    existing_nfts = await account.view_function(env.near_account_id, "nft_tokens", {})

    result = await account.function_call(
        env.near_account_id,
        "nft_mint",
        {
            "token_id": str(len(existing_nfts.result)),  # Generating a new ID incrementally
            "receiver_id": receiver,
            "token_metadata": {
            "title": "AI minted NFT",
                "description": "Hello World from nearaibot.testnet!",
                "media": "https://ipfs.io/ipfs/QmQMZcwxrYF499EL1gvJ5Anw4UqAugoYv5XmQwmnoFS3eM",
                "copies": 1
            }
        },
        amount=int(0.1 * NEAR)
    )
    status = result.status
    if status.get('SuccessValue', None) is not None:
        return f"Successfully minted and sent NFT with transaction hash {result.transaction.hash}"
    elif status.get('Failure', None) is not None:
        return f"An error occured: {status.get('Failure')}"
    else:
        return "An unknown error occured"

@tool()
def get_near_transaction_info(tx_hash: str, sender_account: str):
    """Get information about a Near transaction
    Args:
        tx_hash (str): Hash of the transaction
        sender_account (str): Account that sent the transaction"""

async def get_near_transaction_info_raw(tx_hash: str, sender_account: str):
    near_provider = JsonProvider(env.near_rpc_url)

    tx = await near_provider.json_rpc("EXPERIMENTAL_tx_status", [tx_hash, sender_account])
    return tx

TOOLS = [get_testnet_tokens, mint_near_nft, get_near_transaction_info]

def get_tools() -> list:
    return [convert_to_openai_tool(t) for t in TOOLS]
