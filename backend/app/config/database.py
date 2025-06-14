from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

def configure_database(app):
    """Configure database with Flask app"""
    # Load DATABASE_URL from environment or use default
    database_url = os.getenv('DATABASE_URL', 'postgresql://kopiuser:kopipassword@localhost:5432/kopidb')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    return db