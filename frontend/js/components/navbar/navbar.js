import ApiClient from "../../api.js"

export default class Navbar extends HTMLElement {
    #bagCountElement;
    #bagVisible = false;

    constructor() {
        super();

        this.cssFile = '/js/components/navbar/navbar.css';

        this.withBackground = this.getAttribute('with-background') != null ? true : false;
        this.type = this.getAttribute('type') || 'default';
        this.navOptions = this.getAttribute('options') || 'default';
        this.minimal = this.navOptions.includes('minimal');

        const defaultContent = `
            <div id="nav-right">
                <div class="nav-button">
                    <img src="/images/icons/motorcycle.png"/>
                    <a role="button" href="#">Zostań kurierem</a>
                </div>

                <div class="nav-button">
                    <img src="/images/icons/restaurant.png"/>
                    <a role="button" href="#">Dodaj swoją restaurację</a>
                </div>

                <div class="nav-button manager-button" style="display: none;">
                    <img src="/images/icons/manager.png"/>
                    <a role="button" href="/pages/restaurant-list.html">Zarządzaj</a>
                </div>

                <div class="nav-button logout-button" style="display: none;">
                    <img src="/images/icons/logout.png"/>
                    <a role="button">Wyloguj się</a>
                </div>
            </div>
            <div class="nav-user">
                <div class="nav-button">
                    <img src="/images/icons/user.png"/>
                    <a role="button" href="/pages/signin.html"></a>
                </div>
            </div>
        `;

        const content = this.minimal ? '' : defaultContent;
        const withBackground = this.navOptions.includes('background');
        const withBackBtn = this.navOptions.includes('back-button');

        this.innerHTML = `
            <link rel="stylesheet" href="${this.cssFile}">
            <nav class="${withBackground ? 'nav-with-background' : ''}">
                ${content !== '' ? `
                <button id="side-menu-btn">
                    <svg class="ham hamRotate ham8" viewBox="0 0 100 100">
                        <path
                            class="line top"
                            d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" />
                        <path
                            class="line middle"
                            d="m 30,50 h 40" />
                        <path
                            class="line bottom"
                            d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" />
                    </svg>
                </button>` : ''}
                ${withBackBtn ? '<a href="/index.html">&lt</a>' : ''}
                <a id="nav-logo-link" href="/index.html">
                    <img src="/images/logo.png" id="nav-logo" />
                </a>
                ${content}
                <button id="bag-btn">
                    <img src="/images/icons/bag.png" />
                    <span>0</span>
                </button>
            </nav>
            <div id="side-menu-background" class="notactive"></div>
            <div id="side-menu" class="notactive" style="background: ${withBackground ? 'white' : 'var(--background-color)'};">
                <div class="nav-user">
                    <div class="nav-button">
                        <img src="/images/icons/user.png"/>
                        <a role="button" href="/pages/signin.html"></a>
                    </div>
                </div>

                <div class="nav-button">
                    <img src="/images/icons/motorcycle.png"/>
                    <a role="button" href="#">Zostań kurierem</a>
                </div>

                <div class="nav-button">
                    <img src="/images/icons/key.png"/>
                    <a role="button" href="#">Dodaj swoją restaurację</a>
                </div>

                <div class="nav-button manager-button" style="display: none;">
                    <img src="/images/icons/manager.png"/>
                    <a role="button" href="/pages/restaurant-list.html">Zarządzaj</a>
                </div>

                <div class="nav-button logout-button" style="display: none;">
                    <img src="/images/icons/logout.png"/>
                    <a role="button">Wyloguj się</a>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        const bagBtn = this.querySelector('#bag-btn');
        const bag = document.querySelector('x-bag');
        const client = new ApiClient();

        client.fetchUserInfo()
            .then(userInfo => {
                if (userInfo != null && bag != null) {
                    bagBtn.style.display = 'fles';
                }

                if (userInfo != null && userInfo.role === 'admin') {
                    const managerButtons = Array.from(this.getElementsByClassName("manager-button"));
                    managerButtons.forEach(button => {
                        button.style.display = 'flex';
                    });
                }
            });

        if (this.minimal) {
            return;
        }

        const sideMenuBtn = this.querySelector('#side-menu-btn');
        const sideMenu = this.querySelector('#side-menu');
        const background = this.querySelector('#side-menu-background');
        const svg = this.querySelector('.ham');
        this.#bagCountElement = this.querySelector('#bag-btn span');

        sideMenuBtn.addEventListener('click', () => {
            svg.classList.toggle('active');

            sideMenu.classList.toggle('notactive');
            sideMenu.classList.toggle('active');

            background.classList.toggle('active');
            background.classList.toggle('notactive');

            if (sideMenu.classList.contains('active')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        Array.from(this.getElementsByClassName("logout-button")).forEach(logoutButton => {
            logoutButton.addEventListener('click', () => {
                const client = new ApiClient();
                client.logout().then(() => {
                    window.location.href = '/index.html';
                });
            });
        });

        if (bag != null) {
            bagBtn.addEventListener('click', () => {
                if (bag == null) {
                    return;
                }

                if (this.#bagVisible) {
                    bag.hideBag();
                    this.#bagVisible = false;
                    document.body.style.overflow = 'auto';
                } else {
                    bag.showBag();
                    this.#bagVisible = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.body.style.overflow = 'hidden';
                }

                background.classList.toggle('active');
                background.classList.toggle('notactive');
            });
        }

        this.refreshUser();
    }

    refreshUser() {
        const client = new ApiClient();

        if (!client.isLoggedIn()) {
            const userAnchors = Array.from(this.getElementsByClassName("nav-user")).map(user => user.querySelector('a'));

            userAnchors.forEach(userAnchor => {
                userAnchor.textContent = 'Zaloguj się';
                userAnchor.href = '/pages/signin.html';
                    
                Array.from(this.getElementsByClassName("logout-button")).forEach(logoutButton => {
                    logoutButton.style.display = 'none';
                });
            });

            return;
        }

        client.fetchUserInfo().then(userInfo => {
            const userAnchors = Array.from(this.getElementsByClassName("nav-user")).map(user => user.querySelector('a'));

            userAnchors.forEach(userAnchor => {
                if (userInfo) {
                    userAnchor.textContent = userInfo.name + " • " + parseFloat(userInfo.balance).toFixed(2) + " zł";
                    userAnchor.href = '/pages/profile.html';  

                    Array.from(this.getElementsByClassName("logout-button")).forEach(logoutButton => {
                        logoutButton.style.display = 'flex';
                    });
                }
            });
        });
    }

    setBagCount(count) {
        this.#bagCountElement.textContent = count;
    }
}

customElements.define('x-navbar', Navbar);