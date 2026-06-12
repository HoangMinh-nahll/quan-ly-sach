const express = require('express');
const session = require('express-session');
const app     = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret           : 'qls-web-secret-2026',
  resave           : false,
  saveUninitialized: false,
  cookie           : { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/',        require('./routes/auth'));
app.use('/books',   require('./routes/books'));
app.use('/borrows', require('./routes/borrows'));
app.use('/stats',   require('./routes/stats'));

app.listen(4000, () => console.log('✅ Web chạy tại http://localhost:4000'));