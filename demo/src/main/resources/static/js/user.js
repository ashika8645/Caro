const playerName = document.getElementById('playerName');
const playerStats = document.getElementById('playerStats');
const loginButton = document.getElementById('loginButton');
const loginRegisterContainer = document.getElementById('loginRegisterContainer');
const overlay = document.getElementById('overlay');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const notification = document.getElementById('notification');

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

if (localStorage.getItem('token')) {
    playerName.textContent = localStorage.getItem('username');
    playerStats.textContent = `Matches: ${localStorage.getItem('matches') || 0}, Wins: ${localStorage.getItem('wins') || 0}`;
    loginButton.textContent = "Logout";
    loginButton.onclick = logout;
}

const ws = new WebSocket('ws://localhost:8080/ws/game');
const chatSocket = new WebSocket('ws://localhost:8080/chat');

ws.onopen = () => {
    console.log('Connected to server');
};

chatSocket.onopen = () => {
    console.log('Connected to chat server');
};

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    chatSocket.send(JSON.stringify({ type: 'chat', matchId, message }));
    messageInput.value = '';
}
