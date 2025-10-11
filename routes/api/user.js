const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.post('/login',async(req,res)=> {
  const { username,password } = req.body;
  try {
    const user = await User.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ error: 'ユーザーが見つかりません' });
    }

    if (password === user.password) {
      req.session.userId = user.id;
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/logout',(req,res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout  failed' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Step 1: 全ユーザー取得のテスト用エンドポイント
router.get('/all', async (req, res) => {
  try {
    const users = await User.getAllUsers();
    console.log('All users:', users);
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error getting all users:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;