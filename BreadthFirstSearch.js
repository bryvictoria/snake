import Queue from './Queue.js'
import SearchAlgorithm from './SearchAlgorithm.js'


export default class BreadthFirstSearch extends SearchAlgorithm{

    

    
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

    q = new Queue()

    
    generatePath(max = null){
        this.resetTiles()
        const [head,...body] = this.chain
        this.q.reset()
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position)
        this.goal = this._target.position
        this._goalFound = false
        this.nodes = new Array(100 * 100).fill(null)
        this.q.enqueue([...this.start,null])
        this.nodes[this.computeIndexByPosition(this.start)] = {x:this.start[0],y:this.start[1],p:null,g:0}

        this.visitedNodes = new Set()
        this.path = []
        this.markings = [];
        this.ctr = 0

        
        //console.log('BFS')
        //console.log('goal:'+JSON.stringify(this.goal))
        //console.log('head:'+JSON.stringify(this.start))
        //console.log('body:'+JSON.stringify(this.obstacles))
        
        const tileSize = this.board.tileSize
        const directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
        let goalIndex = null
        let stopper = 0
        while(!this.q.isEmpty() && stopper < 10000){
            
            const pos = this.q.dequeue()
            
            const node = this.nodes[this.computeIndexByPosition(pos)]
            const g = node.g + 1;
            if(this.collides(pos,this.goal)){
                
                this._goalFound = true
                goalIndex = this.computeIndexByPosition(pos)
                //console.log('goal found, generate path',goalIndex);
                break;
            } else if(max != null && max == g){
                this._goalFound = true
                goalIndex = this.computeIndexByPosition(pos)
                //console.log('goal found, generate path',goalIndex);
                break;
            }

        //    this.visitedNodes.add(this.computeIndexByPosition(pos))
            
            let nPos = directionsMap.map((i,index) => [pos[0]+i[0],pos[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))
        ////console.log(JSON.stringify(nPos))
            for(let i = 0 ; i < nPos.length;i++){
                
                let p = this.computeIndexByPosition(pos)

        //        this.visitedNodes.add(this.computeIndexByPosition(nPos[i]))
                let nNode = [...nPos[i],p,g]

                this.nodes[this.computeIndexByPosition(nNode)] = {x:nNode[0],y:nNode[1],p,g}
                this.q.enqueue(nNode)
            }
            ////console.log('q:'+JSON.stringify(this.q.length()))
            ////console.log([...this.visitedNodes])
            stopper++

        }

        if(goalIndex){
            this.path = []
            let parentIndex = goalIndex
            
            while(parentIndex != null){
                let n = this.nodes[parentIndex]
                if(n) {
                    if(!this.collides([n.x,n.y],this.start))
                        this.path.push([n.x,n.y])
                    parentIndex = n.p
                }
            }

        }
        //console.log('goal reached:'+this._goalFound)
        //console.log('path:'+JSON.stringify(this.path))
        //console.log('nodes:'+JSON.stringify(this.nodes.filter(i => i != null)))
        return this.path
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

        return true
    }

    


    isVisited(point){
        //return this.visitedNodes.has(this.computeIndexByPosition([point[0],point[1]]))
        //return this.nodes[this.computeIndexByPosition(point)] != null

        const idx = point[0] + point[1] * this.board.width
        return this.nodes[idx] != null
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