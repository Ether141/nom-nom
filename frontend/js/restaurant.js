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

// Pobieramy elementy
const buttons = document.querySelectorAll(".category-btn");
const categories = document.querySelectorAll(".category-container");

// Funkcja przewijania do kategorii
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

// Funkcja aktualizowania aktywnej kategorii w sliderze
function updateActiveCategory() {
    let currentCategory = "";
    const scrollPosition = window.scrollY;

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

const el = document.querySelector("#categories-slider");
const observer = new IntersectionObserver( 
    ([e]) => e.target.classList.toggle("scrolled", e.intersectionRatio < 1),
    { threshold: [1] }
);

observer.observe(el);

window.addEventListener("scroll", () => {
    updateActiveCategory();
});