(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
    setupPlayers();
    applyQuerySearch();
  });

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
      var grid = document.querySelector('[data-filter-grid]');
      var empty = document.querySelector('[data-empty-result]');
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var currentType = 'all';

      function run() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category
          ].join(' ').toLowerCase();
          var typeText = (card.dataset.type || '') + ' ' + (card.dataset.genre || '');
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchType = currentType === 'all' || typeText.indexOf(currentType) !== -1;
          var visible = matchKeyword && matchType;
          card.style.display = visible ? '' : 'none';
          if (visible) shown += 1;
        });
        if (empty) empty.classList.toggle('is-visible', shown === 0);
      }

      if (input) input.addEventListener('input', run);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentType = button.getAttribute('data-filter-type') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          run();
        });
      });
      run();
    });
  }

  function applyQuerySearch() {
    var input = document.querySelector('[data-search-input]');
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q');
    if (!value) return;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) return;
    function toggle() {
      button.classList.toggle('is-visible', window.scrollY > 320);
    }
    window.addEventListener('scroll', toggle, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;
      if (!video || !trigger || !stream) return;

      function attach() {
        if (loaded) return;
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        trigger.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      trigger.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!loaded) play();
      });
      video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        trigger.classList.remove('is-hidden');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }
})();
