export class GraphHistoryManager {
    /**
     * Saves and restores the graph data.
     * This class is usefull to implement shortcuts
     * to undo/redo operations on a graph.
     * 
     * @param {*} cy the graph which status will be saved
     * @param {*} maxHistory the number of allowed undo/redo operations
     */
    constructor(cy, maxHistory = 50) {
        if (maxHistory < 1) {
            throw new Error("The max history must be >= 1");
        }
        this.cy = cy;
        this.maxHistory = maxHistory;
        
        /**
         * @type {any[]}
         */
        this.undoStack = [];
        /**
         * @type {any[]}
         */
        this.redoStack = [];
    }

    /**
     * Saves the current graph state in order
     * to restore it later if needed.
     * @returns null
     */
    save() {
        /* Comprares the current state
        with the previews one in order to
        not allow useless saves */
        const current = this.cy.json();
        const last = this.undoStack[this.undoStack.length - 1];

        if (last && JSON.stringify(last.elements) === JSON.stringify(current.elements)) {
            return;
        }

        // saves the state
        this.undoStack.push(current);
        // to many saved states. Deletes the oldest.
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    /**
     * Restores the last saved operation
     * in the undo stack
     * @returns null
     */
    undo() {
        // needs at least a status to go back to
        if (this.undoStack.length < 2) {
            return;
        };

        // move the current status to the redo stack
        const current = this.undoStack.pop();
        this.redoStack.push(current);

        // revert the previews status
        const prev = this.undoStack[this.undoStack.length - 1];
        this.cy.json(prev);
    }

    /**
     * Restores the last saved operation
     * in the redo stack
     * @returns null
     */
    redo() {
        // nees ad least a status to revert
        if (this.redoStack.length === 0) {
            return;
        }

        // the last status that can be reverted back
        const next = this.redoStack.pop();
        this.undoStack.push(next);
        this.cy.json(next);
    }
}