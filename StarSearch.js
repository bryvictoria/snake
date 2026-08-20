import PriorityQueue from './PriorityQueue.js'
import SearchAlgorithm from './SearchAlgorithm.js'


export default class StarSearch extends SearchAlgorithm{

    nodes = {}
    visitedNodes = null
    goal = null
    obstacles = []
    obstacleSet = new Set()
    start = null
    path = []
    nudge = true
    markings = []
    ctr  = 0

    pq = new PriorityQueue()
    
    generatePath(){

        const [head,...body] = this.chain
        this.pq.reset()
        this.start = [...head.position]
        this.obstacles = this.chain.map(i => i.position)

        this.obstacleSet = new Set([...this.obstacles.map(i => this._key(i))])
        this.goal = [ ...this._target.position ]
        this._goalFound = false
        this.nodes = new Array(this.board.width * this.board.width).fill(null)
        this.enqueueNode(this.toNode(this.start))

        this.visitedNodes = new Uint8Array(this.board.width * this.board.width).fill(0)

        this.path = []
        this.markings = [];
        this.ctr = 0

        window.debugger.log(' A* goal:'+JSON.stringify(this.goal)+' body:'+JSON.stringify(this.obstacles))
        
        const tileSize = this.board.tileSize
        const directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
        let goalIndex = null
        let stopper = 0
        while(!this.pq.isEmpty()  && stopper++ < 1000000){
            const posId = this.pq.dequeue()
            const node = this.nodes[posId]

            if(this.collides([node.x,node.y],this.goal)){
                
                this._goalFound = true
                goalIndex = posId
                break;
            }

            this.visitedNodes[posId] = 1
            
            
            for(let i =0 ;i < directionsMap.length; i++){
                let nPos = [node.x+directionsMap[i][0],node.y+directionsMap[i][1]]
                let nPosId = this._key(nPos)
                if(this.isPassable(nPos) && !this.isVisited(nPosId)) {
                    
                    this.visitedNodes[nPosId] = 1

                    let g = node.g + 1
                    let h = this.computeHueristics(nPos)
                    let f = g + h
                    let p = posId

                    if(this.pq.has(nPos)){

                        let nNode = this.nodes[nPosId]

                        if(f < nNode.f ){
                            nNode.g = g
                            nNode.h = h
                            nNode.f = f
                            nNode.parent = p

                            this.pq.update(this._key([nNode.x,nNode.y]),nNode.f)
                        }
                        
                    }else{
                        let nNode = this.toNode(nPos)
                        nNode.g = g
                        nNode.h = h
                        nNode.f = f
                        nNode.parent = p
                        this.enqueueNode(nNode)
                    }

                }
            }

            

        }

        
        if(goalIndex != null){
            this.path = []
            let parentIndex = goalIndex
            
            while(parentIndex != null ){
                let n = this.nodes[parentIndex]
                if(n) {
                    if(!this.collides([n.x,n.y],this.start))
                        this.path.push([n.x,n.y])
                    parentIndex = n.parent
                }
            }

            this.path = this.path.reverse()
        }
        window.debugger.log('goal reached:'+this._goalFound)
        window.debugger.log('path:'+JSON.stringify(this.path))
        return this.path
    }
    enqueueNode(node){
        let posId = this._key([node.x,node.y])
        this.nodes[posId] = node
        this.pq.enqueue(posId,node.f)

    }
    computeHueristics(pos){
        return this.computeManhattanDistance(pos,this.goal)
    }
    toNode(pos){
        
        let node = {
            x: pos[0],
            y: pos[1],
            f:0,
            g:0,
            h:0,
            i:this._key(pos),
            parent: null
        }
        return node
    }
    flattenPosition(pos,delimiter = ','){
        return pos[0]+delimiter+ pos[1]
    }
    

    
    isPassable(node){

        let key = this._key(node)
        if(
            node[0] < 0 || node[0] >= 600 
                || 
            node[1] < 0 || node[1] >= 600 
        )
            return false

        if(this.obstacleSet.has(key))
            return false

        

        return true
    }

    


    isVisited(posId){
        return this.visitedNodes[posId] === 1
    }

    colorTile(ctx,x,y,color){
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        ctx.stroke()
        
    }
    draw(ctx,color){
        const size = this.board.tileSize;

        ctx.stroke();
        
        if(this.nodes.length)
            for(let n of this.nodes.filter(i => i != null)){
                this.colorTile(ctx,n.x,n.y,'lightgreen')
            }

        for(let n of this.path){
            this.colorTile(ctx,n[0],n[1],'green')
        }
        for(let n of this.obstacles){
            this.colorTile(ctx,n[0],n[1],'red')
        }
    }
    

    
    

}