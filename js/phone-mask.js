// js/phone-mask.js
(function() {
    // Маска для телефона: +7 (XXX) XXX-XX-XX
    function phoneMask(input) {
        // Удаляем все нецифровые символы
        let value = input.value.replace(/\D/g, '');
        
        // Если строка пустая, ничего не делаем
        if (value.length === 0) {
            input.value = '';
            return;
        }
        
        // Форматируем номер
        let formatted = '+7';
        
        // Добавляем скобку после +7
        if (value.length > 1) {
            formatted += ' (';
        }
        
        // Добавляем первые 3 цифры кода
        if (value.length > 1) {
            formatted += value.substring(1, 4);
        }
        
        // Закрываем скобку
        if (value.length >= 4) {
            formatted += ') ';
        }
        
        // Добавляем следующие 3 цифры
        if (value.length > 4) {
            formatted += value.substring(4, 7);
        }
        
        // Добавляем дефис
        if (value.length >= 7) {
            formatted += '-';
        }
        
        // Добавляем следующие 2 цифры
        if (value.length > 7) {
            formatted += value.substring(7, 9);
        }
        
        // Добавляем дефис
        if (value.length >= 9) {
            formatted += '-';
        }
        
        // Добавляем последние 2 цифры
        if (value.length > 9) {
            formatted += value.substring(9, 11);
        }
        
        input.value = formatted;
    }

    // Находим все поля с классом phone-mask
    const phoneInputs = document.querySelectorAll('.phone-mask');
    
    phoneInputs.forEach(input => {
        // При вводе применяем маску
        input.addEventListener('input', function(e) {
            // Сохраняем позицию курсора
            const cursorPos = this.selectionStart;
            
            phoneMask(this);
            
            // Восстанавливаем позицию курсора
            if (cursorPos < this.value.length) {
                this.setSelectionRange(cursorPos, cursorPos);
            }
        });
        
        // При фокусе, если поле пустое, ставим +7
        input.addEventListener('focus', function() {
            if (this.value === '' || this.value === '+7') {
                this.value = '+7 ';
                // Перемещаем курсор после +7
                this.setSelectionRange(3, 3);
            }
        });
        
        // При потере фокуса, если введено только +7, очищаем
        input.addEventListener('blur', function() {
            const cleanValue = this.value.replace(/\D/g, '');
            if (cleanValue.length <= 1) {
                this.value = '';
            }
        });
        
        // При клике ставим курсор в конец
        input.addEventListener('click', function() {
            const cleanValue = this.value.replace(/\D/g, '');
            if (cleanValue.length <= 1) {
                this.value = '+7 ';
                this.setSelectionRange(3, 3);
            }
        });
        
        // Обработка клавиш Backspace и Delete
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // Если нажат Backspace, даем стандартную обработку
                setTimeout(() => {
                    const cleanValue = this.value.replace(/\D/g, '');
                    if (cleanValue.length <= 1) {
                        this.value = '';
                    } else {
                        phoneMask(this);
                    }
                }, 0);
            }
        });
    });
})();