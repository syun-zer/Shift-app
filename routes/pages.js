const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/user');
const { getAllUsersShiftsForMonth } = require('../models/shift');

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
router.get('/schedule', async (req, res) => {
  try {
    // Step 1: 全ユーザー取得
    const users = await getAllUsers();
    
    // Step 2: 月別シフト取得（2025年10月）
    const shifts = await getAllUsersShiftsForMonth(2025, 10);
    
    // 10月の日付配列を生成
    const dates = [];
    for (let day = 1; day <= 31; day++) {
      dates.push({
        day: day,
        date: `2025-10-${day.toString().padStart(2, '0')}`,
        dayOfWeek: new Date(2025, 9, day).toLocaleDateString('ja-JP', { weekday: 'short' })
      });
    }
    
    console.log('Users:', users);
    console.log('Shifts:', shifts);
    
    res.render('layout', {
      title: '月間シフト表',
      content: 'schedule',
      users: users,
      shifts: shifts,
      dates: dates
    });
  } catch (err) {
    console.error('Error in /schedule:', err);
    res.status(500).send('エラーが発生しました');
  }
});

module.exports = router;
