/**
 * moves the node and all its descendants by the same delta
 * @param {Array} nodes - all nodes
 * @param {Array} edges - all edges
 * @param {Object} draggedNode - the node being dragged
 * @param {Object} delta - {x, y} change in position
 * @returns {Array} newNodes - updated list of nodes
 */
export const moveSubtree = (nodes, edges, draggedNode, delta) => {
    // Find all children of the dragged node
    const getChildren = (parentId) => {
        return edges
            .filter(edge => edge.source === parentId)
            .map(edge => edge.target);
    };

    // Recursive function to get all descendants
    const getDescendants = (parentId, visited = new Set()) => {
        const children = getChildren(parentId);
        children.forEach(childId => {
            if (!visited.has(childId)) {
                visited.add(childId);
                getDescendants(childId, visited);
            }
        });
        return visited;
    };

    const descendants = getDescendants(draggedNode.id);

    return nodes.map((node) => {
        // If it's a descendant, apply the delta
        if (descendants.has(node.id)) {
            return {
                ...node,
                position: {
                    x: node.position.x + delta.x,
                    y: node.position.y + delta.y,
                },
            };
        }
        return node;
    });
};
