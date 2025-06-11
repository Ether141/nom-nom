export default class RestaurantMenuSection extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.cssFile = '/js/components/restaurant-menu-section/restaurant-menu-section.css';
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="menu-section-container">
                <div class="section-header">
                    <div>
                        <x-claim-input inputId="menu-type" type="text" label="Kategoria" iconSrc="../images/icons/menu.png"></x-claim-input>
                    </div>
                    <div>
                        <x-button id="btn-remove-section" buttonStyle="ghost" label="Usuń"></x-button>
                    </div>
                    <div>
                        <x-button id="btn-toggle-section" buttonStyle="ghost" label="-"></x-button>
                    </div>
                </div>
                <div class="dishes-list" style="display: none;">
                    <x-button id="btn-add-dish" label="Dodaj danie"></x-button>
                </div>
            </div>
        `;

        this.dishesList = this.shadowRoot.querySelector(".dishes-list");
        this.btnAddDish = this.shadowRoot.getElementById("btn-add-dish");
        this.btnRemoveSection = this.shadowRoot.getElementById("btn-remove-section");
        this.btnToggleSection = this.shadowRoot.getElementById("btn-toggle-section");

        this.btnAddDish.addEventListener("click", () => {
            this.addDish(0);
        });
        
        this.btnRemoveSection.addEventListener("click", () => this.removeSection());
        this.btnToggleSection.addEventListener("click", () => this.toggleSection());
    }

    addDish(dishId) {
        const dishContainer = document.createElement("div");
        dishContainer.classList.add("dish-item");
        dishContainer.setAttribute("data-id", dishId);
        dishContainer.innerHTML = `
            <x-claim-input inputId="dish-name" type="text" label="Nazwa dania"></x-claim-input>
            <x-claim-input inputId="dish-price" type="text" label="Cena"></x-claim-input>
            <x-button class="btn-remove-dish" buttonStyle="ghost" label="Usuń"></x-button>
            <x-claim-input inputId="dish-description" type="text" label="Opis"></x-claim-input>
        `;

        dishContainer.querySelector(".btn-remove-dish").addEventListener("click", () => {
            dishContainer.remove();
        });

        this.dishesList.appendChild(dishContainer);
    }

    removeSection() {
        this.dispatchEvent(new CustomEvent('removeSection', { detail: this, bubbles: true }));
    }
    
    toggleSection() {
        if (this.dishesList.style.display === "none") {
            this.dishesList.style.display = "";
        } else {
            this.dishesList.style.display = "none";
        }
    }

    getSectionData() {
        const menuTypeInput = this.shadowRoot.querySelector('x-claim-input[inputId="menu-type"]');
        const category = menuTypeInput ? menuTypeInput.value : "";
        const dishItems = [];

        this.dishesList.querySelectorAll(".dish-item").forEach(dish => {
            const dishId = dish.getAttribute("data-id");
            const dishNameInput = dish.querySelector('x-claim-input[inputId="dish-name"]');
            const dishPriceInput = dish.querySelector('x-claim-input[inputId="dish-price"]');
            const dishDescriptionInput = dish.querySelector('x-claim-input[inputId="dish-description"]');
            dishItems.push({
                id: dishId,
                name: dishNameInput ? dishNameInput.value : "",
                description: dishDescriptionInput ? dishDescriptionInput.value : "",
                price: dishPriceInput ? dishPriceInput.value : ""
            });
        });
        return { category: category, dishes: dishItems };
    }
}

customElements.define('x-restaurant-menu-section', RestaurantMenuSection);