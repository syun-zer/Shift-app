const express = require('express');
const session = require('express-session');

const pageRouter = require('./routes/pages');
const userApiRouter = require('./routes/api/user');
const shiftApiRouter = require('./routes/api/shift');

const app = express();

app.set('view engine','ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/',pageRouter);
app.use('/api/users',userApiRouter);
app.use('/api/shifts',isLoggedIn, shiftApiRouter);

function isLoggedIn(req,res,next) {
  if(req.session.userId) {
    return next();
  }
  res.status(401).json({error:'Unauthorized'});
}

app.listen(3000,() => {
  console.log('Server started on http://localhost:3000');
})
