const adminToken = localStorage.getItem("adminToken");
const adminName = localStorage.getItem("adminName");


// =============================
// CHECK ADMIN LOGIN
// =============================

if (!adminToken) {

    alert("Please login as admin first.");

    window.location.href = "admin-login.html";
}


// =============================
// SHOW ADMIN NAME
// =============================

const welcome = document.getElementById("admin-welcome");

if (welcome) {
    welcome.textContent = "Welcome, " + adminName + " 👋";
}


// =============================
// LOAD CUSTOMERS
// =============================

async function loadCustomers() {

    try {

        const response = await fetch(
            "https://ochuko-banga-soup.onrender.com/api/admin/users",
            {
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        document.getElementById("customer-count").textContent =
            data.length;


        const container =
            document.getElementById("customers-container");


        if (data.length === 0) {

            container.innerHTML =
                "<p>No customers registered yet.</p>";

            return;
        }


        container.innerHTML = "";


        data.forEach(function (customer) {

            const customerCard =
                document.createElement("div");

            customerCard.className =
                "customer-card";


            customerCard.innerHTML = `
                <h3>${customer.name}</h3>

                <p>
                    <strong>Email:</strong>
                    ${customer.email}
                </p>

                <p>
                    <strong>Registered:</strong>
                    ${new Date(customer.createdAt).toLocaleString()}
                </p>
            `;


            container.appendChild(customerCard);

        });

    } catch (error) {

        console.error(error);

        document.getElementById(
            "customers-container"
        ).textContent =
            "Could not load customers.";

    }

}


// =============================
// LOAD ORDERS
// =============================

async function loadOrders() {

    try {

        const response = await fetch(
            "https://ochuko-banga-soup.onrender.com/api/admin/orders",
            {
                headers: {
                    "Authorization": "Bearer " + adminToken
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(data.message);

        }


        document.getElementById("order-count").textContent =
            data.length;


        const container =
            document.getElementById("orders-container");


        if (data.length === 0) {

            container.innerHTML =
                "<p>No orders yet.</p>";

            return;

        }


        container.innerHTML = "";

data.forEach(function (order) {

    const orderCard =
        document.createElement("div");

    orderCard.className =
        "order-card";


    // CREATE THE ITEMS LIST

    let itemsHTML = "";

    if (order.items && order.items.length > 0) {

        itemsHTML = order.items.map(function (item) {

            const itemTotal =
                (item.price || 0) * (item.quantity || 1);

            return `
                <div class="admin-order-item">

                    <span>
                        ${item.name}
                        × ${item.quantity || 1}
                    </span>

                    <strong>
                        ₦${itemTotal.toLocaleString()}
                    </strong>

                </div>
            `;

        }).join("");

    } else {

        itemsHTML =
            "<p>No items found for this order.</p>";

    }


    orderCard.innerHTML = `

        <h3>
            Order #${order._id}
        </h3>


        <p>
            <strong>Status:</strong>
            ${order.status}
        </p>


        <p>
            <strong>Customer:</strong>
            ${order.customerName || "Not provided"}
        </p>


        <p>
            <strong>Phone:</strong>
            ${order.phone || "Not provided"}
        </p>


        <p>
            <strong>Address:</strong>
            ${order.address || "Not provided"}
        </p>


        <p>
            <strong>City:</strong>
            ${order.city || "Not provided"}
        </p>


        <p>
            <strong>Payment:</strong>
            ${order.paymentMethod || "Not provided"}
        </p>


        <p>
            <strong>Note:</strong>
            ${order.note || "No note"}
        </p>


        <h4 class="admin-items-title">
            Items Ordered
        </h4>


        <div class="admin-order-items">

            ${itemsHTML}

        </div>


        <p class="admin-order-total">

            <strong>
                Total:
            </strong>

            ₦${order.items
                ? order.items.reduce(function (total, item) {
                    return total +
                        ((item.price || 0) *
                        (item.quantity || 1));
                }, 0).toLocaleString()
                : "0"
            }

        </p>


        <p>
            <strong>Date:</strong>
            ${new Date(order.createdAt).toLocaleString()}
        </p>

    `;


    container.appendChild(orderCard);

});

    } catch (error) {

        console.error(error);

        document.getElementById(
            "orders-container"
        ).textContent =
            "Could not load orders.";

    }

}


// =============================
// LOGOUT
// =============================

document.getElementById("logout-btn")
    .addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");

        window.location.href = "admin-login.html";

    });


// =============================
// LOAD EVERYTHING
// =============================

loadCustomers();
loadOrders();