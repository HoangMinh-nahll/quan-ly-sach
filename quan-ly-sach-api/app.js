const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/users',   require('./routes/users'));
app.use('/api/books',   require('./routes/books'));
app.use('/api/borrows', require('./routes/borrows'));
app.use('/api/stats',   require('./routes/stats'));

app.get('/', (req, res) => {
  res.json({
    message: '📚 Quan Ly Sach - API Server',
    endpoints: [
      'POST   /api/users/register',
      'POST   /api/users/login',
      'GET    /api/users',
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