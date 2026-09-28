// =========================
// REGISTER
// =========================

document
    .getElementById("register-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("register-name").value;

        const email =
            document.getElementById("register-email").value;

        const password =
            document.getElementById("register-password").value;

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );

            const data = await response.json();

            if (response.ok) {

                alert(data.message);

            } else {

                alert(data.message);
            }

        } catch (error) {

            console.error(error);

            alert(
                "Could not connect to the server."
            );
        }
    });


// =========================
// LOGIN
// =========================

document
    .getElementById("login-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document.getElementById("login-email").value;

        const password =
            document.getElementById("login-password").value;

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/login",
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

            if (response.ok) {

    // Save login token
    localStorage.setItem(
        "token",
        data.token
    );

    // Save customer's name
    localStorage.setItem(
        "username",
        data.name
    );

    // Go straight to the homepage
    window.location.href = "index.html";



            } else {

                alert(data.message);
            }

        } catch (error) {

            console.error(error);

            alert(
                "Could not connect to the server."
            );
        }
    });