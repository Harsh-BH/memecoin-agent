import logging
from config import env

class _Logger:
    instance: logging.Logger

    def __init__(self, debug=False):
        logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.DEBUG if debug else logging.INFO)
        # Hide verbose logs from dependencies
        for lib in ["asyncio", "urllib3", "httpx", "httpcore", "aiohttp"]:
            logging.getLogger(lib).setLevel(logging.WARNING)
        self.instance = logger

    def warn(self, message):
        self.instance.warning(message)

    def debug(self, message):
        self.instance.debug(message)

    def info(self, message):
        self.instance.info(message)

    def error(self, message):
        self.instance.error(message)

logger = _Logger(env.debug)
