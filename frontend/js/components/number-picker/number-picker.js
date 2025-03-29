export default class NumberPicker extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/number-picker/number-picker.css';
        this.min = this.getAttribute('min') || 0;
        this.max = this.getAttribute('max') || 100;
        this.value = this.getAttribute('value') || this.min;

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <div class="number-picker">
                <button class="number-picker-decrement">-</button>
                <span>${this.value}</span>
                <button class="number-picker-increment">+</button>
            </div>
        `;

        this.decrementButton = this.shadowRoot.querySelector('.number-picker-decrement');
        this.incrementButton = this.shadowRoot.querySelector('.number-picker-increment');
        this.valueInput = this.shadowRoot.querySelector('span');

        this.decrementButton.addEventListener('click', this.decrement.bind(this));
        this.incrementButton.addEventListener('click', this.increment.bind(this));
    }

    decrement() {
        if (this.value > this.min) {
            this.value--;
            this.valueInput.innerHTML = this.value;
            this.dispatchEvent(new CustomEvent('valuechanged', { detail: this.value }));
        }
    }

    increment() {
        if (this.value < this.max) {
            this.value++;
            this.valueInput.innerHTML = this.value;
            this.dispatchEvent(new CustomEvent('valuechanged', { detail: this.value }));
        }
    }

    getValue() {
        return this.value;
    }
}