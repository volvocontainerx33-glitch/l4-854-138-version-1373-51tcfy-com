(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });

        panel.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                panel.classList.remove("is-open");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function go(step) {
            show(index + step);
            restart();
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                go(-1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                go(1);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            var keyword = root.querySelector("[data-filter-keyword]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var reset = root.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
            var empty = root.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (keyword && query) {
                keyword.value = query;
            }

            function apply() {
                var keywordValue = normalize(keyword ? keyword.value : "");
                var yearValue = normalize(year ? year.value : "");
                var typeValue = normalize(type ? type.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-line"),
                        card.getAttribute("data-column")
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var matched = true;

                    if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                        matched = false;
                    }

                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }

                    if (year) {
                        year.value = "";
                    }

                    if (type) {
                        type.value = "";
                    }

                    apply();
                });
            }

            apply();
        });
    }

    function initVideoPlayer(selector, playlistUrl) {
        var root = document.querySelector(selector);
        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-player-overlay]");
        var button = root.querySelector("[data-player-button]");
        var hls = null;

        if (!video) {
            return;
        }

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playlistUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(playlistUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = playlistUrl;
            }

            video.setAttribute("data-ready", "1");
        }

        function play() {
            attach();

            if (overlay) {
                overlay.hidden = true;
            }

            video.controls = true;
            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });

        attach();
    }

    window.Site = {
        initVideoPlayer: initVideoPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
