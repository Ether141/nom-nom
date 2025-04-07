export default class Toggle extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/toggle/toggle.css';

        if (this.getAttribute('name') === null) {
            throw new Error('toggle-switch component must have a name attribute');
        }

        this.name = this.getAttribute('name');
        this._checked = this.getAttribute('checked') === 'true';

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="checkbox-wrapper">
                <input type="checkbox" id="${this.name}" ${this._checked ? "checked" : ""} />
                <label for="${this.name}" class="toggle"><span></span></label>
            </div>
        `;

        this.shadowRoot.getElementById(this.name).addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('change', { detail: this.checked }));
        });
    }

    get checked() {
        return this.shadowRoot.getElementById(this.name).checked;
    }

    set checked(val) {
        const checkbox = this.shadowRoot.getElementById(this.name);
        checkbox.checked = val;

        this._checked = val;
        this.setAttribute('checked', val.toString());
    }
}

customElements.define('x-toggle', Toggle);