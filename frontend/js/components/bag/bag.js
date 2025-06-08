import ApiClient from "../../api.js";
import PopupMessage from '../popup-message/popup-message.js';

class Bag extends HTMLElement {
    #deliveryPrice = 0;
    #minPrice = 0;
    #navbar;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cssFile = "/js/components/bag/bag.css";

        this.bagItems = [ ];

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div id="bag">
                <span>Twój koszyk</span>
                <div id="bag-items-container"></div>
                
                <div id="bag-summary-details">
                    <div>
                        <span>Cena zamówienia:</span>
                        <span id="order-price">0,00 zł</span>
                    </div>
                    <div>
                        <span>Koszt dostawy:</span>
                        <span>0,00 zł</span>
                    </div>
                </div>
                
                <div id="bag-summary">
                    <x-button label="Zamów"></x-button>
                    <div>
                        <span id="bag-summary-label">Razem: </span>
                        <span id="bag-summary-price">0,00 zł</span>
                    </div>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this.#navbar = document.querySelector('x-navbar');

        this.getBag();
        this.renderBagItems();
        this.updateTotal();

        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item-btn')) {
                const itemId = e.target.closest('.bag-item').getAttribute('data-id');
                this.removeBagItem(itemId);
            }
            
            if (e.target.tagName.toLowerCase() === 'x-button') {
                this.placeOrder();
            }
        });
    }

    renderBagItems() {
        const container = this.shadowRoot.querySelector('#bag-items-container');
        container.innerHTML = this.bagItems.map(item => {
            return `
                <div class="bag-item" data-id="${item.dataId}">
                    <div>
                        <span class="bag-item-name">${item.name}</span>
                        <span class="bag-item-price">${this.formatPrice(item.price)}</span>
                    </div>
                    <button class="delete-item-btn">X</button>
                </div>
            `;
        }).join('');

        this.#navbar.setBagCount(this.bagItems.length);
    }

    async getBag() {
        const apiClient = new ApiClient();

        if (!apiClient.isLoggedIn()) {
            return;
        }
        
        const params = new URLSearchParams(window.location.search);
        const restaurantId = params.get('restaurantId');

        if (!restaurantId) {
            return;
        }
        
        apiClient.get(`restaurant/get/${restaurantId}`).then(response => {
            response.json().then((data) => {
                this.#deliveryPrice = data.deliveryPrice;
                this.#minPrice = data.minimalPriceForDelivery;
                this.shadowRoot.querySelector('#bag-summary-details > div:nth-child(2) > span:nth-child(2)').textContent = this.formatPrice(this.#deliveryPrice);
            });
        });

        try {
            const response = await apiClient.post(`bag/${restaurantId}`, null, true);

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            data.products.forEach(product => {
                this.addBagItem({ id: product.id, name: product.name, price: product.price }, false);
            });
          
            this.renderBagItems();
            this.updateTotal();
        } catch (error) { }
    }

    async updateBag() {
        const apiClient = new ApiClient();

        if (!apiClient.isLoggedIn()) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const restaurantId = params.get('restaurantId');

        if (!restaurantId) {
            return;
        }

        try {
            await apiClient.post(`bag/update/${restaurantId}`, { productIds: this.bagItems.map(item => Number(item.id)) }, true);
        } catch (error) { }
    }

    updateTotal() {
        let total = 0;
        this.bagItems.forEach(item => {
            total += item.price;
        });

        total += this.#deliveryPrice;
        this.shadowRoot.querySelector('#bag-summary-price').textContent = this.formatPrice(total);
        this.shadowRoot.querySelector('#order-price').textContent = this.formatPrice(total);
    }

    parsePrice(priceText) {
        // Convert "44,00 zł" to float 44.00.
        const numberText = priceText.replace('zł', '').trim().replace(',', '.');
        return parseFloat(numberText);
    }

    formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + ' zł';
    }

    updateIds() {
        for (let i = 0; i < this.bagItems.length; i++) {
            this.bagItems[i].dataId = String(i);
        }
    }

    addBagItem(item, update = true) {
        // { id, name, price }.
        this.bagItems.push(item);
        this.updateIds();
        this.renderBagItems();
        this.updateTotal();

        if (update) {
            this.updateBag();
        }
    }

    removeBagItem(itemId) {
        this.bagItems = this.bagItems.filter(item => item.dataId !== itemId);
        this.updateIds();
        this.renderBagItems();
        this.updateTotal();
        this.updateBag();
    }

    placeOrder() {
        if (this.bagItems.length === 0) {
            PopupMessage.instance.showPopup('Koszyk jest pusty.', 'error');
            return;
        }
        
        if (this.bagItems.reduce((sum, item) => sum + item.price, 0) + this.#deliveryPrice < this.#minPrice) {
            PopupMessage.instance.showPopup(`Minimalna kwota zamówienia wynosi ${this.formatPrice(this.#minPrice)}.`, 'error');
            return;
        }

        localStorage.setItem('restaurantId', new URLSearchParams(window.location.search).get('restaurantId'));
        localStorage.setItem('bagItems', JSON.stringify(this.bagItems));
        localStorage.setItem('deliveryPrice', this.#deliveryPrice);
        window.location.href = '/pages/order.html';
    }

    showBag() {
        document.getElementById('bag').classList.remove('notactive');
        document.getElementById('bag').classList.add('active');
    }

    hideBag() {
        document.getElementById('bag').classList.add('notactive');
        document.getElementById('bag').classList.remove('active');
    }
}

customElements.define('x-bag', Bag);
