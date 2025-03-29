export default class Button extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/button/button.css';
        this.label = this.getAttribute('label') || 'Button';
        this.buttonStyle = this.getAttribute('buttonStyle') || 'standard';

        const style = this.buttonStyle === 'ghost' ? 'ghost-button' : 'standard-button';

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <div>
                <link rel="stylesheet" href="${this.cssFile}">
                <button class="${style}">${this.label}</button>
            </div>
        `;

        this.shadowRoot.querySelector('button').addEventListener('click', (event) => {
            if (typeof this.onclick === 'function') {
                this.onclick(event);
            }

            this.dispatchEvent(new CustomEvent('click', { detail: event }));
        });
    }
}