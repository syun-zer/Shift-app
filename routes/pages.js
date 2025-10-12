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
    // URLパラメータから年月を取得、デフォルトは現在の年月
    const currentDate = new Date();
    const year = parseInt(req.query.year) || currentDate.getFullYear();
    const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);

    // Step 1: 全ユーザー取得
    const users = await getAllUsers();
    
    // Step 2: 月別シフト取得
    const shifts = await getAllUsersShiftsForMonth(year, month);
    
    // Step 5: 必要人数取得
    const requiredStaff = await getRequiredStaffCount();
    
    // 指定された月の日数を取得
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 日付配列を生成
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // この日のシフト人数を計算
      const dailyShifts = shifts.filter(shift => shift.date.startsWith(date));
      const actualCount = dailyShifts.length;
      const isShortStaffed = actualCount < requiredStaff;
      
      dates.push({
        day: day,
        date: date,
        dayOfWeek: new Date(year, month - 1, day).toLocaleDateString('ja-JP', { weekday: 'short' }),
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
      currentYear: year,
      currentMonth: month,
      isLoggedIn: true
    });
  } catch (err) {
    console.error('Error in /schedule:', err);
    res.status(500).send('エラーが発生しました');
  }
});

module.exports = router;
