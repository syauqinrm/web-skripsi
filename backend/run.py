# run.py - Versi Perbaikan Final

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import dari direktori 'app' Anda
from app.config.database import db
from app.api.detection import detection_bp # Pastikan file dan variabel ini ada
from app.api.upload import upload_bp     # Pastikan file dan variabel ini ada

def create_app():
    """
    Application Factory Function.
    Fungsi ini bertanggung jawab untuk membuat dan mengkonfigurasi instance aplikasi Flask.
    """
    app = Flask(__name__)
    load_dotenv()

    # Konfigurasi aplikasi
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inisialisasi CORS
    CORS(app) # Mengizinkan CORS untuk semua route

    # Inisialisasi Database
    db.init_app(app)

    # --- INI BAGIAN YANG DIPERBAIKI ---
    # Daftarkan blueprint dengan prefix yang benar agar sesuai dengan panggilan frontend
    app.register_blueprint(detection_bp, url_prefix='/api/detect') # Diubah dari '/api/detection'
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    
    print("Aplikasi Flask berhasil dibuat dengan konfigurasi CORS dan routing yang benar.")
    return app


# Bagian ini hanya akan berjalan ketika Anda menjalankan `python run.py` secara langsung
if __name__ == '__main__':
    # Panggil factory untuk mendapatkan aplikasi yang sudah dikonfigurasi
    app = create_app()

    # Membuat tabel database dalam konteks aplikasi
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
    
    # Menjalankan server
    print("Starting Flask server on http://0.0.0.0:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)