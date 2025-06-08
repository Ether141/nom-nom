import RestaurantCard from './components/restaurant-card/restaurant-card.js';
import Dropdown from './components/dropdown/dropdown.js';
import ApiClient, { API_URL } from './api.js';

const client = new ApiClient();
const restaurantsList = document.getElementById('restaurants-list');
const searchBar = document.getElementById('search-bar');
const sortDropdown = document.getElementById('sort-dropdown');
const progressIndicator = document.getElementById('progress-indicator');
const progressIndicatorContainer = document.getElementById('progress-indicator-container');
const addressInput = document.querySelector('x-address-input');
const notFoundContainer = document.getElementById('not-found-container');

const urlParams = new URLSearchParams(window.location.search);
const address = urlParams.get('address') || '';

addressInput.value = address;

function hideProgressIndicator() {
    progressIndicator.hide();
    progressIndicatorContainer.style.display = 'none';
}

function showProgressIndicator() {
    progressIndicatorContainer.style.display = 'block';
    progressIndicator.show();
}

showProgressIndicator();

function createRestaurantCards(json) {
    while (restaurantsList.firstChild) {
        restaurantsList.removeChild(restaurantsList.firstChild);
    }

    showProgressIndicator();

    json.forEach(restaurant => {
        const restaurantCard = document.createElement('x-restaurant-card');
        restaurantCard.style.display = 'none';
        restaurantCard.setAttribute('restaurant-id', restaurant.id);
        restaurantCard.setAttribute('restaurant-name', restaurant.name);
        restaurantCard.setAttribute('restaurant-image', API_URL + 'restaurant/banner/' + restaurant.id);
        restaurantCard.setAttribute('tags', restaurant.tags);
        restaurantCard.setAttribute('rating', restaurant.opinion);
        restaurantCard.setAttribute('rating-number', restaurant.opinionNumber);
        restaurantCard.setAttribute('waiting-time', restaurant.deliveryTime);
        restaurantCard.setAttribute('delivery-price', restaurant.deliveryPrice == 0 ? "Darmowa" : restaurant.deliveryPrice + ' zł');
        restaurantCard.setAttribute('min-price', restaurant.minimalPriceForDelivery);
        restaurantsList.appendChild(restaurantCard);
    });

    hideProgressIndicator();

    if (json.length === 0) {
        notFoundContainer.style.display = 'flex';
    } else {
        notFoundContainer.style.display = 'none';
    }

    document.querySelectorAll('x-restaurant-card').forEach(card => {
        card.style.display = 'block';
    });
}

function getRestaurants() {
    const sortValue = sortDropdown.value;
    const phrase = searchBar.value.toLowerCase().trim();
    const sortParam = sortValue ? `&sort=${sortValue}` : '';

    client.get(`restaurant/all?address=${address}&phrase=${phrase}${sortParam}`).then(response => {
        if (response.ok) {
            response.json().then(data => {
                createRestaurantCards(data);
            });
        }
    });
}

getRestaurants();

let filtered = false;

function updateResults() {
    const searchTerm = searchBar.value.toLowerCase();

    if (searchTerm.length < 3) {
        if (filtered) {
            filtered = false;
            getRestaurants();
        }

        return;
    }

    getRestaurants();
    filtered = true;
}

let timer;

searchBar.addEventListener('input', function() {
    clearTimeout(timer);
    timer = setTimeout(updateResults, 2000);
});

searchBar.addEventListener('blur', function() {
    clearTimeout(timer);
    updateResults();
});

searchBar.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        clearTimeout(timer);
        updateResults();
    }
});

sortDropdown.addEventListener('change', function() {
    getRestaurants();
});