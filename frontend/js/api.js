//const API_URL = 'http://localhost:8080/api/v1/';
const API_URL = 'https://273d5b7e-1034-4436-bdf6-d015b611e581.mock.pstmn.io/api/';

function concatUrl(endpoint) {
    return `${API_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}

export default class ApiClient {
    async get(endpoint) {
        try {
            return await fetch(concatUrl(endpoint), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        try {
            return await fetch(concatUrl(endpoint), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    }
}