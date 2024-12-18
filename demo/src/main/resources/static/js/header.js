document.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('headerContainer').innerHTML = data;

            const username = localStorage.getItem('username');
            const loginLink = document.getElementById('loginLink');
            const adminLink = document.getElementById('adminLink');

            if (username) {
                loginLink.textContent = 'Logout';
                loginLink.href = '#';
                loginLink.addEventListener('click', () => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });

                if (username === 'admin') {
                    adminLink.style.display = 'inline';
                }
            }
        });
});
