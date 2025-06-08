import ProductCard from "./components/product-card/product-card.js";
import ApiClient, { API_URL } from "./api.js";

const client = new ApiClient();

const categoriesSlider = document.querySelector("#categories-slider > div");
const productsContainer = document.getElementById("products");
const productsContainers = [];
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('restaurantId');
const createdCategories = [];
let buttons = [];

if (!client.isLoggedIn()) {
    document.getElementById("bag").style.display = "none";

    const mainContent = document.getElementById("main-content");
    mainContent.style.gridTemplateColumns = "1fr";
    mainContent.style.width = mainContent.style.maxWidth = "800px";
}

client.get(`restaurant/get/${restaurantId}`).then(response => {
    response.json().then((data) => {
        setRestaurantDetails(data);
    });
});

client.get(`product/all/${restaurantId}`).then((response) => {
    if (response.ok) {
        response.json().then((data) => {
            data.forEach(product => {
                createProductCard(product);
            });

            getCategoryButtons();
            setupScroll();
        });
    }
});

function setRestaurantDetails(json) {
    document.getElementById("banner").setAttribute("src", API_URL + 'restaurant/banner/' + json.id);
    document.getElementById('restaurant-title').innerText = json.name;
    document.getElementById('restaurant-address').innerText = json.address;
    document.getElementById('rating').innerText = json.opinion;
    document.getElementById('rating-number').innerText = `(${json.opinionNumber})`;
    document.getElementById('tags').innerText = json.tags;
    document.getElementById('delivery-time').innerText = json.deliveryTime + ' min';
    document.getElementById('delivery-price').innerText = json.deliveryPrice == 0 ? "Darmowa" : json.deliveryPrice + ' zł';
    document.getElementById('min-price').innerText = json.minimalPriceForDelivery + ' zł';
}

function createProductCard(json) {
    const categoryName = json.category;

    if (!createdCategories.includes(categoryName)) {
        const btn = document.createElement('div');
        btn.classList.add('category-btn');

        if (createdCategories.length === 0) {
            btn.classList.add('category-selected');
        }

        btn.innerText = categoryName;
        btn.setAttribute('data-target', `category-${createdCategories.length}`);
        categoriesSlider.appendChild(btn);

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        categoryContainer.setAttribute('id', `category-${createdCategories.length}`);
        const categorySpan = document.createElement('span');
        categorySpan.innerText = categoryName;
        categoryContainer.appendChild(categorySpan);
        
        productsContainer.appendChild(categoryContainer);
        productsContainers.push(categoryContainer);

        createdCategories.push(categoryName);
    }

    const productCard = document.createElement('x-product-card');
    productCard.setAttribute('product-id', json.id);
    productCard.setAttribute('product-name', json.name);
    productCard.setAttribute('product-price', Number(json.price).toFixed(2) + ' zł');
    productCard.setAttribute('product-details', json.description);

    const categoryIndex = createdCategories.indexOf(categoryName);
    productsContainers[categoryIndex].appendChild(productCard);
}

function getCategoryButtons() {
    buttons = document.querySelectorAll(".category-btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - document.getElementById("categories-slider").offsetHeight, // Odejmujemy wysokość slidera
                    behavior: "smooth"
                });
            }
        });
    });
}

function setupScroll() {
    document.addEventListener("DOMContentLoaded", () => {
        const picker = document.getElementById("picker");
    
        picker.addEventListener("valuechanged", () => {
            console.log(picker.getValue());
        });
    });
    
    const scrollContainer = document.getElementById("categories-slider")
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });
    
    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
    });
    
    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
    });
    
    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX);
        scrollContainer.scrollLeft = scrollLeft - walk;
    });

    const el = document.querySelector("#categories-slider");
    const observer = new IntersectionObserver( 
        ([e]) => e.target.classList.toggle("scrolled", e.intersectionRatio < 1),
        { threshold: [1] }
    );

    observer.observe(el);

    window.addEventListener("scroll", () => {
        updateActiveCategory();
    });
}

function updateActiveCategory() {
    let currentCategory = "";
    const scrollPosition = window.scrollY;
    const categories = document.querySelectorAll(".category-container");

    categories.forEach(category => {
        if (scrollPosition >= category.offsetTop - document.getElementById("categories-slider").offsetHeight - 10) {
            currentCategory = category.id;
        }
    });
    
    if (currentCategory === "") {
        currentCategory = categories[0].id;
    }

    buttons.forEach(button => {
        if (button.getAttribute("data-target") === currentCategory) {
            button.classList.add("category-selected");
        } else {
            button.classList.remove("category-selected");
        }
    });
}