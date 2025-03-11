document.addEventListener("DOMContentLoaded", async () => {
    const slidesContainer = document.querySelector('.slides');
    const paginationContainer = document.querySelector('.pagination');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    const imageFileNames = ['0', '3'];
    const images = imageFileNames.map((name) => `./img/${name}.webp`);

    let currentIndex = 1;
    let interval = null;
    let startX = 0;
    let moveX = 0;
    let isDragging = false;
    let currentTranslate = 0;

    function initSlider() {
        slidesContainer.innerHTML = '';
        
        const extendedImages = [images[images.length - 1], ...images, images[0]];
        extendedImages.forEach(img => addSlide(img));

        paginationContainer.innerHTML = images.map((_, index) => `<div class="dot" data-index="${index + 1}"></div>`).join('');
        document.querySelectorAll('.dot')[0].classList.add('active');

        addDotListeners();
        addSwipeListeners();
        updateSlider(true);
        startInterval();
    }

    function addSlide(imgSrc) {
        const slide = document.createElement('div');
        slide.classList.add('slide');
        slide.innerHTML = `<img src="${imgSrc}" alt="slider">`;
        slidesContainer.appendChild(slide);
    }

    function updateSlider(instant = false) {
        slidesContainer.style.transition = instant ? 'none' : 'transform 0.3s ease';
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function updatePagination() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === (currentIndex - 1 + images.length) % images.length);
        });
    }

    function changeSlide(newIndex) {
        currentIndex = newIndex;
        updateSlider();
        updatePagination();

        setTimeout(() => {
            if (currentIndex > images.length) {
                currentIndex = 1;
                updateSlider(true);
            } else if (currentIndex === 0) {
                currentIndex = images.length;
                updateSlider(true);
            }
        }, 300);

        resetInterval();
    }

    function addDotListeners() {
        document.querySelectorAll('.dot').forEach((dot) => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                if (!isNaN(index)) {
                    changeSlide(index);
                }
            });
        });
    }

    function addSwipeListeners() {
        function startDrag(x) {
            isDragging = true;
            startX = x;
            currentTranslate = -currentIndex * slidesContainer.clientWidth;
            slidesContainer.style.transition = 'none';
            clearInterval(interval);
    
            // Добавляем обработчики только в пределах слайдера
            slidesContainer.addEventListener('mousemove', onMoveDrag);
            slidesContainer.addEventListener('mouseup', onEndDrag);
            slidesContainer.addEventListener('mouseleave', onEndDrag);
            slidesContainer.addEventListener('touchmove', onMoveDrag);
            slidesContainer.addEventListener('touchend', onEndDrag);
        }
    
        function onMoveDrag(event) {
            if (!isDragging) return;
            const x = event.touches ? event.touches[0].clientX : event.clientX;
            moveX = x - startX;
            slidesContainer.style.transform = `translateX(${currentTranslate + moveX}px)`;
        }
    
        function onEndDrag() {
            if (!isDragging) return;
            isDragging = false;
            slidesContainer.style.transition = 'transform 0.3s ease';
        
            if (Math.abs(moveX) > slidesContainer.clientWidth / 4) {
                currentIndex += moveX > 0 ? -1 : 1;
            }
        
            updateSlider();
            updatePagination(); // ✅ Обновляем пагинацию
            resetInterval();    // ✅ Перезапускаем таймер
        
            // Ждем окончания анимации перед проверкой крайних слайдов
            slidesContainer.addEventListener('transitionend', checkLoop, { once: true });
        
            moveX = 0;
        
            // Убираем обработчики
            slidesContainer.removeEventListener('mousemove', onMoveDrag);
            slidesContainer.removeEventListener('mouseup', onEndDrag);
            slidesContainer.removeEventListener('mouseleave', onEndDrag);
            slidesContainer.removeEventListener('touchmove', onMoveDrag);
            slidesContainer.removeEventListener('touchend', onEndDrag);
        }
        
        function checkLoop() {
            if (currentIndex > images.length) {
                // Перескакиваем мгновенно к первому слайду (без анимации)
                currentIndex = 1;
                updateSlider(true);
            } else if (currentIndex === 0) {
                // Перескакиваем мгновенно к последнему слайду
                currentIndex = images.length;
                updateSlider(true);
            }
        }
    
        slidesContainer.addEventListener('mousedown', (event) => startDrag(event.clientX));
        slidesContainer.addEventListener('touchstart', (event) => startDrag(event.touches[0].clientX));
    }

    prevBtn.addEventListener('click', () => changeSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => changeSlide(currentIndex + 1));

    document.addEventListener('keydown', ({ key }) => {
        if (key === 'ArrowLeft') changeSlide(currentIndex - 1);
        if (key === 'ArrowRight') changeSlide(currentIndex + 1);
    });

    function startInterval() {
        if (!interval) {
            interval = setInterval(() => changeSlide(currentIndex + 1), 3000);
        }
    }

    function resetInterval() {
        clearInterval(interval);
        interval = null;
        startInterval();
    }

    initSlider();
});
