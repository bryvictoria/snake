export default class PriorityQueue{
    //let newI = {f:100}; const items = [{f:3},{f:8},{f:12},{f:14},{f:14},{f:20}]; let s = items.length; for(let i =0;i< items.length;i++){ if(items[i].f > newI.f){ s = i; break;} } items.splice(s,0,newI); items

    board = {width:100,height:100,tileSize:6,area: 600}
    _queue = []
    _posSet = new Set()
    _fScore = new Int32Array(this.board.width*this.board.height).fill(0)

    constructor(){

    }

    enqueue(posId,f){

        let s = this._queue.length
        
        
        for(let i =0;i< this._queue.length;i++){ 
            if(this._fScore[this._queue[i]] < f){ 
                s = i; break;
            } 
        }

        this._queue.splice(s,0,posId);
        this._posSet.add(posId)
        this._fScore[posId] = f

    }

    _key(pos){
//        return pos[0] * this.board.width + pos[1]
        return pos[0]/this.board.tileSize  + pos[1]/this.board.tileSize * this.board.width
    }

    has(posId){
        return this._posSet.has(posId)
    }

    reset(){
        this._queue = []
        this._posSet = new Set()
    }

    get(posId){
        return this._queue.find(i => i === posId)
    }
    getIndex(posId){
        return this._queue.findIndex(i => i === posId)
    }

    update(posId,f){
        let index = this.getIndex(posId)
        this._queue.splice(index,1)
        this.enqueue(posId,f)
    }
    dequeue(){
        let i = this._queue.pop()
        this._posSet.delete(i)
        this._fScore[i] = 0
        return i
    }

    isEmpty(){
        return this._queue.length == 0
    }
}