(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("open");
        toggle.classList.toggle("open", isOpen);
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length) {
      var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      var setSlide = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      };
      var prev = document.querySelector(".hero-control.prev");
      var next = document.querySelector(".hero-control.next");
      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          setSlide(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setSlide(i);
          restart();
        });
      });
      setSlide(0);
      start();
    }

    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      var regionSelect = document.querySelector("[data-region-filter]");
      var typeSelect = document.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".search-grid .movie-card"));
      var state = document.querySelector("[data-search-state]");
      var empty = document.querySelector(".empty-state");
      var normalize = function (value) {
        return String(value || "").toLowerCase().trim();
      };
      var run = function () {
        var term = normalize(searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var shown = 0;
        cards.forEach(function (card) {
          var hay = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchTerm = !term || hay.indexOf(term) !== -1;
          var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
          var matchType = !type || normalize(card.getAttribute("data-type")) === type;
          var visible = matchTerm && matchRegion && matchType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (state) {
          state.textContent = term || region || type ? "匹配到 " + shown + " 部影片" : "输入片名、地区、年份或标签进行筛选";
        }
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      };
      searchInput.addEventListener("input", run);
      if (regionSelect) {
        regionSelect.addEventListener("change", run);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", run);
      }
      run();
    }
  });
})();
