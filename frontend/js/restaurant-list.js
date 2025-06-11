import ApiClient, { API_URL } from './api.js';
import { checkAccess } from "./restrict.js";

checkAccess("admin");

const client = new ApiClient();

document.querySelector('x-progress-indicator').show();

const restaurantsListContainer = document.getElementById("restaurants-list");

client.post('/management/all', {}, true)
    .then(response => response.json())
    .then(data => {
        data.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach(restaurant => {
            const restaurantDiv = document.createElement("div");
            restaurantDiv.classList.add("restaurant-item");

            const img = document.createElement("img");
            img.src = `${API_URL}restaurant/banner/${restaurant.id}`;

            const detailsDiv = document.createElement("div");

            const spanName = document.createElement("span");
            spanName.textContent = restaurant.name;

            const spanAddress = document.createElement("span");
            spanAddress.textContent = restaurant.address;

            detailsDiv.appendChild(spanName);
            detailsDiv.appendChild(spanAddress);

            restaurantDiv.appendChild(img);
            restaurantDiv.appendChild(detailsDiv);

            restaurantsListContainer.appendChild(restaurantDiv);

            restaurantDiv.addEventListener("click", () => {
                window.location.href = `/pages/restaurant-edit.html?id=${restaurant.id}`;
            });
        })
    })
    .then(() => {
        document.getElementById("progress-indicator-container").style.display = "none";
        document.getElementById("restaurants-list").style.display = "flex"; 
    })
    .catch(error => console.error("Error fetching restaurants:", error));

document.getElementById("add-restaurant-button").addEventListener("click", () => {
    window.location.href = "/pages/restaurant-edit.html";
});