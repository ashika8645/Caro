const boardSize = 15;
const boardContainer = document.getElementById('boardContainer');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');

let gameStarted = false;
let currentPlayer = 'X';
let matchId;
let myTurn = false;

const ws = new WebSocket('ws://localhost:8080/ws/game');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'waiting':
            showNotification(data.message, 'info');
            break;

        case 'matchFound':
            matchId = data.matchId;
            currentPlayer = data.role;
            resetBoard();
            gameStarted = true;
            myTurn = (currentPlayer === 'X');
            showNotification(`Match found! You are playing as ${data.role}`);
            break;

        case 'move':
            updateBoard(data.x, data.y, data.player);
            myTurn = !myTurn;
            break;

        case 'gameOver':
            updateBoard(data.x, data.y, data.player);

            if (data.winningCells && data.winningCells.length > 0) {
                highlightWinningCells(data.winningCells);
            }

            showNotification(
                `Game over! ${data.winner === 'Draw' ? "It's a draw!" : `${data.winner} wins!`}`
            );

            gameStarted = false;
            myTurn = false;
            break;

        case 'chat':
            addChatMessage(data.message);
            break;

        case 'opponentDisconnected':
            showNotification('Your opponent has disconnected. You win by default.', 'info');
            gameStarted = false;
            break;

        case 'error':
            showNotification(data.message, 'error');
            break;

        case 'notification':
            showNotification(data.message, 'info');
            break;
    }
};

function findMatch() {
    ws.send(JSON.stringify({ type: 'findMatch' }));
}

function sendMove(x, y) {
    ws.send(JSON.stringify({ type: 'move', matchId, player: currentPlayer, x, y }));
}

function sendChatMessage() {
    const message = messageInput.value;
    ws.send(JSON.stringify({ type: 'chat', matchId, message }));
    messageInput.value = '';
}

function createBoard() {
    boardContainer.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('board');
    for (let i = 0; i < boardSize; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < boardSize; j++) {
            const td = document.createElement('td');
            td.dataset.x = i;
            td.dataset.y = j;
            td.addEventListener('click', () => makeMove(i, j, td));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    boardContainer.appendChild(table);
}

function makeMove(x, y, cell) {
    if (!gameStarted) {
        showNotification('Please start a new game first', 'error');
        return;
    }
    if (!myTurn) {
        showNotification('Not your turn!', 'error');
        return;
    }
    if (cell.textContent !== '') {
        showNotification('Invalid move! This cell is already taken.', 'error');
        return;
    }

    cell.textContent = currentPlayer;

    sendMove(x, y);
}

function updateBoard(x, y, player) {
    const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
    cell.textContent = player;
}

function highlightWinningCells(cells) {
    cells.forEach(([x, y]) => {
        const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
        cell.classList.add('winning-cell');
    });
}

function resetBoard() {
    boardContainer.innerHTML = '';
    createBoard();
}

createBoard();

const chatSocket = new WebSocket('ws://localhost:8080/chat');

chatSocket.onopen = () => {
    console.log('Connected to chat server');
};

chatSocket.onmessage = (event) => {
    const message = event.data;
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
};

function sendChatMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    chatSocket.send(message);
    messageInput.value = '';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
