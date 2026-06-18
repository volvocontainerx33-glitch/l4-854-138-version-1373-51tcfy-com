(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        restart();
      });
    }

    setSlide(0);
    restart();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".movie-card"),
    );
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) return;

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function filter() {
      var term = normalize(input ? input.value : "");
      var genre = normalize(select ? select.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
          ].join(" "),
        );
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var show = matchesTerm && matchesGenre;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) input.addEventListener("input", filter);
    if (select) select.addEventListener("change", filter);
    filter();
  }

  window.initMoviePlayer = function (videoSrc) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playOverlay");
    if (!video || !videoSrc) return;

    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) return Promise.resolve();
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSrc;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          video.addEventListener("loadedmetadata", resolve, { once: true });
          window.setTimeout(resolve, 1200);
        });
      }

      video.src = videoSrc;
      return Promise.resolve();
    }

    function play() {
      load().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      });
      if (button) button.hidden = true;
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) play();
    });

    video.addEventListener("play", function () {
      if (button) button.hidden = true;
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
