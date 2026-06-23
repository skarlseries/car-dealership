(function(global) {
    const API_BASE = (global.AUTOPREMIUM_API_URL || (window.location.port === '3000' ? '' : 'http://localhost:3000')) + '/api';

    function getToken() {
        const user = localStorage.getItem('user');
        if (!user) return null;
        try {
            const parsed = JSON.parse(user);
            return parsed.token || null;
        } catch {
            return null;
        }
    }

    async function request(path, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        const token = getToken();
        if (token) headers.Authorization = 'Bearer ' + token;

        const response = await fetch(API_BASE + path, { ...options, headers });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(data.error || 'Ошибка запроса');
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    }

    global.AutoPremiumAPI = {
        baseUrl: API_BASE,

        getCars(params = {}) {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value != null && value !== '') query.set(key, value);
            });
            const qs = query.toString();
            return request('/cars' + (qs ? '?' + qs : ''));
        },

        getCar(id) {
            return request('/cars/' + id);
        },

        submitTestDrive(data) {
            return request('/test-drive', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        login(email, password) {
            return request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
        },

        register(data) {
            return request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        getMe() {
            return request('/auth/me');
        },

        getAdminStats() {
            return request('/admin/stats');
        },

        getAdminRequests() {
            return request('/admin/requests');
        },

        updateRequest(id, status) {
            return request('/admin/requests/' + id, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        },

        deleteRequest(id) {
            return request('/admin/requests/' + id, { method: 'DELETE' });
        },

        getAdminCars() {
            return request('/admin/cars');
        },

        createCar(data) {
            return request('/admin/cars', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        updateCar(id, data) {
            return request('/admin/cars/' + id, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        deleteCar(id) {
            return request('/admin/cars/' + id, { method: 'DELETE' });
        }
    };
})(window);
