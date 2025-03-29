export default class Navbar extends HTMLElement {
    constructor() {
        super();

        this.cssFile = '/js/components/navbar/navbar.css';

        this.withBackground = this.getAttribute('with-background') != null ? true : false;
        this.type = this.getAttribute('type') || 'default';
        this.navOptions = this.getAttribute('options') || 'default';

        const defaultContent = `
            <div id="nav-right">
                <a class="nav-button" role="button" href="#">Zostań kurierem</a>
                <a class="nav-button" role="button" href="#">Dodaj swoją restaurację</a>
            </div>
            <div id="nav-user">
                <a class="nav-button" role="button" href="/pages/signin.html">Zaloguj się</a>
                <img src="/images/icons/user.png" />
            </div>
        `;

        const content = this.navOptions.includes('minimal') ? '' : defaultContent;
        const withBackground = this.navOptions.includes('background');
        const withBackBtn = this.navOptions.includes('back-button');

        this.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <nav class="${withBackground ? 'nav-with-background' : ''}">
                ${withBackBtn ? '<a href="/index.html">&lt</a>' : ''}
                <img src="/images/logo.png" id="nav-logo" />
                ${content}
            </nav>
        `;
    }


}