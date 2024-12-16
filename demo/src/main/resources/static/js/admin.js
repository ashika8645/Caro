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

function hideAllContainers() {
    document.getElementById('boardContainer').style.display = 'none';
    document.getElementById('boardListContainer').style.display = 'none';
    document.getElementById('userListContainer').style.display = 'none';
}

function createEditableBoard(boardState = [], boardId = null) {
    const boardSize = 7;
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('board');
    for (let i = 0; i < boardSize; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < boardSize; j++) {
            const td = document.createElement('td');
            td.dataset.x = i;
            td.dataset.y = j;
            td.textContent = boardState[i] && boardState[i][j] ? boardState[i][j] : '';
            td.addEventListener('click', () => toggleCellContent(td));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    boardContainer.appendChild(table);

    const saveButton = document.createElement('button');
    saveButton.id = 'saveBoardButton';
    saveButton.textContent = 'Save';
    saveButton.onclick = () => saveBoardToDatabase(boardId);
    boardContainer.appendChild(saveButton);
}

function toggleCellContent(cell) {
    if (cell.textContent === '') {
        cell.textContent = 'X';
    } else if (cell.textContent === 'X') {
        cell.textContent = 'O';
    } else {
        cell.textContent = '';
    }
    saveBoardStateToLocal();
}

function saveBoardStateToLocal() {
    const board = [];
    const rows = document.querySelectorAll('table.board tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        board.push(rowData);
    });
    localStorage.setItem('editableBoard', JSON.stringify(board));
}

function saveBoardToDatabase(boardId) {
    const board = JSON.parse(localStorage.getItem('editableBoard')) || [];

    const descriptionInput = document.querySelector('input[type="text"]');
    const targetStepsInput = document.querySelector('input[type="number"]');
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const targetSteps = targetStepsInput ? parseInt(targetStepsInput.value.trim(), 10) : 0;

    const payload = {
        boardState: JSON.stringify(board),
        description: description,
        targetSteps: targetSteps
    };

    const url = boardId ? `/api/training/boards/${boardId}` : '/api/training/save-board';
    const method = boardId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessNotification('Board saved successfully!');
                resetBoardForm();
                showBoardList();
            } else {
                showErrorNotification('Failed to save board. Please try again.');
            }
        })
        .catch(error => {
            showErrorNotification('Error saving board: ' + error.message);
        });
}

function resetBoardForm() {
    localStorage.removeItem('editableBoard');
}

function showBoardList() {
    hideAllContainers();
    const boardListContainer = document.getElementById('boardListContainer');

    if (!boardListContainer.querySelector('table')) {
        const table = document.createElement('table');
        boardListContainer.appendChild(table);
    }

    boardListContainer.style.display = 'block';

    fetch('/api/training/boards')
        .then(response => response.json())
        .then(data => {
            const boardListTable = boardListContainer.querySelector('table');
            if (boardListTable) {
                boardListTable.innerHTML = `
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Target Steps</th>
                        <th>Actions</th>
                    </tr>
                `;

                data.forEach(board => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${board.id}</td>
                        <td contenteditable="true" onblur="updateBoard(${board.id}, 'description', this.innerText)">${board.description || 'N/A'}</td>
                        <td contenteditable="true" onblur="updateBoard(${board.id}, 'targetSteps', this.innerText)">${board.targetSteps}</td>
                        <td>
                            <button onclick="editBoard(${board.id})">Edit</button>
                            <button onclick="deleteBoard(${board.id})">Delete</button>
                        </td>
                    `;
                    boardListTable.appendChild(row);
                });

                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>New</td>
                    <td contenteditable="true"></td>
                    <td contenteditable="true"></td>
                    <td>
                        <button onclick="addNewBoard()">Add</button>
                    </td>
                `;
                boardListTable.appendChild(newRow);
            }
        })
        .catch(error => showErrorNotification('Error fetching boards: ' + error.message));
}

function editBoard(boardId) {
    fetch(`/api/training/boards/${boardId}`)
        .then(response => response.json())
        .then(data => {
            createEditableBoard(JSON.parse(data.boardState), boardId);
            localStorage.setItem('editableBoard', JSON.stringify(JSON.parse(data.boardState)));
            document.getElementById('boardContainer').style.display = 'block';
        })
}

function deleteBoard(boardId) {
    if (confirm("Are you sure you want to delete this board?")) {
        fetch(`/api/training/boards/${boardId}`, { method: 'DELETE' })
            .then(() => showBoardList())
            .catch(error => showErrorNotification('Error deleting board: ' + error.message));
    }
}

function newBoard() {
    createEditableBoard();
    document.getElementById('boardContainer').style.display = 'block';
    document.getElementById('saveBoardButton').onclick = () => saveBoardToDatabase();
}

function updateBoard(boardId, field, value) {
    fetch(`/api/training/boards/${boardId}`)
        .then(response => response.json())
        .then(data => {
            data[field] = field === 'targetSteps' ? parseInt(value, 10) : value;
            if (isNaN(data.targetSteps)) {
                showErrorNotification('Please provide a valid target steps value.');
                return;
            }
            return fetch(`/api/training/boards/${boardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(response => response.json())
        .then(() => showSuccessNotification('Board updated successfully'))
        .catch(error => showErrorNotification('Error updating board: ' + error.message));
}

function addNewBoard() {
    const newRow = document.querySelector('#boardListContainer tr:last-child');
    const description = newRow.children[1].innerText.trim() || '';
    const targetSteps = parseInt(newRow.children[2].innerText.trim(), 10) || 0;

    const payload = {
        description: description,
        targetSteps: targetSteps,
        boardState: JSON.stringify(Array(7).fill(Array(7).fill('')))
    };

    fetch('/api/training/save-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessNotification('Board added successfully!');
                showBoardList();
            } else {
                showErrorNotification('Failed to add board. Please try again.');
            }
        })
        .catch(error => {
            showErrorNotification('Error adding board: ' + error.message);
        });
}

function showUserList() {
    hideAllContainers();
    const userListContainer = document.getElementById('userListContainer');

    if (!userListContainer.querySelector('table')) {
        const table = document.createElement('table');
        userListContainer.appendChild(table);
    }

    userListContainer.style.display = 'block';

    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            const userListTable = userListContainer.querySelector('table');
            if (userListTable) {
                userListTable.innerHTML = `
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Matches Played</th>
                        <th>Matches Won</th>
                        <th>Actions</th>
                    </tr>
                `;

                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td contenteditable="true" onblur="updateUser(${user.id}, 'username', this.innerText)">${user.username}</td>
                        <td contenteditable="true" onblur="updateUser(${user.id}, 'email', this.innerText)">${user.email}</td>
                        <td contenteditable="true" onblur="updateUser(${user.id}, 'matchesPlayed', this.innerText)">${user.matchesPlayed}</td>
                        <td contenteditable="true" onblur="updateUser(${user.id}, 'matchesWon', this.innerText)">${user.matchesWon}</td>
                        <td>
                            <button onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    `;
                    userListTable.appendChild(row);
                });
            }
        })
        .catch(error => showErrorNotification('Error fetching users: ' + error.message));
}

function updateUser(userId, field, value) {
    fetch(`/api/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            data[field] = value;
            return fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(response => response.json())
        .then(() => showSuccessNotification('User updated successfully'))
        .catch(error => showErrorNotification('Error updating user: ' + error.message));
}

function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`/api/users/${userId}`, { method: 'DELETE' })
            .then(() => showUserList())
            .catch(error => showErrorNotification('Error deleting user: ' + error.message));
    }
}

// Document Ready Event
document.addEventListener('DOMContentLoaded', () => {
    hideAllContainers();
    const savedBoard = JSON.parse(localStorage.getItem('editableBoard'));
    if (savedBoard) {
        createEditableBoard(savedBoard);
    }

    document.getElementById('newBoardButton').addEventListener('click', newBoard);
});