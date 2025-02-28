const express = require('express');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const router = express.Router();

// 2. POST - Create a new user
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET - Retrieve all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '_id username'); // Select only required fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. POST - Add exercise data for a user
router.post('/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const user = await User.findById(_id);

    if (!user) return res.json({ error: 'User not found' });

    const newExercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    await newExercise.save();

    res.json({
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: user._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. GET - Retrieve exercise logs for a user
router.get('/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) return res.json({ error: 'User not found' });

    let filter = { userId: _id };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    let exercises = Exercise.find(filter).limit(parseInt(limit) || 0);
    exercises = await exercises;

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
