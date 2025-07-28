var boardState = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
]

var currentBoardi = 0;
var currentRow = 0;
var currentCell = 0;

var currentBoard = document.getElementById('board-l');

const answers = ['LEMON', 'APPLE', 'SHOOT']



function isAlpha(c) {
    return /^[a-zA-Z]$/.test(c);
}

function nextBoard() {
    currentBoardi = (currentBoardi + 1) % 3;
    if (currentBoardi == 0) {
        currentBoard = document.getElementById('board-l');
    } else if (currentBoardi == 1) {
        currentBoard = document.getElementById('board-m');
    } else {
        currentBoard = document.getElementById('board-r');
    }
}

function filterWordList(arr) {
    var filtered = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].length == 5) {
            filtered.push(arr[i]);
        }
    }
    return filtered;
}

function getBoardState(boardId) {
    var board = document.getElementById(boardId);
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 5; j++) {
            boardState[i][j] = board.children[i].children[j].innerHTML;
        }
    }
    return boardState;
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
}

function checkGuess(guess, answer) {
    var guessList = [...guess];
    var answerList = answer.split('');
    var result = ['grey', 'grey', 'grey', 'grey', 'grey'];

    // green
    for (i = 0; i < 5; i++) {
        if (guessList[i] == answerList[i]) {
            result[i] = 'green';
            guessList[i] = '-';
            answerList[i] = '.';
        }
    }

    // yellow
    for (i = 0; i < 5; i++) {
        if (answerList.includes(guessList[i])) {
            result[i] = 'yellow';
            guessList[i] = '-';
            answerList[answerList.indexOf(guessList[i])] = '.';
        }
    }

    return result;
}

function keyboardPress(e) {
    const c = e.key.toUpperCase();
    if (isAlpha(c)) {
        if (currentCell < 5) {
            currentBoard.children[currentRow].children[currentCell].innerHTML = c;
            currentCell++;
        }
    } else if (c == 'BACKSPACE') {
        if (currentCell > 0) {
            currentBoard.children[currentRow].children[currentCell - 1].innerHTML = ' ';
            currentCell--;
        }
    } else if (c == 'ENTER') {
        if (currentCell == 5) {
            var guess = ['', '', '', '', ''];
            for (i = 0; i < 5; i++) {
                guess[i] = currentBoard.children[currentRow].children[i].innerHTML;
            }

            var result = checkGuess(guess, answers[currentBoardi]);
            for (i = 0; i < 5; i++) {
                currentBoard.children[currentRow].children[i].style.backgroundColor = result[i];
            }
            currentCell = 0;
            nextBoard();

            if (currentBoardi == 0) {
                currentRow++;
            }

            if (currentRow == 7) {
                alert('lose');
            }
        }
    }
}

window.onload = function() {
    generateBoards();
}

window.onkeydown = keyboardPress