// js/auth.js
(function() {
    const STATUS_MAP_FROM_API = {
        'Новая': 'Новый',
        'В обработке': 'В работе',
        'Завершена': 'Завершено',
        'Отклонена': 'Отклонено'
    };

    window.mapLeadStatusFromApi = function(status) {
        return STATUS_MAP_FROM_API[status] || status;
    };

    window.mapLeadStatusToApi = function(status) {
        const reverse = Object.fromEntries(Object.entries(STATUS_MAP_FROM_API).map(([k, v]) => [v, k]));
        return reverse[status] || status;
    };

    function saveUserSession(user, token) {
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: token,
            loginTime: new Date().toISOString()
        }));
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) return;

            try {
                if (submitBtn) submitBtn.disabled = true;
                const result = await AutoPremiumAPI.login(email, password);
                saveUserSession(result.user, result.token);

                const redirect = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
                window.location.href = redirect;
            } catch (err) {
                alert(err.message || 'Ошибка входа');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const phone = document.getElementById('registerPhone').value;
            const terms = document.getElementById('registerTerms').checked;

            if (!name || !email || !password || !terms) return;

            try {
                await AutoPremiumAPI.register({ name, email, password, phone });
                alert('Регистрация успешна! Войдите в аккаунт.');
                window.location.href = 'login.html';
            } catch (err) {
                alert(err.message || 'Ошибка регистрации');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы действительно хотите выйти?')) {
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    }

    function checkAuth() {
        const user = localStorage.getItem('user');
        const protectedPages = ['dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (protectedPages.includes(currentPage)) {
            if (!user) {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
                return false;
            }

            const userData = JSON.parse(user);
            if (!['admin', 'manager'].includes(userData.role)) {
                alert('Доступ запрещен. Требуются права администратора или менеджера.');
                window.location.href = 'index.html';
                return false;
            }
        }
        return true;
    }

    checkAuth();
})();
