export default class Button extends HTMLElement {
    constructor() {
        super();
        this.enabled = true;
        this.cssFile = '/js/components/button/button.css';
        this._handleClick = this._handleClick.bind(this);
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.label = this.getAttribute('label') || 'Button';
        this.buttonStyle = this.getAttribute('buttonStyle') || 'standard';
        const styleClass = this.buttonStyle === 'ghost' ? 'ghost-button' : 'standard-button';

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <button class="${styleClass}">${this.label}</button>
        `;

        const buttonElement = this.shadowRoot.querySelector('button');
        buttonElement.addEventListener('click', this._handleClick);
    }

    disconnectedCallback() {
        const buttonElement = this.shadowRoot.querySelector('button');
        if (buttonElement) {
            buttonElement.removeEventListener('click', this._handleClick);
        }
    }

    _handleClick(event) {
        if (this.enabled) {
            this.dispatchEvent(new CustomEvent('onclick', {
                bubbles: true,
                composed: true
            }));
        }
    }

    disable() {
        const buttonElement = this.shadowRoot.querySelector('button');
        if (buttonElement) {
            buttonElement.classList.add('disabled');
        }
        this.enabled = false;
    }

    enable() {
        const buttonElement = this.shadowRoot.querySelector('button');
        if (buttonElement) {
            buttonElement.classList.remove('disabled');
        }
        this.enabled = true;
    }
}

customElements.define('x-button', Button);