from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'app/static/uploads'
    RESULTS_FOLDER = 'app/static/results'