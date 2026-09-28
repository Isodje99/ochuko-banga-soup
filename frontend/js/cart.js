const cartItems = document.getElementById("cart-items");

const cartTotal = document.getElementById("cart-total");

const deliveryFee = document.getElementById("delivery-fee");

const grandTotal = document.getElementById("grand-total");

const checkoutButton = document.getElementById("checkout-btn");


let cart = JSON.parse(localStorage.getItem("cart")) || [];


// Display cart
function displayCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty 🛒</h3>

                <p>
                    You haven't added any food yet.
                </p>

                <a href="index.html#menu">
                    Browse Our Menu
                </a>
            </div>
        `;

        cartTotal.textContent = "₦0";
        grandTotal.textContent = "₦0";

        return;
    }


    let total = 0;


    cart.forEach(function(item, index) {

        const itemTotal = item.price * item.quantity;

        total += itemTotal;


        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";


        cartItem.innerHTML = `

            <div class="cart-item-info">

                <h3>${item.name}</h3>

                <p>
                    ₦${item.price.toLocaleString()}
                    each
                </p>

            </div>


            <div class="quantity">

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

            </div>


            <strong class="item-total">
                ₦${itemTotal.toLocaleString()}
            </strong>


            <button
                class="remove-btn"
                onclick="removeItem(${index})">

                Remove

            </button>

        `;


        cartItems.appendChild(cartItem);

    });


    const delivery = 1000;

    const finalTotal = total + delivery;


    cartTotal.textContent =
        "₦" + total.toLocaleString();


    grandTotal.textContent =
        "₦" + finalTotal.toLocaleString();

}


// Increase quantity
function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

}


// Decrease quantity
function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }

    saveCart();

}


// Remove item
function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

}


// Save cart
function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();

}


// Checkout
checkoutButton.addEventListener("click", function() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    window.location.href = "checkout.html";

});


displayCart();