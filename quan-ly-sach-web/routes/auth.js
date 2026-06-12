const express = require('express');
const router  = express.Router();
const api     = require('../config/api');

router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/books');
});

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/books');
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const response = await api.post('/api/users/login', req.body);
    req.session.user = response.data.data;
    res.redirect('/books');
  } catch (err) {
    res.render('auth/login', { error: err.response?.data?.message || 'Lỗi kết nối server!' });
  }
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/books');
  res.render('auth/register', { error: null, success: null });
});

router.post('/register', async (req, res) => {
  try {
    await api.post('/api/users/register', req.body);
    res.render('auth/register', { error: null, success: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    res.render('auth/register', { error: err.response?.data?.message || 'Lỗi đăng ký!', success: null });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;