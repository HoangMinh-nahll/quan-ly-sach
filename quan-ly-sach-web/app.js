const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Kết nối database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quan_ly_sach'
}).promise();

app.use((req, res, next) => {
  req.db = db;
  next();
});

// Session
app.use(session({
  secret: 'qls-web-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Global user variable
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ========== THÊM ROUTE NÀY ==========
// Route /api cho web server (trả về thông tin API)
app.get('/api', (req, res) => {
  res.json({
    message: 'Đây là Web Server, không phải API Server',
    note: 'API Server đang chạy tại http://localhost:5000',
    endpoints: {
      users: 'http://localhost:5000/api/users',
      books: 'http://localhost:5000/api/books',
      borrows: 'http://localhost:5000/api/borrows',
      stats: 'http://localhost:5000/api/stats'
    }
  });
});
// ====================================

// Routes
app.use('/', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/borrows', require('./routes/borrows'));
app.use('/stats', require('./routes/stats'));
app.use('/users', require('./routes/users'));

app.listen(4000, () => console.log('✅ Web chạy tại http://localhost:4000'));