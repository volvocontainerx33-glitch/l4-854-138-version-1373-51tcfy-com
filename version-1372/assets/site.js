(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('.home-hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function begin() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        begin();
      });
    });

    if (slides.length > 1) {
      begin();
    }
  }

  var filterForm = document.querySelector('.filter-bar');
  if (filterForm) {
    var input = filterForm.querySelector('[data-filter-input]');
    var categorySelect = filterForm.querySelector('[data-filter-category]');
    var yearSelect = filterForm.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var empty = document.querySelector('.filter-empty');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
      var q = normalize(input ? input.value : '');
      var cat = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchedQuery = !q || haystack.indexOf(q) !== -1;
        var matchedCat = !cat || card.getAttribute('data-category') === cat;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matched = matchedQuery && matchedCat && matchedYear;
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, runFilter);
      }
      if (categorySelect) {
        categorySelect.addEventListener(eventName, runFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, runFilter);
      }
    });

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });

    runFilter();
  }
})();

function initVideoPlayer(src) {
  var video = document.querySelector('.player-video');
  var overlay = document.querySelector('.player-overlay');
  var button = document.querySelector('.player-button');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !src) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    loadStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }
  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
