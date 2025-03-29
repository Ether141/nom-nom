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
        this.errorText = this.getAttribute('errorText') || '';
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
                <span>${this.errorText}</span>
            </div>
        `;

        this.input = this.shadowRoot.querySelector('.claim-input-field');

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