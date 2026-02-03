const gameEvents = {
    onStart: null,
    onStep: null,
    onEnd: null
};

function dispatchGameEvent(eventName, detail={})
{
    const event = new CustomEvent(eventName, {detail});
    document.dispatchEvent(event);

    switch(eventName)
    {
        case 'mine.start':
            if (gameEvents.onStart) gameEvents.onStart(detail);
            break;
        case 'mine.step':
            if (gameEvents.onStep) gameEvents.onStep(detail);
            break;
        case 'mine.end':
            if (gameEvents.onEnd) gameEvents.onEnd(detail);
            break;
    }

}

function setMineStartHandler(handler) {
    gameEvents.onStart = handler;
}

function setMineStepHandler(handler) {
    gameEvents.onStep = handler;
}

function setMineEndHandler(handler) {
    gameEvents.onEnd = handler;
}

const SIZE = 12;
const MINES = Math.floor(SIZE * SIZE * 0.16);

let board = [], revealed = [], flagged = [];
let gameOver = false, firstClick = true, timer = 0, timerInterval = null;
let currentRow = 0, currentCol = 0, flagsPlaced = 0;

let message = 'Нажмите на "R", если хотите перезапустить игру';

function generateBoard(firstRow, firstCol) {
    board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    revealed = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    flagged = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);
        
        if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) continue;
        if (board[row][col] !== 'mine') {
            board[row][col] = 'mine';
            minesPlaced++;
        }
    }
    
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] !== 'mine') {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = row + dr, nc = col + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === 'mine') {
                            count++;
                        }
                    }
                }
                board[row][col] = count;
            }
        }
    }
}

function revealCell(row, col) {
    if (gameOver || revealed[row][col] || flagged[row][col]) return;
    
    if (firstClick) {
        generateBoard(row, col);
        firstClick = false;
        startTimer();
        updateGameInfo(message);

        dispatchGameEvent('mine.start',
            {
                row: row,
                col: col,
                size: SIZE,
                mines: MINES
            }
        );
    }
    
    dispatchGameEvent('mine.step', {
        row: row,
        col: col,
        action: 'reveal'
    });

    revealed[row][col] = true;
    
    if (board[row][col] === 'mine') {
        gameOver = true;
        stopTimer();
        updateGameInfo("💥 Вы проиграли!");

        dispatchGameEvent('mine.end', {
            result: 'lose',
            time: timer,
            reason: 'hit_mine',
            flags: flagsPlaced
        });

        revealAllMines();
        return;
    }
    
    if (board[row][col] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !revealed[nr][nc] && !flagged[nr][nc]) {
                    revealCell(nr, nc);
                }
            }
        }
    }
    
    renderBoard();
    checkWin();
}

function toggleFlag(row, col) {
    if (gameOver || revealed[row][col]) return;
    
    if (gameOver || revealed[row][col]) return;
    
    if (flagged[row][col])
    {
        flagged[row][col] = false;
        flagsPlaced--;
    }
    else
    {
        if (flagsPlaced >= MINES)
        {
            updateGameInfo(message);
            return;   
        }
        flagged[row][col] = true;
        flagsPlaced++;
    }

    dispatchGameEvent('mine.step', {
        row: row,
        col: col,
        action: flagged[row][col] ? 'flag_set' : 'flag_remove',
        flags: flagsPlaced
    });

    document.getElementById('flags').textContent = flagsPlaced;
    renderBoard();
}

function revealAllMines() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            revealed[row][col] = true;
        }
    }
    renderBoard();
}

function checkWin() {
    let revealedCount = 0, correctFlags = 0;
    
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (revealed[row][col]) revealedCount++;
            if (flagged[row][col] && board[row][col] === 'mine') correctFlags++;
        }
    }
    
    const totalCells = SIZE * SIZE;
    if (revealedCount === totalCells - MINES || correctFlags === MINES) {
        gameOver = true;
        stopTimer();
        updateGameInfo("🎉 Поздравляем! Вы выиграли!");

        dispatchGameEvent('mine.end', {
            result: 'win',
            time: timer,
            reason: 'all_cells_revealed',
            flags: flagsPlaced,
            revealed: revealedCount,
            correctFlags: correctFlags
        });
    }
}

function startTimer() {
    timer = 0;
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = timer;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function moveCursor(dRow, dCol) {
    currentRow = Math.max(0, Math.min(SIZE - 1, currentRow + dRow));
    currentCol = Math.max(0, Math.min(SIZE - 1, currentCol + dCol));
    renderBoard();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = boardElement.style.gridTemplateRows = `repeat(${SIZE}, 30px)`;
    
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (revealed[row][col]) {
                cell.classList.add('revealed');
                if (board[row][col] === 'mine') {
                    cell.classList.add('mine');
                    if (gameOver) cell.classList.add('exploded');
                } else if (board[row][col] > 0) {
                    cell.textContent = board[row][col];
                    cell.classList.add(`number-${board[row][col]}`);
                }
            } else if (flagged[row][col]) {
                cell.classList.add('flagged');
            }
            
            if (row === currentRow && col === currentCol) {
                cell.classList.add('highlighted');
            }
            
            boardElement.appendChild(cell);
        }
    }
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            const row = +cell.dataset.row, col = +cell.dataset.col;
            e.ctrlKey ? toggleFlag(row, col) : revealCell(row, col);
        });
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            toggleFlag(+cell.dataset.row, +cell.dataset.col);
        });
    });
}

function updateGameInfo(message) {
    document.getElementById('gameInfo').textContent = message;
}

function restartGame() {
    gameOver = false;
    firstClick = true;
    timer = 0;
    currentRow = 0;
    currentCol = 0;
    flagsPlaced = 0;
    
    stopTimer();
    board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    revealed = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    flagged = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    
    renderBoard();
    document.getElementById('flags').textContent = '0';
    document.getElementById('totalMines').textContent = MINES;
    document.getElementById('timer').textContent = '0';
    updateGameInfo("Сделайте первый ход!");
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    switch(e.key) {
        case 'ArrowUp': moveCursor(-1, 0); break;
        case 'ArrowDown': moveCursor(1, 0); break;
        case 'ArrowLeft': moveCursor(0, -1); break;
        case 'ArrowRight': moveCursor(0, 1); break;
        case ' ':
        case 'Enter':
            e.ctrlKey ? toggleFlag(currentRow, currentCol) : revealCell(currentRow, currentCol);
            break;
    }
});

document.getElementById('totalMines').textContent = MINES;
restartGame();

document.addEventListener('keydown', e => { if (e.key === 'R') { restartGame(); } });

document.addEventListener('keydown', e => 
{ 
    if (e.key === 'R' || e.key === 'r')
        restartGame(); 
});

document.addEventListener('mine.start', (e) => {
    console.log('Событие mine.start:', e.detail);
});

document.addEventListener('mine.step', (e) => {
    console.log('Событие mine.step:', e.detail);
});

document.addEventListener('mine.end', (e) => {
    console.log('Событие mine.end:', e.detail);
});
