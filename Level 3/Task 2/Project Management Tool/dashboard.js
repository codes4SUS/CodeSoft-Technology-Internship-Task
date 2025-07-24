const token = localStorage.getItem("token");
const email = localStorage.getItem("email");

if (!token) {
  alert("Unauthorized. Please login first.");
  window.location.href = "index.html";
}

// Set user email in dashboard
document.getElementById("userEmail").textContent = email;

// DOM Elements
const projectList = document.getElementById("projectList");
const createForm = document.getElementById("createProjectForm");
const projectMsg = document.getElementById("projectMsg");
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const assignedDropdown = document.getElementById("assigned-to");
const selectedProjectInput = document.getElementById("selected-project-id");

let selectedProjectId = null;

// ======= PROJECT SECTION ========

// Fetch projects
async function fetchProjects() {
  try {
    const res = await fetch("http://localhost:5000/api/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    projectList.innerHTML = "";

    if (data.length === 0) {
      projectList.innerHTML = "<li>No projects found.</li>";
      return;
    } else {
      data.forEach((project) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${project.title}</strong><br/>
          <small>${project.description}</small><br/>
          <em>Members: ${project.members.map(m => m.email).join(', ')}</em><br/>
          <button onclick="loadTasks('${project._id}')">📋 View Tasks</button>
          <button onclick="selectProject('${project._id}')">➕ Add Task</button>
        `;
        projectList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

// Fetch and populate users in assigned-to dropdown
async function loadUsersForTaskAssignment() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const users = await res.json();
    assignedDropdown.innerHTML = `<option value="">-- Select User --</option>`;
    users.forEach(user => {
      const option = document.createElement("option");
      option.value = user._id;
      option.textContent = user.email;
      assignedDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}
// Create project
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("projectTitle").value;
  const description = document.getElementById("projectDesc").value;

  try {
    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });

    const result = await res.json();
    if (res.ok) {
      projectMsg.textContent = "✅ Project created successfully!";
      document.getElementById("projectTitle").value = "";
      document.getElementById("projectDesc").value = "";
      fetchProjects();
    } else {
      projectMsg.textContent = `❌ ${result.message || "Failed to create project"}`;
    }
  } catch (error) {
    console.error("Error creating project:", error);
    projectMsg.textContent = "❌ Something went wrong.";
  }
});

// Add task
document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const assignedTo = document.getElementById("assigned-to").value;
  const projectId = document.getElementById("selected-project-id").value;

  console.log("🟡 Task Form Submission");
  console.log("➡️ Title:", title);
  console.log("➡️ Description:", description);
  console.log("➡️ Assigned To:", assignedTo);
  console.log("➡️ Project ID:", projectId);

  if (!projectId) {
    alert("Please select a project first.");
    return;
  }
  if (!assignedTo) {
    alert("Please select a user to assign the task to.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, assignedTo }),
    });

    const result = await res.json();
    console.log("Task response:", result);
    if (res.ok) {
      alert("✅ Task added!");
      //document.getElementById("task-title").value = "";
      //document.getElementById("task-desc").value = "";
      //document.getElementById("assigned-to").value = "";
      taskForm.reset();
      loadTasks(projectId);  // Reload tasks
    } else {
      alert(`❌ ${result.message || "Failed to add task."}`);
    }
  } catch (error) {
    console.error("Error adding task:", error);
    alert("❌ Error occurred while adding task.");
  }
});

// Load tasks
async function loadTasks(projectId) {
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const tasks = await res.json();
    console.log("Loaded tasks:", tasks);

    //const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      taskList.innerHTML = "<p>No tasks found.</p>";
    } else {
      tasks.forEach((task) => {
        const div = document.createElement("div");
        div.textContent = `• ${task.title} (Assigned to: ${task.assignedTo?.email || 'N/A'})`;
        taskList.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
    document.getElementById("task-list").innerHTML = "<p>Error loading tasks.</p>";
  }
}

// Select project for adding task
function selectProject(projectId) {
  document.getElementById("selected-project-id").value = projectId;
  alert("✅ Project selected. Now add a task below.");
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "index.html";
});

// Initial fetch
fetchProjects();
loadUsersForTaskAssignment(); // 🔁 load users on page load