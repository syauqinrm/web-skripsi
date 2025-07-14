# Coffee Bean Detection System

Sistem deteksi roasting biji kopi secara real-time menggunakan teknologi YOLOv8 dengan integrasi ESP32-CAM untuk live stream detection.

## 🌟 Main Feature

- Real-time Detection: Deteksi tingkat roasting biji kopi secara langsung
- ESP32-CAM Integration: Live streaming dan capture dari ESP32-CAM
- YOLOv8 Model: Menggunakan model AI terdepan untuk deteksi objek
- Web Dashboard: Interface web yang responsif dan user-friendly
- Database Storage: Penyimpanan hasil deteksi dengan metadata lengkap
- Multiple Capture Methods: Berbagai cara capture gambar dari live stream

---

## Systems Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ESP32-CAM     │───▶│  Flask Backend  │───▶│  React Frontend │
│  (Hardware)     │    │   (Python)      │    │   (Vite + JS)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │              ┌─────────────────┐                │
        │              │  YOLOv8 Model   │                │
        │              │  (Detection)    │                │
        │              └─────────────────┘                │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Live Stream    │    │   Database      │    │  User Interface │
│  Video Feed     │    │  (SQLite)       │    │  (Dashboard)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

# Web Skripsi Setup & Installation Guide

This project consists of two main parts:

- **Backend:** Flask (Python)
- **Frontend:** React with Vite & Tailwind CSS

## 📦Prerequisites

- [Python 3.13+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd web-skripsi
```

---

## 2. Backend Setup (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Run Flask Server

```bash
flask run
```

or

```
python run.py
```

---

## 3. Frontend Setup (React, Vite, Tailwind)

```bash
cd ../frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

---

## 4. Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## Notes

- Adjust the API endpoint in the frontend if needed.
- For production, refer to deployment guides for Flask and Vite.

---

## 👨‍💻 Author

Syauqi Nur Muhammad and M. Hilmy Irfan Maulana
