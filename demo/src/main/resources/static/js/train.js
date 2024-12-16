let targetStepsInput = null;
let movesMade = 0;

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
    fetch('/api/training/boards/random')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            displayTrainingBoard(data.boardState, data.targetSteps);
        })
        .catch(error => {
            showErrorNotification('Error fetching random training board: ' + error.message);
        });
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
            td.addEventListener('click', () => makeMove(td, targetSteps));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    boardContainer.appendChild(table);

    movesMade = 0;
    showSuccessNotification(`Solve the board in ${targetSteps} moves!`);
}

function makeMove(cell, targetSteps) {
    if (cell.textContent === '') {
        cell.textContent = 'X';
        movesMade++;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        checkWin(x, y).then(isWin => {
            if (isWin) {
                showSuccessNotification('You solved the board!');
                setTimeout(fetchRandomTrainingBoard, 2000); // Automatically fetch a new board after 2 seconds
            } else if (movesMade >= targetSteps) {
                showErrorNotification('No more valid moves! You failed to solve the board.');
                setTimeout(fetchRandomTrainingBoard, 2000); // Automatically fetch a new board after 2 seconds
            }
        });
    } else {
        showErrorNotification('Invalid move!');
    }
}

function checkWin(x, y) {
    const board = [];
    const rows = document.querySelectorAll('table.board tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        board.push(rowData);
    });

    return fetch(`/api/training/boards/check?x=${x}&y=${y}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(board)
    })
    .then(response => response.json())
    .then(isWin => {
        return isWin;
    })
    .catch(error => {
        showErrorNotification('Error checking win: ' + error.message);
        return false;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRandomTrainingBoard();
});
