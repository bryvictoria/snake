import SearchAlgorithm from './SearchAlgorithm.js'


export default class DepthFirstSearch extends SearchAlgorithm{

    
    bounded = false
    cap = 1000
    nodes = null
    visitedNodes = new Set()
    goal = null
    anchor = null
    shadow = []
    obstacles = []
    start = null
    path = []
    pathSet = new Set()
    shadowSet = new Set()
    obstacleSet = new Set()
    nudge = true
    
    ctr  = 0
    forwardCtr = 0
    maxIterations = 10000
    maxCoiling = 200

    _capReached = false
    allDirections = [];

    chainPos = []
    
    draw(ctx){

        const size = this.board.tileSize;

        ctx.stroke();
        for(let mark of this.path){
            this.colorTile(ctx,...mark,'yellow')
        }

        if(this.shadow)
        for(let mark of this.shadow){
            if(mark){
                this.colorTile(ctx,...mark,'red')
            }
        }

        

    }

    
    setAnchor(anchor){
        this.anchor = [...this.anchor.position]
    }
    

    generatePath(){


        this.resetTiles()

        const [head,...body] = this.chain
        this.start = [...head.position]
        this.shadow = this.chain.map(i => i.position).reverse()
        this.chainPos = this.chain.map(i => i.position).reverse()
        this.shadowSet = new Set(this.shadow.map(i => i[0]+','+i[1]))
        this.obstacleSet = new Set()

        this.goal = [...this._target.position]
        this._goalFound = false
        this._capReached = false
        
        this.nodes = [this.start]
        this.visitedNodes = new Set()
        this.path = []
        this.pathSet = new Set();

        this.ctr = 0
        this.forwardCtr = 0

        if(this.anchor === null)
            this.anchor = this.goal
    
    //    window.debugger.log('DFS-')
    //    window.debugger.log('goal:'+JSON.stringify(this.goal))
    //    window.debugger.log('head:'+JSON.stringify(this.start))
        window.debugger.log('DFS goal:'+JSON.stringify(this.goal) +' body:'+JSON.stringify(this.shadow))
        
        try{
            while(this.nodes.length > 0 && (!this._goalFound || !this._capReached)){
                this.searchNodes()
                
            }
        } catch(e){
            //window.debugger.log(e.message)
        }

        window.debugger.log('goal reached:'+this._goalFound)
        window.debugger.log('max coiling:'+this.maxCoiling)
        window.debugger.log('path:'+this.path.length+JSON.stringify(this.path))
        window.debugger.log('path length:'+this.path.length)
        window.debugger.log('depth:'+JSON.stringify(this.depth))
        window.debugger.log('ctr:'+JSON.stringify(this.ctr))
        window.debugger.log('forward:'+JSON.stringify(this.forwardCtr))

        return this.path

    }

    colorTile(ctx,x,y,color){

    
        ctx.beginPath()
        ctx.fillStyle = color ?? 'brown'
        ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        ctx.stroke()
        
    }
    
    

    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 600 
                || 
            node[1] < 0 || node[1] >= 600 
        )
            return false

        let isPassable = !this.shadowSet.has(node[0]+','+node[1]);

        if(isPassable) 
            isPassable = !this.pathSet.has(node[0]+','+node[1])

        if(isPassable) 
            isPassable = !this.obstacleSet.has(node[0]+','+node[1])

        return isPassable

    }

    isVisited(point){
        return this.visitedNodes.has(`[${point[0]},${point[1]}]`)
    }

    depth = 0
    neighbors = []

    anchor = null

    setAnchor(anchor){
        this.anchor = anchor
    }

    getMaxCoiling(anchor){
        return this.maxCoiling
    }
    
    setMaxCoiling(maxCoiling){
        this.maxCoiling = maxCoiling
    }
    
    setCap(cap){
        this.cap = cap
    }

    setBounded(bounded){
        this.bounded = bounded
    }

    searchNodes(){
        let newNodes = []
        const len = this.nodes.length
        const tileSize = this.board.tileSize
        const directionsMap = [
            [0, tileSize], [tileSize, 0], [0, -tileSize], [-1 * tileSize, 0]
        ];
        let isBacktrack = false
        let neighborNodes = []
        let neighborNodesF = []

        for(let i = 0; i < len ;i++){

            if(this.ctr > this.maxIterations)
                break;
            ////window.debugger.log(this.bounded , this.path.length , this.cap)
            if(this.bounded && this.path.length > this.cap){
                this._capReached = true;
                break;
            }

            let node = this.nodes[i]

            if(this.collides(node,this.goal) || this.collides(node,this.anchor)){
                //console.log("this collided:",node,this.goal,this.anchor)
                this._goalFound = true;
                break;
            }

            if(node == undefined && this.depth == 0){
                node = this.start
            }
            
            if(!isBacktrack){
                let randomOrderedDirections = [[0,0], [0,0], [0,0], [0,0]];

                for (let i = 0; i < 4; i++) {
                    randomOrderedDirections[i][0] = directionsMap[i][0];
                    randomOrderedDirections[i][1] = directionsMap[i][1];
                }
                
                neighborNodes = []
                neighborNodesF = []
                for(let k = 0; k < randomOrderedDirections.length;k++ ){
                    let dir = randomOrderedDirections[k]

                    let neighborNode = [node[0]+dir[0],node[1]+dir[1]]
                    neighborNodesF.push(neighborNode)
                    if(this.isPassable(neighborNode) && !this.isVisited(neighborNode)){
                        neighborNodes.push(neighborNode)
                    }
                }

            } else{
                ////window.debugger.log('backtrack');
                neighborNodes = this.neighbors.pop()
            }
            
            

            let firstNeighbor = null

            let coilAway = true
            if(this.forwardCtr > this.maxCoiling)
                coilAway = false

            if(neighborNodes.length){
                let neighborsF = []
                for(let l in neighborNodes){

                    let gh = (this.computeDistance([neighborNodes[l][0],neighborNodes[l][1]],this.start)) + (this.computeManhattanDistance([neighborNodes[l][0],neighborNodes[l][1]],(coilAway?this.anchor:this.goal)) * (this.nudge?1.0001:1))
                    neighborsF[l] = gh

                }
                //console.log(JSON.stringify(neighborsF)+" NODE: "+JSON.stringify(node)+" NODES: "+JSON.stringify(neighborNodes))
                let nIndex = 0
                if(!this.bounded){
                    

                    

                    nIndex = coilAway ? neighborsF.indexOf(Math.max(...neighborsF)) : neighborsF.indexOf(Math.min(...neighborsF))

                    const isTie = neighborsF.every(v => v === neighborsF[0])

                    if(isTie){
                        neighborsF = []
                        for(let m in neighborNodes){

                            let gh = (this.computeManhattanDistance([neighborNodes[m][0],neighborNodes[m][1]],this.start)) + (this.computeManhattanDistance([neighborNodes[m][0],neighborNodes[m][1]],(coilAway?this.anchor:this.goal)) * (this.nudge?1.0001:1))
                            neighborsF[m] = gh

                        }
                        nIndex = coilAway ? neighborsF.indexOf(Math.max(...neighborsF)) : neighborsF.indexOf(Math.min(...neighborsF))
                    }
                } 
                firstNeighbor = neighborNodes[nIndex]
            }
            
            if(firstNeighbor != null){

                this.neighbors.push(neighborNodes)
                
                this.visitedNodes.add(`[${firstNeighbor[0]},${firstNeighbor[1]}]`)
                newNodes = [firstNeighbor]

                this.path.push(firstNeighbor)
                this.pathSet.add(firstNeighbor[0]+','+firstNeighbor[1])

                this.shadow.push(firstNeighbor)
                const removedSet = this.shadow.shift()

                

        //        //window.debugger.log(this.ctr+':'+`[${firstNeighbor[0]},${firstNeighbor[1]}]`+':'+JSON.stringify(this.shadow))

                this.shadowSet.add(firstNeighbor[0]+','+firstNeighbor[1])
                this.shadowSet.delete(removedSet[0]+','+removedSet[1])

                
                this.depth++
                this.forwardCtr++
                isBacktrack = false



            }else if(this.depth > 0) {
                this.depth--
                this.neighbors.pop()
                
                const removedSet = this.shadow.pop()

                let backNode = null
                let backNodeIndex = this.path.length - this.shadow.length - 2
        //        //window.debugger.log('backtrack?',backNodeIndex,backNode);
                
                if(backNodeIndex < 0){
                    backNodeIndex = this.chain.length - (this.shadow.length - this.path.length + 2)
                    backNode = this.chainPos[backNodeIndex]
                }else{
                    backNode = this.path[backNodeIndex]
                }

                

        //        //window.debugger.log('backtrack??',backNodeIndex,backNode);
                if(backNode){
                    this.shadow.unshift(backNode)
                    this.shadowSet.add(backNode[0]+','+backNode[1])
                }
                this.shadowSet.delete(removedSet[0]+','+removedSet[1])
                
        //        //window.debugger.log("<:"+this.ctr)

                const removed = this.path.pop()
                this.pathSet.delete(removed[0]+','+removed[1])

                
                let poppedNode = this.path[this.path.length-1]
                newNodes = [poppedNode]
                if(poppedNode)
                    this.visitedNodes.add(`[${poppedNode[0]},${poppedNode[1]}]`)
                isBacktrack = true
            
            }
            
        }
        


        this.nodes = newNodes
        this.ctr++
    
    }

    
    setObstacle(obstacles){
        this.obstacleSet = new Set(obstacles.map(i => i[0]+','+i[1]))
    }
    

}