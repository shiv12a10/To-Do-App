// Request for notification permissions
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Load tasks and history from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// Add task event listener
document.getElementById('addTaskBtn').addEventListener('click', addTask);

// Function to add task
function addTask() {
    const taskInput = document.getElementById('taskInput').value.trim();
    const taskDateTime = document.getElementById('taskDateTime').value;

    if (taskInput !== '' && taskDateTime !== '') {
        const taskId = new Date().getTime();
        tasks.push({ id: taskId, text: taskInput, alarmTime: taskDateTime });
        document.getElementById('taskInput').value = '';
        document.getElementById('taskDateTime').value = '';
        updateLocalStorage();
        displayTasks();
        scheduleAlarm(taskInput, new Date(taskDateTime), taskId);
    }
}

// Function to display tasks
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <span class="task-time">Alarm: ${task.alarmTime}</span>
            <button class="complete-btn" onclick="completeTask(${task.id})">Complete</button>
            <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Function to delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    updateLocalStorage();
    displayTasks();
}

// Function to complete a task and move it to history
function completeTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        history.push(task);
        tasks = tasks.filter(t => t.id !== id);
        updateLocalStorage();
        displayTasks();
        displayHistory();
    }
}

// Function to edit a task
function editTask(id) {
    const taskText = document.querySelector(`.task-item button[onclick="editTask(${id})"]`).previousElementSibling.previousElementSibling;
    taskText.contentEditable = true;
    taskText.focus();

    taskText.addEventListener('blur', function () {
        const newText = taskText.innerText.trim();
        if (newText !== '') {
            tasks = tasks.map(task => task.id === id ? { ...task, text: newText } : task);
            taskText.contentEditable = false;
            updateLocalStorage();
            displayTasks();
        }
    });
}

// Function to update localStorage
function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('history', JSON.stringify(history));
}

// Function to schedule alarm for a task
function scheduleAlarm(taskText, alarmTime, taskId) {
    const now = new Date();
    const timeDifference = alarmTime.getTime() - now.getTime();

    if (timeDifference > 0) {
        setTimeout(() => {
            showNotification(taskText, taskId);
        }, timeDifference);
    }
}

// Function to show notification
function showNotification(taskText, taskId) {
    if (Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: `It's time for: ${taskText}`,
            icon: 'images/logo_trademarkia.webp'
        });

        // Optionally move the task to history when the notification is shown
        completeTask(taskId);
    }
}

// Display task history
function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    history.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <span class="task-time">Completed at: ${task.alarmTime}</span>
            <button class="edit-btn" onclick="editHistoryTask(${task.id})">Edit</button>
            <button class="delete-btn" onclick="deleteHistoryTask(${task.id})">Delete</button>
        `;
        historyList.appendChild(li);
    });
}

// Function to edit a task in history
function editHistoryTask(id) {
    const taskText = document.querySelector(`#historyList .task-item button[onclick="editHistoryTask(${id})"]`).previousElementSibling.previousElementSibling;
    taskText.contentEditable = true;
    taskText.focus();

    taskText.addEventListener('blur', function () {
        const newText = taskText.innerText.trim();
        if (newText !== '') {
            history = history.map(task => task.id === id ? { ...task, text: newText } : task);
            taskText.contentEditable = false;
            updateLocalStorage();
            displayHistory();
        }
    });
}

// Function to delete a task from history
function deleteHistoryTask(id) {
    history = history.filter(task => task.id !== id);
    updateLocalStorage();
    displayHistory();
}

// Initial display of tasks and history from localStorage
tasks.forEach(task => {
    scheduleAlarm(task.text, new Date(task.alarmTime), task.id);
});

displayTasks();
displayHistory();
