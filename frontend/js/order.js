import ApiClient, { API_URL } from "./api.js";
import AddressManager from "./components/address-manager/address-manager.js";
import PopupMessage from './components/popup-message/popup-message.js';
import { checkAccess } from "./restrict.js";

checkAccess();

const apiClient = new ApiClient();

function loadProducts() {
    const bagItems = JSON.parse(localStorage.getItem('bagItems'));
    localStorage.removeItem('bagItems');
    
    const items = bagItems.map(item => {
        return {
            id: parseInt(item.id),
            name: item.name,
            price: parseFloat(item.price)
        };
    });

    return items;
}

function getRestaurantId() {
    const restaurantId = localStorage.getItem('restaurantId');
    localStorage.removeItem('restaurantId');
    return restaurantId;
}

function getDeliveryPrice() {
    const deliveryPrice = localStorage.getItem('deliveryPrice');
    localStorage.removeItem('deliveryPrice');
    return deliveryPrice ? parseFloat(deliveryPrice) : 0;
}

async function fetchRestaurantDetails(restaurantId) {
    const response = await apiClient.get(`restaurant/get/${restaurantId}`);
    return await response.json();
}

function updateRestaurantUI(data) {
    document.getElementById("banner").setAttribute("src", API_URL + 'restaurant/banner/' + data.id);
    document.getElementById("restaurant-title").textContent = data.name;

    const detailsRow = document.querySelector("#restaurant .details-row");
    detailsRow.querySelector(".poppins-medium").textContent = data.opinion;
    detailsRow.querySelector(".poppins-light").textContent = `(${data.opinionNumber})`;
    detailsRow.querySelector(".poppins-regular").textContent = data.tags;
}

function setRestaurantDetails(restaurantId) {
    fetchRestaurantDetails(restaurantId)
    .then(data => {
        updateRestaurantUI(data);
    });
}

const restaurantId = getRestaurantId();
const deliveryPrice = getDeliveryPrice();

setRestaurantDetails(restaurantId);

const summaryList = document.querySelector("#summary > .list");
const products = loadProducts();

function addProductToSummary(product, container) {
    const listItem = document.createElement("div");
    listItem.classList.add("order-product");
    listItem.innerHTML = `<span>${product.name}</span><span>${Number(product.price).toFixed(2).replace('.', ',')} zł</span>`;
    container.appendChild(listItem);

    const separator = document.createElement("div");
    separator.classList.add("order-product-separator");
    container.appendChild(separator);
}

products.forEach(product => {
    addProductToSummary(product, summaryList);
});

addProductToSummary({ name: "Koszt dostawy", price: deliveryPrice }, summaryList);

let totalPrice = products.reduce((sum, product) => sum + Number(product.price), 0) + deliveryPrice;
const totalSpan = document.querySelector(".order-total span:nth-child(2)");
totalSpan.textContent = `${totalPrice.toFixed(2).replace('.', ',')} zł`;

let balance = 0;
const walletBalanceSpan = document.getElementById("wallet-balance");
const client = new ApiClient();

client.fetchUserInfo().then(userInfo => {
    if (userInfo) {
        balance = userInfo.balance;
        walletBalanceSpan.textContent = parseFloat(balance).toFixed(2) + " zł"
    }
});

function placeOrder() {
    const data = {
        restaurantId: restaurantId,
        products: products.map(product => product.id),
        comment: document.getElementById("comment").value
    }

    apiClient.post(`order/place`, data, true)
        .then(response => {
            if (response.ok) {
                response.json().then(data => {
                    window.location.href = `/pages/status.html?id=${data.id}`;
                });
            } else {
                PopupMessage.instance.showPopup('Wystąpił błąd podczas składania zamówienia.', 'error');
            }
        })
        .catch(error => {
            console.error('Error placing order:', error);
            PopupMessage.instance.showPopup('Wystąpił błąd podczas składania zamówienia.', 'error');
        });
}

const orderButton = document.getElementById("order-button");
const addressManager = document.getElementsByTagName("x-address-manager")[0];

orderButton.addEventListener("click", () => {
    const selectedAddress = addressManager.getSelectedAddress();

    if (!selectedAddress) {
        PopupMessage.instance.showPopup('Wybierz adres dostawy.', 'error');
        return;
    }

    if (totalPrice > balance) {
        PopupMessage.instance.showPopup('Nie masz wystarczającej ilości środków w portfelu.', 'error');
        return;
    }

    placeOrder();
});