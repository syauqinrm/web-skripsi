from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .detection import Detection

def init_app(app):
    db.init_app(app)