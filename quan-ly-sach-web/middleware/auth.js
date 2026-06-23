// XÓA TẤT CẢ NỘI DUNG CŨ
// Viết lại như sau:

module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};