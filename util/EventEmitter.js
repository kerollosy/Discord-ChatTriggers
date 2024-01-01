/**
 * Simple event emitter implementation allowing registration and emission of events.
 */
export class EventEmitter {
    /**
     * Creates a new EventEmitter instance.
     */
    constructor() {
        /**
         * @private
         * @type {Object.<string, Array<function>>}
         * A dictionary to store arrays of listeners for each event.
         */
        this.events = {}
    }

    /**
     * Adds a listener function to the specified event.
     * @param {string} event - The name of the event to attach the listener to.
     * @param {function} listener - The function to be called when the event is emitted.
     */
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    /**
     * Emits an event, triggering all registered listeners for that event.
     * @param {string} event - The name of the event to emit.
     * @param {...any} args - Arguments to be passed to each listener function.
     */
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }
}