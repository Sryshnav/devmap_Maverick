document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const noTasks = document.getElementById('noTasks');
    const errorPopup = document.getElementById('errorPopup');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    
    const editModal = document.getElementById('editModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const editTaskInput = document.getElementById('editTaskInput');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    
    let currentFilter = 'all';
    let currentEditTaskId = null;
   
    loadTasks();
    updateClearCompletedButton();

    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            filterTasks(filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditTask);
    modalOverlay.addEventListener('click', closeEditModal);
    
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
        
        createTaskElement(task);
        
        saveTask(task);
   
        taskInput.value = '';
        
        noTasks.style.display = 'none';
        
        filterTasks(currentFilter);
        
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
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', () => openEditModal(task.id, task.text));
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.innerHTML = '✓';
        completeBtn.title = task.completed ? 'Mark as incomplete' : 'Mark as complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(taskText);
        li.appendChild(actionsDiv);
        
        taskList.appendChild(li);
    }
    
    function showError() {
        errorPopup.style.display = 'block';

        errorPopup.style.animation = 'none';
        errorPopup.offsetHeight; 
        errorPopup.style.animation = 'slideIn 0.3s ease-out, fadeOut 0.3s ease-in forwards 3s';
        
        setTimeout(() => {
            errorPopup.style.display = 'none';
        }, 3300);
    }
    
    function toggleComplete(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        tasks = tasks.map(task => {
            if (task.id === Number(id)) {
                task.completed = !task.completed;
            }
            return task;
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.toggle('completed');
            taskElement.dataset.status = taskElement.classList.contains('completed') ? 'completed' : 'pending';

            const completeBtn = taskElement.querySelector('.complete-btn');
            const isCompleted = taskElement.classList.contains('completed');
            completeBtn.title = isCompleted ? 'Mark as incomplete' : 'Mark as complete';
            
            filterTasks(currentFilter);
            
            updateClearCompletedButton();
        }
    }
    
    function deleteTask(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        tasks = tasks.filter(task => task.id !== Number(id));

        localStorage.setItem('tasks', JSON.stringify(tasks));

        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
       
        if (taskElement) {
            taskElement.classList.add('deleted');
            
            setTimeout(() => {
                taskElement.remove();
                
                if (tasks.length === 0) {
                    noTasks.style.display = 'block';
                }
                
               
                updateClearCompletedButton();
            }, 300);
        }
    }
    
    function saveTask(task) {
   
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
     
        tasks.push(task);
        

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        if (tasks.length > 0) {
            
            noTasks.style.display = 'none';

            tasks.forEach(task => {
                createTaskElement(task);
            });
            
            
            filterTasks(currentFilter);
        }
    }
    
    function filterTasks(filter) {
        
        const taskItems = document.querySelectorAll('.task-item');
        
        
        taskItems.forEach(item => {
            const status = item.dataset.status;
            
            if (filter === 'all' || filter === status) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        
        let visibleTasks = false;
        taskItems.forEach(item => {
            if (item.style.display !== 'none') {
                visibleTasks = true;
            }
        });
        
       
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
     
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
    
        const incompleteTasks = tasks.filter(task => !task.completed);
      
        localStorage.setItem('tasks', JSON.stringify(incompleteTasks));

        const completedTaskElements = document.querySelectorAll('.task-item.completed');
        completedTaskElements.forEach(element => {
            element.classList.add('deleted');
        });
        
        setTimeout(() => {
            completedTaskElements.forEach(element => element.remove());
    
            if (incompleteTasks.length === 0) {
                noTasks.style.display = 'block';
                noTasks.textContent = 'No tasks yet. Add one above!';
            } else {
                filterTasks(currentFilter);
            }
     
            updateClearCompletedButton();
        }, 300);
    }
    
    function updateClearCompletedButton() {
   
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
      
        const hasCompletedTasks = tasks.some(task => task.completed);
        
       
        clearCompletedBtn.style.display = hasCompletedTasks ? 'block' : 'none';
    }
    
    function openEditModal(taskId, taskText) {
        
        currentEditTaskId = taskId;

        editTaskInput.value = taskText;
   
        editModal.classList.add('active');
        modalOverlay.classList.add('active');
        
        
        editTaskInput.focus();
        
       
        editTaskInput.addEventListener('keypress', function editKeyHandler(e) {
            if (e.key === 'Enter') {
                saveEditTask();
               
                editTaskInput.removeEventListener('keypress', editKeyHandler);
            }
        });
    }
    
    function closeEditModal() {
       
        editModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        
        
        currentEditTaskId = null;
    }
    
    function saveEditTask() {
      
        const newTaskText = editTaskInput.value.trim();
        
        if (newTaskText === '') {

            editTaskInput.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                editTaskInput.style.borderColor = '#e0e0e0';
            }, 2000);
            return;
        }

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        tasks = tasks.map(task => {
            if (task.id === Number(currentEditTaskId)) {
                task.text = newTaskText;
            }
            return task;
        });
      
        localStorage.setItem('tasks', JSON.stringify(tasks));
      
        const taskElement = document.querySelector(`.task-item[data-id="${currentEditTaskId}"]`);
        if (taskElement) {
            const taskTextElement = taskElement.querySelector('.task-text');
            taskTextElement.textContent = newTaskText;
            
    
            taskElement.style.backgroundColor = '#f0f7ff';
            setTimeout(() => {
                taskElement.style.backgroundColor = '';
            }, 1000);
        }
        
   
        closeEditModal();
    }
});