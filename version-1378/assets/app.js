(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-search]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-item]"));
      var empty = scope.querySelector("[data-empty-state]");
      if (!items.length) {
        return;
      }

      function apply() {
        var query = normalize(search ? search.value : "");
        var visible = 0;
        items.forEach(function (item) {
          var text = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-year"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" "));
          var matched = !query || text.indexOf(query) !== -1;
          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter");
            var value = normalize(select.value);
            var current = normalize(item.getAttribute("data-" + key));
            if (value && current.indexOf(value) === -1) {
              matched = false;
            }
          });
          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var attached = false;
      var hls = null;
      if (!video || !button || !stream) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      }

      function play() {
        attach();
        var promise = video.play();
        shell.classList.add("is-playing");
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
