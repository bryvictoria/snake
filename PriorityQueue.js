export default class PriorityQueue{
    //let newI = {f:100}; const items = [{f:3},{f:8},{f:12},{f:14},{f:14},{f:20}]; let s = items.length; for(let i =0;i< items.length;i++){ if(items[i].f > newI.f){ s = i; break;} } items.splice(s,0,newI); items

    _queue = []
    _posSet = new Set()

    constructor(){

    }

    enqueue(item){
        let s = this._queue.length
        for(let i =0;i< this._queue.length;i++){ 
            if(this._queue[i][2] < item[2]){ 
                s = i; break;
            } 
        } 
        this._queue.splice(s,0,item);
        this._posSet.add(this._key(item))
        //console.log(this._queue)
    }
    _key(pos){
        return pos[0] * 100 + pos[1]
    }
    has(pos){
        return this._posSet.has(this._key(pos))
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
        let item = this._queue.pop()
        this._posSet.delete(this._key(item))
        return item
    }

    isEmpty(){
        return this._queue.length == 0
    }
}