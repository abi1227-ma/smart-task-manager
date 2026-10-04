// ==========================================
// TASKFLOW DASHBOARD
// ==========================================

let allTasks = [];
let currentFilter = "all";


// ==========================================
// GET ELEMENTS
// ==========================================

const userName = document.getElementById("userName");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const userAvatar = document.getElementById("userAvatar");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressPercent = document.getElementById("progressPercent");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

const taskModal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskButton");
const emptyAddButton = document.getElementById("emptyAddButton");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");

const taskForm = document.getElementById("taskForm");

const logoutButton = document.getElementById("logoutButton");
const themeButton = document.getElementById("themeButton");

const toast = document.getElementById("toast");

const taskSection = document.getElementById("taskSection");

const dashboardNav = document.getElementById("dashboardNav");
const myTasksNav = document.getElementById("myTasksNav");
const completedNav = document.getElementById("completedNav");


// ==========================================
// TOAST
// ==========================================

function showToast(message, success = true) {

    toast.textContent = message;

    toast.classList.remove("error");

    if (!success) {
        toast.classList.add("error");
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// ==========================================
// LOAD USER
// ==========================================

async function loadUser() {

    try {

        const response = await fetch("/api/me");

        if (!response.ok) {

            window.location.href = "/";

            return;
        }

        const data = await response.json();

        const user = data.user;

        userName.textContent = user.name;

        profileName.textContent = user.name;

        profileEmail.textContent = user.email;

        userAvatar.textContent =
            user.name.charAt(0).toUpperCase();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to connect to server",
            false
        );
    }
}


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks() {

    try {

        const response = await fetch("/api/tasks");

        if (!response.ok) {

            if (response.status === 401) {

                window.location.href = "/";

                return;
            }

            throw new Error("Unable to load tasks");
        }

        allTasks = await response.json();

        updateStatistics();

        renderTasks();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load tasks",
            false
        );
    }
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total = allTasks.length;

    const completed =
        allTasks.filter(task => task.completed).length;

    const pending =
        total - completed;

    const progress =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;

    progressPercent.textContent =
        `${progress}%`;
}


// ==========================================
// RENDER TASKS
// ==========================================

function renderTasks() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    let filteredTasks =
        allTasks.filter(task => {

            const title =
                String(task.title || "")
                    .toLowerCase();

            const description =
                String(task.description || "")
                    .toLowerCase();

            const matchesSearch =
                title.includes(searchText) ||
                description.includes(searchText);


            if (!matchesSearch) {
                return false;
            }


            if (currentFilter === "active") {

                return !task.completed;
            }


            if (currentFilter === "completed") {

                return task.completed;
            }


            return true;
        });


    if (filteredTasks.length === 0) {

        let message = "No tasks yet";

        let description =
            "Add your first task and start making progress.";


        if (currentFilter === "completed") {

            message = "No completed tasks";

            description =
                "Complete a task and it will appear here.";

        } else if (currentFilter === "active") {

            message = "No active tasks";

            description =
                "Great job! You have no pending tasks.";

        } else if (searchText) {

            message = "No matching tasks";

            description =
                "Try a different search term.";
        }


        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✦
                </div>

                <h3>
                    ${message}
                </h3>

                <p>
                    ${description}
                </p>

                <button
                    class="add-task-button"
                    onclick="openTaskModal()">
                    + Add New Task
                </button>

            </div>
        `;

        return;
    }


    taskList.innerHTML =
        filteredTasks
            .map(task => createTaskHTML(task))
            .join("");
}


// ==========================================
// CREATE TASK CARD
// ==========================================

function createTaskHTML(task) {

    const completedClass =
        task.completed
            ? "task-completed"
            : "";

    const checked =
        task.completed
            ? "checked"
            : "";


    let dueDate = "No due date";


    if (task.dueDate) {

        const date =
            new Date(task.dueDate);

        if (!isNaN(date.getTime())) {

            dueDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );
        }
    }


    return `

        <div class="task-card ${completedClass}">

            <div class="task-check-area">

                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${checked}
                    onchange="toggleTask(
                        ${task.id},
                        this.checked
                    )">

            </div>


            <div class="task-content">

                <h3>
                    ${escapeHTML(task.title)}
                </h3>


                ${
                    task.description
                        ? `
                            <p>
                                ${escapeHTML(
                                    task.description
                                )}
                            </p>
                        `
                        : ""
                }


                <div class="task-meta">

                    <span class="task-category">
                        ${escapeHTML(
                            task.category || "Personal"
                        )}
                    </span>


                    <span
                        class="
                            task-priority
                            priority-${String(
                                task.priority || "Medium"
                            ).toLowerCase()}
                        ">

                        ${escapeHTML(
                            task.priority || "Medium"
                        )}

                    </span>


                    <span class="task-date">
                        ◷ ${dueDate}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                <button
                    onclick="deleteTask(${task.id})"
                    title="Delete task">

                    🗑

                </button>

            </div>

        </div>
    `;
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// MODAL
// ==========================================

function openTaskModal() {

    taskModal.classList.remove("hidden");

    setTimeout(() => {

        document
            .getElementById("taskTitle")
            .focus();

    }, 100);
}


function closeTaskModal() {

    taskModal.classList.add("hidden");

    taskForm.reset();
}


window.openTaskModal =
    openTaskModal;


// ==========================================
// OPEN MODAL
// ==========================================

addTaskButton.addEventListener(
    "click",
    openTaskModal
);


emptyAddButton.addEventListener(
    "click",
    openTaskModal
);


// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.addEventListener(
    "click",
    closeTaskModal
);


cancelTask.addEventListener(
    "click",
    closeTaskModal
);


document
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeTaskModal
    );


// ==========================================
// CREATE TASK
// ==========================================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            document
                .getElementById("taskTitle")
                .value
                .trim();


        const description =
            document
                .getElementById("taskDescription")
                .value
                .trim();


        const category =
            document
                .getElementById("taskCategory")
                .value;


        const priority =
            document
                .getElementById("taskPriority")
                .value;


        const dueDate =
            document
                .getElementById("taskDueDate")
                .value;


        try {

            const response =
                await fetch(
                    "/api/tasks",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            title,
                            description,
                            category,
                            priority,
                            dueDate
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                showToast(
                    data.message ||
                    "Unable to create task",
                    false
                );

                return;
            }


            showToast(
                "Task created successfully!"
            );


            closeTaskModal();


            await loadTasks();

        } catch (error) {

            console.error(error);

            showToast(
                "Unable to create task",
                false
            );
        }
    }
);


// ==========================================
// COMPLETE / UNCOMPLETE TASK
// ==========================================

async function toggleTask(
    taskId,
    completed
) {

    try {

        const response =
            await fetch(
                `/api/tasks/${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        completed
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to update task",
                false
            );

            return;
        }


        showToast(
            completed
                ? "Task completed! 🎉"
                : "Task moved back to active"
        );


        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to update task",
            false
        );
    }
}


window.toggleTask =
    toggleTask;


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(taskId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/tasks/${taskId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to delete task",
                false
            );

            return;
        }


        showToast(
            "Task deleted successfully"
        );


        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to delete task",
            false
        );
    }
}


window.deleteTask =
    deleteTask;


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    renderTasks
);


// ==========================================
// FILTER BUTTONS
// ==========================================

document
    .querySelectorAll(".filter-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".filter-button"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderTasks();
            }
        );

    });


// ==========================================
// SIDEBAR ACTIVE STATE
// ==========================================

function setSidebarActive(activeButton) {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );
        });


    activeButton.classList.add(
        "active"
    );
}


// ==========================================
// DASHBOARD BUTTON
// ==========================================

dashboardNav.addEventListener(
    "click",
    function () {

        setSidebarActive(
            dashboardNav
        );


        currentFilter = "all";


        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );
            });


        document
            .querySelector(
                '[data-filter="all"]'
            )
            .classList.add("active");


        renderTasks();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


// ==========================================
// MY TASKS BUTTON
// ==========================================

myTasksNav.addEventListener(
    "click",
    function () {

        setSidebarActive(
            myTasksNav
        );


        currentFilter = "all";


        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );
            });


        document
            .querySelector(
                '[data-filter="all"]'
            )
            .classList.add("active");


        renderTasks();


        taskSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// ==========================================
// COMPLETED BUTTON
// ==========================================

completedNav.addEventListener(
    "click",
    function () {

        setSidebarActive(
            completedNav
        );


        currentFilter =
            "completed";


        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );
            });


        document
            .querySelector(
                '[data-filter="completed"]'
            )
            .classList.add("active");


        renderTasks();


        taskSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async function () {

        try {

            const response =
                await fetch(
                    "/api/logout",
                    {
                        method: "POST"
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                window.location.href = "/";

            } else {

                showToast(
                    "Logout failed",
                    false
                );
            }

        } catch (error) {

            console.error(error);

            showToast(
                "Logout failed",
                false
            );
        }
    }
);


// ==========================================
// DARK / LIGHT MODE
// ==========================================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeButton.textContent = "☾";

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        themeButton.textContent = "☼";
    }
}


const savedTheme =
    localStorage.getItem(
        "taskflow-theme"
    );


if (savedTheme) {

    applyTheme(savedTheme);

} else {

    applyTheme("light");
}


themeButton.addEventListener(
    "click",
    function () {

        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        const newTheme =
            isDark
                ? "light"
                : "dark";


        applyTheme(newTheme);


        localStorage.setItem(
            "taskflow-theme",
            newTheme
        );
    }
);


// ==========================================
// START DASHBOARD
// ==========================================

loadUser();

loadTasks();