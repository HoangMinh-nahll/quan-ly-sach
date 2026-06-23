const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Thay bằng mật khẩu MySQL của bạn
  database: 'quan_ly_sach'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Lỗi kết nối database:', err.message);
    return;
  }
  console.log('✅ Kết nối database thành công!');
});

module.exports = db;