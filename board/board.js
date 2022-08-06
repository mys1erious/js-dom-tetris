import {
    CELL,
    CELL_BLINK,
    CELL_BORDER,
    FIG_STATIC,
    BLINK_DELAY,
    ROW,
    ROW_CLEAR_POINTS,
    PLAYABLE_ROWS,
    COL,
    PLAYABLE_COLS,
    START_ID
} from "../constants.js";
import {getCellIdAsTuple, getCellIdAsStr, sleep} from "../utils.js";


export class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
    };

    draw = () => {
        const container = document.getElementById('main-container');
        const grid = document.createElement('div');
        grid.id = 'board';
        grid.classList.add('board-container');

        for (let row=1; row <= this.rows; row++) {
            for (let col=1; col <= this.cols; col++) {
                let cell = document.createElement('div');
                cell.classList.add(CELL);
                cell.style = this.getCellPos(row, col);
                cell.id = `${row}_${col}`;

                let bordersMap = {
                    'topRow': row === PLAYABLE_ROWS[0]-1 && col >= PLAYABLE_COLS[0]-1 && col <= PLAYABLE_COLS[1],
                    'botRow':  row === PLAYABLE_ROWS[1] && col >= PLAYABLE_COLS[0]-1 && col <= PLAYABLE_COLS[1],
                    'leftCol': col === PLAYABLE_COLS[0]-1 && row >= PLAYABLE_ROWS[0]-1 && row < PLAYABLE_ROWS[1],
                    'rightCol': col === PLAYABLE_COLS[1] && row >= PLAYABLE_ROWS[0]-1 && row < PLAYABLE_ROWS[1]
                };
                let bordersCondition =
                    bordersMap["topRow"] === true ||
                    bordersMap["botRow"] === true ||
                    bordersMap["leftCol"] === true ||
                    bordersMap["rightCol"] === true

                if (bordersCondition) {
                    cell.classList.add(CELL_BORDER);
                }

                grid.appendChild(cell);
            }
        }
        container.appendChild(grid);
    };

    getCellPos = (row, col) => {
        return `grid-row: ${row} / ${row}; grid-column: ${col} / ${col}`;
    };

    staticInFirstRow = () => {
        for (let i = 2; i < COL; i++) {
            let curId = `${PLAYABLE_ROWS[0]}_${i}`
            let curCell = document.getElementById(curId);
            if (curCell.classList.contains(FIG_STATIC)) return true;
        }
        return false;
    };

    getRowsInRange = (start, end, reversed=false) => {
        let rows = [];

        const rowAction = (i, rows) => {
            let curRow = [];
            for (let j=PLAYABLE_COLS[0]; j < PLAYABLE_COLS[1]; j++){
                let cell = document.getElementById(`${i}_${j}`);
                curRow.push(cell);
            }
            rows.push(curRow);
        };

        if (reversed) { for(let i=end; i > start; i--){rowAction(i, rows);} }
        else { for(let i=start; i < end; i++){rowAction(i, rows);} }

        return rows;
    };

    getAllRows = () => {
        let [rowId, _] = getCellIdAsTuple(START_ID);
        return this.getRowsInRange(rowId, PLAYABLE_ROWS[1]);
    }

    rowIsStatic = (row) => {
        for (let cell of row) {
            if (!cell.classList.contains(FIG_STATIC)) {
                return false;
            }
        }
        return true;
    };

    findFullStaticRows = () => {
        let rows = this.getAllRows();
        let staticRows = [];

        for (let row of rows) {
            if (this.rowIsStatic(row)) staticRows.push(row);
        }

        return staticRows;
    };

    cellBlinkAnimation = async(cell) => {
        cell.classList.add(CELL_BLINK);
        await sleep(BLINK_DELAY);
        cell.classList.remove(CELL_BLINK);
    };

    cleanCell = async(cell) => {
        await this.cellBlinkAnimation(cell);
        cell.className = CELL;
    };

    cleanBoard = async() => {
        let staticRows = this.findFullStaticRows();
        let n = staticRows.length;

        if (n > 0) {
            // Clean all static rows
            for (let row of staticRows) {
                for (let cell of row) {
                    await this.cleanCell(cell);
                }
                gameScore += ROW_CLEAR_POINTS;
                // For each staticRow get all staticCells above it and shift it down by 1
                let [rowId, colId] = getCellIdAsTuple(row[0].id);
                this.shiftStaticCells(rowId);
            }
        }
    };

    shiftStaticCells = (rowId) => {
        let rows = this.getRowsInRange(PLAYABLE_ROWS[0], rowId, reversed=>true);
        for (let row of rows) {
            for (let cell of row) {
                if (cell.classList.contains(FIG_STATIC)) {
                    let [cellIdRow, cellIdCol] = getCellIdAsTuple(cell.id);
                    let nextCellPos = document.getElementById(getCellIdAsStr(cellIdRow+1, cellIdCol));
                    nextCellPos.classList = cell.classList;
                    cell.className = CELL;
                }
            }
        }
    };
}
