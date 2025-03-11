document.addEventListener("DOMContentLoaded", async () => {
    const slidesContainer = document.querySelector('.slides');
    const paginationContainer = document.querySelector('.pagination');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    const imageFileNames = ['0', '3', '8'];
    const images = imageFileNames.map((name) => `./img/${name}.webp`);

    let currentIndex = 1;
    let isTransitioning = false;
    let interval;
    let startX = 0;
    let moveX = 0;
    let isDragging = false;

    // Инициализация слайдера
    function initSlider() {
        slidesContainer.innerHTML = '';

        addSlide(images[images.length - 1], true);
        images.forEach((img) => addSlide(img));
        addSlide(images[0], true);

        paginationContainer.innerHTML = images
            .map((_, index) => `<div class="dot" data-index="${index + 1}"></div>`)
            .join('');
        
        document.querySelectorAll('.dot')[0].classList.add('active');

        addDotListeners();
        addSwipeListeners();
        updateSlider(true);
        startInterval();
    }

    // Добавление слайда
    function addSlide(imgSrc, isClone = false) {
        const slide = document.createElement('div');
        slide.classList.add('slide', isClone && 'clone');
        slide.innerHTML = `<img src="${imgSrc}" alt="slider">`;
        slidesContainer.appendChild(slide);
    }

    // Обновление активного слайда
    function updateSlider(instant = false) {
        slidesContainer.style.transition = instant ? 'none' : 'transform 0.3s ease';
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Обновление точек пагинации
    function updatePagination() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === (currentIndex - 1 + images.length) % images.length);
        });
    }

    // Переключение слайда
    function changeSlide(newIndex) {
        if (isTransitioning) return;
        isTransitioning = true;

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
            isTransitioning = false;
        }, 500);

        resetInterval();
    }

    // Добавление обработчиков клика на точки пагинации
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

    // Добавление обработчиков свайпа
    function addSwipeListeners() {
        slidesContainer.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
        });

        slidesContainer.addEventListener('touchmove', (event) => {
            moveX = event.touches[0].clientX - startX;
        });

        slidesContainer.addEventListener('touchend', () => {
            if (moveX > 50) {
                changeSlide(currentIndex - 1);
            } else if (moveX < -50) {
                changeSlide(currentIndex + 1);
            }
        });

        slidesContainer.addEventListener('mousedown', (event) => {
            isDragging = true;
            startX = event.clientX;
        });

        slidesContainer.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            moveX = event.clientX - startX;
        });

        slidesContainer.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            if (moveX > 50) {
                changeSlide(currentIndex - 1);
            } else if (moveX < -50) {
                changeSlide(currentIndex + 1);
            }
        });

        slidesContainer.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    // Кнопки навигации
    prevBtn.addEventListener('click', () => changeSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => changeSlide(currentIndex + 1));

    // Управление клавиатурой
    document.addEventListener('keydown', ({ key }) => {
        if (key === 'ArrowLeft') changeSlide(currentIndex - 1);
        if (key === 'ArrowRight') changeSlide(currentIndex + 1);
    });

    // Автопереключение
    function startInterval() {
        interval = setInterval(() => changeSlide(currentIndex + 1), 3000);
    }

    function resetInterval() {
        clearInterval(interval);
        startInterval();
    }

    initSlider();
});
