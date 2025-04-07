const successColor = "#2ecc71";
const successProgressColor = "#218f4f";
const errorColor = "#cc2e2e";
const errorProgressColor = "#8f2121";

export default class PopupMessage extends HTMLElement {
    #message = "";

    /**  @returns {PopupMessage | null} */
    static get instance() {
        return document.querySelector("x-popup-message");
    }

    constructor() {
        super();
        this.render();
    }

    render() {
        this.#message = "Default popup message!";
        this.cssFile = "/js/components/popup-message/popup-message.css";
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = this.#getMarkup();
        this.#addEventListeners();
    }

    #getMarkup() {
        return `
            <link rel="stylesheet" href="${this.cssFile}">
            <div id="popup-message-container" class="hidden">
                <div id="popup-message">
                    <span class="message">${this.#message}</span>
                    <div id="progress-bar"></div>
                </div>
            </div>
        `;
    }

    #addEventListeners() {
        const progressBar = this.shadowRoot.querySelector("#progress-bar");
        const popupMessage = this.shadowRoot.querySelector("#popup-message");
        const popupContainer = this.shadowRoot.querySelector("#popup-message-container");

        popupMessage.addEventListener("mouseenter", () =>
            this.#handleMouseEnter(progressBar)
        );

        popupMessage.addEventListener("mouseleave", () =>
            this.#handleMouseLeave(progressBar, popupMessage)
        );

        popupMessage.addEventListener("click", () =>
            this.#handlePopupClick(popupContainer)
        );

        progressBar.addEventListener("transitionend", () =>
            this.#handleTransitionEnd(popupContainer)
        );
    }

    #handleMouseEnter(progressBar) {
        const computedWidth = getComputedStyle(progressBar).width;
        progressBar.style.width = computedWidth;
        progressBar.style.transition = "none";
    }

    #handleMouseLeave(progressBar, popupMessage) {
        const containerWidth = popupMessage.offsetWidth;
        const currentWidthPx = parseFloat(getComputedStyle(progressBar).width);
        const currentPercent = (currentWidthPx / containerWidth) * 100;
        const remainingTime = 7 * (currentPercent / 100);
        progressBar.style.transition = `width ${remainingTime}s linear`;
        setTimeout(() => {
            progressBar.style.width = "0%";
        }, 0);
    }

    #handlePopupClick(popupContainer) {
        popupContainer.classList.remove("visible");
        popupContainer.classList.add("hidden");
    }

    #handleTransitionEnd(popupContainer) {
        popupContainer.classList.remove("visible");
        popupContainer.classList.add("hidden");
    }

    #updatePopupPresentation(message, type) {
        this.#message = message;
        const messageSpan = this.shadowRoot.querySelector('.message');
        if (messageSpan) {
            messageSpan.textContent = message;
        }

        const popupMessageDiv = this.shadowRoot.querySelector('#popup-message');
        const progressBar = this.shadowRoot.querySelector('#progress-bar');

        if (type === "success") {
            popupMessageDiv.style.backgroundColor = successColor;
            progressBar.style.backgroundColor = successProgressColor;
        } else if (type === "error") {
            popupMessageDiv.style.backgroundColor = errorColor;
            progressBar.style.backgroundColor = errorProgressColor;
        }

        const popupContainer = this.shadowRoot.querySelector('#popup-message-container');
        popupContainer.classList.remove('hidden');
        popupContainer.classList.add('visible');

        progressBar.style.transition = 'none';
        progressBar.style.width = '100%';
        // Force reflow to apply the no-transition width.
        void progressBar.offsetWidth;
        progressBar.style.transition = 'width 7s linear';

        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 0);
    }

    showPopup(message, type = "success") {
        this.#updatePopupPresentation(message, type);
    }
}

customElements.define("x-popup-message", PopupMessage);