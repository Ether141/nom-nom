import ApiClient from "./api.js";

function redirectToLogin() {
    window.location.href = '/pages/signin.html';
}

export function checkAccess(role = null) {
    const client = new ApiClient();

    client.fetchUserInfo().then(userInfo => {
        if (!userInfo) {
            redirectToLogin();
        } else if (role && userInfo.role !== role) {
            window.location.href = '/index.html';
        }
    }).catch(() => {
        redirectToLogin();
    });
}

