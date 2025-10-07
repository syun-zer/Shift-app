const express = require('express');
const router = express.Router();

const {
  createShift,
  getShiftsByUserId,
  getFutureShiftsByUserId,
  deleteShiftById,
  deleteOldShifts,
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
    res.status(500).json({ error:'Failed to add shift'});
  }
});

router.get('/',async(req,res) => {
  console.log('GET /api/shifts called with userId:', req.session.userId);
  try {
    // 50日前の古いシフトを自動削除
    await deleteOldShifts(50);
    
    // 効率的に未来のシフトのみを取得
    const futureShifts = await getFutureShiftsByUserId(req.session.userId);
    console.log('Retrieved future shifts:', futureShifts);
    
    // 過去のシフトは削除されているので空の配列を返す
    const pastShifts = [];
    
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

module.exports = router;