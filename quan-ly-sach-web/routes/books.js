const express = require('express');
const router  = express.Router();
const api     = require('../config/api');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    const url      = search ? `/api/books?search=${encodeURIComponent(search)}` : '/api/books';
    const response = await api.get(url);
    res.render('books/index', { books: response.data.data, search: search || '' });
  } catch {
    res.render('books/index', { books: [], search: '' });
  }
});

router.get('/create', auth, (req, res) => {
  res.render('books/create', { error: null });
});

router.post('/create', auth, async (req, res) => {
  try {
    await api.post('/api/books', req.body);
    res.redirect('/books');
  } catch (err) {
    res.render('books/create', { error: err.response?.data?.message || 'Lỗi thêm sách!' });
  }
});

router.get('/:id/edit', auth, async (req, res) => {
  try {
    const response = await api.get(`/api/books/${req.params.id}`);
    res.render('books/edit', { book: response.data.data, error: null });
  } catch {
    res.redirect('/books');
  }
});

router.post('/:id/edit', auth, async (req, res) => {
  try {
    await api.put(`/api/books/${req.params.id}`, req.body);
    res.redirect('/books');
  } catch {
    res.redirect('/books');
  }
});

router.post('/:id/delete', auth, async (req, res) => {
  try { await api.delete(`/api/books/${req.params.id}`); } catch {}
  res.redirect('/books');
});

module.exports = router;