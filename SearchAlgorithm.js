export default class SearchAlgorithm {


    ctx = null
    board = {width:100,height:100,tileSize:4}
    
    chain = null
    _target = null
    _goalFound = false

    tiles = []

    constructor(ctx,chain,target){
        this.ctx = ctx
        this.chain = chain
        this._target = target
        this.resetTiles()
    }

    resetTiles(){

        for(let x = 0; x<= this.board.height; x++){
            this.tiles[x] = []
            for(let y = 0; y<= this.board.height; y++){
                this.tiles[x][y] = 0
            }
        }
    }

    isGoalFound(){
        return this._goalFound
    }
    setTarget(target){
        this._target = target
    }
    setChain(chain){
        this.chain = chain
    }
    collides(pos,_targetPos){
        return pos[0] == _targetPos[0] && pos[1] == _targetPos[1]
    }

    computeManhattanDistance(start,end){
        return Math.abs(end[0]-start[0]) + Math.abs(end[1]-start[1])
    }

    computeDistance = (a, b) => {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy);
    };

}