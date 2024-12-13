const boardSize = 15;
const boardContainer = document.getElementById('boardContainer');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const playerName = document.getElementById('playerName');
const playerStats = document.getElementById('playerStats');
const loginButton = document.getElementById('loginButton');
const loginRegisterContainer = document.getElementById('loginRegisterContainer');
const overlay = document.getElementById('overlay');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const notification = document.getElementById('notification');

let gameStarted = false;
let currentPlayer = 'X';
let matchId;
let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
let myTurn = false; // Biến để kiểm tra lượt chơi

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
            myTurn = (currentPlayer === 'X'); // X đi trước
            showNotification(`Match found! You are playing as ${data.role}`);
            break;

        case 'move':
            updateBoard(data.x, data.y, data.player);
            myTurn = !myTurn; // Đổi lượt sau khi nhận được nước đi từ đối thủ
            break;

        case 'gameOver':
            updateBoard(data.x, data.y, data.player);
            showNotification(`Game over! ${data.winner === 'Draw' ? "It's a draw!" : `${data.winner} wins!`}`);
            gameStarted = false;
            break;

        case 'chat':
            addChatMessage(data.message);
            break;

        case 'opponentDisconnected':
            showNotification('Your opponent has disconnected', 'error');
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
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
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
    if (board[x][y] !== null) {
        showNotification('Invalid move! This cell is already taken.', 'error');
        return;
    }

    board[x][y] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWin(x, y)) {
        sendMove(x, y); // Gửi nước đi cuối cùng trước khi thông báo kết thúc
        ws.send(JSON.stringify({ type: 'gameOver', matchId, winner: currentPlayer, x, y })); // Gửi thông báo gameOver kèm nước đi cuối
        highlightWinningCells(x, y);
        gameStarted = false;
        updatePlayerStats(currentPlayer);
    } else if (isDraw()) {
        sendMove(x, y); // Gửi nước đi cuối cùng trước khi thông báo hòa
        ws.send(JSON.stringify({ type: 'gameOver', matchId, winner: 'Draw', x, y }));
        gameStarted = false;
    } else {
        myTurn = false; // Đổi lượt
        sendMove(x, y);
    }
}

function updateBoard(x, y, player) {
    const cell = document.querySelector(`td[data-x="${x}"][data-y="${y}"]`);
    board[x][y] = player;
    cell.textContent = player;

    if (checkWin(x, y)) {
        showNotification(`${player} wins!`);
        highlightWinningCells(x, y);
        gameStarted = false;
    } else if (isDraw()) {
        showNotification('The game is a draw!');
        gameStarted = false;
    }
}


function checkWin(x, y) {
    const directions = [
        { dx: 0, dy: 1 },  // Horizontal
        { dx: 1, dy: 0 },  // Vertical
        { dx: 1, dy: 1 },  // Main diagonal
        { dx: 1, dy: -1 }  // Counter diagonal
    ];

    for (const { dx, dy } of directions) {
        let count = 1;
        count += countConsecutive(x, y, dx, dy);
        count += countConsecutive(x, y, -dx, -dy);
        if (count >= 5) return true;
    }
    return false;
}

function countConsecutive(x, y, dx, dy) {
    let count = 0;
    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize && board[nx][ny] === currentPlayer) {
        count++;
        nx += dx;
        ny += dy;
    }
    return count;
}

function isDraw() {
    return board.every(row => row.every(cell => cell !== null));
}

function highlightWinningCells(x, y) {
    const directions = [
        { dx: 0, dy: 1 },
        { dx: 1, dy: 0 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 }
    ];

    for (const { dx, dy } of directions) {
        let cells = [[x, y]];
        cells.push(...getWinningCells(x, y, dx, dy));
        cells.push(...getWinningCells(x, y, -dx, -dy));
        if (cells.length >= 5) {
            cells.forEach(([cx, cy]) => {
                const cell = document.querySelector(`td[data-x="${cx}"][data-y="${cy}"]`);
                cell.classList.add('winning-cell');
            });
            break;
        }
    }
}

function getWinningCells(x, y, dx, dy) {
    let cells = [];
    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize && board[nx][ny] === currentPlayer) {
        cells.push([nx, ny]);
        nx += dx;
        ny += dy;
    }
    return cells;
}

function updatePlayerStats(winner) {
    let matches = parseInt(localStorage.getItem('matches')) || 0;
    let wins = parseInt(localStorage.getItem('wins')) || 0;
    matches++;
    if (winner === localStorage.getItem('username')) {
        wins++;
    }
    localStorage.setItem('matches', matches);
    localStorage.setItem('wins', wins);
    playerStats.textContent = `Matches: ${matches}, Wins: ${wins}`;
}

function showLoginRegister() {
    loginRegisterContainer.style.display = 'block';
    overlay.style.display = 'block';
}

function closeLoginRegister() {
    loginRegisterContainer.style.display = 'none';
    overlay.style.display = 'none';
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function performLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            localStorage.setItem('token', data.message);
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            playerName.textContent = data.username;
            playerStats.textContent = `Matches: ${localStorage.getItem('matches') || 0}, Wins: ${localStorage.getItem('wins') || 0}`;
            loginButton.textContent = "Logout";
            loginButton.onclick = logout;
            closeLoginRegister();
            showNotification('Logged in as ' + data.username);
        } else {
            showNotification('Invalid credentials', 'error');
        }
    })
    .catch(error => {
        showNotification('Error during login', 'error');
        console.error('Login error:', error);
    });
}

function performRegister() {
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!username || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            showNotification('Registered successfully');
            closeLoginRegister();
        } else if (data.message) {
            showNotification(data.message, 'error');
        } else {
            showNotification('Registration failed', 'error');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    playerName.textContent = "Not logged in";
    playerStats.textContent = "Matches: 0, Wins: 0";
    loginButton.textContent = "Login";
    loginButton.onclick = showLoginRegister;
    showNotification('Logged out');
}

function playWithAI() {
    fetch('/api/matches', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            matchId = data.id;
            resetBoard();
            gameStarted = true;
            currentPlayer = 'X';
            showNotification('Starting a new game against AI!');
        });
}

function resetBoard() {
    boardContainer.innerHTML = '';
    createBoard();
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
}

// Initialize game
createBoard();

// Check if user is already logged in
if (localStorage.getItem('token')) {
    playerName.textContent = localStorage.getItem('username');
    playerStats.textContent = `Matches: ${localStorage.getItem('matches') || 0}, Wins: ${localStorage.getItem('wins') || 0}`;
    loginButton.textContent = "Logout";
    loginButton.onclick = logout;
}

// Chat WebSocket
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
