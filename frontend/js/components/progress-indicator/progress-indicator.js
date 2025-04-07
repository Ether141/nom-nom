export default class ProgressIndicator extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/progress-indicator/progress-indicator.css';
        this.attachShadow({ mode: 'open' });

        this.overlayWidth = this.getAttribute('overlay-width') || '100%';
        this.overlayHeight = this.getAttribute('overlay-height') || '100%';
        this.borderRadius = this.getAttribute('border-radius') || '0';
        this.overlayColor = this.getAttribute('overlay-color') || 'white';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: ${this.overlayWidth};
                    height: ${this.overlayHeight};
                }

                .overlay-progress {
                    border-radius: ${this.borderRadius};
                    background-color: ${this.overlayColor};
                }
            </style>

            <link rel="stylesheet" href="${this.cssFile}">
            <div class="overlay-progress">
                <span class="spinner" role="status"></span>
            </div>
        `;

        this.hide();
    }

    show() {
        this.shadowRoot.host.style.display = 'flex';
    }

    hide() {
        this.shadowRoot.host.style.display = 'none';
    }
}

customElements.define('x-progress-indicator', ProgressIndicator);