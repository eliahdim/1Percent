# 1% Project

## Description

1% Project is a web application that helps users to create and manage their goals.

## Tech Stack

- React
- Vite
- React Flow - for canvas
- Node.js
- Express
- SQLite - Database (better-sqlite3)

## MVC

### Frontend

- Model: Manages local state and data structures (goal tree, progress, relationships).  
- View: React components that display the goal hierarchy visually.  
- Controller: Connects user actions (creating, completing, deleting goals) to data updates and backend API calls.

### Backend

- Model: better-sqlite3 queries defining goal and subgoal structure in SQLite.  
- Controller: Handles requests from the frontend and communicates with the SQLite database.  
  Routes are kept separate for clean structure, e.g. `routes/goalRoutes.js` calls `controllers/goalController.js`.

## Installation

### Frontend

```bash
npm install
```

### Backend

```bash
cd Backend
npm install
```

## Usage

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd Backend
npm start
```

## License

MIT