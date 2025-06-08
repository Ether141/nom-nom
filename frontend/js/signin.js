import ApiClient from "./api.js";
import { ERR_ENTER_EMAIL, ERR_ENTER_PASSWORD, ERR_GENERAL, ERR_INVALID_EMAIL, ERR_INVALID_INPUT } from "./resources.js";

const emailInput = document.querySelector('x-claim-input[inputId="email"]');
const passwordInput = document.querySelector('x-claim-input[inputId="password"]');
const loginBtn = document.getElementById("login-btn");
const errorMessage = document.getElementById("error-message");

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

const login = () => {
    hideError();

    const email = emailInput.value;
    const password = passwordInput.value;

    let valid = validateEmail();
    valid = validatePassword() && valid;

    if (!valid) {
        return;
    }

    const client = new ApiClient();
    lockInput();

    client.post('user/login', {
        email: email,
        password: password
    }, true)
        .then(response => {
            if (response.ok) {
                window.location.href = "/index.html";

                response.json().then(json => {
                    const sessionId = json.sessionId;
                    localStorage.setItem("sessionId", sessionId);
                });
            } else {
                unlockInput();
                response.json().then(json => {
                    showError(ERR_INVALID_INPUT);
                });
            }
        })
        .catch(error => {
            unlockInput();
            showError(ERR_GENERAL);
        });
};

loginBtn.addEventListener("onclick", login);

// when user press enter, click the login button
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        login();
    }
});

function lockInput() {
    emailInput.lock();
    passwordInput.lock();
    loginBtn.disable();
}

function unlockInput() {
    emailInput.unlock();
    passwordInput.unlock();
    loginBtn.enable();
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

function showError(error) {
    errorMessage.textContent = error;
    errorMessage.style.display = "block";
}

function validateEmail() {
    if (emailInput.value === "") {
        emailInput.invalid(ERR_ENTER_EMAIL);
        return false;
    } else {
        emailInput.valid();
        return true;
    }
}

function validatePassword() {
    if (passwordInput.value === "") {
        passwordInput.invalid(ERR_ENTER_PASSWORD);
        return false;
    } else {
        passwordInput.valid();
        return true;
    }
}