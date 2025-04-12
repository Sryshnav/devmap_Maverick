document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const noTasks = document.getElementById('noTasks');
    const errorPopup = document.getElementById('errorPopup');
    
   
    loadTasks();

    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            showError();
            return;
        }
  
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        

        createTaskElement(task);
        
  
        saveTask(task);
   
        taskInput.value = '';
        
      
        noTasks.style.display = 'none';
    }
    
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = task.completed ? 'task-item completed' : 'task-item';
        li.dataset.id = task.id;
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
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
            if (task.id === id) {
                task.completed = !task.completed;
            }
            return task;
        });
        
 
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
      
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        taskElement.classList.toggle('completed');

        const completeBtn = taskElement.querySelector('.complete-btn');
        const isCompleted = taskElement.classList.contains('completed');
        completeBtn.title = isCompleted ? 'Mark as incomplete' : 'Mark as complete';
    }
    
    function deleteTask(id) {
       
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        tasks = tasks.filter(task => task.id !== id);

        localStorage.setItem('tasks', JSON.stringify(tasks));

        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        taskElement.remove();

        if (tasks.length === 0) {
            noTasks.style.display = 'block';
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
        }
    }
});