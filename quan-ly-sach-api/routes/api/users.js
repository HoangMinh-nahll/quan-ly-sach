const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../../config/db');  // Đổi đường dẫn

// GET all users
router.get('/', (req, res) => {
  db.query('SELECT id, ho_ten, email, role, created_at FROM users ORDER BY id DESC',
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, total: results.length, data: results });
    }
  );
});

// GET user by ID
router.get('/:id', (req, res) => {
  db.query('SELECT id, ho_ten, email, role, created_at FROM users WHERE id = ?', 
    [req.params.id], 
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
      }
      res.json({ success: true, data: results[0] });
    }
  );
});

// Register user
router.post('/register', async (req, res) => {
  const { ho_ten, email, mat_khau, role = 'user' } = req.body;
  
  if (!ho_ten || !email || !mat_khau) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }
  
  try {
    const hashed = await bcrypt.hash(mat_khau, 10);
    db.query('INSERT INTO users (ho_ten, email, mat_khau, role) VALUES (?,?,?,?)',
      [ho_ten, email, hashed, role],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
          }
          return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Đăng ký thành công!', id: result.insertId });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
});

// Login user
router.post('/login', (req, res) => {
  const { email, mat_khau } = req.body;
  
  if (!email || !mat_khau) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ!' });
  }
  
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
    }
    
    const match = await bcrypt.compare(mat_khau, results[0].mat_khau);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
    }
    
    const { mat_khau: _, ...user } = results[0];
    res.json({ success: true, message: 'Đăng nhập thành công!', data: user });
  });
});

// UPDATE user
router.put('/:id', async (req, res) => {
  const { ho_ten, email, role } = req.body;
  const userId = req.params.id;
  
  if (!ho_ten || !email) {
    return res.status(400).json({ success: false, message: 'Tên và email là bắt buộc!' });
  }
  
  db.query('UPDATE users SET ho_ten = ?, email = ?, role = ? WHERE id = ?',
    [ho_ten, email, role || 'user', userId],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });
        }
        return res.status(500).json({ success: false, message: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
      }
      res.json({ success: true, message: 'Cập nhật thành công!' });
    }
  );
});

// UPDATE password (reset password - khi đã đăng nhập)
router.put('/:id/reset-password', async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.params.id;
  
  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ mật khẩu!' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
  }
  
  db.query('SELECT mat_khau FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }
    
    const match = await bcrypt.compare(old_password, results[0].mat_khau);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng!' });
    }
    
    const hashed = await bcrypt.hash(new_password, 10);
    db.query('UPDATE users SET mat_khau = ? WHERE id = ?', [hashed, userId], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    });
  });
});

// Forgot password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email!' });
  }
  
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống!' });
    }
    
    const resetToken = Buffer.from(`${results[0].id}_${Date.now()}`).toString('base64');
    
    db.query('UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, results[0].id],
      (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        console.log(`📧 Link reset: http://localhost:4000/reset-password-form?token=${resetToken}`);
        res.json({ success: true, message: 'Link reset mật khẩu đã được tạo! (Kiểm tra console để xem link)' });
      }
    );
  });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  
  if (!token || !new_password) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin!' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
  }
  
  db.query('SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()', [token], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
    
    const hashed = await bcrypt.hash(new_password, 10);
    db.query('UPDATE users SET mat_khau = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashed, results[0].id],
      (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
      }
    );
  });
});

// DELETE user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }
    res.json({ success: true, message: 'Xóa người dùng thành công!' });
  });
});

module.exports = router;