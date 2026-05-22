from app import create_app
import os

# Initialize factory configuration matching the environment
app = create_app('ProductionConfig')

if __name__ == "__main__":
    app.run()