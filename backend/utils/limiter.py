from slowapi import Limiter
from slowapi.util import get_remote_address

# Global limiter instance to avoid circular imports between main and routes
limiter = Limiter(key_func=get_remote_address)
