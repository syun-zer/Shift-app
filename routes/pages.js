const express = require('express');
const router = express.Router();

router.get('/',(req,res) => {
  if(req.session.userId) {
    res.redirect('/shifts');
  } else {
    res.redirect('/login');
  }
});

router.get('/shifts',(req,res)=> {
  if(req.session.userId) {
    res.render('layout',{
      title:'Shift Manager',content:'shift'
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/login',(req,res)=> {
  res.render('layout',{
    title:'Login',content:'login'
  });
});

// Step 3: スケジュールページ
router.get('/schedule', (req, res) => {
  res.render('layout', {
    title: '月間シフト表',
    content: 'schedule'
  });
});

module.exports = router;
