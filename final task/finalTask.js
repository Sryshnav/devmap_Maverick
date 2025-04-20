document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const noTasks = document.getElementById('noTasks');
    const errorPopup = document.getElementById('errorPopup');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    
    // Edit modal elements
    const editModal = document.getElementById('editModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const editTaskInput = document.getElementById('editTaskInput');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    
    // Current filter and edit state
    let currentFilter = 'all';
    let currentEditTaskId = null;
   
    // Initialize app
    loadTasks();
    updateClearCompletedButton();

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            
            // Update active filter button
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tasks
            filterTasks(filter);
        });
    });
    
    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Modal event listeners
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditTask);
    modalOverlay.addEventListener('click', closeEditModal);
    
    // Functions
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            showError();
            return;
        }
  
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Create task element and add to DOM
        createTaskElement(task);
        
        // Save task to localStorage
        saveTask(task);
   
        // Clear input field
        taskInput.value = '';
        
        // Hide "No tasks" message
        noTasks.style.display = 'none';
        
        // Apply current filter
        filterTasks(currentFilter);
        
        // Update Clear Completed button
        updateClearCompletedButton();
    }
    
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = task.completed ? 'task-item completed' : 'task-item';
        li.dataset.id = task.id;
        li.dataset.status = task.completed ? 'completed' : 'pending';
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', () => openEditModal(task.id, task.text));
        
        // Complete button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.innerHTML = '✓';
        completeBtn.title = task.completed ? 'Mark as incomplete' : 'Mark as complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        // Append buttons to actions div
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);
        
        // Append elements to li
        li.appendChild(taskText);
        li.appendChild(actionsDiv);
        
        // Append li to task list
        taskList.appendChild(li);
    }
    
    function showError() {
        errorPopup.style.display = 'block';

        // Reset animation
        errorPopup.style.animation = 'none';
        errorPopup.offsetHeight; // Trigger reflow
        errorPopup.style.animation = 'slideIn 0.3s ease-out, fadeOut 0.3s ease-in forwards 3s';
        
        // Hide error after animation
        setTimeout(() => {
            errorPopup.style.display = 'none';
        }, 3300);
    }
    
    function toggleComplete(id) {
        // Get tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Toggle task completed status
        tasks = tasks.map(task => {
            if (task.id === Number(id)) {
                task.completed = !task.completed;
            }
            return task;
        });
        
        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update DOM
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.toggle('completed');
            taskElement.dataset.status = taskElement.classList.contains('completed') ? 'completed' : 'pending';

            // Update complete button title
            const completeBtn = taskElement.querySelector('.complete-btn');
            const isCompleted = taskElement.classList.contains('completed');
            completeBtn.title = isCompleted ? 'Mark as incomplete' : 'Mark as complete';
            
            // Apply current filter
            filterTasks(currentFilter);
            
            // Update Clear Completed button
            updateClearCompletedButton();
        }
    }
    
    function deleteTask(id) {
        // Get tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // Remove task from array
        tasks = tasks.filter(task => task.id !== Number(id));

        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Get task element
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        
        // Add delete animation
        if (taskElement) {
            taskElement.classList.add('deleted');
            
            // Remove element after animation completes
            setTimeout(() => {
                taskElement.remove();
                
                // Show "No tasks" message if no tasks left
                if (tasks.length === 0) {
                    noTasks.style.display = 'block';
                }
                
                // Update Clear Completed button
                updateClearCompletedButton();
            }, 300);
        }
    }
    
    function saveTask(task) {
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Add new task
        tasks.push(task);
        
        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        if (tasks.length > 0) {
            // Hide "No tasks" message
            noTasks.style.display = 'none';

            // Create task elements
            tasks.forEach(task => {
                createTaskElement(task);
            });
            
            // Apply current filter
            filterTasks(currentFilter);
        }
    }
    
    function filterTasks(filter) {
        // Get all task items
        const taskItems = document.querySelectorAll('.task-item');
        
        // Show/hide tasks based on filter
        taskItems.forEach(item => {
            const status = item.dataset.status;
            
            if (filter === 'all' || filter === status) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Check if any tasks are visible
        let visibleTasks = false;
        taskItems.forEach(item => {
            if (item.style.display !== 'none') {
                visibleTasks = true;
            }
        });
        
        // Show/hide "No tasks" message
        if (taskItems.length === 0) {
            noTasks.style.display = 'block';
            noTasks.textContent = 'No tasks yet. Add one above!';
        } else if (!visibleTasks) {
            noTasks.style.display = 'block';
            noTasks.textContent = `No ${filter} tasks found.`;
        } else {
            noTasks.style.display = 'none';
        }
    }
    
    function clearCompletedTasks() {
        // Get tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Filter out completed tasks
        const incompleteTasks = tasks.filter(task => !task.completed);
        
        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(incompleteTasks));
        
        // Remove completed tasks from DOM with animation
        const completedTaskElements = document.querySelectorAll('.task-item.completed');
        completedTaskElements.forEach(element => {
            element.classList.add('deleted');
        });
        
        // Remove elements after animation completes
        setTimeout(() => {
            completedTaskElements.forEach(element => element.remove());
            
            // Show "No tasks" message if no tasks left
            if (incompleteTasks.length === 0) {
                noTasks.style.display = 'block';
                noTasks.textContent = 'No tasks yet. Add one above!';
            } else {
                filterTasks(currentFilter);
            }
            
            // Update Clear Completed button
            updateClearCompletedButton();
        }, 300);
    }
    
    function updateClearCompletedButton() {
        // Get tasks from localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Check if any completed tasks exist
        const hasCompletedTasks = tasks.some(task => task.completed);
        
        // Show/hide Clear Completed button
        clearCompletedBtn.style.display = hasCompletedTasks ? 'block' : 'none';
    }
    
    function openEditModal(taskId, taskText) {
        // Set current edit task ID
        currentEditTaskId = taskId;
        
        // Set edit input value
        editTaskInput.value = taskText;
        
        // Show modal and overlay
        editModal.classList.add('active');
        modalOverlay.classList.add('active');
        
        // Focus input
        editTaskInput.focus();
        
        // Add keypress event for Enter key
        editTaskInput.addEventListener('keypress', function editKeyHandler(e) {
            if (e.key === 'Enter') {
                saveEditTask();
                // Remove this event listener
                editTaskInput.removeEventListener('keypress', editKeyHandler);
            }
        });
    }
    
    function closeEditModal() {
        // Hide modal and overlay
        editModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        
        // Reset current edit task ID
        currentEditTaskId = null;
    }
    
    function saveEditTask() {
        // Get edit input value
        const newTaskText = editTaskInput.value.trim();
        
        if (newTaskText === '') {
            // Show error
            editTaskInput.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                editTaskInput.style.borderColor = '#e0e0e0';
            }, 2000);
            return;
        }
        
        // Get tasks from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Update task text
        tasks = tasks.map(task => {
            if (task.id === Number(currentEditTaskId)) {
                task.text = newTaskText;
            }
            return task;
        });
        
        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update DOM
        const taskElement = document.querySelector(`.task-item[data-id="${currentEditTaskId}"]`);
        if (taskElement) {
            const taskTextElement = taskElement.querySelector('.task-text');
            taskTextElement.textContent = newTaskText;
            
            // Add highlight effect
            taskElement.style.backgroundColor = '#f0f7ff';
            setTimeout(() => {
                taskElement.style.backgroundColor = '';
            }, 1000);
        }
        
        // Close modal
        closeEditModal();
    }
});