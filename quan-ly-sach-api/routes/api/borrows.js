const express = require('express');
const router  = express.Router();
const db      = require('../../config/db');  // Đổi đường dẫn

const PHAT_MOI_NGAY = 5000;
const PHAT_LAM_MAT  = 200000;

// Phần còn lại giữ nguyên...
router.get('/', (req, res) => {
  db.query(`
    SELECT ms.*, u.ho_ten, u.email, s.ten_sach, s.tac_gia
    FROM muon_sach ms
    JOIN users u ON ms.user_id = u.id
    JOIN sach  s ON ms.sach_id = s.id
    ORDER BY ms.id DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, total: results.length, data: results });
  });
});

router.post('/', (req, res) => {
  const { user_id, sach_id, ngay_muon, ngay_hen_tra, ghi_chu } = req.body;
  if (!user_id || !sach_id || !ngay_muon || !ngay_hen_tra)
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc!' });

  db.query('SELECT so_luong_con FROM sach WHERE id = ?', [sach_id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách!' });
    if (results[0].so_luong_con <= 0)
      return res.status(400).json({ success: false, message: 'Sách đã hết!' });

    db.query(
      'INSERT INTO muon_sach (user_id, sach_id, ngay_muon, ngay_hen_tra, ghi_chu) VALUES (?,?,?,?,?)',
      [user_id, sach_id, ngay_muon, ngay_hen_tra, ghi_chu || ''],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        db.query('UPDATE sach SET so_luong_con = so_luong_con - 1 WHERE id = ?', [sach_id]);
        res.json({ success: true, message: 'Tạo phiếu mượn thành công!', id: result.insertId });
      }
    );
  });
});

router.put('/:id/return', (req, res) => {
  const ngay_tra = new Date().toISOString().split('T')[0];
  db.query('SELECT * FROM muon_sach WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
    const borrow    = results[0];
    if (borrow.trang_thai !== 'dang_muon')
      return res.status(400).json({ success: false, message: 'Phiếu đã xử lý rồi!' });
    const soNgayTre = Math.max(0, Math.floor((new Date(ngay_tra) - new Date(borrow.ngay_hen_tra)) / 86400000));
    const tien_phat = soNgayTre * PHAT_MOI_NGAY;
    db.query(
      'UPDATE muon_sach SET trang_thai="da_tra", ngay_tra=?, tien_phat=? WHERE id=?',
      [ngay_tra, tien_phat, req.params.id], () => {
        db.query('UPDATE sach SET so_luong_con = so_luong_con + 1 WHERE id = ?', [borrow.sach_id]);
        res.json({ success: true, message: 'Trả sách thành công!', soNgayTre, tien_phat });
      }
    );
  });
});

router.put('/:id/lost', (req, res) => {
  db.query('SELECT * FROM muon_sach WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
    const borrow = results[0];
    if (borrow.trang_thai !== 'dang_muon')
      return res.status(400).json({ success: false, message: 'Phiếu đã xử lý rồi!' });
    db.query(
      'UPDATE muon_sach SET trang_thai="lam_mat", tien_phat=? WHERE id=?',
      [PHAT_LAM_MAT, req.params.id], () => {
        db.query('UPDATE sach SET so_luong = so_luong - 1 WHERE id = ?', [borrow.sach_id]);
        res.json({ success: true, message: 'Đã ghi nhận làm mất!', tien_phat: PHAT_LAM_MAT });
      }
    );
  });
});

module.exports = router;