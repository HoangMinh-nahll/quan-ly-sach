const mysql = require('mysql2');

const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: '',
  database: 'quan_ly_sach'
});

db.connect(err => {
  if (err) { console.error('❌ Lỗi MySQL:', err.message); return; }
  console.log('✅ Kết nối MySQL thành công!');
});

module.exports = db;