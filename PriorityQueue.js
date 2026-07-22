export default class PriorityQueue{
    //let newI = {f:100}; const items = [{f:3},{f:8},{f:12},{f:14},{f:14},{f:20}]; let s = items.length; for(let i =0;i< items.length;i++){ if(items[i].f > newI.f){ s = i; break;} } items.splice(s,0,newI); items

    _queue = []
    _posSet = new Set()

    constructor(){

    }

    enqueue(item){
        let s = this._queue.length
        for(let i =0;i< this._queue.length;i++){ 
            if(this._queue[i][2] > item[2]){ 
                s = i; break;
            } 
        } 
        this._queue.splice(s,0,item);
        this._posSet.add(item[0]+','+item[1])
        //console.log(this._queue)
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
        this._queue.splice(index,1)
        this.enqueue(item)
    }
    dequeue(){
        return this._queue.shift()
    }

    isEmpty(){
        return this._queue.length == 0
    }
}