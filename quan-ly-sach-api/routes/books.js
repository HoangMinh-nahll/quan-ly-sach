const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', (req, res) => {
  const { search } = req.query;
  const query  = search
    ? 'SELECT * FROM sach WHERE ten_sach LIKE ? OR tac_gia LIKE ? OR the_loai LIKE ? ORDER BY id DESC'
    : 'SELECT * FROM sach ORDER BY id DESC';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, total: results.length, data: results });
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM sach WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách!' });
    res.json({ success: true, data: results[0] });
  });
});

router.post('/', (req, res) => {
  const { ten_sach, tac_gia, the_loai, nam_xb, so_luong, mo_ta } = req.body;
  if (!ten_sach || !tac_gia)
    return res.status(400).json({ success: false, message: 'Tên sách và tác giả là bắt buộc!' });
  db.query(
    'INSERT INTO sach (ten_sach, tac_gia, the_loai, nam_xb, so_luong, so_luong_con, mo_ta) VALUES (?,?,?,?,?,?,?)',
    [ten_sach, tac_gia, the_loai, nam_xb, so_luong, so_luong, mo_ta],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Thêm sách thành công!', id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const { ten_sach, tac_gia, the_loai, nam_xb, so_luong, mo_ta } = req.body;
  db.query(
    'UPDATE sach SET ten_sach=?, tac_gia=?, the_loai=?, nam_xb=?, so_luong=?, mo_ta=? WHERE id=?',
    [ten_sach, tac_gia, the_loai, nam_xb, so_luong, mo_ta, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Cập nhật thành công!' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM sach WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Xóa thành công!' });
  });
});

module.exports = router;