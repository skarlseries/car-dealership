// js/catalog.js
(function() {
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop&crop=center&auto=format';
    let CAR_DATA = [];

    const grid = document.getElementById('catalogGrid');
    const resultCount = document.getElementById('resultCount');

    function formatPrice(price) {
        return '₽' + Number(price).toLocaleString('ru-RU');
    }

    function normalizeCar(car) {
        // Парсим строку картинок, если она пришла из БД в виде JSON-строки
        let parsedImages = [];
        try {
            if (car.images) {
                parsedImages = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
            }
        } catch (e) {
            console.error("Ошибка парсинга дополнительных картинок авто:", e);
        }

        // Если картинок нет, собираем массив из главного изображения
        let images = parsedImages && parsedImages.length ? parsedImages : [car.image || DEFAULT_IMAGE];
        
        // Гарантируем, что главная картинка идет первой в массиве
        if (car.image && !images.includes(car.image)) {
            images.unshift(car.image);
        }

        // Очищаем массив от пустых строк и пробелов
        images = images.filter(url => url && url.trim().length > 0);

        return {
            ...car,
            desc: car.description || car.desc || `${car.brand} ${car.model}`,
            image: car.image || images[0] || DEFAULT_IMAGE,
            images: images
        };
    }

    function getCarDetailUrl(id) {
        return 'car-detail.html?id=' + id;
    }

    function renderCars(cars) {
        if (!grid) return;

        grid.innerHTML = '';
        const count = cars.length;
        if (resultCount) resultCount.textContent = count;

        if (count === 0) {
            grid.innerHTML = '<div class="col-span-full py-20 text-center text-secondary">По вашему запросу ничего не найдено.</div>';
            return;
        }

        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card animate-fade-in';

            // Генерируем точки переключения картинок, если картинок больше одной
            let dotsHtml = '';
            if (car.images && car.images.length > 1) {
                dotsHtml = `<div class="car-card-dots">` + 
                    car.images.map((imgUrl, index) => `
                        <span class="gallery-dot ${index === 0 ? 'active' : ''}" 
                              data-img="${imgUrl}"
                              onmouseover="changeCatalogCardImage(this, '${imgUrl}')">
                        </span>
                    `).join('') + 
                `</div>`;
            }

            card.innerHTML = `
                <div class="car-card-image" style="position: relative; overflow: hidden;">
                    <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" class="main-catalog-img" style="width:100%; height:100%; object-fit:cover;">
                    <span class="car-card-badge">${car.status}</span>
                    ${car.mileage === 0 ? '<span class="car-card-badge" style="left: auto; right: 12px; background: #22c55e;">Модель ' + car.year + '</span>' : ''}
                    
                    ${dotsHtml}
                </div>
                <div class="car-card-body">
                    <div class="car-card-header">
                        <div>
                            <h3 class="car-card-title">${car.brand}</h3>
                            <p class="car-card-subtitle">${car.model}</p>
                        </div>
                        <span class="car-card-price">${formatPrice(car.price)}</span>
                    </div>
                    <p class="text-body-sm text-secondary" style="margin-bottom: 8px;">${car.desc}</p>
                    <div class="car-card-specs">
                        <div class="car-card-spec">
                            <span class="material-symbols-outlined">calendar_today</span>
                            ${car.year}
                        </div>
                        <div class="car-card-spec">
                            <span class="material-symbols-outlined">speed</span>
                            ${car.mileage === 0 ? '0 км' : car.mileage.toLocaleString() + ' км'}
                        </div>
                    </div>
                    <div class="car-card-footer">
                        <span class="text-body-sm text-secondary">${car.fuel}</span>
                        <a href="${getCarDetailUrl(car.id)}" class="btn btn-primary btn-sm">Подробнее</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Глобальная функция для смены главного изображения внутри карточки при наведении
    window.changeCatalogCardImage = function(dotElement, newSrc) {
        const imageContainer = dotElement.closest('.car-card-image');
        const mainImg = imageContainer.querySelector('.main-catalog-img');
        
        if (mainImg) {
            mainImg.src = newSrc;
        }

        // Переключаем активную точку только внутри текущей карточки
        imageContainer.querySelectorAll('.gallery-dot').forEach(dot => dot.classList.remove('active'));
        dotElement.classList.add('active');
    };

    async function loadCars() {
        const searchInput = document.getElementById('searchInput');
        const brandFilter = document.getElementById('brandFilter');
        const priceFilter = document.getElementById('priceFilter');
        const yearFilter = document.getElementById('yearFilter');

        const params = { limit: 50 };
        const search = searchInput ? searchInput.value.trim() : '';
        const brand = brandFilter ? brandFilter.value : '';
        const maxPrice = priceFilter ? priceFilter.value : '';
        const year = yearFilter ? yearFilter.value : '';

        if (search.length >= 2) params.search = search;
        if (brand) params.brand = brand;
        if (maxPrice && maxPrice !== '100000000') params.maxPrice = maxPrice;
        if (year) params.year = year;

        try {
            const response = await AutoPremiumAPI.getCars(params);
            CAR_DATA = (response.data || []).map(normalizeCar);
            renderCars(CAR_DATA);
        } catch (err) {
            console.error('Ошибка загрузки каталога:', err);
            if (grid) {
                grid.innerHTML = '<div class="col-span-full py-20 text-center text-secondary">Не удалось загрузить каталог. Запустите backend-сервер.</div>';
            }
        }
    }

    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');
    const yearFilter = document.getElementById('yearFilter');

    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(loadCars, 300);
        });
    }
    if (brandFilter) brandFilter.addEventListener('change', loadCars);
    if (priceFilter) priceFilter.addEventListener('change', loadCars);
    if (yearFilter) yearFilter.addEventListener('change', loadCars);

    loadCars();
})();