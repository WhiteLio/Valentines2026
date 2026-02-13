document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // Configuration
    // ========================================
    const GIRL_TARGET = 'Shann';
    const BOY_TARGET = 'Lio';
    const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

    // ========================================
    // DOM Elements
    // ========================================
    const girlInput = document.getElementById('girlName');
    const boyInput = document.getElementById('boyName');
    const calculateBtn = document.getElementById('calculateBtn');
    const btnWrapper = document.getElementById('btn-wrapper');
    const navbar = document.getElementById('navbar');
    const calcSection = document.getElementById('calculator-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const timelineSection = document.getElementById('timeline-section');
    const footer = document.getElementById('footer');
    const scrollHint = document.getElementById('scroll-hint');
    const ringFill = document.getElementById('ring-fill');

    // ========================================
    // Input Rigging
    // ========================================
    const state = { girlCount: 0, boyCount: 0 };

    function setupInput(input, target, countKey) {
        let updating = false;

        input.addEventListener('input', () => {
            if (updating) return;
            updating = true;

            const currentLen = input.value.length;

            if (currentLen > state[countKey]) {
                state[countKey] = Math.min(state[countKey] + 1, target.length);
            } else if (currentLen < state[countKey]) {
                state[countKey] = Math.max(state[countKey] - 1, 0);
            }

            input.value = target.substring(0, state[countKey]);

            const len = input.value.length;
            input.setSelectionRange(len, len);

            updating = false;
            updateButton();
        });

        input.addEventListener('paste', (e) => e.preventDefault());
        input.addEventListener('drop', (e) => e.preventDefault());

        input.addEventListener('mouseup', () => {
            const len = input.value.length;
            input.setSelectionRange(len, len);
        });
    }

    function updateButton() {
        const ready = state.girlCount === GIRL_TARGET.length
            && state.boyCount === BOY_TARGET.length;

        calculateBtn.disabled = !ready;

        if (ready) {
            btnWrapper.classList.add('visible');
        } else {
            btnWrapper.classList.remove('visible');
        }
    }

    setupInput(girlInput, GIRL_TARGET, 'girlCount');
    setupInput(boyInput, BOY_TARGET, 'boyCount');

    // ========================================
    // Section Helpers
    // ========================================
    function showSection(el) {
        el.style.display = '';
    }

    function hideSection(el) {
        el.style.display = 'none';
    }

    // ========================================
    // Calculate Button - Orchestrated Flow
    // ========================================
    calculateBtn.addEventListener('click', () => {
        // Step 1: Fade out calculator + navbar
        navbar.classList.add('nav-hidden');
        calcSection.classList.add('fade-out');

        setTimeout(() => {
            // Step 2: Hide calculator, show loading
            hideSection(calcSection);
            showSection(loadingSection);
            void loadingSection.offsetHeight;
            loadingSection.classList.add('show');

            setTimeout(() => {
                // Step 3: Fade out loading
                loadingSection.classList.remove('show');

                setTimeout(() => {
                    // Step 4: Hide loading, show results
                    hideSection(loadingSection);

                    showSection(resultsSection);
                    showSection(timelineSection);
                    showSection(document.getElementById('valentine-message'));
                    showSection(footer);

                    void resultsSection.offsetHeight;
                    resultsSection.classList.add('show');

                    navbar.classList.remove('nav-hidden');

                    // Start ring animation, content reveals after it finishes
                    animatePercentage();
                    createFloatingHearts();
                    setupTimelineAnimations();
                }, 400);
            }, 2200);
        }, 500);
    });

    // ========================================
    // Percentage Counter + Ring + Content Reveal
    // ========================================
    function animatePercentage() {
        const el = document.getElementById('percentage');
        const target = 100;
        const duration = 2200;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(eased * target);

            el.textContent = value;

            // Update SVG ring
            const offset = RING_CIRCUMFERENCE * (1 - eased);
            ringFill.style.strokeDashoffset = offset;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ring complete: reveal surrounding content
                revealResultContent();
            }
        }

        requestAnimationFrame(update);
    }

    function revealResultContent() {
        const reveals = document.querySelectorAll('.result-reveal');
        reveals.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('revealed');
            }, i * 350);
        });
    }

    // ========================================
    // Floating Hearts (no rotation, 20 hearts)
    // ========================================
    function createFloatingHearts() {
        const container = document.getElementById('hearts-container');
        // Mostly hollow hearts (user liked those), some filled emoji
        const heartChars = ['\u2661', '\u2764\uFE0F'];

        for (let i = 0; i < 20; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
            heart.style.left = (Math.random() * 90 + 5) + '%';
            heart.style.fontSize = (Math.random() * 14 + 10) + 'px';
            heart.style.animationDuration = (Math.random() * 7 + 7) + 's';
            heart.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(heart);
        }
    }

    // ========================================
    // Scroll Hint Click
    // ========================================
    scrollHint.addEventListener('click', () => {
        timelineSection.scrollIntoView({ behavior: 'smooth' });
    });

    // ========================================
    // Timeline Scroll Animations (staggered)
    // ========================================
    function setupTimelineAnimations() {
        const items = document.querySelectorAll('.timeline-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const stagger = parseInt(item.dataset.stagger, 10) || 0;
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, stagger);
                    observer.unobserve(item);
                }
            });
        }, { threshold: 0.1 });

        items.forEach((item, index) => {
            item.dataset.stagger = index * 200;
            observer.observe(item);
        });
    }

    // ========================================
    // Choice Buttons (Calculate style, then selected/greyed)
    // ========================================
    document.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const allBtns = btn.closest('.choice-buttons').querySelectorAll('.choice-btn');
            allBtns.forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // ========================================
    // Footer Links Sound Effect
    // ========================================
    const fahSound = document.getElementById('fah-sound');
    document.querySelectorAll('.footer-links a').forEach((link) => {
        link.addEventListener('click', () => {
            fahSound.currentTime = 0;
            fahSound.play();
        });
    });
});
