const API_URL = 'http://localhost:3001/api';

export const api = {
    /**
     * Get all goals as a tree structure
     */
    fetchGoals: async () => {
        const response = await fetch(`${API_URL}/goals`);
        if (!response.ok) throw new Error('Failed to fetch goals');
        return response.json();
    },

    /**
     * Create a new goal
     * @param {Object} goalData - { title, description, parentId }
     */
    createGoal: async (goalData) => {
        const response = await fetch(`${API_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(goalData),
        });
        if (!response.ok) throw new Error('Failed to create goal');
        return response.json();
    },

    /**
     * Update a goal
     * @param {number} id 
     * @param {Object} updates - { title, description, status }
     */
    updateGoal: async (id, updates) => {
        const response = await fetch(`${API_URL}/goals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update goal');
        return response.json();
    },

    /**
     * Delete a goal
     * @param {number} id 
     */
    deleteGoal: async (id) => {
        const response = await fetch(`${API_URL}/goals/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete goal');
        return true;
    }
};
