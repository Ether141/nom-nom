import ApiClient from "../../api.js";

const addressCardTemplate = document.createElement('template');

addressCardTemplate.innerHTML = `
    <div class="address">
        <span id="address-name"></span>
        <span id="street"></span>
        <span id="city"></span>
        <span id="phone"></span>
    </div>
`;

class Address {
    constructor(name, street, city, postalCode, phone) {
        this.name = name;
        this.street = street;
        this.city = city;
        this.postalCode = postalCode;
        this.phone = phone;
    }
}

export default class AddressManager extends HTMLElement {
    #deleteAddressButton = null;
    #editing = false;
    #addresses = [];

    constructor() {
        super();
        this.#render();
        this.#loadAddresses();
    }

    #render() {
        this.cssFile = '/js/components/address-manager/address-manager.css';
        this.addressSelector = this.getAttribute('selector') || false;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = this.#getMarkup();

        this.addressNameInput = this.shadowRoot.querySelector('x-claim-input[inputId="address-name"]');
        this.streetInput = this.shadowRoot.querySelector('x-claim-input[inputId="street"]');
        this.postalCodeInput = this.shadowRoot.querySelector('x-claim-input[inputId="postal-code"]');
        this.cityInput = this.shadowRoot.querySelector('x-claim-input[inputId="city"]');
        this.phoneInput = this.shadowRoot.querySelector('x-claim-input[inputId="phone"]');

        this.addressNameInput.addEventListener("blur", () => this.#validateAddressName());
        this.streetInput.addEventListener("blur", () => this.#validateStreet());
        this.postalCodeInput.addEventListener("blur", () => this.#validatePostalCode());
        this.cityInput.addEventListener("blur", () => this.#validateCity());
        this.phoneInput.addEventListener("blur", () => this.#validatePhone());

        this.#deleteAddressButton = this.shadowRoot.getElementById("btn-delete-address");
        this.#deleteAddressButton.disable();

        this.shadowRoot.getElementById("address-add-btn").addEventListener("click", () => {
            this.#showHideAddressEdit(true);
            this.#unselecteAllAddresses();
            this.#clearAddressInputs();
            this.#editing = false;
            this.#deleteAddressButton.disable();
            this.addressNameInput.unlock();
            this.shadowRoot.querySelector("h3").textContent = "Dodaj adres";
        });

        this.shadowRoot.getElementById("btn-cancel-address").addEventListener("click", () => {
            this.#showHideAddressEdit(false);
        });

        this.shadowRoot.getElementById("btn-save-address").addEventListener("click", () => this.#saveAddress());

        this.#deleteAddressButton.addEventListener("click", () => this.#deleteAddress());
    }

    #getMarkup() {
        return `
            <link rel="stylesheet" href="${this.cssFile}">
            <div id="address-manager">
                <div class="list">
                    <button id="address-add-btn">+</button>
                </div>

                <div id="address-edit" class="address-hidden">
                    <h3>Edytuj adres</h3>

                    <x-claim-input inputId="address-name" type="text" label="Nazwa adresu" iconSrc="../images/icons/id-card.png"></x-claim-input>
                    <x-claim-input inputId="street" type="text" label="Ulica i numer" iconSrc="../images/icons/map-pin.png" autocomplete="street-address"></x-claim-input>
                    <x-claim-input inputId="postal-code" type="text" label="Kod pocztowy" iconSrc="../images/icons/zip-code.png" autocomplete="postal-code"></x-claim-input>
                    <x-claim-input inputId="city" type="text" label="Miasto" iconSrc="../images/icons/city.png" autocomplete="home city"></x-claim-input>
                    <x-claim-input inputId="phone" type="text" label="Numer telefonu" iconSrc="../images/icons/phone.png" autocomplete="tel"></x-claim-input>

                    <div class="btn-container">
                        <x-button id="btn-cancel-address" buttonStyle="ghost" label="Anuluj"></x-button>
                        <x-button id="btn-delete-address" buttonStyle="ghost" label="Usuń"></x-button>
                        <x-button id="btn-save-address" label="Zapisz adres"></x-button>
                    </div>

                </div>
            </div>
        `;
    }

    async #loadAddresses() {
        const apiClient = new ApiClient();

        try {
            const response = await apiClient.get('/user/addresses');

            if (response.ok) {
                const addresses = await response.json();

                addresses.addresses.forEach(({ name, street, city, postalCode, phone }) => {
                    const address = new Address(name, street, city, postalCode, phone);
                    this.#addresses.push(address);
                    this.#createAddressCard(name, street, city, postalCode, phone);
                });
            } else {
                console.error('Failed to load addresses:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    }

    getSelectedAddress() {
        const selectedAddress = this.shadowRoot.querySelector(".address.selected");
        if (!selectedAddress) {
            return null;
        }
        const name = selectedAddress.querySelector('#address-name').textContent.trim();
        return this.#addresses.find(address => address.name === name) || null;
    }

    #saveAddress() {
        let valid = this.#validateAddressName();
        valid = this.#validateStreet() && valid;
        valid = this.#validatePostalCode() && valid;
        valid = this.#validateCity() && valid;
        valid = this.#validatePhone() && valid;

        if (valid) {
            const name = this.addressNameInput.value.trim();
            const street = this.streetInput.value.trim();
            const city = this.cityInput.value.trim();
            const postalCode = this.postalCodeInput.value.trim();
            const phone = this.phoneInput.value.trim();
            
            if (this.#editing) {
                const selectedAddress = this.shadowRoot.querySelector(".selected");

                if (selectedAddress) {
                    selectedAddress.querySelector('#address-name').textContent = name;
                    selectedAddress.querySelector('#street').textContent = street;
                    selectedAddress.querySelector('#city').textContent = `${postalCode} ${city}`;
                    selectedAddress.querySelector('#phone').textContent = phone;

                    const index = this.#addresses.findIndex(address => address.name === name);
                    this.#addresses[index] = new Address(name, street, city, postalCode, phone);
                }
            } else {
                const address = new Address(name, street, city, postalCode, phone);
                this.#addresses.push(address);
                this.#createAddressCard(name, street, city, postalCode, phone);
            }
            this.#showHideAddressEdit(false);
        }
    }

    #deleteAddress() {
        const selectedAddress = this.shadowRoot.querySelector(".selected");

        if (selectedAddress) {
            const name = selectedAddress.querySelector('#address-name').textContent;
            this.#addresses = this.#addresses.filter(address => address.name !== name);
            selectedAddress.remove();
            this.#showHideAddressEdit(false);
        }
    }

    #createAddressCard(name, street, city, postalCode, phone) {
        const list = this.shadowRoot.querySelector(".list");
        const newAddressFragment = addressCardTemplate.content.cloneNode(true);
        newAddressFragment.querySelector('#address-name').textContent = name;
        newAddressFragment.querySelector('#street').textContent = street;
        newAddressFragment.querySelector('#city').textContent = `${postalCode} ${city}`;
        newAddressFragment.querySelector('#phone').textContent = phone;

        const address = newAddressFragment.querySelector('.address');

        address.addEventListener("click", () => {
            this.#unselecteAllAddresses();
            address.classList.add("selected");

            if (this.addressSelector) {
                return;
            }

            this.#clearAddressInputs();
            this.#showHideAddressEdit(true);
            this.#deleteAddressButton.enable();
            this.#editing = true;
            this.shadowRoot.querySelector("h3").textContent = "Edytuj adres";

            this.addressNameInput.value = name;
            this.streetInput.value = street;
            this.postalCodeInput.value = postalCode;
            this.cityInput.value = city;
            this.phoneInput.value = phone;

            this.addressNameInput.lock();
        });

        list.insertBefore(newAddressFragment, list.firstChild);
    }

    #unselecteAllAddresses() {
        const addresses = this.shadowRoot.querySelectorAll(".address");
        addresses.forEach(address => {
            address.classList.remove("selected");
        });
    }

    #clearAddressInputs() {
        this.addressNameInput.value = "";
        this.streetInput.value = "";
        this.postalCodeInput.value = "";
        this.cityInput.value = "";
        this.phoneInput.value = "";
    }

    #showHideAddressEdit(show) {
        const addressEdit = this.shadowRoot.getElementById("address-edit");
        if (show) {
            if (addressEdit.classList.contains("address-visible")) {
                return;
            }

            addressEdit.classList.remove("address-hidden");
            addressEdit.classList.add("address-visible");
           
            setTimeout(() => {
                const topPos = addressEdit.getBoundingClientRect().top + window.pageYOffset - 150;
                window.scrollTo({ top: topPos, behavior: "smooth" });
            }, 100);
        } else {
            addressEdit.classList.add("address-hidden");
            addressEdit.classList.remove("address-visible");

            this.#editing = false;
            this.#unselecteAllAddresses();
            this.#clearAddressInputs();
            this.#deleteAddressButton.disable();
        }
    }

    #validateAddressName() {
        const value = this.addressNameInput.value.trim();
        const duplicate = this.#addresses.some(address => address.name === value);
        if (!value) {
            this.addressNameInput.invalid("Wprowadź nazwę adresu.");
            return false;
        } else if (duplicate && !this.#editing) {
            this.addressNameInput.invalid("Adres z tą nazwą już istnieje.");
            return false;
        } else {
            this.addressNameInput.valid();
            return true;
        }
    }

    #validateStreet() {
        const value = this.streetInput.value.trim();
        if (!value) {
            this.streetInput.invalid("Wprowadź nazwę ulicy.");
            return false;
        } else {
            this.streetInput.valid();
            return true;
        }
    }

    #validatePostalCode() {
        const value = this.postalCodeInput.value.trim();

        const pattern = /^\d{2}-\d{3}$/;

        if (!value) {
            this.postalCodeInput.invalid("Wprowadź kod pocztowy.");
            return false;
        } else if (!pattern.test(value)) {
            this.postalCodeInput.invalid("Niepoprawny format kodu pocztowego (XX-XXX).");
            return false;
        } else {
            this.postalCodeInput.valid();
            return true;
        }
    }

    #validateCity() {
        const value = this.cityInput.value.trim();

        if (!value) {
            this.cityInput.invalid("Wprowadź nazwę miasta.");
            return false;
        } else {
            this.cityInput.valid();
            return true;
        }
    }

    #validatePhone() {
        const value = this.phoneInput.value.trim();

        const pattern = /^\+?\d{9,15}$/;
        if (!value) {
            this.phoneInput.invalid("Wprowadź numer telefonu.");
            return false;
        } else if (!pattern.test(value)) {
            this.phoneInput.invalid("Niepoprawny numer telefonu.");
            return false;
        } else {
            this.phoneInput.valid();
            return true;
        }
    }
}

customElements.define('x-address-manager', AddressManager);