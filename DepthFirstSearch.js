import SearchAlgorithm from './SearchAlgorithm.js'


export default class DepthFirstSearch extends SearchAlgorithm{

    
    
    nodes = null
    visitedNodes = new Set()
    goal = null
    obstacles = []
    start = null
    path = []
    pathSet = new Set()
    obstacleSet = new Set()
    nudge = true
    
    ctr  = 0
    forwardCtr = 0
    maxIterations = 10000
    maxCoiling = 2000

    allDirections = [];

    chainPos = []
    
    draw(){

        const size = this.board.tileSize;

        this.ctx.stroke();
        for(let mark of this.path){
            this.colorTile(...mark,'yellow')
        }

        if(this.obstacles)
        for(let mark of this.obstacles){
            if(mark){
                this.colorTile(...mark,'red')
            }
        }

        

    }

    

    

    generatePath(){


        this.resetTiles()

        const [head,...body] = this.chain
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position).reverse()
        this.chainPos = this.chain.map(i => i.position).reverse()
        this.obstacleSet = new Set(this.obstacles.map(i => i[0]+','+i[1]))

        this.goal = this._target.position
        this._goalFound = false
        
        this.nodes = [this.start]
        this.visitedNodes = new Set()
        this.path = []
        this.pathSet = new Set();

        this.ctr = 0
        this.forwardCtr = 0

        this.anchor = this.goal
        

    //    console.log('DFS')
    //    console.log('goal:'+JSON.stringify(this.goal))
    //    console.log('head:'+JSON.stringify(this.start))
    //    console.log('body:'+JSON.stringify(this.obstacles))
        
        try{
            while(this.nodes.length > 0 && !this._goalFound){
                this.searchNodes()
                
            }
        } catch(e){
            console.log(e.message)
        }

        console.log('goal reached:'+this._goalFound)
        console.log('max coiling:'+this.maxCoiling)
    //    console.log('path:'+this.path.length+JSON.stringify(this.path))
        console.log('path length:'+this.path.length)
        console.log('depth:'+JSON.stringify(this.depth))
        console.log('ctr:'+JSON.stringify(this.ctr))
        console.log('forward:'+JSON.stringify(this.forwardCtr))

        return this.path

    }

    colorTile(x,y,color){

    
        this.ctx.beginPath()
        this.ctx.fillStyle = color ?? 'brown'
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()
        
    }
    
    

    isPassable(node){
        if(
            node[0] < 0 || node[0] >= 400 
                || 
            node[1] < 0 || node[1] >= 400 
        )
            return false

        let isPassable = !this.obstacleSet.has(node[0]+','+node[1]);

        if(isPassable) 
            isPassable = !this.pathSet.has(node[0]+','+node[1])

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
            
            
            let node = this.nodes[i]

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
                //console.log('backtrack');
                neighborNodes = this.neighbors.pop()
            }
            
            for(let j in neighborNodes){
                if(this.collides(neighborNodes[j],this.goal))
                    this._goalFound = true;
            }

            let firstNeighbor = null

            if(neighborNodes.length){
                let neighborsF = []
                for(let l in neighborNodes){

                    let gh = this.computeManhattanDistance([neighborNodes[l][0],neighborNodes[l][1]],this.start) + (this.computeManhattanDistance([neighborNodes[l][0],neighborNodes[l][1]],this.anchor) * (this.nudge?1.0001:1))
                    neighborsF[l] = gh

                }

                let coilAway = true

                if(this.forwardCtr > this.maxCoiling)
                    coilAway = false

                let nIndex = coilAway ? neighborsF.indexOf(Math.max(...neighborsF)) : neighborsF.indexOf(Math.min(...neighborsF))

                const isTie = neighborsF.every(v => v === neighborsF[0])

                if(isTie){
                    neighborsF = []
                    for(let m in neighborNodes){

                        let gh = this.computeManhattanDistance([neighborNodes[m][0],neighborNodes[m][1]],this.start) + (this.computeDistance([neighborNodes[m][0],neighborNodes[m][1]],this.anchor) * (this.nudge?1.0001:1))
                        neighborsF[m] = gh

                    }
                    nIndex = coilAway ? neighborsF.indexOf(Math.max(...neighborsF)) : neighborsF.indexOf(Math.min(...neighborsF))
                }

                firstNeighbor = neighborNodes[nIndex]
            }
            
            if(firstNeighbor != null){

                this.neighbors.push(neighborNodes)
                
                this.visitedNodes.add(`[${firstNeighbor[0]},${firstNeighbor[1]}]`)
                newNodes = [firstNeighbor]

                this.path.push(firstNeighbor)
                this.pathSet.add(firstNeighbor[0]+','+firstNeighbor[1])

                this.obstacles.push(firstNeighbor)
                const removedSet = this.obstacles.shift()

                

        //        console.log(this.ctr+':'+`[${firstNeighbor[0]},${firstNeighbor[1]}]`+':'+JSON.stringify(this.obstacles))

                this.obstacleSet.add(firstNeighbor[0]+','+firstNeighbor[1])
                this.obstacleSet.delete(removedSet[0]+','+removedSet[1])

                
                this.depth++
                this.forwardCtr++
                isBacktrack = false



            }else if(this.depth > 0) {
                this.depth--
                this.neighbors.pop()
                
                const removedSet = this.obstacles.pop()

                let backNode = null
                let backNodeIndex = this.path.length - this.obstacles.length - 2
        //        console.log('backtrack?',backNodeIndex,backNode);
                
                if(backNodeIndex < 0){
                    backNodeIndex = this.chain.length - (this.obstacles.length - this.path.length + 2)
                    backNode = this.chainPos[backNodeIndex]
                }else{
                    backNode = this.path[backNodeIndex]
                }

                

        //        console.log('backtrack??',backNodeIndex,backNode);
                if(backNode){
                    this.obstacles.unshift(backNode)
                    this.obstacleSet.add(backNode[0]+','+backNode[1])
                }
                this.obstacleSet.delete(removedSet[0]+','+removedSet[1])
                
        //        console.log("<:"+this.ctr)

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

    
    setObstacle(){
        this.obstacles = [];
        if(this.path.length >= this.chain.length){
            this.obstacles = this.path.slice( this.path.length - this.chain.length, this.path.length )
        }else{
            this.obstacles = [ ...this.path, ...this.chain.map(i=>i.position).slice( 0, this.chain.length - this.path.length ) ]
        }
        this.obstacleSet = new Set(this.obstacles.map(i => i[0]+','+i[1]))
    }
    

}