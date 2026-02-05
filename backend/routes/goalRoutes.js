const express = require('express');
const goalController = require('../controllers/goalController');

const router = express.Router();

// GET /api/goals - Get all goals as tree structure
router.get('/', goalController.getAllGoals);

// GET /api/goals/:id - Get a single goal with subgoals
router.get('/:id', goalController.getGoalById);

// GET /api/goals/:id/subgoals - Get subgoals of a goal
router.get('/:id/subgoals', goalController.getSubgoals);

// POST /api/goals - Create a new goal
router.post('/', goalController.createGoal);

// PUT /api/goals/:id - Update an existing goal
router.put('/:id', goalController.updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
