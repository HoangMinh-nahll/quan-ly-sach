const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// Đường dẫn đúng sau khi di chuyển app.js ra root
app.use('/api/users',   require('./routes/api/users'));
app.use('/api/books',   require('./routes/api/books'));
app.use('/api/borrows', require('./routes/api/borrows'));
app.use('/api/stats',   require('./routes/api/stats'));

app.get('/api', (req, res) => {
  res.json({
    message: '📚 Quan Ly Sach - API Server',
    endpoints: [
      'POST   /api/users/register',
      'POST   /api/users/login',
      'GET    /api/users',
      'GET    /api/users/:id',
      'PUT    /api/users/:id',
      'PUT    /api/users/:id/reset-password',
      'POST   /api/users/forgot-password',
      'POST   /api/users/reset-password',
      'DELETE /api/users/:id',
      'GET    /api/books',
      'GET    /api/books?search=...',
      'GET    /api/books/:id',
      'POST   /api/books',
      'PUT    /api/books/:id',
      'DELETE /api/books/:id',
      'GET    /api/borrows',
      'POST   /api/borrows',
      'PUT    /api/borrows/:id/return',
      'PUT    /api/borrows/:id/lost',
      'GET    /api/stats'
    ]
  });
});

app.listen(5000, () => console.log('✅ API chạy tại http://localhost:5000'));