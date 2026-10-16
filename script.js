// State Management
let tasks = JSON.parse(localStorage.getItem('pro_tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const emptyState = document.getElementById('emptyState');
const taskStats = document.getElementById('taskStats');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTasks();
});

// Theme Handling
themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    tasks.unshift(newTask);
    saveAndRender();

    // Reset Form
    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'Medium';
});

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    const searchText = searchInput.value.toLowerCase();
    
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = 
            currentFilter === 'all' ? true :
            currentFilter === 'active' ? !task.completed : task.completed;
            
        const matchesSearch = task.text.toLowerCase().includes(searchText);
        
        return matchesFilter && matchesSearch;
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskNode(task));
        });
    }

    updateStats();
}

// Create Task HTML
function createTaskNode(task) {
    const li = document.createElement('li');
    li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
        <div class="task-left">
            <div class="custom-checkbox" onclick="toggleTask(${task.id})">
                ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <div class="task-meta">
                    <span class="tag">${task.category}</span>
                    <span class="priority-tag priority-${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span class="due-date"><i class="fa-regular fa-calendar"></i> ${task.dueDate}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button class="action-btn" onclick="editTask(${task.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" onclick="deleteTask(${task.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    return li;
}

// Actions
window.toggleTask = function(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            const updatedState = !t.completed;
            // Trigger confetti if task is completed
            if (updatedState) {
                triggerConfetti();
            }
            return { ...t, completed: updatedState };
        }
        return t;
    });
    saveAndRender();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Update your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
        task.text = newText.trim();
        saveAndRender();
    }
};

clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
});

// Filters & Search
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener('input', renderTasks);

// Stats & Progress Bar
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    progressBar.style.width = `${percent}%`;
    progressPercent.innerText = `${percent}%`;
    taskStats.innerText = `${active} active task${active !== 1 ? 's' : ''} remaining`;

    // 100% Complete Celebration
    if (total > 0 && completed === total) {
        triggerBigCelebration();
    }
}

// Confetti Effects
function triggerConfetti() {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
    });
}

function triggerBigCelebration() {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
    });
}

// Helpers
function saveAndRender() {
    localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    renderTasks();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}