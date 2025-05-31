# Alur Kerja Sistem Monitoring Deteksi Tingkat Roasting Biji Kopi (YOLOv8 + Flask + React + PostgreSQL)
---

# 🔧 **Spesifikasi Sistem:**

* **Model deteksi:** YOLOv8 (klasifikasi + bounding box)
* **Backend:** Flask (Python)
* **Frontend:** React.js (web interface)
* **Database:** PostgreSQL
* **Alat:** Arduino Uno + Kamera (hanya mengambil dan mengirim gambar)
* **Tingkat Roasting:** Green Bean, Light Roast, Medium Roast, dan Dark Roast.

---

# 🧭 **Alur Kerja Sistem Secara Rinci:**

---

## ✅ **1. Akuisisi Gambar dari Kamera**

### 📍 Komponen:

* Arduino Uno (bertugas sebagai pengendali)
* Kamera (modul eksternal – contoh: OV7670 atau kamera yang punya antarmuka Wi-Fi)
* Modul tambahan (karena Arduino Uno tidak punya kemampuan native ambil dan kirim gambar → biasanya butuh ESP32-CAM atau Wi-Fi shield)

### 📦 Proses:

1. Arduino mengaktifkan kamera untuk mengambil gambar (biasanya JPEG)
2. Gambar dikirim ke backend:

   * Lewat **HTTP POST multipart/form-data** (jika pakai modul Wi-Fi)
   * Atau lewat serial ke modul Wi-Fi lain (jika Arduino Uno tidak bisa kirim HTTP langsung)

### 📁 Format Data:

```http
POST /upload-image HTTP/1.1
Content-Type: multipart/form-data
Body:
{
  "image": <file.jpg>
}
```

---

## ✅ **2. Backend Flask Menerima & Menyimpan Gambar**

### 📦 Proses:

1. Flask menerima file dari request `POST /upload-image`

2. File gambar disimpan sementara di direktori lokal, misal:

   ```
   uploads/2025-05-31_10-15-00.jpg
   ```

3. Backend mencatat waktu (`timestamp`) saat gambar diterima

### 📁 Contoh kode:

```python
file = request.files['image']
filename = f"uploads/{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
file.save(filename)
```

---

## ✅ **3. YOLOv8 Mendeteksi Roasting di Gambar**

### 📦 Proses:

1. Flask memuat model YOLOv8 (`model_roasting.pt`) saat server dijalankan

2. Gambar yang diterima dikirim ke model:

   ```python
   results = model(filename)  # filename = path to image
   ```

3. YOLOv8 mengembalikan list objek:

   * Koordinat bounding box (`x1, y1, x2, y2`)
   * Kelas roasting (misal: `green_bean`, `medium_roast`)
   * Confidence (tingkat keyakinan)

### 🧾 Contoh output YOLOv8:

```json
[
  {
    "roast_class": "medium_roast",
    "confidence": 0.89,
    "box": [100, 120, 180, 200]
  },
  {
    "roast_class": "dark_roast",
    "confidence": 0.91,
    "box": [210, 130, 270, 190]
  }
]
```

---

## ✅ **4. Gambar Dianotasi (Bounding Box + Label)**

### 📦 Proses:

* Gambar diberi bounding box dan label (`roast_class + confidence`) menggunakan OpenCV
* Hasil anotasi disimpan sebagai gambar baru:

  ```
  results/2025-05-31_10-15-00_annotated.jpg
  ```

### 📁 Contoh kode:

```python
cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
cv2.putText(img, "medium_roast 89%", (x1, y1-10), ...)
cv2.imwrite("results/filename_annotated.jpg", img)
```

---

## ✅ **5. Data Disimpan ke Database PostgreSQL**

### 📦 Data yang disimpan:

* Path gambar asli
* Path gambar hasil anotasi
* Timestamp
* JSON list deteksi:

  * `roast_class`
  * `confidence`
  * `bounding_box`

### 🧾 Contoh struktur tabel:

**Table: detection\_results**

| id | image\_path    | result\_image  | timestamp           | detections (JSON)             |
| -- | -------------- | -------------- | ------------------- | ----------------------------- |
| 1  | uploads/xx.jpg | results/xx.jpg | 2025-05-31 10:15:00 | \[{"roast\_class": ..., ...}] |

---

## ✅ **6. Frontend React.js Mengambil & Menampilkan Hasil**

### 📦 Proses:

1. React melakukan **fetch** ke endpoint Flask:

   * `/api/latest-result`
   * atau polling tiap 2–5 detik

2. Backend mengirim response:

```json
{
  "image_url": "http://server/results/2025-05-31_10-15-00_annotated.jpg",
  "timestamp": "2025-05-31T10:15:00",
  "detections": [
    {
      "roast_class": "medium_roast",
      "confidence": 0.89,
      "box": [100, 120, 180, 200]
    },
    ...
  ]
}
```

3. React.js menampilkan:

   * Gambar hasil deteksi (sudah ada bounding box)
   * Informasi:

     * Waktu deteksi
     * Jumlah biji kopi per kelas
     * Confidence masing-masing kelas

---

## ✅ **7. Tampilan Web (Frontend)**

### 🖥️ Contoh elemen UI di React:

```
🕒 Waktu Deteksi: 2025-05-31 10:15:00
📦 Jumlah Biji: 3
- Green Bean: 1 (92%)
- Medium Roast: 1 (89%)
- Dark Roast: 1 (91%)

[ Gambar hasil deteksi dengan bounding box ]
```

### 🖼️ Gambar:

```jsx
<img src="http://server/results/2025-05-31_10-15-00_annotated.jpg" alt="hasil deteksi" />
```

---

## ✅ RANGKUMAN ALUR SEDERHANA

1. **Arduino + Kamera** → ambil gambar → kirim ke Flask
2. **Flask** → terima gambar → proses dengan YOLOv8
3. **YOLOv8** → hasil deteksi (kelas + box + confidence)
4. **Flask** → simpan hasil ke DB + anotasi gambar
5. **React.js** → ambil data → tampilkan gambar + info deteksi

---