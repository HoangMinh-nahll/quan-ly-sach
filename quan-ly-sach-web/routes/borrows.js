const express = require('express');
const router  = express.Router();
const api     = require('../config/api');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const response = await api.get('/api/borrows');
    res.render('borrows/index', { borrows: response.data.data });
  } catch {
    res.render('borrows/index', { borrows: [] });
  }
});

router.get('/create', auth, async (req, res) => {
  try {
    const [booksRes, usersRes] = await Promise.all([api.get('/api/books'), api.get('/api/users')]);
    const books = booksRes.data.data.filter(b => b.so_luong_con > 0);
    res.render('borrows/create', { books, users: usersRes.data.data, error: null });
  } catch {
    res.redirect('/borrows');
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    await api.post('/api/borrows', req.body);
    res.redirect('/borrows');
  } catch (err) {
    try {
      const [booksRes, usersRes] = await Promise.all([api.get('/api/books'), api.get('/api/users')]);
      const books = booksRes.data.data.filter(b => b.so_luong_con > 0);
      res.render('borrows/create', { books, users: usersRes.data.data, error: err.response?.data?.message || 'Lỗi!' });
    } catch { res.redirect('/borrows'); }
  }
});

router.post('/:id/return', auth, async (req, res) => {
  try { await api.put(`/api/borrows/${req.params.id}/return`); } catch {}
  res.redirect('/borrows');
});

router.post('/:id/lost', auth, async (req, res) => {
  try { await api.put(`/api/borrows/${req.params.id}/lost`); } catch {}
  res.redirect('/borrows');
});

module.exports = router;