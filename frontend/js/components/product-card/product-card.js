import PopupMessage from '../popup-message/popup-message.js';
import ApiClient from '../../api.js';

export default class ProductCard extends HTMLElement {
    #bag;
    #productPriceNumber;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#bag = document.querySelector('x-bag');
    }

    connectedCallback() {
        this.cssFile = "/js/components/product-card/product-card.css";
        this.productId = this.getAttribute('product-id');
        this.productName = this.getAttribute('product-name') || 'Default Name';
        this.productPrice = this.getAttribute('product-price') || '0.00 zł';
        this.productDetails = this.getAttribute('product-details') || 'No details provided';

        this.#productPriceNumber = parseFloat(this.productPrice.replace(' zł', '').replace(',', '.'));

        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="product">
                <div>
                    <div>
                        <span class="product-name">${this.productName}</span>
                        <span class="product-price">${this.productPrice}</span>
                    </div>
                    <span class="product-details">${this.productDetails}</span>
                </div>
                
                <x-button label="+"></x-button>
            </div>
        `;
    }

    addEventListeners() {
        const button = this.shadowRoot.querySelector('x-button');
        button.addEventListener('onclick', () => {
            const client = new ApiClient();

            if (!client.isLoggedIn()) {
                PopupMessage.instance.showPopup('Zaloguj się, aby dodać produkt do koszyka', 'error');
                return;
            } else {
                this.#bag.addBagItem({
                    id: this.productId,
                    name: this.productName,
                    price: this.#productPriceNumber
                });
                PopupMessage.instance.showPopup('Produkt został dodany do koszyka', 'success');
            }
        });
    }
}

customElements.define('x-product-card', ProductCard);