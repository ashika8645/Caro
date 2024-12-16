let isCreatingBoard = false;
let targetStepsInput = null;

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = notification ${type};
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSuccessNotification(message) {
    showNotification(message, 'success');
}

function showErrorNotification(message) {
    showNotification(message, 'error');
}

function fetchRandomTrainingBoard() {
    fetch('/api/training/random-board')
        .then(response => {
            if (!response.ok) {
                throw new Error(HTTP error! status: ${response.status});
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Check the structure of the returned data
            displayTrainingBoard(data.boardState, data.targetSteps);
        })
        .catch(error => {
            showErrorNotification('Error fetching random training board: ' + error.message);
        });
}

function initCreateBoardMode() {
    isCreatingBoard = true;
    document.getElementById('saveBoardButton').style.display = 'inline';
    createEditableBoard();
}

function createEditableBoard() {
    const boardSize = 7;
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.innerHTML = '';

    targetStepsInput = document.createElement('input');
    targetStepsInput.type = 'number';
    targetStepsInput.min = 1;
    targetStepsInput.placeholder = 'Enter target steps';
    boardContainer.appendChild(targetStepsInput);

    const table = document.createElement('table');
    table.classList.add('board');
    for (let i = 0; i < boardSize; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < boardSize; j++) {
            const td = document.createElement('td');
            td.dataset.x = i;
            td.dataset.y = j;
            td.textContent = ''; // Initial value
            td.addEventListener('click', () => {
                if (td.textContent === '') {
                    td.textContent = 'X';
                } else if (td.textContent === 'X') {
                    td.textContent = 'O';
                } else {
                    td.textContent = '';
                }
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    boardContainer.appendChild(table);
}

function saveBoardToDatabase() {
    if (!isCreatingBoard) return;

    const board = [];
    const rows = document.querySelectorAll('table.board tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        board.push(rowData);
    });

    const targetSteps = parseInt(targetStepsInput.value, 10);
    if (isNaN(targetSteps) || targetSteps < 1) {
        showErrorNotification('Please enter a valid target step count.');
        return;
    }

    const payload = {
        boardState: JSON.stringify(board),
        targetSteps: targetSteps
    };

    fetch('/api/training/save-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessNotification('Board saved successfully!');
                resetCreateBoardMode();
            } else {
                showErrorNotification('Failed to save board. Please try again.');
            }
        })
        .catch(error => {
            showErrorNotification('Error saving board: ' + error.message);
        });
}

function resetCreateBoardMode() {
    isCreatingBoard = false;
    targetStepsInput = null;
    document.getElementById('saveBoardButton').style.display = 'none';
    fetchRandomTrainingBoard();
}

function displayTrainingBoard(boardState, targetSteps) {
    const board = JSON.parse(boardState);
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('board');
    for (let i = 0; i < board.length; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < board[i].length; j++) {
            const td = document.createElement('td');
            td.dataset.x = i;
            td.dataset.y = j;
            td.textContent = board[i][j];
            td.addEventListener('click', () => makeMove(td, i, j));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    boardContainer.appendChild(table);

    showSuccessNotification(Solve the board in ${targetSteps} moves!);
}

function makeMove(cell, x, y) {
    if (cell.textContent === '') {
        cell.textContent = 'X';

        if (checkWin()) {
            showSuccessNotification('You solved the board!');
            setTimeout(fetchRandomTrainingBoard, 2000);
        }
    } else {
        showErrorNotification('Invalid move!');
    }
}

function checkWin() {
    const board = [];
    const rows = document.querySelectorAll('table.board tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        board.push(rowData);
    });

    const boardSize = board.length;

    for (let i = 0; i < boardSize; i++) {
        if (board[i].every(cell => cell === 'X') ||
            board.map(row => row[i]).every(cell => cell === 'X')) {
            return true;
        }
    }

    if (board.map((row, index) => row[index]).every(cell => cell === 'X') ||
        board.map((row, index) => row[boardSize - index - 1]).every(cell => cell === 'X')) {
        return true;
    }

    return false;
}