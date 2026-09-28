const receiptData =
    JSON.parse(localStorage.getItem("lastOrder"));

if (!receiptData) {

    alert("No receipt found.");

    window.location.href = "index.html";

} else {

    document.getElementById("receipt-order-id")
        .textContent = receiptData.orderId;

    document.getElementById("receipt-customer")
        .textContent = receiptData.customer;

    document.getElementById("receipt-payment")
        .textContent = receiptData.payment;

    const itemsContainer =
        document.getElementById("receipt-items");

    itemsContainer.innerHTML = "";

    receiptData.items.forEach(function(item) {

        const itemRow = document.createElement("div");

        itemRow.className = "receipt-item";

        itemRow.innerHTML = `
            <span>
                ${item.name} × ${item.quantity}
            </span>

            <strong>
                ₦${(
                    item.price * item.quantity
                ).toLocaleString()}
            </strong>
        `;

        itemsContainer.appendChild(itemRow);

    });

    document.getElementById("receipt-subtotal")
        .textContent =
        "₦" + receiptData.subtotal.toLocaleString();

    document.getElementById("receipt-delivery")
        .textContent =
        "₦" + receiptData.delivery.toLocaleString();

    document.getElementById("receipt-total")
        .textContent =
        "₦" + receiptData.total.toLocaleString();
}