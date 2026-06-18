(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('form[action="search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilterPanel(panelNode) {
        var scope = panelNode.closest('section') || document;
        var input = panelNode.querySelector('[data-local-search]');
        var chips = Array.prototype.slice.call(panelNode.querySelectorAll('[data-filter]'));
        var result = panelNode.querySelector('[data-result-text]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var activeCategory = 'all';

        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var category = card.getAttribute('data-category') || '';
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var categoryMatch = activeCategory === 'all' || category === activeCategory;
                var queryMatch = !query || text.indexOf(query) !== -1;
                var show = categoryMatch && queryMatch;
                card.classList.toggle('hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (result) {
                result.textContent = visible ? '已筛选出匹配内容' : '暂无匹配内容';
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && !input.value) {
                input.value = query;
            }
            input.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeCategory = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                apply();
            });
        });

        apply();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(setupFilterPanel);

    document.querySelectorAll('.video-player').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');
        var source = player.getAttribute('data-src');
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached || !video || !source) {
                return;
            }

            if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        player.classList.remove('playing');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            attached = true;
        }

        function playVideo() {
            attachSource();
            if (!video) {
                return;
            }
            var attempt = video.play();
            player.classList.add('playing');
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    player.classList.remove('playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('playing');
                }
            });
            video.addEventListener('click', function () {
                attachSource();
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });

    var topButton = document.querySelector('.back-to-top');
    if (topButton) {
        window.addEventListener('scroll', function () {
            topButton.classList.toggle('show', window.scrollY > 360);
        });
        topButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();
