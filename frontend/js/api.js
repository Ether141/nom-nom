export const API_URL = 'http://localhost:5000/api/';

function concatUrl(endpoint) {
    return `${API_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}

export default class ApiClient {
    async get(endpoint) {
        return await fetch(concatUrl(endpoint), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async post(endpoint, data, credentials = false) {
        return await fetch(concatUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: credentials ? 'include' : undefined
        });
    }

    async put(endpoint, data, credentials = false) {
        return await fetch(concatUrl(endpoint), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: credentials ? 'include' : undefined
        });
    }

    async delete(endpoint, credentials = false) {
        return await fetch(concatUrl(endpoint), {
            method: 'DELETE',
            credentials: credentials ? 'include' : undefined
        });
    }

    isLoggedIn() {
        const session_id = localStorage.getItem('sessionId');
        return session_id !== null && session_id !== undefined && session_id !== '';
    }

    async fetchUserInfo() {
        if (!this.isLoggedIn()) {
            return null;
        }

        try {
            const response = await this.post(`user/get`, null, true);

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch {
            return null;
        }
    }

    async logout() {
        if (!this.isLoggedIn()) {
            return null;
        }

        try {
            const response = await this.post(`user/logout`, null, true);

            if (response.ok) {
                localStorage.removeItem('sessionId');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}