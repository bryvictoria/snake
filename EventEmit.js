export default class EventEmit {

    #listeners = {};
    
    on(event, callback) {
        this.#listeners[event] = this.#listeners[event] || [];
        this.#listeners[event].push(callback);
    }

    emit(event, data) {
        this.#listeners[event]?.forEach(cb => cb(data));
    }

}