# 📧 Panduan Implementasi Notifikasi Email & SMS

## Arsitektur Sistem

Website ini sudah dilengkapi dengan:
1. ✅ Tabel pencapaian operator dengan urutan berdasarkan persentase tertinggi
2. ✅ Grafik visual perbandingan target vs output
3. ✅ UI untuk notifikasi karyawan dengan pencapaian ≤ 50%

## Cara Mengimplementasikan Notifikasi Real

### 🔧 Backend Setup (Node.js/Express)

#### 1. Install Dependencies

```bash
npm install express nodemailer twilio dotenv cors body-parser
```

#### 2. File: `server.js`

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Konfigurasi Email (Gmail)
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Gunakan App Password, bukan password biasa
  }
});

// Konfigurasi SMS (Twilio)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Endpoint untuk mengirim notifikasi email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, employees } = req.body;
    
    // Format daftar karyawan
    const employeeList = employees.map(emp => 
      `- ${emp.name}: ${emp.percentage}% (${emp.status})`
    ).join('\n');
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject || 'Alert: Karyawan dengan Pencapaian Rendah',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #f44336;">🚨 Notifikasi Pencapaian Karyawan</h2>
          <p>Terdapat <strong>${employees.length} karyawan</strong> dengan pencapaian ≤ 50%:</p>
          <ul style="line-height: 1.8;">
            ${employees.map(emp => `
              <li>
                <strong>${emp.name}</strong>: ${emp.percentage}% 
                <span style="color: ${emp.percentage <= 30 ? '#f44336' : '#ff9800'};">
                  (${emp.percentage <= 30 ? 'KRITIS' : 'PERLU PERHATIAN'})
                </span>
              </li>
            `).join('')}
          </ul>
          <p style="margin-top: 20px; color: #666;">
            Mohon segera lakukan evaluasi dan tindak lanjut.
          </p>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email berhasil dikirim' });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk mengirim SMS
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, employees } = req.body;
    
    const message = `ALERT: ${employees.length} karyawan dengan pencapaian ≤50%: ${
      employees.map(e => `${e.name} (${e.percentage}%)`).join(', ')
    }`;
    
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    res.json({ success: true, message: 'SMS berhasil dikirim' });
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. File: `.env`

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Server
PORT=3000
```

### 📱 Cara Mendapatkan Kredensial

#### Gmail App Password:
1. Buka Google Account Settings
2. Security → 2-Step Verification (aktifkan jika belum)
3. App Passwords → Generate new password
4. Pilih "Mail" dan "Other" (nama: Performance Tracker)
5. Copy password yang dihasilkan ke `.env`

#### Twilio (untuk SMS):
1. Daftar di https://www.twilio.com
2. Dapatkan Account SID dan Auth Token dari dashboard
3. Beli nomor telepon atau gunakan trial number
4. Copy kredensial ke `.env`

### 🌐 Update Frontend

Ganti fungsi `handleSendNotification` di file HTML:

```javascript
const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendStatus('sending');

    try {
        // Kirim email
        const emailResponse = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: emailForm.email,
                subject: 'Alert: Karyawan dengan Pencapaian Rendah',
                employees: notifications.map(n => ({
                    name: n.name,
                    percentage: n.percentage,
                    status: n.severity === 'critical' ? 'KRITIS' : 'PERLU PERHATIAN'
                }))
            })
        });

        const result = await emailResponse.json();
        
        if (result.success) {
            setSendStatus('success');
            
            // Optional: Kirim SMS juga
            // await fetch('http://localhost:3000/api/send-sms', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         to: '+6281234567890', // Nomor tujuan
            //         employees: notifications.map(n => ({
            //             name: n.name,
            //             percentage: n.percentage
            //         }))
            //     })
            // });
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

## 🚀 Alternatif: SMS Gateway Indonesia

Untuk SMS lokal yang lebih murah:

### Zenziva
```javascript
const axios = require('axios');

async function sendSMS(phone, message) {
  const response = await axios.get('https://console.zenziva.net/wareguler/api/sendWA/', {
    params: {
      userkey: process.env.ZENZIVA_USERKEY,
      passkey: process.env.ZENZIVA_PASSKEY,
      to: phone,
      message: message
    }
  });
  return response.data;
}
```

### Fonnte
```javascript
async function sendSMS(phone, message) {
  const response = await axios.post('https://api.fonnte.com/send', {
    target: phone,
    message: message
  }, {
    headers: {
      'Authorization': process.env.FONNTE_TOKEN
    }
  });
  return response.data;
}
```

## 🔄 Notifikasi Otomatis

Untuk mengirim notifikasi otomatis setiap hari:

```javascript
const cron = require('node-cron');

// Jalankan setiap hari jam 8 pagi
cron.schedule('0 8 * * *', async () => {
  console.log('Checking employee performance...');
  
  // Ambil data karyawan dari database
  const employees = await getEmployeeData();
  const lowPerformers = employees.filter(e => e.percentage <= 50);
  
  if (lowPerformers.length > 0) {
    // Kirim email ke manager
    await sendEmail({
      to: 'manager@company.com',
      subject: 'Daily Performance Alert',
      employees: lowPerformers
    });
  }
});
```

## 📊 Deployment

### Vercel (Frontend)
1. Upload file HTML ke repository GitHub
2. Connect ke Vercel
3. Deploy otomatis

### Heroku/Railway (Backend)
1. Push backend ke GitHub
2. Connect ke Heroku/Railway
3. Set environment variables
4. Deploy

### Alternative: All-in-One dengan Next.js
Kombinasikan frontend dan backend dalam satu aplikasi Next.js untuk deployment yang lebih mudah.

## 🔐 Keamanan

1. **Jangan hardcode credentials** - Selalu gunakan environment variables
2. **Rate limiting** - Batasi jumlah request per IP
3. **CORS** - Hanya izinkan domain tertentu
4. **Validasi input** - Sanitize semua input dari user
5. **HTTPS** - Wajib untuk production

## 📝 Testing

```bash
# Test email endpoint
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "employees": [
      {"name": "Budi", "percentage": "42", "status": "KRITIS"}
    ]
  }'
```

---

**Catatan:** Website HTML yang sudah dibuat dapat langsung digunakan dan sudah menampilkan semua data dengan visualisasi yang lengkap. Untuk implementasi notifikasi real, ikuti panduan backend di atas.
