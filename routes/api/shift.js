const express = require('express');
const router = express.Router();

const {
  createShift,
  getShiftsByUserId,
  getFutureShiftsByUserId,
  deleteShiftById,
  deleteOldShifts,
  getAllUsersShiftsForMonth,
} = require('../../models/shift');

router.post('/',async(req,res) => {
  const { date } = req.body;
  console.log('POST /api/shifts called with:', { userId: req.session.userId, date });
  try {
    await createShift(req.session.userId,date);
    console.log('Shift created successfully');
    res.status(201).json({ message: 'shift added'});
  } catch (err) {
    console.error('Error creating shift:', err);
    if (err.message === 'この日時のシフトは既に登録されています') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error:'Failed to add shift'});
    }
  }
});

router.get('/',async(req,res) => {
  console.log('GET /api/shifts called with userId:', req.session.userId);
  try {
    // 50日前の古いシフトを自動削除
    await deleteOldShifts(50);
    
    // 全てのシフトを取得
    const shifts = await getShiftsByUserId(req.session.userId);
    console.log('Retrieved shifts:', shifts);
    const currentTime = new Date();
    console.log('Current time:', currentTime.toISOString());

    const pastShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      console.log('Comparing:', shiftDate.toISOString(), '<', currentTime.toISOString(), '=', shiftDate < currentTime);
      return shiftDate < currentTime;
    });

    const futureShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= currentTime;
    });
    
    console.log('Filtered shifts:', { futureShifts, pastShifts });
    return res.status(200).json({futureShifts,pastShifts});
  }catch (err){
    console.error('Error retrieving shifts:', err);
    res.status(500).json({ error: 'Failed to retrive shifts'});
  }
});

router.delete('/:id',async(req,res)=> {
  try{
    await deleteShiftById(req.params.id);
    res.status(200).json({ message: 'Shift deleted'});
  }catch(err){
   res.status(500).json({ error: 'Failed to delete shift' });
  }
});

// Step 2: 月別シフト取得のテスト用エンドポイント（認証なし）
router.get('/monthly-test/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  console.log(`GET /api/shifts/monthly-test/${year}/${month} called`);
  
  try {
    const shifts = await getAllUsersShiftsForMonth(parseInt(year), parseInt(month));
    console.log('Monthly shifts:', shifts);
    res.status(200).json({ 
      year: parseInt(year),
      month: parseInt(month), 
      shifts 
    });
  } catch (err) {
    console.error('Error getting monthly shifts:', err);
    res.status(500).json({ error: 'Failed to get monthly shifts' });
  }
});

module.exports = router;