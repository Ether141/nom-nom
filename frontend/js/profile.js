import AddressManager from "/js/components/address-manager/address-manager.js";
import WalletPay from "./components/wallet-pay/wallet-pay.js";
import PopupMessage from "./components/popup-message/popup-message.js";
import { ERR_PASSWORD_PATTERN, ERR_PASSWORD_MISMATCH, ERR_ENTER_PASSWORD } from "./resources.js";
import ApiClient from "./api.js";
import { checkAccess } from "./restrict.js";

checkAccess();

const client = new ApiClient();
const addFundsWidget = document.getElementsByTagName("x-wallet-pay")[0];
const currentPasswordInput = document.querySelector('x-claim-input[inputId="current-password"]');
const newPasswordInput = document.querySelector('x-claim-input[inputId="new-password"]');
const newPasswordRepeatInput = document.querySelector('x-claim-input[inputId="repeat-new-password"]');
const saveChangesBtn = document.getElementById("btn-save-changes");
const walletBalanceSpan = document.getElementById("wallet-balance");
const ordersList = document.getElementById("orders-list");
const progressIndicator = document.getElementById("progress-indicator");
let isAddFundsVisible = false;

progressIndicator.show();
addFundsWidget.hide();

currentPasswordInput.addEventListener("blur", validateCurrentPassword);
newPasswordInput.addEventListener("blur", validatePassword);
newPasswordRepeatInput.addEventListener("blur", validateRepeatPassword);

saveChangesBtn.addEventListener("click", () => {
    let valid = validateCurrentPassword();
    valid = validatePassword() && valid;
    valid = validateRepeatPassword() && valid;

    if (!valid) {
        return;
    }

    const data = {
        currentPassword: currentPasswordInput.value,
        newPassword: newPasswordInput.value
    };

    client.post('user/change-password', data, true)
        .then(response => {
            if (response.ok) {
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                newPasswordRepeatInput.value = '';

                currentPasswordInput.valid();
                newPasswordInput.valid();
                newPasswordRepeatInput.valid();
                PopupMessage.instance.showPopup("Hasło zostało zmienione pomyślnie.", "success");
            } else {
                response.json().then(json => {
                    PopupMessage.instance.showPopup("Podane obecne hasło jest niepoprawne.", "error");
                });
            }
        })
        .catch(error => {
            PopupMessage.instance.showPopup("Wystąpił błąd, spróbuj ponownie później.", "error");
        });
});

client.fetchUserInfo().then(userInfo => {
    walletBalanceSpan.innerText = parseFloat(userInfo.balance).toFixed(2) + " zł";
});

document.getElementById("btn-add-funds").addEventListener("click", () => {
    if (!isAddFundsVisible) {
        addFundsWidget.show();
    } else {
        addFundsWidget.hide();
    }

    isAddFundsVisible = !isAddFundsVisible;
});

function validateCurrentPassword() {
    if (currentPasswordInput.value.trim() === '') {
        currentPasswordInput.invalid(ERR_ENTER_PASSWORD);
        return false;
    } else {
        currentPasswordInput.valid();
        return true;
    }
}

function validatePassword() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(newPasswordInput.value)) {
        newPasswordInput.invalid(ERR_PASSWORD_PATTERN);
        return false;
    } else {
        newPasswordInput.valid();
        return true;
    }
}

function validateRepeatPassword() {
    if (newPasswordRepeatInput.value.trim() === '' || newPasswordInput.value !== newPasswordRepeatInput.value) {
        newPasswordRepeatInput.invalid(ERR_PASSWORD_MISMATCH);
        return false;
    } else {
        newPasswordRepeatInput.valid();
        return true;
    }
}

function loadOrders() {
    client.post('order/getall', null, true)
        .then(response => response.json())
        .then(orders => {
            document.getElementById("progress-indicator-container").style.display = "none";
            ordersList.innerHTML = '';
            orders.sort((a, b) => new Date(b.placeDate) - new Date(a.placeDate));

            orders.forEach(order => {
                const orderItem = document.createElement("div");
                orderItem.classList.add("order-item");

                const orderNumber = document.createElement("span");
                orderNumber.textContent = `Zamówienie #${order.id}`;

                const orderPrice = document.createElement("span");
                orderPrice.textContent = `${parseFloat(order.totalPrice).toFixed(2).replace('.', ',')} zł`;

                const orderDate = document.createElement("span");
                orderDate.textContent = new Date(order.placeDate).toLocaleString();

                const detailsButton = document.createElement("x-button");

                detailsButton.setAttribute("buttonStyle", "ghost");

                if (order.status === "WaitingForAccept") {
                    detailsButton.setAttribute("label", "Oczekuje na akceptację");
                } else if (order.status === "InProgress") {
                    detailsButton.setAttribute("label", "W trakcie");
                } else {
                    detailsButton.setAttribute("label", "Zakończone");
                }

                detailsButton.addEventListener("click", () => {
                    window.location.href = `/pages/status.html?id=${order.id}`;
                });

                const dateAndButtonContainer = document.createElement("div");
                dateAndButtonContainer.appendChild(orderDate);
                dateAndButtonContainer.appendChild(detailsButton);

                orderItem.appendChild(orderNumber);
                orderItem.appendChild(orderPrice);
                orderItem.appendChild(dateAndButtonContainer);

                ordersList.appendChild(orderItem);
            });
        });
}

loadOrders();