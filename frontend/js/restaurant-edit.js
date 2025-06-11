import ApiClient, { API_URL } from './api.js';
import PopupMessage from './components/popup-message/popup-message.js'
import { checkAccess } from "./restrict.js";

checkAccess("admin");

const client = new ApiClient();

document.querySelector('x-progress-indicator').show();

const bannerImg = document.getElementById("banner-image");
const bannerText = document.getElementById("banner-text");
const menuContainer = document.getElementById("menu-container");
const btnAddSection = document.getElementById("btn-add-section");

btnAddSection.addEventListener("click", () => {
    const section = document.createElement("x-restaurant-menu-section");

    section.addEventListener("removeSection", () => {
        section.remove();
    });

    menuContainer.appendChild(section);
});

const restaurantId = new URLSearchParams(window.location.search).get('id');
const creating = !restaurantId || restaurantId === '0';

if (!creating) {
    fetchRestaurantDetails(restaurantId);
} else {
    showForm();
    document.getElementById("delete-restaurant-container").style.display = "none";
}

document.getElementById("btn-save-changes").addEventListener("click", updateRestaurant);

if (!creating) {
    document.getElementById("btn-delete-restaurant").addEventListener("click", deleteRestaurant);
}

function navigate() {
    if (creating) {
        window.location.href = "/pages/restaurant-list.html";
    } else {
        window.location.reload();
        window.scrollTo(0, 0);
    }
}

function gatherRestaurantUpdateData() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const id = idParam ? parseInt(idParam) : 0;

    const nameInput = document.querySelector('x-claim-input[inputId="name"]');
    const addressInput = document.querySelector('x-claim-input[inputId="address"]');
    const tagsInput = document.querySelector('x-claim-input[inputId="tags"]');
    const deliveryTimeInput = document.querySelector('x-claim-input[inputId="delivery-time"]');
    const deliveryPriceInput = document.querySelector('x-claim-input[inputId="delivery-price"]');
    const minPriceInput = document.querySelector('x-claim-input[inputId="min-price"]');

    const restaurantData = {
        id: id,
        name: nameInput ? nameInput.value : "",
        address: addressInput ? addressInput.value : "",
        tags: tagsInput ? tagsInput.value : "",
        deliveryTime: deliveryTimeInput ? deliveryTimeInput.value : "",
        deliveryPrice: deliveryPriceInput ? parseFloat(deliveryPriceInput.value) : 0,
        minimalPriceForDelivery: minPriceInput ? parseFloat(minPriceInput.value) : 0,
        productUpdates: []
    };

    // Dla każdego elementu sekcji menu zbieramy produkty
    const menuSections = document.querySelectorAll("x-restaurant-menu-section");
    menuSections.forEach(section => {
        // Metoda getSectionData zwraca { category, dishes: [{ name, description, price }] }
        const sectionData = section.getSectionData();
        sectionData.dishes.forEach(dish => {
            restaurantData.productUpdates.push({
                id: dish.id || 0,
                name: dish.name,
                description: dish.description || "",
                category: sectionData.category,
                price: parseFloat(dish.price) || 0
            });
        });
    });

    return restaurantData;
}

function uploadBanner(restaurantId) {
    const bannerInputElement = document.querySelector('x-claim-input[inputId="banner"]');
    let fileInput = bannerInputElement;

    if (bannerInputElement.shadowRoot) {
        fileInput = bannerInputElement.shadowRoot.querySelector('input[type="file"]');
    }

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const bannerFile = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", bannerFile);

        client.postFormData(`management/banner/${restaurantId}`, formData, true)
            .then(resp => {
                if (resp.ok) {
                    setTimeout(() => {
                        navigate();
                    }, 2000);

                    PopupMessage.instance.showPopup("Banner został wysłany poprawnie.", "success");
                } else {
                    PopupMessage.instance.showPopup("Błąd podczas wysyłania banneru.", "error");
                    showForm();
                }
            })
            .catch(() => {
                PopupMessage.instance.showPopup("Wystąpił błąd podczas wysyłania banneru.", "error");
                showForm();
            });
    } else {
        navigate();
    }
}

function updateRestaurant() {
    const data = gatherRestaurantUpdateData();
    hideForm();

    client.post('/management/update', data, true)
        .then(response => {
            if (response.ok) {
                PopupMessage.instance.showPopup("Dane restauracji zostały zaktualizowane.", "success");
                response.json().then(data => {
                    uploadBanner(data.id);
                });
            } else {
                PopupMessage.instance.showPopup("Aktualizacja restauracji nie powiodła się.", "error");
                showForm();
            }
        })
        .catch(() => {
            PopupMessage.instance.showPopup("Wystąpił błąd podczas aktualizacji restauracji.", "error");
            showForm();
        });
}

function showForm() {
    document.querySelectorAll('#main-content > div').forEach(div => {
        if (div.id !== 'progress-indicator-container') {
            div.style.display = 'flex';
        } else {
            div.style.display = 'none';
        }
    });
}

function hideForm() {
    document.querySelectorAll('#main-content > div').forEach(div => {
        if (div.id !== 'progress-indicator-container') {
            div.style.display = 'none';
        } else {
            div.style.display = 'flex';
        }
    });
}

function fetchRestaurantDetails(id) {
    client.post(`management/details/${id}`, null, true)
        .then(response => response.json())
        .then(data => {
            const restaurant = data.restaurant;

            // Uzupełnienie pól formularza podstawowych informacji:
            const nameInput = document.querySelector('x-claim-input[inputId="name"]');
            const addressInput = document.querySelector('x-claim-input[inputId="address"]');
            const tagsInput = document.querySelector('x-claim-input[inputId="tags"]');
            const deliveryTimeInput = document.querySelector('x-claim-input[inputId="delivery-time"]');
            const deliveryPriceInput = document.querySelector('x-claim-input[inputId="delivery-price"]');
            const minPriceInput = document.querySelector('x-claim-input[inputId="min-price"]');

            if (nameInput) nameInput.value = restaurant.name;
            if (addressInput) addressInput.value = restaurant.address;
            if (tagsInput) tagsInput.value = restaurant.tags;
            if (deliveryTimeInput) deliveryTimeInput.value = restaurant.deliveryTime;
            if (deliveryPriceInput) deliveryPriceInput.value = restaurant.deliveryPrice;
            if (minPriceInput) minPriceInput.value = restaurant.minimalPriceForDelivery;

            bannerImg.src = restaurant.bannerImage || API_URL + 'restaurant/banner/' + restaurant.id;
            bannerText.textContent = restaurant.name;

            // Uzupełnienie sekcji menu – grupujemy produkty po kategorii:
            const menuContainer = document.getElementById("menu-container");
            menuContainer.innerHTML = "";
            const grouped = {};
            data.products.forEach(product => {
                if (!grouped[product.category]) {
                    grouped[product.category] = [];
                }
                grouped[product.category].push(product);
            });

            // Dla każdej kategorii tworzymy sekcję menu:
            Object.keys(grouped).forEach(category => {
                const section = document.createElement("x-restaurant-menu-section");
                // Ustawiamy kategorię po krótkim czasie, aż element zostanie w pełni zainicjowany
                setTimeout(() => {
                    const menuTypeInput = section.shadowRoot.querySelector('x-claim-input[inputId="menu-type"]');
                    if (menuTypeInput) {
                        menuTypeInput.value = category;
                    }
                    // Dla każdego produktu z tej kategorii dodajemy "danie"
                    grouped[category].forEach(product => {
                        section.addDish(product.id || 0);
                        // Pobieramy ostatni dodany element "dish-item"
                        const dishItems = section.shadowRoot.querySelectorAll(".dish-item");
                        const lastDish = dishItems[dishItems.length - 1];
                        if (lastDish) {
                            const dishNameInput = lastDish.querySelector('x-claim-input[inputId="dish-name"]');
                            const dishPriceInput = lastDish.querySelector('x-claim-input[inputId="dish-price"]');
                            const dishDescriptionInput = lastDish.querySelector('x-claim-input[inputId="dish-description"]');
                            if (dishNameInput) dishNameInput.value = product.name;
                            if (dishPriceInput) dishPriceInput.value = product.price;
                            if (dishDescriptionInput) dishDescriptionInput.value = product.description;
                        }
                    });
                }, 0);

                section.addEventListener("removeSection", () => {
                    section.remove();
                });
                menuContainer.appendChild(section);
            });

            showForm();
        })
        .catch(error => {
            console.error("Error fetching restaurant details:", error);
            PopupMessage.instance.showPopup("Nie udało się pobrać szczegółów restauracji.", "error");
        });
}

function deleteRestaurant() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const id = idParam ? parseInt(idParam) : 0;

    if (confirm("Czy na pewno chcesz usunąć tę restaurację?")) {
        hideForm();

        client.delete(`/management/${id}`, true)
            .then(response => {
                if (response.ok) {
                    PopupMessage.instance.showPopup("Restauracja została usunięta.", "success");
                    setTimeout(() => {
                        window.location.href = "/pages/restaurant-list.html";
                    }, 2000);
                } else {
                    PopupMessage.instance.showPopup("Nie udało się usunąć restauracji.", "error");
                    showForm();
                }
            })
            .catch(() => {
                PopupMessage.instance.showPopup("Wystąpił błąd podczas usuwania restauracji.", "error");
                showForm();
            });
    }
}