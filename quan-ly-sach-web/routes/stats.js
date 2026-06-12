const express = require('express');
const router  = express.Router();
const api     = require('../config/api');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const response = await api.get('/api/stats');
    res.render('stats/index', { stats: response.data.data });
  } catch {
    res.render('stats/index', { stats: { tongSach:0, tongBan:0, dangMuon:0, daTra:0, lamMat:0, tongPhat:0, theoLoai:[], topSach:[] } });
  }
});

module.exports = router;