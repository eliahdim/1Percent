# Project Overview — 1%

## 🧭 Purpose
"1%" (1Percent) is a fullstack web application that helps users visualize and manage their life goals by breaking them down into smaller, actionable sub-goals.  
The app’s structure is inspired by a **tree**, where each main goal branches into subgoals, forming a clear visual hierarchy of progress and relationships.

The purpose is to give users a better understanding of how each small step contributes to their larger ambitions.

---

## ⚙️ Tech Stack
### Frontend
- **Framework:** React (built with [Vite](https://vitejs.dev))
- **Language:** JavaScript / JSX
- **Design Pattern:** Model–View–Controller (MVC)
- **Hosting:** Vercel (planned)

### Backend
- **Environment:** Node.js + Express
- **Database:** SQLite
- **Design Pattern:** Model–View–Controller (MVC)
- **Hosting:** Render / Railway / Vercel serverless (depending on setup)

---

## 🧩 Design Pattern — MVC
The entire project follows the **Model–View–Controller** pattern, both in frontend and backend.

### Frontend (React)
- **Model:** Manages local state and data structures (goal tree, progress, relationships).  
- **View:** React components that display the goal hierarchy visually.  
- **Controller:** Connects user actions (creating, completing, deleting goals) to data updates and backend API calls.

### Backend (Express)
- **Model:** Sequelize models defining goal and subgoal structure in SQLite.  
- **View:** (Not applicable — API-based)  
- **Controller:** Handles requests from the frontend and communicates with the SQLite database.  
  Routes are kept separate for clean structure, e.g. `routes/goalRoutes.js` calls `controllers/goalController.js`.

Maintaining strict MVC separation is **vital** to ensure the project remains organized and scalable.

---

## 🌳 Visualization Concept
1% visualizes user goals as an interactive **tree structure**:

- Each **node** = a goal or subgoal.  
- Nodes are connected visually, showing dependencies and hierarchy.  
- Users can **expand, collapse, and complete** goals dynamically.

Example structure:
Main Goal
├── Subgoal A
│ └── Subgoal A1
└── Subgoal B
├── Subgoal B1
└── Subgoal B2


---

## 🔗 Data Flow
1. The **frontend** (React) sends API requests to the **backend** via REST endpoints.  
2. The **backend** handles requests using Express controllers.  
3. Data is stored and retrieved from **SQLite** through Mongoose models.  
4. The frontend dynamically updates the tree view based on the API responses.

---

## 🤖 Antigravity AI Guidance
Antigravity acts as an AI development assistant within this repository.  
Its primary responsibility is to **generate or modify code while respecting the MVC architecture**.

Rules for Antigravity:
1. All data-related logic → **Model**  
2. All user interaction logic → **Controller**  
3. All UI rendering → **View (React components)**  
4. Backend routes and controllers must remain separate — no mixed responsibilities  
5. Always ensure frontend and backend stay decoupled and communicate only via API

---

## 🚀 Future Possibilities
- User authentication and individual accounts  
- Cloud syncing of goal data  
- Goal completion statistics and analytics  
- Collaborative goal sharing between users  
- Visual customization of the goal tree  

---

### Summary
1% is a fullstack goal visualization and management app built with **React (Vite)** on the frontend and **Node.js/Express + SQLite** on the backend.  
Both layers follow the **MVC design pattern**, ensuring clean, maintainable, and scalable architecture.  
The result will be an interactive tree-based interface where users can create, explore, and track their goals in a structured and motivating way.
