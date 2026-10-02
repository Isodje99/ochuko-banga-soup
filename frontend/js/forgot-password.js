const forgotForm = document.getElementById("forgot-password-form");

forgotForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("forgot-email").value.trim();
    const message = document.getElementById("forgot-message");

    message.textContent = "Sending reset link...";

    try {

        const response = await fetch(
            "https://ochuko-banga-soup.onrender.com/api/forgot-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

    } catch (error) {

        console.error(error);

        message.textContent =
            "Could not connect to the server.";

    }

});