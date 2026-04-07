import sys
import os

# Add backend directory to sys.path so imports like 'routes', 'database' work
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app

# Vercel needs 'app' exported at the module level
# We already have it from 'from main import app'
