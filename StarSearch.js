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
        this.resetTiles()
        const [head,...body] = this.chain
        this.pq.reset()
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position)
        this.goal = this._target.position
        this._goalFound = false
        this.nodes = new Array(100 * 100).fill(null)
        this.enqueueNode(this.toNode(this.start))

        this.visitedNodes = new Set()
        this.path = []
        this.markings = [];
        this.ctr = 0

        
        console.log('A*')
        console.log('goal:'+JSON.stringify(this.goal))
        //console.log('head:'+JSON.stringify(this.start))
        console.log('body:'+JSON.stringify(this.obstacles))
        
        const tileSize = this.board.tileSize
        const directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
        let goalIndex = null
        while(!this.pq.isEmpty()){
            const pos = this.pq.dequeue()
            const node = this.nodes[this.computeIndexByPosition(pos)]

            if(this.collides(pos,this.goal)){
                
                this._goalFound = true
                goalIndex = this.computeIndexByPosition(pos)
                //console.log('goal found, generate path',goalIndex);
                break;
            }

            this.visitedNodes.add(this.flattenPosition(pos))
            
            let nPos = directionsMap.map((i,index) => [pos[0]+i[0],pos[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))

            for(let i = 0 ; i < nPos.length;i++){
                
                let g = node.g + 1
                let h = this.computeHueristics(nPos[i])
                let f = g + h
                let p = this.computeIndexByPosition(pos)

                if(this.pq.has(nPos[i])){

                    let nNode = this.nodes[this.computeIndexByPosition(nPos[i])]

                    if(f < nNode.f ){
                        nNode.g = g
                        nNode.h = h
                        nNode.f = f
                        nNode.parent = p

                        this.pq.update([nNode.x,nNode.y,nNode.f])
                    }
                    
                }else{
                    let nNode = this.toNode(nPos[i])
                    nNode.g = g
                    nNode.h = h
                    nNode.f = nNode.g + nNode.h
                    nNode.parent = p

                    this.enqueueNode(nNode)
                }

            }

        }

        if(goalIndex){
            this.path = []
            let parentIndex = goalIndex
            let stopper = 0
            
            while(parentIndex != null && stopper < 1000){
                let n = this.nodes[parentIndex]
                if(n) {
                    if(!this.collides([n.x,n.y],this.start))
                        this.path.push([n.x,n.y])
                    parentIndex = n.parent
                }
                stopper++
            }

            this.path = this.path.reverse()
        }
        console.log('goal reached:'+this._goalFound)
        console.log('path:'+JSON.stringify(this.path))
        ////console.log('nodes:'+JSON.stringify(this.nodes.filter(i => i != null)))
        return this.path
    }
    enqueueNode(node){
        this.nodes[this.computeIndexByPosition([node.x,node.y])] = node
        this.pq.enqueue([node.x,node.y,node.f])

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
            i:this.computeIndexByPosition(pos),
            parent: null
        }
        return node
    }
    flattenPosition(pos,delimiter = ','){
        return pos[0]+delimiter+ pos[1]
    }
    computeIndexByPosition(pos){
        return pos[0] + pos[1] * this.board.width
    }
    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 400 
                || 
            node[1] < 0 || node[1] >= 400 
        )
            return false

        for(let obstacle of this.obstacles){
            if(this.collides(obstacle,node))
                return false 
        }

        for(let pathNode of this.path){
            if(this.collides(pathNode,node))
                return false 
        }

        return true
    }

    


    isVisited(point){
        return this.visitedNodes.has(this.flattenPosition(point))
    }

    colorTile(x,y,color){
        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()
        
    }
    draw(color){
        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let n of this.nodes.filter(i => i != null)){
            this.colorTile(n.x,n.y,'lightgreen')
        }

        for(let n of this.path){
            this.colorTile(n[0],n[1],color)
        }
    }
    

    
    

}