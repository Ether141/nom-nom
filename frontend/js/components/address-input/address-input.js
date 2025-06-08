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

        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.#searchAddress(this.input.value);
                event.preventDefault();
            }
        });

        this.shadowRoot.querySelector('.address-search-button').addEventListener('click', (event) => {
            this.#searchAddress(this.input.value);
            event.preventDefault();
        });
    }

    #searchAddress(address) {
        const encodedAddress = encodeURIComponent(address);
        const searchUrl = `/pages/search.html?address=${encodedAddress}`;
        window.location.href = searchUrl;
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = val;
    }
}

customElements.define('x-address-input', AddressInput);