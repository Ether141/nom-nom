import ApiClient from "./api.js";
import { ERR_ENTER_EMAIL, ERR_ENTER_PASSWORD, ERR_GENERAL } from "./resources.js";

const emailInput = document.querySelector('x-claim-input[inputId="email"]');
const passwordInput = document.querySelector('x-claim-input[inputId="password"]');
const loginBtn = document.getElementById("login-btn");
const errorMessage = document.getElementById("error-message");

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

loginBtn.addEventListener("onclick", function() {
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
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "/index.html";

            response.json().then(json => {
                const sessionId = json.session_id;
                localStorage.setItem("session_id", sessionId);
            });
        } else {
            unlockInput();
            response.json().then(json => {
                showError(json.message);
            });
        }
    })
    .catch(error => {
        unlockInput();
        showError(ERR_GENERAL);
    });
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