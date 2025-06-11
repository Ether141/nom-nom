export default class ClaimInput extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/claim-input/claim-input.css';

        if (this.getAttribute('inputId') === null) {
            throw new Error('claim-input component must have a inputId attribute');
        }

        this.inputId = this.getAttribute('inputId');
        this.type = this.getAttribute('type') || 'text';
        this.label = this.getAttribute('label') || '';
        this.iconSrc = this.getAttribute('iconSrc') || '';
        this.autocomplete = this.getAttribute('autocomplete') || 'off';

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="claim-input-container">
                <div>
                    <input type="${this.type}" class="claim-input-field" placeholder="" id="${this.inputId}" autocomplete="${this.autocomplete}" />
                    <label for="${this.inputId}" class="claim-input-label">${this.label}</label>
                    <img class="claim-input-icon" src="${this.iconSrc}" />
                </div>
                <span></span>
            </div>
        `;

        this.rootElement = this.shadowRoot.querySelector('.claim-input-container');
        this.input = this.shadowRoot.querySelector('.claim-input-field');

        this.input.addEventListener('input', () => {
            this.value = this.input.value;
            this.dispatchEvent(new CustomEvent('change', { detail: this.input.value }));
        });

        if (this.getAttribute("value")) {
            this.value = this.getAttribute("value");
        }
        
        if (this.hasAttribute('lock')) {
            this.lock();
        }
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        if (this.type == 'file') {
            this.input.filename = val;
        } else {
            this.input.value = val;
        }
    }

    invalid(text) {
        this.shadowRoot.querySelector('.claim-input-container > span').innerHTML = text;
        this.rootElement.classList.add('claim-input-invalid');
    }

    valid() {
        this.rootElement.classList.remove('claim-input-invalid');
    }

    lock() {
        this.input.disabled = true;
        this.rootElement.classList.add('readonly');
    }

    unlock() {
        this.input.disabled = false;
        this.rootElement.classList.remove('readonly');
    }
}

customElements.define('x-claim-input', ClaimInput);