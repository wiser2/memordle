import { dict as fullDict} from './wordlist/dictionary.js';
import { targets as fullTargets} from './wordlist/targets.js';

var dict;
var targets;

var currentBoardi = 0;
var currentRow = 0;
var currentCell = 0;

var currentBoard = document.getElementById('board-l');

var answers = ["", "", ""];
var boardsSolved = [false, false, false];
var boardsLost = [false, false, false];

var finished = false;

var memoMillis = 3000;

var textColourHex = "#fff";
var greenHex = '#57ac78'
var yellowHex = '#e9c601';
var blackoutHex = '#303030'
var bgHex = '#404040';


function isAlpha(c) {
    return /^[a-zA-Z]$/.test(c);
}

function arraysEqual(arr1, arr2) {
    if (arr1.length != arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

function updateBoardIndicators() {
    for (let i = 0; i < 3; i++) {
        if (boardsSolved[i]){
            document.getElementsByClassName('board-indicator')[i].innerHTML = "✓";
        } else if (boardsLost[i]) {
            document.getElementsByClassName('board-indicator')[i].innerHTML = "X";
        } else if (i == currentBoardi) {
            document.getElementsByClassName('board-indicator')[i].innerHTML = "↓";
        } else {
            document.getElementsByClassName('board-indicator')[i].innerHTML = " ";
        }
    }
}

function nextBoard() {
    currentCell = 0;
    if (currentBoardi == 2) {
        currentRow++;
    }
    
    currentBoardi = (currentBoardi + 1) % 3;
    if (boardsSolved[currentBoardi]) {
        nextBoard();
    }

    
    currentBoard = getBoard(currentBoardi);

    updateBoardIndicators();
}

function getBoard(i) {
    if (i == 0) {
        return document.getElementById('board-l');
    } else if (i == 1) {
        return document.getElementById('board-m');
    } else {
        return document.getElementById('board-r');
    }
}

function filterWordList(arr) {
    var filtered = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].length == 5) {
            filtered.push(arr[i].toLowerCase());
        }
    }
    return filtered;
}

function generateBoardHTML(containerId) {
    var boardContainerContainer = document.getElementById('board-container-container');
    var boardContainer = document.getElementById(containerId);
    
    var board = document.createElement('div');
    var boardId = 'board-' + containerId.charAt(16);
    board.className = 'board';
    board.id = boardId;
    
    for (var i = 0; i < 7; i++) {
        var row = document.createElement('div');
        row.className = 'row';
        row.id = boardId.charAt(0) + '-' + i;
        
        for (var j = 0; j < 5; j++) {
            var cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = boardId.charAt(0) + '-' + i + '-' + j;
            cell.innerHTML = ' ';
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    boardContainer.appendChild(board);
    boardContainerContainer.appendChild(boardContainer);
    
}

function generateBoards() {
    generateBoardHTML('board-container-l');
    generateBoardHTML('board-container-m');
    generateBoardHTML('board-container-r');
    currentBoard = document.getElementById('board-l');

    for (let i = 0; i < 3; i++) {
        document.getElementsByClassName('board-indicator')[i].innerHTML = " ";
    }
}

function generateAnswers() {
    for (let i = 0; i < 3; i++) {
        answers[i] = targets[Math.floor(Math.random() * targets.length)];
    }

    console.log(answers);
}

function initWordlists() {
    dict = filterWordList(fullDict);
    targets = filterWordList(fullTargets);
}

function isGuessValid(guess) {
    let guessStr = guess.join('').toLowerCase();
    return dict.includes(guessStr);
}

function unhideAllHints() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
            if (getBoard(i).children[j].children[0].innerHTML == ' ') {
                continue;
            }

            var guess = ['', '', '', '', ''];
            for (let k = 0; k < 5; k++) {
                guess[k] = getBoard(i).children[j].children[k].innerHTML.toLowerCase();
            }

            var result = checkGuess(guess, answers[i]);

            for (let k = 0; k < 5; k++) {
                getBoard(i).children[j].children[k].style.backgroundColor = result[k];
                getBoard(i).children[j].children[k].style.color = textColourHex;
            }
        }
    }
}

function win() {
    finished = true;
    unhideAllHints();
    updateBoardIndicators();
}

function lose() {
    finished = true;
    unhideAllHints();
    updateBoardIndicators();
}

function enterPressed() {
    var guess = ['', '', '', '', ''];
    for (let i = 0; i < 5; i++) {
        guess[i] = currentBoard.children[currentRow].children[i].innerHTML.toLowerCase();
    }

    if (!isGuessValid(guess)) {
        return;
    }

    var result = checkGuess(guess, answers[currentBoardi]);
    for (let i = 0; i < 5; i++) {
        currentBoard.children[currentRow].children[i].style.backgroundColor = result[i];
    }

    if (arraysEqual(result, [greenHex, greenHex, greenHex, greenHex, greenHex])) {
        boardsSolved[currentBoardi] = true;
        if (boardsSolved[0] && boardsSolved[1] && boardsSolved[2]) {
            win();
            return;
        }
        nextBoard();
        return;
    }

    if (currentRow == 6 && !boardsSolved[currentBoardi]) {
        boardsLost[currentBoardi] = true;
    }

    
    queueHideHints(currentBoardi, currentRow, memoMillis);
    nextBoard();

    if (currentRow == 7) {
        lose();
    }
}

function checkGuess(guess, answer) {
    var guessList = [...guess];
    var answerList = answer.split('');
    var result = ['grey', 'grey', 'grey', 'grey', 'grey'];

    // green
    for (let i = 0; i < 5; i++) {
        if (guessList[i] == answerList[i]) {
            result[i] = greenHex;
            guessList[i] = '-';
            answerList[i] = '.';
        }
    }

    // yellow
    for (let i = 0; i < 5; i++) {
        if (answerList.includes(guessList[i])) {
            result[i] = yellowHex;
            guessList[i] = '-';
            answerList[answerList.indexOf(guessList[i])] = '.';
        }
    }

    return result;
}

function hideHints(boardi, rowi) {
    if (!finished) {
        for (let i = 0; i < 5; i++) {
            getBoard(boardi).children[rowi].children[i].style.backgroundColor = blackoutHex;
            getBoard(boardi).children[rowi].children[i].style.color = blackoutHex;

        }
    }
}

function queueHideHints(boardi, rowi, ms) {
    setTimeout(function() {
        hideHints(boardi, rowi);
    }, ms);
}

function keyboardPress(e) {
    const c = e.key.toLowerCase();
    if (isAlpha(c)) {
        if (currentCell < 5) {
            currentBoard.children[currentRow].children[currentCell].innerHTML = c.toUpperCase();
            currentCell++;
        }
    } else if (c == 'backspace') {
        if (currentCell > 0) {
            currentBoard.children[currentRow].children[currentCell - 1].innerHTML = ' ';
            currentCell--;
        }
    } else if (c == 'enter') {
        if (currentCell == 5) {
            enterPressed();
        }
    }
}

window.onload = function() {
    generateBoards();
    initWordlists();
    generateAnswers();
}

window.onkeydown = keyboardPress