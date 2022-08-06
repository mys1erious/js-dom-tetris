import {ROW, COL} from "../constants.js";
import {Board} from "../board/board.js";
import {Figure, getShuffledFigures} from "../figures/figure.js";
import {sleep} from "../utils.js";


let gameStarted = false;
let board;
let curFigures;
let curFigure;
let cleaning = false;

let scoreValElement = document.getElementById('score-val');


export const startGame = () => {
    if (!gameStarted){
        gameStarted = true;

        board = new Board(ROW, COL);
        board.draw();

        curFigures = getShuffledFigures();
        curFigure = curFigures.pop();
        curFigure.init();

        window.setInterval(figureAutoSlide, 1000);
        window.setInterval(mainLoop, 100);
    }
};


const figureAutoSlide = () => {
    if (gameStarted === true) {
        if (curFigure) curFigure.moveDownHandling('bottom');
    }
};

const mainLoop = async() => {
    if (!cleaning && !curFigure.inFly) {
        if (curFigures.length === 0) {
            curFigures = getShuffledFigures();
        }

        if (board.staticInFirstRow()) {
            alert(`Static in first row, Score: ${gameScore}`);
            endGame();
        }

        cleaning = true;
        await board.cleanBoard().then(() => {
            cleaning = false;
            scoreUpdate();
        });

        curFigure.terminate();
        curFigure = curFigures.pop();
        curFigure.init();
    }
};


const scoreUpdate = () => {
    scoreValElement.innerHTML = gameScore.toString();
};


export const endGame = () => {
    if (gameStarted) document.location.reload();
};
