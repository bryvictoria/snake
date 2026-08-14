import Queue from './Queue.js'
import SearchAlgorithm from './SearchAlgorithm.js'


export default class BreadthFirstSearch extends SearchAlgorithm{

    

    
    nodes = null
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
        this.obstacleSet = new Set([...this.chain.map(i => this._key(i.position))])
        this.goal = this._target.position
        this._goalFound = false
        this.nodes = new Array(100 * 100).fill(null)
        this.q.enqueue(this._key(this.start))
        this.nodes[this._key(this.start)] = [this.start[0],this.start[1],null,0]

        this.visitedNodes = new Uint8Array(10000).fill(0)
        this.visitedNodes[this._key(this.start)] = 1
        this.path = []
        this.markings = [];
        this.ctr = 0

        window.debugger.log('BFS goal:'+JSON.stringify(this.goal)+' body:'+JSON.stringify(this.obstacles))
        
        const tileSize = this.board.tileSize
        const directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
        let goalIndex = null
        while(!this.q.isEmpty()  ){
            
            const posId = this.q.dequeue()
            
            const node = this.nodes[posId]
            const g = node[3] + 1;

            if(posId === this._key(this.goal)){
                
                this._goalFound = true
                goalIndex = posId
                window.debugger.log('goal found, generate path',goalIndex);
                break;
            } else if(max != null && max == g){
                this._goalFound = true
                goalIndex = posId
                window.debugger.log('goal found, generate path',goalIndex);
                break;
            }

            

             for(let i =0 ;i < directionsMap.length; i++){



                let nPos = [node[0]+directionsMap[i][0],node[1]+directionsMap[i][1]]
                
                
                
                if(
                    nPos[0] < 0 || nPos[0] >= 600 
                        || 
                    nPos[1] < 0 || nPos[1] >= 600 
                )
                    continue

                let nPosid = nPos[0]/tileSize + nPos[1]/tileSize * this.board.width

                

                if(!this.obstacleSet.has(nPosid) && this.visitedNodes[nPosid] === 0) {
                    

                    let p = posId

                    this.nodes[nPosid] = [nPos[0],nPos[1],p,g]
                    this.visitedNodes[nPosid] = 1
                    this.q.enqueue(nPosid)
                }
            }
            
        }

        if(goalIndex != null){
            this.path = []
            let parentIndex = goalIndex
            
            while(parentIndex != null){
                let n = this.nodes[parentIndex]
                if(n) {
                    this.path.push([n[0],n[1]])
                    parentIndex = n[2]
                }
            }
            this.path.pop()
            this.path.reverse()

        }


        window.debugger.log('goal reached:'+this._goalFound)
        window.debugger.log('path found:'+JSON.stringify(this.path))
        
        return this.path
    }

    
    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 600 
                || 
            node[1] < 0 || node[1] >= 600 
        )
            return false

        return !this.obstacleSet.has(this._key(node))

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
        if(this.nodes)
            for(let n of this.nodes.filter(i => i != null)){
                this.colorTile(ctx,n[0],n[1],'lightgreen')
            }

        for(let n of this.path){
            this.colorTile(ctx,n[0],n[1],'blue')
        }

       
    }
    

    
    

}