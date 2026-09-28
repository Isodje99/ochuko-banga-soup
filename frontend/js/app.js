// Get all Add to Cart buttons
const addButtons = document.querySelectorAll(".add-cart");

// Get the cart count
const cartCount = document.getElementById("cart-count");

// Get existing cart from the browser
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Show current cart count
updateCartCount();


// Add food to cart
addButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const foodName = button.dataset.name;
        const foodPrice = Number(button.dataset.price);

        const existingFood = cart.find(function(item) {
            return item.name === foodName;
        });

        if (existingFood) {

            existingFood.quantity++;

        } else {

            cart.push({
                name: foodName,
                price: foodPrice,
                quantity: 1
            });

        }

        // Save cart
        localStorage.setItem("cart", JSON.stringify(cart));

        // Update number on cart button
        updateCartCount();

        alert(foodName + " added to cart!");

    });

});


// Update cart number
function updateCartCount() {

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += item.quantity;
    });

    cartCount.textContent = totalItems;
}
const usernameDisplay =
    document.getElementById("username-display");

const username =
    localStorage.getItem("username");

if (username && usernameDisplay) {
    usernameDisplay.textContent =
        "Welcome, " + username + " 👋";
}