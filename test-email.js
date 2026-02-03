require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Testing Email Configuration...\n');

// Konfigurasi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Test data karyawan
const testEmployees = [
  { name: 'Budi', percentage: '42', status: 'KRITIS' },
  { name: 'Nopri', percentage: '30', status: 'KRITIS' }
];

const testEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .employee { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Test Email Configuration</h1>
      <p>Performance Tracking System</p>
    </div>
    <div class="content">
      <p><strong>Selamat!</strong> Email configuration Anda berhasil! 🎉</p>
      <p>Ini adalah test email dari sistem tracking pencapaian operator.</p>
      
      <div class="alert">
        <strong>📋 Test Data:</strong>
        ${testEmployees.map(emp => `
          <div class="employee">
            • <strong>${emp.name}</strong>: ${emp.percentage}% (${emp.status})
          </div>
        `).join('')}
      </div>
      
      <p>Sistem notifikasi email sudah siap digunakan untuk production!</p>
    </div>
  </div>
</body>
</html>
`;

async function testEmail() {
  try {
    console.log('📧 Gmail User:', process.env.GMAIL_USER);
    console.log('🔐 App Password:', process.env.GMAIL_APP_PASSWORD ? '***configured***' : '❌ NOT SET');
    console.log('');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Error: GMAIL_USER atau GMAIL_APP_PASSWORD belum dikonfigurasi!');
      console.log('\n📝 Langkah-langkah:');
      console.log('1. Copy file .env.example menjadi .env');
      console.log('2. Isi GMAIL_USER dengan email Gmail Anda');
      console.log('3. Generate App Password dari Google Account Settings');
      console.log('4. Isi GMAIL_APP_PASSWORD dengan App Password tersebut');
      process.exit(1);
    }
    
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');
    
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: {
        name: 'Performance Tracking System',
        address: process.env.GMAIL_USER
      },
      to: process.env.GMAIL_USER, // Kirim ke diri sendiri
      subject: '🧪 Test Email - Performance Tracking System',
      html: testEmailTemplate,
      text: 'Test email dari Performance Tracking System. Jika Anda menerima email ini, konfigurasi berhasil!'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Sent to:', process.env.GMAIL_USER);
    console.log('\n🎉 Selamat! Email configuration berhasil!');
    console.log('💡 Cek inbox Anda untuk melihat test email.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Pastikan 2-Step Verification aktif di Google Account');
    console.log('2. Generate App Password dari: https://myaccount.google.com/apppasswords');
    console.log('3. Gunakan App Password (16 digit), BUKAN password Gmail biasa');
    console.log('4. Pastikan tidak ada spasi di App Password');
    console.log('5. Coba disable antivirus/firewall sementara');
  }
}

testEmail();
