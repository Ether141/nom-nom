import ApiClient from "./api.js";

function redirectToLogin() {
    window.location.href = '/pages/signin.html';
}

export function checkAccess() {
    const client = new ApiClient();

    client.fetchUserInfo().then(userInfo => {
        if (!userInfo) {
            redirectToLogin();
        }
    }).catch(() => {
        redirectToLogin();
    });
}

