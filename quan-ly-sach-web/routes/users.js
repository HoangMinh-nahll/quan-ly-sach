const express = require('express');
const router  = express.Router();
const api     = require('../config/api');
const auth    = require('../middleware/auth');

// GET all users (chỉ admin mới xem được)
router.get('/', auth, async (req, res) => {
  // Kiểm tra role (chỉ admin mới xem được)
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  try {
    const response = await api.get('/api/users');
    res.render('users/index', { users: response.data.data, error: null, success: null });
  } catch (err) {
    res.render('users/index', { users: [], error: 'Lỗi tải danh sách người dùng!', success: null });
  }
});

// GET user by ID
router.get('/:id', auth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  try {
    const response = await api.get(`/api/users/${req.params.id}`);
    res.render('users/show', { user: response.data.data, error: null });
  } catch (err) {
    res.redirect('/users');
  }
});

// GET create user form
router.get('/create', auth, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  res.render('users/create', { error: null });
});

// POST create user
router.post('/create', auth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  try {
    await api.post('/api/users/register', req.body);
    res.redirect('/users');
  } catch (err) {
    res.render('users/create', { error: err.response?.data?.message || 'Lỗi thêm người dùng!' });
  }
});

// GET edit user form
router.get('/:id/edit', auth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  try {
    const response = await api.get(`/api/users/${req.params.id}`);
    res.render('users/edit', { user: response.data.data, error: null });
  } catch (err) {
    res.redirect('/users');
  }
});

// POST update user
router.post('/:id/edit', auth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  try {
    await api.put(`/api/users/${req.params.id}`, req.body);
    res.redirect('/users');
  } catch (err) {
    const response = await api.get(`/api/users/${req.params.id}`);
    res.render('users/edit', { user: response.data.data, error: err.response?.data?.message || 'Lỗi cập nhật!' });
  }
});

// POST delete user
router.post('/:id/delete', auth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/books');
  }
  
  // Không cho xóa chính mình
  if (req.params.id == req.session.user.id) {
    return res.redirect('/users');
  }
  
  try {
    await api.delete(`/api/users/${req.params.id}`);
    res.redirect('/users');
  } catch (err) {
    res.redirect('/users');
  }
});

// GET reset password form
router.get('/reset-password', auth, (req, res) => {
  res.render('users/reset-password', { error: null, success: null });
});

// POST reset password
router.post('/reset-password', auth, async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;
  
  if (new_password !== confirm_password) {
    return res.render('users/reset-password', { error: 'Mật khẩu xác nhận không khớp!', success: null });
  }
  
  try {
    await api.put(`/api/users/${req.session.user.id}/reset-password`, {
      old_password,
      new_password
    });
    res.render('users/reset-password', { error: null, success: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    res.render('users/reset-password', { error: err.response?.data?.message || 'Lỗi đổi mật khẩu!', success: null });
  }
});

// GET forgot password form
router.get('/forgot-password', (req, res) => {
  res.render('users/forgot-password', { error: null, success: null });
});

// POST forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    await api.post('/api/users/forgot-password', { email: req.body.email });
    res.render('users/forgot-password', { error: null, success: 'Link reset mật khẩu đã được gửi! Vui lòng kiểm tra email.' });
  } catch (err) {
    res.render('users/forgot-password', { error: err.response?.data?.message || 'Email không tồn tại!', success: null });
  }
});

// GET reset password with token
router.get('/reset-password-form', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.redirect('/forgot-password');
  }
  res.render('users/reset-password-form', { token, error: null, success: null });
});

// POST reset password with token
router.post('/reset-password-form', async (req, res) => {
  const { token, new_password, confirm_password } = req.body;
  
  if (new_password !== confirm_password) {
    return res.render('users/reset-password-form', { token, error: 'Mật khẩu xác nhận không khớp!', success: null });
  }
  
  try {
    await api.post('/api/users/reset-password', { token, new_password });
    res.render('users/reset-password-form', { token, error: null, success: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    res.render('users/reset-password-form', { token, error: err.response?.data?.message || 'Lỗi đặt lại mật khẩu!', success: null });
  }
});

module.exports = router;