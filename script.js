// ===============================
// TaskFlow - Authentication
// ===============================

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const toast = document.getElementById("toast");

// ===============================
// Toast Message
// ===============================

function showToast(message, success = true) {
    toast.textContent = message;

    toast.style.background = success
        ? "#211b2a"
        : "#b42318";

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ===============================
// Switch to Register
// ===============================

showRegister.addEventListener("click", () => {
    loginView.classList.add("hidden");
    registerView.classList.remove("hidden");
});

// ===============================
// Switch to Login
// ===============================

showLogin.addEventListener("click", () => {
    registerView.classList.add("hidden");
    loginView.classList.remove("hidden");
});

// ===============================
// Register
// ===============================

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, false);
            return;
        }

        showToast("Account created successfully!");

        registerForm.reset();

        setTimeout(() => {
            registerView.classList.add("hidden");
            loginView.classList.remove("hidden");
        }, 1200);

    } catch (error) {
        console.error(error);
        showToast("Unable to connect to server", false);
    }
});

// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, false);
            return;
        }

        showToast(`Welcome back, ${data.user.name}!`);

        loginForm.reset();

        // Dashboard will be created in the next step
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (error) {
        console.error(error);
        showToast("Unable to connect to server", false);
    }
});