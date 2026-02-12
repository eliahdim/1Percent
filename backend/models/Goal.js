const db = require('../config/database');

/**
 * Goal Model - Handles all database operations for goals
 * Goals can have parent-child relationships (subgoals)
 */
const Goal = {
  /**
   * Get all top-level goals (goals without a parent)
   */
  findAll: () => {
    const stmt = db.prepare('SELECT * FROM goals WHERE parent_id IS NULL ORDER BY created_at DESC');
    return stmt.all();
  },

  /**
   * Get a goal by its ID
   */
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM goals WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Get all subgoals of a parent goal
   */
  findByParentId: (parentId) => {
    const stmt = db.prepare('SELECT * FROM goals WHERE parent_id = ? ORDER BY created_at ASC');
    return stmt.all(parentId);
  },

  /**
   * Create a new goal
   */
  create: ({ title, description, parentId, status, color, x, y }) => {
    const stmt = db.prepare(`
      INSERT INTO goals (title, description, parent_id, status, color, x, y)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      title,
      description || null,
      parentId || null,
      status || 'Not Started',
      color || null,
      x || 0, // Use provided x or default to 0
      y || 0  // Use provided y or default to 0
    );
    return Goal.findById(result.lastInsertRowid);
  },

  /**
   * Update an existing goal
   */
  update: (id, { title, description, status, color, x, y }) => {
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    if (x !== undefined) {
      updates.push('x = ?');
      values.push(x);
    }
    if (y !== undefined) {
      updates.push('y = ?');
      values.push(y);
    }

    if (updates.length === 0) {
      return Goal.findById(id);
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    const stmt = db.prepare(`UPDATE goals SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return Goal.findById(id);
  },

  /**
   * Delete a goal (cascades to subgoals)
   */
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM goals WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  /**
   * Get a goal with all its nested subgoals (tree structure)
   */
  getTree: (goalId) => {
    const goal = Goal.findById(goalId);
    if (!goal) return null;

    const subgoals = Goal.findByParentId(goalId);
    goal.subgoals = subgoals.map((subgoal) => Goal.getTree(subgoal.id));
    return goal;
  },

  /**
   * Get all goals as a tree structure (top-level goals with nested subgoals)
   */
  getAllAsTree: () => {
    const topLevelGoals = Goal.findAll();
    return topLevelGoals.map((goal) => Goal.getTree(goal.id));
  }
};

module.exports = Goal;
