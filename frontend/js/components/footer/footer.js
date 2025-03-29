export default class Footer extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/footer/footer.css';

        this.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <footer>
                <span>NomNom © 2025</span>
            </footer>
        `;
    }
}