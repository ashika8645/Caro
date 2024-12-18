document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');

    loginButton.addEventListener('click', performLogin);
    registerButton.addEventListener('click', performRegister);

    function performLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.message); });
            }
            return response.json();
        })
        .then(data => {
            if (data.user) {
                localStorage.setItem('token', data.user.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('matches', data.user.matchesPlayed);
                localStorage.setItem('wins', data.user.matchesWon);
                window.location.href = 'game.html';
            } else {
                showNotification('Invalid credentials', 'error');
            }
        })
        .catch(error => {
            showNotification(`Login error: ${error.message}`, 'error');
            console.error('Login error:', error);
        });
    }

    function performRegister() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!username || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.message); });
            }
            return response.json();
        })
        .then(data => {
            if (data.id) {
                showNotification('Registered successfully');
                window.location.href = 'game.html';
            } else if (data.message) {
                showNotification(data.message, 'error');
            } else {
                showNotification('Registration failed', 'error');
            }
        })
        .catch(error => {
            showNotification(`Registration error: ${error.message}`, 'error');
            console.error('Registration error:', error);
        });
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
});
