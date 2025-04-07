export default class Button extends HTMLElement {
    constructor() {
        super();

        this.enabled = true;
        this.cssFile = '/js/components/button/button.css';
        this.label = this.getAttribute('label') || 'Button';
        this.buttonStyle = this.getAttribute('buttonStyle') || 'standard';

        const style = this.buttonStyle === 'ghost' ? 'ghost-button' : 'standard-button';

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <button class="${style}">${this.label}</button>
        `;

        this.shadowRoot.querySelector('button').addEventListener('click', (event) => {
            if (this.enabled) {
                this.dispatchEvent(new CustomEvent('onclick', {
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }

    disable() {
        this.shadowRoot.querySelector('button').classList.add('disabled');
        this.enabled = false;
    }

    enable() {
        this.shadowRoot.querySelector('button').classList.remove('disabled');
        this.enabled = true;
    }
}

customElements.define('x-button', Button);