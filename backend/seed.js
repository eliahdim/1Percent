const db = require('./config/database');

const seedData = () => {
    console.log('Seeding database...');

    // Clear existing data
    db.exec('DELETE FROM goals');
    db.exec("DELETE FROM sqlite_sequence WHERE name='goals'");

    // Helper to insert goal and return ID
    const insertGoal = (title, description, parentId = null, status = 'Not Started', color = null) => {
        const stmt = db.prepare('INSERT INTO goals (title, description, parent_id, status, color) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(title, description, parentId, status, color);
        return result.lastInsertRowid;
    };

    // Root Goal: Build 1% App
    const rootId = insertGoal('Build "1%" App', 'Create the ultimate goal visualization tool', null, 'In Progress', '#6366f1');

    // Subgoal 1: Backend
    const backendId = insertGoal('Backend Architecture', 'Node.js + Express + SQLite', rootId, 'In Progress', '#ec4899');
    insertGoal('Database Schema', 'Design tables for goals and users', backendId, 'Done', '#ec4899');
    insertGoal('API Endpoints', 'CRUD operations for goals', backendId, 'In Progress', '#ec4899');

    // Subgoal 2: Frontend
    const frontendId = insertGoal('Frontend Interface', 'React + Vite + React Flow', rootId, 'Not Started', '#3b82f6');
    const canvasId = insertGoal('Infinite Canvas', 'Implement node-based goal visualization', frontendId, 'Not Started', '#3b82f6');
    insertGoal('Drag & Drop', 'Allow rearranging goals', canvasId, 'Not Started', '#3b82f6');
    insertGoal('Zoom & Pan', 'Navigation controls', canvasId, 'Not Started', '#3b82f6');

    // Subgoal 3: Design
    const designId = insertGoal('UI/UX Design', 'Modern, dark-themed aesthetic', rootId, 'Done', '#10b981');
    insertGoal('Color Palette', 'Define primary and accent colors', designId, 'Done', '#10b981');
    insertGoal('Typography', 'Select readable and sleek fonts', designId, 'Done', '#10b981');

    console.log('Database seeded successfully!');
};

seedData();
