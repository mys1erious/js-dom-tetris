import {
    FIGURE_MAP,
    FIGURE_ROTATIONS_MAP,
    FIGURE_STYLE_MAP,
    START_ID,
    CELL_BORDER,
    FIG,
    FIG_STATIC, FIGURE_ROTATION_OFFSET_MAP
} from "../constants.js";
import {getCellIdAsTuple, getCellIdAsStr} from "../utils.js";


class FigureException extends Error {
    constructor(message) {
        super(message);
        this.name = 'FIGURE_EXCEPTION';
        this.message = message;
    };
}


const shuffleFigureKeys = () => {
    let keys = Object.keys(FIGURE_MAP);

    // Schwartzian transform, T: O(nlogn), M: O(n)
    let shuffledKeys = keys
        .map(val => ({ val, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ val }) => val);

    return shuffledKeys;
};


export const getShuffledFigures = () => {
    let shuffledKeys = shuffleFigureKeys();

    let figures = [];

    for (let key of shuffledKeys){
        figures.push(new Figure(key));
    }

    return figures;
};


export class Figure {
    constructor(figureType) {
        this.type = figureType;
        this.form = FIGURE_MAP[this.type];
        this.rotations = FIGURE_ROTATIONS_MAP[this.type];
        this.rotation_offsets = FIGURE_ROTATION_OFFSET_MAP[this.type];
        this.style = FIGURE_STYLE_MAP[this.type];
        this.curPos = [];
        this.rotationInd = null;
        this.inFly = true;
    };

    init = () => {
        const [startIdRow, startIdCol] = getCellIdAsTuple(START_ID);

        for(const cellId of this.form){
            let [rowInd, colInd] = getCellIdAsTuple(cellId);
            rowInd += startIdRow;
            colInd += startIdCol - 1;

            this.drawCell(rowInd, colInd);
            this.curPos.push(getCellIdAsStr(rowInd, colInd));
        }
        this.rotationInd = 0;
        console.log('INITED');
        document.addEventListener('keydown', this.keysDownEvent, false);
    };

    terminate = () => {
        document.removeEventListener('keydown', this.keysDownEvent, false);
    };

    drawCell = (rowInd, colInd) => {
        let cellStrId = getCellIdAsStr(rowInd, colInd);
        let curCell = document.getElementById(cellStrId);
        curCell.classList.add(this.style);
    };

    drawFigure = () => {
        for (let cellId of this.curPos) {
            let [rowInd, colInd] = getCellIdAsTuple(cellId);
            this.drawCell(rowInd, colInd);
        }
    };

    eraseCell = (rowInd, colInd) => {
        let cellStrId = getCellIdAsStr(rowInd, colInd);
        let curCell = document.getElementById(cellStrId);
        curCell.classList.remove(this.style);
    };

    eraseFigure = () => {
        for (let cellId of this.curPos) {
            let [rowInd, colInd] = getCellIdAsTuple(cellId);
            this.eraseCell(rowInd, colInd);
        }
    };

    makeFigureStatic = () => {
        for (let cellId of this.curPos) {
            let curCell = document.getElementById(cellId);
            curCell.classList.add(FIG_STATIC);
        }
    };

    keysDownEvent = (event) => {
        const name = event.key;
        const code = event.code;

        let keysHandlingMap = {
            'ArrowDown': this.moveDownHandling,
            'ArrowLeft': this.moveSideHandling,
            'ArrowRight': this.moveSideHandling
        };

        let keysPosMap = {
            'ArrowDown': 'bottom',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
        };

        try {keysHandlingMap[code](keysPosMap[code]);}
        catch (error) {}

        if (code === 'ArrowUp'){
            this.rotate();
        }

    };

    moveFigure = (pos) => {
        this.eraseFigure();
        this.curPos = this.getNextPos(pos);
        this.drawFigure();
    };

    moveDownHandling = (pos) => {
        if (this.nextPosInCollisionClass(pos, CELL_BORDER) ||
            this.nextPosInCollisionClass(pos, FIG_STATIC))
        {
            this.inFly = false;
            this.terminate();
            this.drawFigure();
            this.makeFigureStatic();
        }
        else this.moveFigure(pos);
    };

    moveSideHandling = (pos) => {
        if (
            this.nextPosInCollisionClass(pos, CELL_BORDER) ||
            this.nextPosInCollisionClass(pos, FIG_STATIC)
        ) {}
        else this.moveFigure(pos);

    };

    getNextPos = (pos) => {
        let posMap = {
            'left': [0, -1],
            'right': [0, 1],
            'bottom': [1, 0]
        };

        let nextPos = this.curPos.slice();
        let posVals = posMap[pos];
        for (let i = 0; i < this.curPos.length; i++) {
            let [rowInd, colInd] = getCellIdAsTuple(nextPos[i]);
            rowInd += posVals[0];
            colInd += posVals[1];

            nextPos[i] = getCellIdAsStr(rowInd, colInd);
        }

        return nextPos;
    };

    checkCollision = (cells, collisionClass) => {
        for (let cellId of cells) {
            let curCell = document.getElementById(cellId);
            if (curCell.classList.contains(collisionClass)) {
                return true;
            }
        }
        return false;
    };

    nextPosInCollisionClass = (pos, collisionClass) => {
        let nextPos = this.getNextPos(pos);
        return this.checkCollision(nextPos,  collisionClass);
    };

    getNextRotationMatrix = () => {
        let nextRotation = this.rotations[this.rotationInd];
        if (this.rotationInd === this.form.length-1) this.rotationInd = 0;
        else this.rotationInd++;

        return nextRotation;
    };

    getNextRotationPos = (nextRotationMatrix) => {
        let nextCurPos = [];

        for (let [i, curPosId] of this.curPos.entries()) {
            let [rotationRowId, rotationColId] = getCellIdAsTuple(nextRotationMatrix[i]);
            let [valRowId, valColId] = getCellIdAsTuple(curPosId);

            valRowId += rotationRowId;
            valColId += rotationColId;

            nextCurPos.push(getCellIdAsStr(valRowId, valColId));
        }

        return nextCurPos;
    };

    applyRotationOffset = (offset) => {
        let curPos = this.curPos.slice();
        let [offsetRow, offsetCol] = getCellIdAsTuple(offset);

        for (let [i, pos] of curPos.entries() ){
            let [rowPos, colPos] = getCellIdAsTuple(pos);
            curPos[i] = getCellIdAsStr(rowPos + offsetRow, colPos + offsetCol);
        }

        return curPos;
    };

    handleRotation = () => {
        let prevRotationInd = this.rotationInd;
        let prevPos = this.curPos.slice();

        let nextRotationMatrix = this.getNextRotationMatrix();
        this.curPos = this.getNextRotationPos(nextRotationMatrix);

        let rotated = false;
        let offsets = this.rotation_offsets[prevRotationInd];
        for (let offset of offsets) {
            let nextCurPos = this.applyRotationOffset(offset);
            if (
                !this.checkCollision(nextCurPos, CELL_BORDER) &&
                !this.checkCollision(nextCurPos, FIG_STATIC)
            ) {
                this.curPos = nextCurPos;
                rotated = true;
                break;
            }
        }

        if (!rotated) this.curPos = prevPos;
    };


    rotate = () => {
        this.eraseFigure();
        this.handleRotation();
        this.drawFigure();
    };
}
