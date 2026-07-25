export default class Queue{
    
    _queue = []

    constructor(){

    }

    enqueue(item){
        this._queue.push(item);
    }


    reset(){
        this._queue = []
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