const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
    session({
        secret: "taskflow-secret-2026",
        resave: false,
        saveUninitialized: false
    })
);

// Temporary data storage
const users = [];
const tasks = [];

// ================================
// TEST ROUTE
// ================================

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "TaskFlow server is working!"
    });
});

// ================================
// REGISTER
// ================================

app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters"
        });
    }

    const existingUser = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    };

    users.push(user);

    res.status(201).json({
        success: true,
        message: "Account created successfully"
    });
});

// ================================
// LOGIN
// ================================

app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const user = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    req.session.userId = user.id;

    res.json({
        success: true,
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ================================
// CURRENT USER
// ================================

app.get("/api/me", (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const user = users.find(
        user => user.id === req.session.userId
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ================================
// LOGOUT
// ================================

app.post("/api/logout", (req, res) => {

    req.session.destroy(error => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.json({
            success: true,
            message: "Logout successful"
        });

    });
});

// ================================
// AUTHENTICATION MIDDLEWARE
// ================================

function requireLogin(req, res, next) {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    next();
}

// ================================
// GET TASKS
// ================================

app.get("/api/tasks", requireLogin, (req, res) => {

    const userTasks = tasks.filter(
        task => task.userId === req.session.userId
    );

    res.json(userTasks);
});

// ================================
// CREATE TASK
// ================================

app.post("/api/tasks", requireLogin, (req, res) => {

    const {
        title,
        description,
        category,
        priority,
        dueDate
    } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Task title is required"
        });
    }

    const newTask = {

        id:
            tasks.length === 0
                ? 1
                : Math.max(...tasks.map(task => task.id)) + 1,

        userId: req.session.userId,

        title,

        description: description || "",

        category: category || "Personal",

        priority: priority || "Medium",

        dueDate: dueDate || "",

        completed: false,

        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
        success: true,
        message: "Task created successfully",
        task: newTask
    });
});

// ================================
// UPDATE TASK
// ================================

app.put("/api/tasks/:id", requireLogin, (req, res) => {

    const id = Number(req.params.id);

    const task = tasks.find(
        task =>
            task.id === id &&
            task.userId === req.session.userId
    );

    if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    const {
        title,
        description,
        category,
        priority,
        dueDate,
        completed
    } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (description !== undefined) {
        task.description = description;
    }

    if (category !== undefined) {
        task.category = category;
    }

    if (priority !== undefined) {
        task.priority = priority;
    }

    if (dueDate !== undefined) {
        task.dueDate = dueDate;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.json({
        success: true,
        message: "Task updated successfully",
        task
    });
});

// ================================
// DELETE TASK
// ================================

app.delete("/api/tasks/:id", requireLogin, (req, res) => {

    const id = Number(req.params.id);

    const index = tasks.findIndex(
        task =>
            task.id === id &&
            task.userId === req.session.userId
    );

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Task not found"
        });
    }

    tasks.splice(index, 1);

    res.json({
        success: true,
        message: "Task deleted successfully"
    });
});

// ================================
// START SERVER
// ================================

app.listen(PORT, () => {

    console.log(
        `TaskFlow server running at http://localhost:${PORT}`
    );

});