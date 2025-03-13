document.addEventListener("DOMContentLoaded", async () => {
    const slidesContainer = document.querySelector('.slides');
    const paginationContainer = document.querySelector('.pagination');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    const imageFileNames = ['0', '3', '8'];
    const images = imageFileNames.map((name) => `./img/${name}.webp`);

    let currentIndex = 1;
    let interval = null;
    let isAnimating = false; // Флаг для блокировки повторных действий

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
        if (isAnimating) return; // Блокируем повторные вызовы
        isAnimating = true;

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
            isAnimating = false; // Разблокируем после завершения анимации
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
        let isDragging = false;
        let startX = 0;
        let moveX = 0;

        function startDrag(x) {
            if (isAnimating) return; // Не даем свайпу срабатывать во время анимации
            isDragging = true;
            startX = x;
            slidesContainer.style.transition = 'none';
            clearInterval(interval);
        }

        function onMoveDrag(event) {
            if (!isDragging) return;
            const x = event.touches ? event.touches[0].clientX : event.clientX;
            moveX = x - startX;
            slidesContainer.style.transform = `translateX(${-(currentIndex * 100) + (moveX / slidesContainer.clientWidth) * 100}%)`;
        }

        function onEndDrag() {
            if (!isDragging) return;
            isDragging = false;
            slidesContainer.style.transition = 'transform 0.3s ease';

            if (Math.abs(moveX) > slidesContainer.clientWidth / 4) {
                currentIndex += moveX > 0 ? -1 : 1;
            }

            changeSlide(currentIndex);
            moveX = 0;
        }

        slidesContainer.addEventListener('mousedown', (event) => startDrag(event.clientX));
        slidesContainer.addEventListener('touchstart', (event) => startDrag(event.touches[0].clientX));

        document.addEventListener('mousemove', onMoveDrag);
        document.addEventListener('mouseup', onEndDrag);
        document.addEventListener('touchmove', onMoveDrag);
        document.addEventListener('touchend', onEndDrag);
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
