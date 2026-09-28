const checkoutItems =
    document.getElementById("checkout-items");

const checkoutSubtotal =
    document.getElementById("checkout-subtotal");

const checkoutTotal =
    document.getElementById("checkout-total");


let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// DISPLAY CHECKOUT ITEMS
function displayCheckout() {

    checkoutItems.innerHTML = "";

    let subtotal = 0;


    cart.forEach(function(item) {

        const itemTotal =
            item.price * item.quantity;

        subtotal += itemTotal;


        const itemElement =
            document.createElement("div");


        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            <div>

                <strong>
                    ${item.name}
                </strong>

                <p>
                    Quantity: ${item.quantity}
                </p>

            </div>

            <strong>
                ₦${itemTotal.toLocaleString()}
            </strong>

        `;


        checkoutItems.appendChild(itemElement);

    });


    const deliveryFee = 1000;

    const total =
        subtotal + deliveryFee;


    checkoutSubtotal.textContent =
        "₦" + subtotal.toLocaleString();


    checkoutTotal.textContent =
        "₦" + total.toLocaleString();

}



// PLACE ORDER
document
    .getElementById("checkout-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;

        }


        const customerName =
            document.getElementById("name").value;

        const phone =
            document.getElementById("phone").value;

        const address =
            document.getElementById("address").value;

        const city =
            document.getElementById("city").value;

        const note =
            document.getElementById("note").value;

        const paymentMethod =
            document.querySelector(
                'input[name="payment"]:checked'
            ).value;


        const order = {

            customerName: customerName,

            phone: phone,

            address: address,

            city: city,

            note: note,

            paymentMethod: paymentMethod,

            items: cart

        };


        try {

            const token = localStorage.getItem("token");

if (!token) {
    alert("Please login before placing your order.");
    window.location.href = "login.html";
    return;
}

const response = await fetch(
    "http://localhost:5000/api/orders",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify(order)
    }
);



            const data =
                await response.json();


         if (response.ok) {

    const paymentMethod =
        document.querySelector(
            'input[name="payment"]:checked'
        ).value;

    let customerName =
        localStorage.getItem("username");

    if (!customerName) {
        customerName =
            document.getElementById("name").value;
    }

    let paymentText = "";

    if (paymentMethod === "online") {

        const cardName =
            document.getElementById("cardName").value;

        const cardNumber =
            document.getElementById("cardNumber").value;

        const lastFour =
            cardNumber.slice(-4);

        paymentText =
            "Online Payment - " +
            cardName +
            " •••• " +
            lastFour;

    } else {

        paymentText =
            "Pay on Delivery - " +
            customerName;

    }

    const receiptSubtotal =
        cart.reduce(function(total, item) {
            return total +
                (item.price * item.quantity);
        }, 0);

    const receiptDelivery = 1000;

    const receiptTotal =
        receiptSubtotal + receiptDelivery;

    const receipt = {

        orderId: data.orderId,

        customer: customerName,

        payment: paymentText,

        items: cart,

        subtotal: receiptSubtotal,

        delivery: receiptDelivery,

        total: receiptTotal

    };

    localStorage.setItem(
        "lastOrder",
        JSON.stringify(receipt)
    );

    localStorage.removeItem("cart");

    window.location.href =
        "receipt.html";


    localStorage.setItem(
        "lastOrder",
        JSON.stringify(receipt)
    );

    localStorage.removeItem("cart");

    window.location.href = "receipt.html";




                console.log(
                    "Server response:",
                    data
                );

            } else {

                alert(
                    "Something went wrong."
                );

            }


        } catch (error) {

            console.error(
                "Error:",
                error
            );


            alert(
                "Could not connect to the server."
            );

        }

    });


// LOAD CHECKOUT
displayCheckout();const paymentOptions =
    document.querySelectorAll(
        'input[name="payment"]'
    );

const cardDetails =
    document.getElementById("card-details");

paymentOptions.forEach(function(option) {

    option.addEventListener("change", function() {

        if (this.value === "online") {

            cardDetails.style.display = "block";

        } else {

            cardDetails.style.display = "none";

        }

    });

});