import ApiClient from "../../api.js";
import PopupMessage from "../popup-message/popup-message.js"

export default class WalletPay extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        this.cssFile = "/js/components/wallet-pay/wallet-pay.css";
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = this.#getMarkup();
        this.#addEventListeners();
    }

    #getMarkup() {
        return `
            <link rel="stylesheet" href="${this.cssFile}">
            <div id="wallet-pay-container">
                <h3>Doładuj swoje konto</h3>

                <div class="list">
                    <div class="payment">
                        <img src="../images/icons/blik.png" />
                        <span>BLIK</span>
                    </div>

                    <div class="payment">
                        <img src="../images/icons/card.png" />
                        <span>Karta kredytowa</span>
                    </div>

                    <div class="payment">
                        <img src="../images/icons/paypal.png" />
                        <span>PayPal</span>
                    </div>

                    <div class="payment">
                        <img src="../images/icons/gpay.png" />
                        <span>Google Pay</span>
                    </div>

                    <div class="payment">
                        <img src="../images/icons/applepay.png" />
                        <span>Apple Pay</span>
                    </div>
                </div>
                
                <div id="blik-container" style="display: none;">
                    <div>
                        <x-claim-input id="blik-value" inputId="blik-value" label="Kwota"></x-claim-input>
                        <x-claim-input id="blik-input" inputId="blik-input" label="Kod BLIK"></x-claim-input>
                        <x-button id="btn-use-blik" label="Zatwierdź"></x-button>
                    </div>
                </div>  
                
                <x-progress-indicator id="progress-indicator"></x-progress-indicator>
            </div>
        `;
    }

    #addEventListeners() {
        const paymentElements = this.shadowRoot.querySelectorAll('.payment');
        paymentElements.forEach(payment => {
            payment.addEventListener('click', () => {
                const wasSelected = payment.classList.contains('selected');
                const blikContainer = this.shadowRoot.querySelector('#blik-container');

                blikContainer.style.display = "none";
                paymentElements.forEach(payment => {
                    payment.classList.remove('selected');
                });

                if (wasSelected) {
                    blikContainer.classList.remove('hidden');
                    return;
                }

                payment.classList.toggle('selected');
                blikContainer.style.display = "flex";
            });
        });

        this.shadowRoot.getElementById("btn-use-blik").addEventListener("click", () => {
            const result = this.#validateInputs();

            if (!result) return;

            this.shadowRoot.querySelector("#progress-indicator").show();
            
            const client = new ApiClient();

            client.post("user/add-funds", { amount: result.blikValue }, true)
                .then(response => {
                    if (response.ok) {
                        response.json().then(json => {
                            const walletBalanceSpan = document.getElementById("wallet-balance");
                            walletBalanceSpan.innerText = parseFloat(json.balance).toFixed(2) + " zł";
                            PopupMessage.instance.showPopup("Doładowanie konta powiodło się.", "success");

                            document.getElementsByTagName("x-navbar")[0].refreshUser();
                            this.shadowRoot.querySelector("#blik-value").value = "";
                            this.shadowRoot.querySelector("#blik-input").value = "";
                        });
                    } else {
                        PopupMessage.instance.showPopup("Wystąpił błąd, spróbuj ponownie później.", "error");
                    }

                    this.shadowRoot.querySelector("#progress-indicator").hide();
                })
                .catch(error => {
                    PopupMessage.instance.showPopup("Wystąpił błąd, spróbuj ponownie później.", "error");
                    this.shadowRoot.querySelector("#progress-indicator").hide();
                });
        });

        this.shadowRoot.querySelector("#blik-value");

        this.shadowRoot.querySelector("#blik-input").addEventListener("blur", () => {
            this.#validateBlikInput();
        });

        this.shadowRoot.querySelector("#blik-value").addEventListener("blur", () => {
            this.#validateBlikValue();
        });
    }

    #validateBlikValue() {
        const blikValueElement = this.shadowRoot.querySelector("#blik-value");
        const blikValue = blikValueElement.value.trim();

        blikValueElement.valid();

        if (!blikValue) {
            blikValueElement.invalid("Wprowadź kwotę.");
            return false;
        }

        const numericBlikValue = parseFloat(blikValue);
        if (isNaN(numericBlikValue) || numericBlikValue < 10 || numericBlikValue > 500) {
            blikValueElement.invalid("Kwota musi być liczbą pomiędzy 10 a 500.");
            return false;
        }

        return numericBlikValue;
    }

    #validateBlikInput() {
        const blikInputElement = this.shadowRoot.querySelector("#blik-input");
        const blikInput = blikInputElement.value.trim();

        blikInputElement.valid();

        if (!blikInput) {
            blikInputElement.invalid("Wprowadź kod BLIK.");
            return false;
        }

        if (!/^\d{6}$/.test(blikInput)) {
            blikInputElement.invalid("Kod BLIK musi składać się z 6 cyfr.");
            return false;
        }

        return blikInput;
    }

    #validateInputs() {
        const numericBlikValue = this.#validateBlikValue();
        const blikInput = this.#validateBlikInput();

        if (numericBlikValue === false || blikInput === false) return false;

        return { blikValue: numericBlikValue, blikInput };
    }

    show() {
        const walletPay = this.shadowRoot.querySelector("#wallet-pay-container");
        walletPay.classList.add("visible");
        walletPay.classList.remove("hidden");

        setTimeout(() => {
            const topPos = walletPay.getBoundingClientRect().top + window.pageYOffset - 150;
            window.scrollTo({ top: topPos, behavior: "smooth" });
        }, 100);
    }

    hide() {
        const walletPay = this.shadowRoot.querySelector("#wallet-pay-container");
        walletPay.classList.remove("visible");
        walletPay.classList.add("hidden");
    }
}

customElements.define("x-wallet-pay", WalletPay);