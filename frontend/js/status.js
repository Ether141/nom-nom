import ApiClient, { API_URL } from './api.js';
import { checkAccess } from "./restrict.js";

checkAccess();

const orderId = new URLSearchParams(window.location.search).get('id');
const apiClient = new ApiClient();

async function fetchOrderDetails(orderId) {
    const response = await apiClient.post(`order/get/${orderId}`, null, true);
    return await response.json();
}

const timerElement = document.getElementById("timer");
const inPrepElement = document.getElementById("status-in-prep");
const doneElement = document.getElementById("status-done");

const timerMinutes = document.getElementById("timer-minutes");

const statusText = document.getElementById("status-text");
const statusAdditional = document.getElementById("status-additional");

const orderNumSpan = document.getElementById("order-num");
const orderTimeSpan = document.getElementById("order-time");
const orderPriceSpan = document.getElementById("order-price");

function updateRestaurantUI(restaurantId) {
    const restaurntTitle = document.querySelector("#restaurant-title");
    const restaurantBanner = document.querySelector("#banner");

    apiClient.get(`restaurant/get/${restaurantId}`)
        .then(response => response.json())
        .then(data => {
            restaurntTitle.textContent = data.name;
            restaurantBanner.setAttribute("src", API_URL + 'restaurant/banner/' + data.id);
        })
        .catch(error => {
            console.error("Error fetching restaurant details:", error);
        });
}

function updateOrderUI() {
    fetchOrderDetails(orderId).then(data => {
        updateRestaurantUI(data.restaurantId);

        orderNumSpan.textContent = data.id;
        orderTimeSpan.textContent = new Date(data.placeDate).toLocaleTimeString();
        orderPriceSpan.textContent = `${data.totalPrice.toFixed(2).replace('.', ',')} zł`;

        switch (data.status) {
            case "WaitingForAccept":
                statusText.textContent = "Oczekiwanie na akceptację zamówienia";
                statusAdditional.textContent = "Prosimy czekać na potwierdzenie.";
                timerElement.style.display = "none";
                inPrepElement.style.display = "flex";
                doneElement.style.display = "none";
                break;
            case "InProgress":
                statusText.textContent = "Zamówienie jest w przygotowaniu";
                statusAdditional.textContent = "Prosimy o cierpliwość, zaraz będzie gotowe.";
                timerElement.style.display = "flex";
                inPrepElement.style.display = "none";
                doneElement.style.display = "none";

                const placeDate = new Date(data.placeDate);
                const orderReadyTime = new Date(placeDate.getTime() + data.deliveryTime * 60000);

                const now = new Date();
                let remainingMinutes = Math.ceil((orderReadyTime - now) / 60000);

                if (remainingMinutes <= 0) {
                    remainingMinutes = 0;
                }

                timerMinutes.textContent = remainingMinutes;

                break;
            case "Done":
                statusText.textContent = "Zamówienie zrealizowane";
                statusAdditional.textContent = "Twoje zamówienie zostało dostarczone. Smacznego!";
                timerElement.style.display = "none";
                inPrepElement.style.display = "none";
                doneElement.style.display = "flex";
                break;
        }
    });
}

updateOrderUI();
setInterval(updateOrderUI, 1000);