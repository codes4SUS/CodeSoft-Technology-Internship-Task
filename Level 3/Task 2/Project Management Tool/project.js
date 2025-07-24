document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (!token || !projectId) {
    alert('Unauthorized or Invalid project ID');
    window.location.href = 'login.html';
    return;
  }

  // Fetch project details
  try {
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Something went wrong');
      return;
    }

    document.getElementById('title').textContent = data.title;
    document.getElementById('description').textContent = data.description;
    document.getElementById('createdBy').textContent = data.createdBy.name || 'You';

    const membersList = document.getElementById('membersList');
    data.members.forEach(member => {
      const li = document.createElement('li');
      li.textContent = `${member.name} (${member.email})`;
      membersList.appendChild(li);
    });

    // Fetch and display project tasks
    fetchTasks();

  } catch (err) {
    alert('Failed to fetch project data');
  }

  // Function to fetch and render tasks
  async function fetchTasks() {
    try {
      const taskRes = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const taskData = await taskRes.json();

      if (!taskRes.ok) {
        alert(taskData.error || 'Failed to fetch tasks');
        return;
      }

      const taskList = document.getElementById('taskList');
      taskList.innerHTML = ''; // Clear previous list

      taskData.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${task.title}</strong><br>${task.description}`;
        taskList.appendChild(li);
      });

    } catch (err) {
      alert('Error fetching tasks');
    }
  }

  // Handle task form submission
  const taskForm = document.getElementById('taskForm');
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskTitle = document.getElementById('taskTitle').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();

    if (!taskTitle || !taskDescription) {
      alert('Please fill out both fields');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription
        })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Failed to add task');
        return;
      }

      // Clear form
      taskForm.reset();

      // Refresh task list
      fetchTasks();

    } catch (err) {
      alert('Error adding task');
    }
  });
});