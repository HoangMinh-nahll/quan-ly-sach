const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', (req, res) => {
  const stats = {};
  db.query('SELECT COUNT(*) as t FROM sach', (e, r) => { stats.tongSach = r[0].t;
  db.query('SELECT COALESCE(SUM(so_luong),0) as t FROM sach', (e, r) => { stats.tongBan = r[0].t;
  db.query('SELECT COUNT(*) as t FROM muon_sach WHERE trang_thai="dang_muon"', (e, r) => { stats.dangMuon = r[0].t;
  db.query('SELECT COUNT(*) as t FROM muon_sach WHERE trang_thai="da_tra"', (e, r) => { stats.daTra = r[0].t;
  db.query('SELECT COUNT(*) as t FROM muon_sach WHERE trang_thai="lam_mat"', (e, r) => { stats.lamMat = r[0].t;
  db.query('SELECT COALESCE(SUM(tien_phat),0) as t FROM muon_sach', (e, r) => { stats.tongPhat = r[0].t;
  db.query('SELECT the_loai, COUNT(*) as count FROM sach GROUP BY the_loai ORDER BY count DESC', (e, r) => { stats.theoLoai = r || [];
  db.query(`SELECT s.ten_sach, s.tac_gia, COUNT(ms.id) as so_lan
    FROM sach s LEFT JOIN muon_sach ms ON s.id = ms.sach_id
    GROUP BY s.id ORDER BY so_lan DESC LIMIT 5`, (e, r) => {
    stats.topSach = r || [];
    res.json({ success: true, data: stats });
  });});});});});});});});
});

module.exports = router;