const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/user');
const { getAllUsersShiftsForMonth } = require('../models/shift');
const { getRequiredStaffCount } = require('../models/settings');

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
      title:'Shift Manager',content:'shift', isLoggedIn: true
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/login',(req,res)=> {
  res.render('layout',{
    title:'Login',content:'login', isLoggedIn: false
  });
});

// Step 3: スケジュールページ
router.get('/schedule', async (req, res) => {
  // 認証チェック
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    // Step 1: 全ユーザー取得
    const users = await getAllUsers();
    
    // Step 2: 月別シフト取得（2025年10月）
    const shifts = await getAllUsersShiftsForMonth(2025, 10);
    
    // Step 5: 必要人数取得
    const requiredStaff = await getRequiredStaffCount();
    
    // 10月の日付配列を生成
    const dates = [];
    for (let day = 1; day <= 31; day++) {
      const date = `2025-10-${day.toString().padStart(2, '0')}`;
      
      // この日のシフト人数を計算
      const dailyShifts = shifts.filter(shift => shift.date.startsWith(date));
      const actualCount = dailyShifts.length;
      const isShortStaffed = actualCount < requiredStaff;
      
      dates.push({
        day: day,
        date: date,
        dayOfWeek: new Date(2025, 9, day).toLocaleDateString('ja-JP', { weekday: 'short' }),
        actualCount: actualCount,
        isShortStaffed: isShortStaffed
      });
    }
    
    console.log('Users:', users);
    console.log('Shifts:', shifts);
    console.log('Required Staff:', requiredStaff);
    
    res.render('layout', {
      title: '月間シフト表',
      content: 'schedule',
      users: users,
      shifts: shifts,
      dates: dates,
      requiredStaff: requiredStaff,
      isLoggedIn: true
    });
  } catch (err) {
    console.error('Error in /schedule:', err);
    res.status(500).send('エラーが発生しました');
  }
});

module.exports = router;
