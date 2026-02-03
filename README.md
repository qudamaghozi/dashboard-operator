# 📊 Sistem Tracking Pencapaian Operator

Sistem monitoring dan tracking pencapaian karyawan dengan notifikasi email dan SMS otomatis.

## ✨ Fitur Utama

1. **📈 Dashboard Pencapaian**
   - Tabel ranking operator berdasarkan persentase pencapaian tertinggi
   - Progress bar visual untuk setiap karyawan
   - Status badge (Sangat Baik, Baik, Perlu Perhatian, Kritis)
   - Statistik ringkasan (total karyawan, performa sangat baik, perlu perhatian, rata-rata)

2. **📊 Visualisasi Grafik**
   - Grafik batang perbandingan Target vs Output
   - Warna dinamis berdasarkan performa
   - Interactive chart dengan Chart.js

3. **🔔 Notifikasi Otomatis**
   - Deteksi otomatis karyawan dengan pencapaian ≤ 50%
   - Notifikasi email dengan template HTML profesional
   - Dukungan SMS via Twilio (opsional)
   - Alert level (Warning / Critical)

## 🚀 Quick Start

### 1. Setup Frontend (Website)

File `employee-performance-tracker.html` sudah siap digunakan:

```bash
# Buka langsung di browser
open employee-performance-tracker.html

# Atau jalankan dengan Python HTTP server
python -m http.server 8000
# Akses: http://localhost:8000/employee-performance-tracker.html
```

**Website sudah berfungsi 100%** dengan data dari Excel, termasuk:
- ✅ Tabel ranking dengan urutan pencapaian tertinggi
- ✅ Grafik perbandingan target vs output
- ✅ Notifikasi untuk karyawan dengan pencapaian ≤ 50%

### 2. Setup Backend (untuk Email & SMS) - Opsional

Backend diperlukan jika ingin **mengirim email/SMS secara real**.

#### Instalasi

```bash
# Install dependencies
npm install

# Copy file .env.example menjadi .env
cp .env.example .env

# Edit .env dan isi kredensial Anda
nano .env
```

#### Konfigurasi Gmail

1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Aktifkan **2-Step Verification**
3. Buka **App Passwords**
4. Generate password untuk **Mail** > **Other** (nama: Performance Tracker)
5. Copy 16-digit password
6. Paste ke file `.env` di `GMAIL_APP_PASSWORD`

#### Konfigurasi .env

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
PORT=3000
```

#### Test Email Configuration

```bash
# Test apakah email berfungsi
npm run test

# Jika berhasil, Anda akan menerima test email
```

#### Jalankan Server

```bash
# Development
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### 1. Send Email Notification

**POST** `/api/send-email`

Request Body:
```json
{
  "to": "manager@company.com",
  "employees": [
    {
      "name": "Budi",
      "percentage": "42",
      "status": "KRITIS"
    },
    {
      "name": "Nopri",
      "percentage": "30",
      "status": "KRITIS"
    }
  ],
  "customMessage": "Mohon segera evaluasi" // opsional
}
```

Response:
```json
{
  "success": true,
  "message": "Email berhasil dikirim",
  "messageId": "xxxxx",
  "recipients": "manager@company.com"
}
```

### 2. Send SMS Notification (Opsional)

**POST** `/api/send-sms`

Request Body:
```json
{
  "to": "+6281234567890",
  "employees": [
    {
      "name": "Budi",
      "percentage": "42"
    }
  ]
}
```

### 3. Test Email Connection

**GET** `/api/test-email`

Response:
```json
{
  "success": true,
  "message": "Koneksi email berhasil!",
  "user": "your-email@gmail.com"
}
```

### 4. Health Check

**GET** `/api/health`

## 🔧 Integrasi Frontend dengan Backend

Update fungsi `handleSendNotification` di file HTML:

```javascript
const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendStatus('sending');

    try {
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: emailForm.email,
                employees: notifications.map(n => ({
                    name: n.name,
                    percentage: n.percentage,
                    status: n.severity === 'critical' ? 'KRITIS' : 'PERLU PERHATIAN'
                }))
            })
        });

        const result = await response.json();
        
        if (result.success) {
            setSendStatus('success');
        } else {
            setSendStatus('error');
        }
    } catch (error) {
        console.error('Error:', error);
        setSendStatus('error');
    }

    setTimeout(() => setSendStatus(null), 5000);
};
```

## 📱 Setup SMS (Twilio) - Opsional

1. Daftar di [Twilio](https://www.twilio.com)
2. Dapatkan Account SID dan Auth Token
3. Beli nomor telepon atau gunakan trial number
4. Tambahkan ke `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 📊 Data Karyawan

Data karyawan diambil dari file Excel `Soal_Test_Programmer.xlsx`:

| No | Nama | Target | Output | Pencapaian |
|----|------|--------|--------|------------|
| 1 | Abdul | 1,000,000 | 960,000 | 96% |
| 2 | Budi | 1,000,000 | 420,000 | 42% ⚠️ |
| 3 | Beni | 1,000,000 | 1,100,000 | 110% |
| 4 | Rian | 1,000,000 | 950,000 | 95% |
| 5 | Romi | 1,000,000 | 1,000,500 | 100.05% |
| 6 | Farhan | 1,000,000 | 550,000 | 55% |
| 7 | Krisna | 1,000,000 | 953,000 | 95.3% |
| 8 | Fajar | 1,000,000 | 1,053,000 | 105.3% |
| 9 | Heri | 1,000,000 | 876,300 | 87.63% |
| 10 | Nopri | 1,000,000 | 300,000 | 30% 🚨 |
| 11 | Dermawan | 1,000,000 | 989,000 | 98.9% |

**Karyawan dengan pencapaian ≤ 50%:**
- Budi: 42% (Perlu Perhatian)
- Nopri: 30% (Kritis)

## 🎨 Fitur UI/UX

- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Gradient modern dan professional
- ✅ Animasi smooth
- ✅ Progress bar dengan warna dinamis
- ✅ Badge ranking (emas, perak, perunggu)
- ✅ Grafik interaktif dengan Chart.js
- ✅ Status badge berwarna
- ✅ Notifikasi panel yang informatif

## 🔐 Keamanan

- ✅ Environment variables untuk credentials
- ✅ Input validation
- ✅ CORS protection
- ✅ Error handling
- ✅ Rate limiting (dapat ditambahkan)

## 📦 File Structure

```
project/
├── employee-performance-tracker.html  # Frontend website (siap pakai)
├── server.js                          # Backend API server
├── package.json                       # Dependencies
├── .env.example                       # Template environment variables
├── test-email.js                      # Test script
├── IMPLEMENTATION_GUIDE.md            # Panduan lengkap
└── README.md                          # Dokumentasi
```

## 🚀 Deployment

### Frontend (HTML)

1. **GitHub Pages**
   - Upload file HTML ke repository
   - Enable GitHub Pages
   - Akses via `https://username.github.io/repo-name`

2. **Vercel**
   - Connect repository ke Vercel
   - Deploy otomatis
   - Custom domain support

3. **Netlify**
   - Drag & drop file atau connect Git
   - SSL otomatis

### Backend (Node.js)

1. **Heroku**
   ```bash
   heroku create performance-tracker-api
   heroku config:set GMAIL_USER=your-email@gmail.com
   heroku config:set GMAIL_APP_PASSWORD=xxxx
   git push heroku main
   ```

2. **Railway**
   - Connect GitHub repository
   - Set environment variables
   - Deploy otomatis

3. **VPS (DigitalOcean, AWS, etc.)**
   ```bash
   # Clone repository
   git clone your-repo
   cd your-repo
   
   # Install dependencies
   npm install
   
   # Setup PM2
   npm install -g pm2
   pm2 start server.js --name "performance-api"
   pm2 startup
   pm2 save
   ```

## 🔄 Notifikasi Otomatis Harian

Tambahkan cron job untuk notifikasi otomatis:

```javascript
const cron = require('node-cron');

// Jalankan setiap hari jam 8 pagi
cron.schedule('0 8 * * *', async () => {
  const lowPerformers = employees.filter(e => e.percentage <= 50);
  
  if (lowPerformers.length > 0) {
    await sendEmail({
      to: 'manager@company.com',
      employees: lowPerformers
    });
  }
});
```

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Check dokumentasi di `IMPLEMENTATION_GUIDE.md`
2. Test email dengan `npm run test`
3. Check server logs
4. Verify `.env` configuration

## 📝 License

MIT License - Bebas digunakan untuk keperluan komersial dan personal.

## 🎯 Checklist Implementasi

- [x] Website dengan tabel ranking pencapaian
- [x] Grafik perbandingan target vs output
- [x] Deteksi karyawan dengan pencapaian ≤ 50%
- [x] UI notifikasi panel
- [x] Backend API untuk email
- [x] Template email profesional
- [x] SMS support (opsional)
- [x] Test script
- [x] Dokumentasi lengkap
- [x] Deployment guide

## ⭐ Features Tambahan (Future)

- [ ] Dashboard admin untuk update data
- [ ] Export laporan ke PDF/Excel
- [ ] Real-time monitoring dengan WebSocket
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Machine learning untuk prediksi performa

---

**Dibuat dengan ❤️ untuk monitoring performa karyawan yang lebih efektif**
