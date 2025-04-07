import ApiClient from "./api.js";
import SuccessIndicator from "./components/success-indicator/success-indicator.js";

import { ERR_GENERAL, ERR_NAME_LENGTH, ERR_INVALID_EMAIL, ERR_EMAIL_EXISTS, ERR_PASSWORD_PATTERN, ERR_PASSWORD_MISMATCH, ERR_ERRORS, ERR_RULES_ACCEPTANCE } from "./resources.js";

const nameInput = document.querySelector('x-claim-input[inputId="firstname"]');
const emailInput = document.querySelector('x-claim-input[inputId="email"]');
const passwordInput = document.querySelector('x-claim-input[inputId="password"]');
const repeatPasswordInput = document.querySelector('x-claim-input[inputId="repeat-password"]');
const rulesAcceptanceCheckbox = document.querySelector('x-toggle[name="cbx-rules-acceptance"]');
const rulesAcceptanceLabel = rulesAcceptanceCheckbox.parentElement.querySelector('span');
const overlay = document.getElementById("overlay");
const overlayProgress = document.getElementById("progress");
const overlaySuccess = document.getElementById("overlay-success");
const errorMessage = document.getElementById("error-message");

nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);
repeatPasswordInput.addEventListener("blur", validateRepeatPassword);

document.getElementById("create-account-btn").addEventListener("click", function () {
    rulesAcceptanceLabel.style.color = "var(--color-text)";
    hideError();

    let valid = validateName();
    valid = validateEmail() && valid;
    valid = validatePassword() && valid;
    valid = validateRepeatPassword() && valid;

    if (!valid && rulesAcceptanceCheckbox.checked) {
        showError(ERR_ERRORS);
    }

    if (!rulesAcceptanceCheckbox.checked) {
        showError(ERR_RULES_ACCEPTANCE);
        rulesAcceptanceLabel.style.color = "red";
    }

    if (!valid || !rulesAcceptanceCheckbox.checked) {
        return;
    }

    const client = new ApiClient();
    showProgress();

    client.post('user/create', {
        firstname: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
    })
        .then(response => {
            hideProgress();

            if (response.ok) {
                showSuccess();
            } else {
                response.json().then(json => {
                    showError(json.message);
                });
            }
        })
        .catch(error => {
            showError(ERR_GENERAL);
        });
});

function showProgress() {
    overlay.style.display = "flex";
    overlayProgress.show();
    overlaySuccess.style.display = "none";
}

function hideProgress() {
    overlayProgress.hide();
}

function showSuccess() {
    overlay.style.display = "flex";
    overlayProgress.hide();
    overlaySuccess.style.display = "flex";
}

function hideOverlay() {
    overlay.style.display = "none";
    overlayProgress.hide();
    overlaySuccess.style.display = "none";
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

function showError(error) {
    hideOverlay();
    errorMessage.textContent = error;
    errorMessage.style.display = "block";
}

function validateName() {
    const trimmedValue = nameInput.value.trim();
    if (trimmedValue.length < 3 || trimmedValue.length > 32) {
        nameInput.invalid(ERR_NAME_LENGTH);
        return false;
    } else {
        nameInput.valid();
        return true;
    }
}

function validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(emailInput.value)) {
        emailInput.valid();
    } else {
        emailInput.invalid(ERR_INVALID_EMAIL);
        return false;
    }

    const emailExists = false;

    if (emailExists) {
        emailInput.invalid(ERR_EMAIL_EXISTS);
        return false;
    }

    return true;
}

function validatePassword() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(passwordInput.value)) {
        passwordInput.invalid(ERR_PASSWORD_PATTERN);
        return false;
    } else {
        passwordInput.valid();
        return true;
    }
}

function validateRepeatPassword() {
    if (repeatPasswordInput.value.trim() === '' || passwordInput.value !== repeatPasswordInput.value) {
        repeatPasswordInput.invalid(ERR_PASSWORD_MISMATCH);
        return false;
    } else {
        repeatPasswordInput.valid();
        return true;
    }
}