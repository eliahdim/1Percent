const Goal = require('../models/Goal');

/**
 * Goal Controller - Handles HTTP requests for goals
 */
const goalController = {
  /**
   * Get all goals as a tree structure
   * GET /api/goals
   */
  getAllGoals: (req, res) => {
    try {
      const goals = Goal.getAllAsTree();
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  },

  /**
   * Get a single goal by ID with its subgoals
   * GET /api/goals/:id
   */
  getGoalById: (req, res) => {
    try {
      const { id } = req.params;
      const goal = Goal.getTree(Number(id));

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json(goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
      res.status(500).json({ error: 'Failed to fetch goal' });
    }
  },

  /**
   * Get subgoals of a specific goal
   * GET /api/goals/:id/subgoals
   */
  getSubgoals: (req, res) => {
    try {
      const { id } = req.params;
      const parentGoal = Goal.findById(Number(id));

      if (!parentGoal) {
        return res.status(404).json({ error: 'Parent goal not found' });
      }

      const subgoals = Goal.findByParentId(Number(id));
      res.json(subgoals);
    } catch (error) {
      console.error('Error fetching subgoals:', error);
      res.status(500).json({ error: 'Failed to fetch subgoals' });
    }
  },

  /**
   * Create a new goal
   * POST /api/goals
   * Body: { title, description?, parentId? }
   */
  createGoal: (req, res) => {
    try {
      const { title, description, parentId, x, y } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }

      // If parentId is provided, verify the parent exists
      if (parentId) {
        const parent = Goal.findById(Number(parentId));
        if (!parent) {
          return res.status(404).json({ error: 'Parent goal not found' });
        }
      }

      const goal = Goal.create({
        title: title.trim(),
        description: description?.trim(),
        parentId: parentId ? Number(parentId) : null,
        x: x || 0,
        y: y || 0
      });

      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  },

  /**
   * Update an existing goal
   * PUT /api/goals/:id
   * Body: { title?, description?, completed? }
   */
  updateGoal: (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, x, y } = req.body;

      const existingGoal = Goal.findById(Number(id));
      if (!existingGoal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      // Validate title if provided
      if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }

      const updatedGoal = Goal.update(Number(id), {
        title: title?.trim(),
        description: description?.trim(),
        title: title?.trim(),
        description: description?.trim(),
        status,
        x,
        y
      });

      res.json(updatedGoal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  },

  /**
   * Delete a goal and its subgoals
   * DELETE /api/goals/:id
   */
  deleteGoal: (req, res) => {
    try {
      const { id } = req.params;

      const existingGoal = Goal.findById(Number(id));
      if (!existingGoal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      Goal.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  }
};

module.exports = goalController;
