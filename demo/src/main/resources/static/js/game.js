const boardSize = 15;
const boardContainer = document.getElementById('boardContainer');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const notification = document.getElementById('notification');

let gameStarted = false;
let currentPlayer = 'X';
let matchId;
let myTurn = false;
let ws;
let chatSocket;

document.addEventListener('DOMContentLoaded', () => {
    const playerName = localStorage.getItem('username');
    const matches = localStorage.getItem('matches');
    const wins = localStorage.getItem('wins');

    document.getElementById('playerName').textContent = playerName || 'Not logged in';
    document.getElementById('playerStats').textContent = playerName ? `Matches: ${matches}, Wins: ${wins}` : '';

    createBoard();
    connectToGameServer();
});

function connectToGameServer() {
    ws = new WebSocket('ws://localhost:8080/ws/game');
    ws.onopen = () => {
        console.log('Connected to game server');
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

                updateStats(data.winner);
                break;

            case 'chat':
                addChatMessage(data.message, 'opponent');
                break;

            case 'opponentDisconnected':
                showNotification('Your opponent has disconnected. You win by default.', 'info');
                gameStarted = false;

                updateStats(currentPlayer);
                break;

            case 'error':
                showNotification(data.message, 'error');
                break;

            case 'notification':
                showNotification(data.message, 'info');
                break;
        }
    };

    chatSocket = new WebSocket('ws://localhost:8080/ws/chat');

    chatSocket.onopen = () => {
        console.log('Connected to chat server');
    };

    chatSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
            addChatMessage(data.message, 'opponent');
        }
    };
}

function findMatch() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'findMatch' }));
    } else {
        showNotification('Not connected to the game server', 'error');
    }
}

function sendMove(x, y) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'move', matchId, player: currentPlayer, x, y }));
    } else {
        showNotification('Not connected to the game server', 'error');
    }
}

function sendChatMessage() {
    if (!gameStarted) {
        showNotification('You can only chat during an active game.', 'error');
        return;
    }
    const message = messageInput.value;
    if (message.trim() !== '') {
        chatSocket.send(JSON.stringify({ type: 'chat', matchId, message }));
        addChatMessage(message, 'self');
        messageInput.value = '';
    }
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

function addChatMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    if (sender === 'self') {
        messageElement.classList.add('self');
    } else {
        messageElement.classList.add('opponent');
    }
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function updateStats(winner) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const currentMatches = parseInt(localStorage.getItem('matches'), 10) || 0;
    const currentWins = parseInt(localStorage.getItem('wins'), 10) || 0;

    const newMatches = currentMatches + 1;
    const newWins = winner === currentPlayer ? currentWins + 1 : currentWins;

    localStorage.setItem('matches', newMatches);
    localStorage.setItem('wins', newWins);

    fetch(`/api/users/updateStats/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            matchesPlayed: newMatches,
            matchesWon: newWins
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.message); });
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('playerStats').textContent = `Matches: ${newMatches}, Wins: ${newWins}`;
    })
    .catch(error => {
        showNotification(`Error updating stats: ${error.message}`, 'error');
        console.error('Error updating stats:', error);
    });
}
