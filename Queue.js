export default class Queue{
    
    _queue = []

    constructor(){

    }

    enqueue(item){
        this._queue.push(item);
    }

    has(pos){
        return this._posSet.has(pos[0]+','+pos[1])
    }

    reset(){
        this._queue = []
    }

    get(pos){
        return this._queue.find(i => i[0] === pos[0] && i[1] === pos[1])
    }
    getIndex(pos){
        return this._queue.findIndex(i => i[0] === pos[0] && i[1] === pos[1])
    }

    dequeue(){
        return this._queue.shift()
    }

    isEmpty(){
        return this._queue.length == 0
    }
    length(){
        return this._queue.length
    }
}