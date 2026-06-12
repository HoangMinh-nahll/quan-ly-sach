const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../config/db');

router.get('/', (req, res) => {
  db.query('SELECT id, ho_ten, email, role, created_at FROM users ORDER BY id DESC',
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, total: results.length, data: results });
    }
  );
});

router.post('/register', async (req, res) => {
  const { ho_ten, email, mat_khau } = req.body;
  if (!ho_ten || !email || !mat_khau)
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ!' });
  const hashed = await bcrypt.hash(mat_khau, 10);
  db.query('INSERT INTO users (ho_ten, email, mat_khau) VALUES (?,?,?)',
    [ho_ten, email, hashed],
    (err, result) => {
      if (err) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
      res.json({ success: true, message: 'Đăng ký thành công!', id: result.insertId });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, mat_khau } = req.body;
  if (!email || !mat_khau)
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ!' });
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
    const match = await bcrypt.compare(mat_khau, results[0].mat_khau);
    if (!match)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
    const { mat_khau: _, ...user } = results[0];
    res.json({ success: true, message: 'Đăng nhập thành công!', data: user });
  });
});

module.exports = router;