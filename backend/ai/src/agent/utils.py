import nltk

# Make sure to download the punkt tokenizer if not already installed:
nltk.download('punkt', quiet=True)

def calculate_token_length(text: str) -> int:
    """Determine the token length using NLTK word tokenization."""
    return len(nltk.word_tokenize(text))
