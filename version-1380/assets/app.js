(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = bySelector('[data-hero-slide]', root);
    var dots = bySelector('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupForms() {
    bySelector('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = 'library.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupFilters() {
    bySelector('[data-search-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var yearSelect = scope.querySelector('[data-year-select]');
      var typeSelect = scope.querySelector('[data-type-select]');
      var items = bySelector('[data-search-item]', scope);
      if (!items.length) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        items.forEach(function (item) {
          var title = normalize(item.getAttribute('data-title'));
          var itemYear = normalize(item.getAttribute('data-year'));
          var region = normalize(item.getAttribute('data-region'));
          var itemType = normalize(item.getAttribute('data-type'));
          var genre = normalize(item.getAttribute('data-genre'));
          var category = normalize(item.getAttribute('data-category'));
          var haystack = [title, itemYear, region, itemType, genre, category].join(' ');
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var yearMatch = !year || itemYear === year;
          var typeMatch = !type || itemType === type;
          item.classList.toggle('is-hidden', !(keywordMatch && yearMatch && typeMatch));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.initializePlayer = function (videoId, overlayId, buttonId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    if (!video || !overlay || !button || !source) {
      return;
    }
    var ready = false;
    var wantsPlay = false;
    var hlsInstance = null;

    function begin() {
      wantsPlay = true;
      overlay.classList.add('is-hidden');
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (wantsPlay) {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    function handleKey(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        begin();
      }
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      begin();
    });
    overlay.addEventListener('click', begin);
    overlay.addEventListener('keydown', handleKey);
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupForms();
    setupFilters();
  });
})();
