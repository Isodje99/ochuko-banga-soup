const adminLoginForm = document.getElementById("admin-login-form");

adminLoginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const message = document.getElementById("admin-message");

    try {

        const response = await fetch(
            "https://ochuko-banga-soupp.onrender.com/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        if (data.role !== "admin") {
            message.textContent = "This account is not an admin account.";
            return;
        }

        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminName", data.name);

        message.textContent = "Admin login successful!";

        window.location.href = "admin-dashboard.html";

    } catch (error) {

        console.error(error);

        message.textContent =
            "Could not connect to the server.";

    }

});