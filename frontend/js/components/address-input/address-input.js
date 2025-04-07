export default class AddressInput extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/address-input/address-input.css';

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="address-search-container">
                <input type="text" class="address-search-input" placeholder="Adres dostawy">
                <a href="./pages/search.html"><button class="address-search-button">Szukaj</button></a>
            </div>
        `;

        this.input = this.shadowRoot.querySelector('.address-search-input');

        this.input.addEventListener('input', () => {
            this.value = this.input.value;
            this.dispatchEvent(new CustomEvent('change', { detail: this.input.value }));
        });
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = val;
    }
}

customElements.define('x-address-input', AddressInput);