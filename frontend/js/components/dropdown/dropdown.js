export default class Dropdown extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/dropdown/dropdown.css';
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="dropdown">
                <select>
                    ${this.innerHTML}
                </select>
            </div>
        `;

        this.selectElement = this.shadowRoot.querySelector('select');

        this.selectElement.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: this.value }
            }));
        });
    }

    get value() {
        return this.selectElement.value;
    }

    set value(val) {
        this.selectElement.value = val;

        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value }
        }));
    }
}