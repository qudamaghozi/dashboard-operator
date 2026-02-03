const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files dan HTML
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'employee-performance-tracker.html'));
});

app.get('/qrcode', (req, res) => {
  res.sendFile(path.join(__dirname, 'qrcode-scanner-v2.html'));
});

// Konfigurasi Email Transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Template email HTML yang profesional
const createEmailTemplate = (employees) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .alert-box { background: white; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .alert-box.critical { border-left-color: #f44336; background: #ffebee; }
        .alert-box.warning { border-left-color: #ff9800; background: #fff3e0; }
        .employee-name { font-weight: bold; font-size: 1.1em; color: #333; }
        .percentage { font-size: 1.3em; font-weight: bold; }
        .percentage.critical { color: #f44336; }
        .percentage.warning { color: #ff9800; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Alert Pencapaian Karyawan</h1>
          <p>Notifikasi Performa Rendah</p>
        </div>
        
        <div class="content">
          <p>Yth. Manager,</p>
          <p>Terdapat <strong>${employees.length} karyawan</strong> dengan pencapaian ≤ 50% yang memerlukan perhatian khusus:</p>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Karyawan</th>
                <th>Pencapaian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map((emp, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${emp.name}</strong></td>
                  <td>
                    <span class="percentage ${emp.percentage <= 30 ? 'critical' : 'warning'}">
                      ${emp.percentage}%
                    </span>
                  </td>
                  <td>
                    <span style="color: ${emp.percentage <= 30 ? '#f44336' : '#ff9800'};">
                      ${emp.percentage <= 30 ? '🚨 KRITIS' : '⚠️ PERLU PERHATIAN'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="margin-top: 20px;">
            Email ini dikirim secara otomatis oleh Sistem Tracking Pencapaian Operator.
          </p>
        </div>
        
        <div class="footer">
          <p>© 2026 Performance Tracking System</p>
          <p style="font-size: 0.9em; margin-top: 10px;">
            Untuk informasi lebih lanjut, hubungi HRD Department
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Endpoint untuk mengirim email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, employees, customMessage } = req.body;
    
    // Validasi input
    if (!to || !employees || employees.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email tujuan dan data karyawan harus diisi' 
      });
    }
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Format email tidak valid' 
      });
    }
    
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: {
        name: 'Performance Tracking System',
        address: process.env.GMAIL_USER
      },
      to: to,
      subject: `🚨 Alert: ${employees.length} Karyawan dengan Pencapaian Rendah`,
      html: createEmailTemplate(employees),
      text: `
        ALERT PENCAPAIAN KARYAWAN
        
        Terdapat ${employees.length} karyawan dengan pencapaian ≤ 50%:
        
        ${employees.map((emp, i) => `${i+1}. ${emp.name}: ${emp.percentage}% (${emp.percentage <= 30 ? 'KRITIS' : 'PERLU PERHATIAN'})`).join('\n')}
        
        ${customMessage || 'Mohon segera lakukan evaluasi dan tindak lanjut.'}
      `
    };
    
    // Kirim email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    
    res.json({ 
      success: true, 
      message: 'Email berhasil dikirim',
      messageId: info.messageId,
      recipients: to
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Pastikan GMAIL_USER dan GMAIL_APP_PASSWORD sudah dikonfigurasi dengan benar di file .env'
    });
  }
});

// SMS endpoint disabled: SMS via Twilio removed to keep notifications by email only
app.post('/api/send-sms', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'SMS service disabled',
    message: 'Fitur SMS dinonaktifkan. Gunakan endpoint /api/send-email untuk notifikasi.'
  });
});

// Endpoint untuk test koneksi email
app.get('/api/test-email', async (req, res) => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    
    res.json({ 
      success: true, 
      message: 'Koneksi email berhasil! Gmail SMTP siap digunakan.',
      user: process.env.GMAIL_USER
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Pastikan GMAIL_USER dan GMAIL_APP_PASSWORD sudah benar di file .env'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Performance Tracking API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      sendEmail: '/api/send-email',
      testEmail: '/api/test-email'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/send-email',
      'GET /api/test-email',
      'GET /api/health'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Performance Tracking API Server                   ║
║  📡 Running on: http://localhost:${PORT}              ║
║                                                       ║
║  Available Endpoints:                                 ║
║  • POST /api/send-email    - Kirim notifikasi email   ║
║  • POST /api/send-sms      - Kirim notifikasi SMS     ║
║  • GET  /api/test-email    - Test koneksi email       ║
║  • GET  /api/health        - Health check             ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  console.log('\n📝 Jangan lupa konfigurasi .env file dengan:');
  console.log('   - GMAIL_USER=your-email@gmail.com');
  console.log('   - GMAIL_APP_PASSWORD=your-app-password');
  console.log('\n💡 Test koneksi email: GET http://localhost:' + PORT + '/api/test-email\n');
});

module.exports = app;
