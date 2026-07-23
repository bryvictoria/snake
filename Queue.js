export default class Queue{
    
    _queue = []
    _posSet = new Set()

    constructor(){

    }

    enqueue(item){
        this._queue.push(item);
        this._posSet.add(item[0]+','+item[1])
    }

    has(pos){
        return this._posSet.has(pos[0]+','+pos[1])
    }

    reset(){
        this._queue = []
        this._posSet = new Set()
    }

    get(pos){
        return this._queue.find(i => i[0] === pos[0] && i[1] === pos[1])
    }
    getIndex(pos){
        return this._queue.findIndex(i => i[0] === pos[0] && i[1] === pos[1])
    }

    update(item){
        let index = this.getIndex(item)
        this._queue[index] = item
    }
    dequeue(){
        return this._queue.shift()
    }

    isEmpty(){
        return this._queue.length == 0
    }
}