export default class StarSearch{

    ctx = null
    board = {width:100,height:100,tileSize:4}

    chain = null
    target = null
    nodes = null
    visitedNodes = []
    goal = null
    obstacles = []
    start = null
    path = []
    nudge = true
    tiles = []
    markings = []
    ctr  = 0
    
    constructor(ctx,chain,target){
        this.ctx = ctx
        this.chain = chain
        this.target = target

        this.resetTiles()


        

    }

    draw(){
        const size = this.board.tileSize;

        this.ctx.beginPath();
        this.ctx.strokeStyle = "lightgray";
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.tiles.length; x++) {
            for (let y = 0; y < this.tiles[x].length; y++) {
                const startX = x * size;
                const startY = y * size;

                // Left border
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(startX, startY + size);

                // Bottom border
                this.ctx.lineTo(startX + size, startY + size);
            }
        }

        this.ctx.stroke();
        for(let mark of this.markings){
            this.colorTile(...mark)
        }
    }

    resetTiles(){

        for(let x = 0; x<= this.board.height; x++){
            this.tiles[x] = []
            for(let y = 0; y<= this.board.height; y++){
                this.tiles[x][y] = 0
            }
        }
    }

    hasFoundGoal = false
    generatePath(){
        this.resetTiles()

        const [head,...body] = this.chain
        this.start = head.position
        this.obstacles = this.chain.map(i => i.position)
        this.goal = this.target.position
        this.hasFoundGoal = false
        
        this.nodes = [this.start]
        this.visitedNodes = []
        this.path = []
        this.markings = [];
        this.ctr = 0

        console.log('goal:'+JSON.stringify(this.goal))
        console.log('head:'+JSON.stringify(this.start))
        console.log('body:'+JSON.stringify(this.obstacles))
        
        while(this.nodes.length > 0 && !this.hasFoundGoal){
            this.searchNodes();
            
        }
        console.log('path:'+JSON.stringify(this.path))
        return this.path
    }

    colorTile(x,y,color){

        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.fillRect(x + this.board.tileSize/2, y +this.board.tileSize/2 , this.board.tileSize/2, this.board.tileSize/2)
        this.ctx.stroke()

        
    }
    collides(pos,targetPos){
        return pos[0] == targetPos[0] && pos[1] == targetPos[1]
    }
    isPassable(node){
        if(
            node[0] < 0 || node[0] > 400 
                || 
            node[1] < 0 || node[1] > 400 
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

    computeManhattanDistance(start,end){
        return Math.abs(end[0]-start[0]) + Math.abs(end[1]-start[1])
    }
    isVisited(point){
        return this.visitedNodes.includes(JSON.stringify(point))
    }
    searchNodes(){
        let newNodes = []
        const len = this.nodes.length
        const tileSize = this.board.tileSize
        for(let i = 0; i < len ;i++){
            
            let node = this.nodes[i]

            let directionsMap = [[0,-1*tileSize],[0,tileSize],[tileSize,0],[-1*tileSize,0]]
            let neighborNodes = directionsMap.map((i,index) => [node[0]+i[0],node[1]+i[1]]).filter(i => this.isPassable(i) && !this.isVisited(i))

            let lowestGh = 999;
            let lowestNeighbor = null;

            for(let j in neighborNodes){

                this.visitedNodes.push(JSON.stringify(neighborNodes[i]))
                if(this.collides(neighborNodes[j],this.goal))
                    this.hasFoundGoal = true;
                
                let gh = this.computeManhattanDistance([neighborNodes[j][0],neighborNodes[j][1]],this.start) + (this.computeManhattanDistance([neighborNodes[j][0],neighborNodes[j][1]],this.goal) * (this.nudge?1.0001:1))
                
                if(gh < lowestGh){
                    lowestGh = gh
                    lowestNeighbor = neighborNodes[j]
                }
            }

            if(lowestNeighbor != null){
                newNodes.push(lowestNeighbor)
                this.path.push(lowestNeighbor)



                this.markings.push([lowestNeighbor[0],lowestNeighbor[1],this.greenScale(this.ctr++)])
            }
        }
        
        this.nodes = newNodes
        
    }
    greenScale(i, totalSteps = 400) {
        const maxStep = totalSteps - 1;
        const clampedI = Math.max(0, Math.min(i, maxStep));
        
        const rValue = Math.round(255 - (clampedI * (255 / maxStep)));
        const rHex = rValue.toString(16).padStart(2, '0').toUpperCase();
        
        return `#${rHex}FF00`;
    }

}