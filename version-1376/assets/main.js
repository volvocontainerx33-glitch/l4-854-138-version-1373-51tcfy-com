(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
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
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        autoplay();
      });
    });

    show(0);
    autoplay();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    if (!inputs.length || !window.MOVIES) {
      return;
    }

    inputs.forEach(function (input) {
      var panel = input.parentElement.querySelector("[data-search-panel]");

      if (!panel) {
        return;
      }

      function render() {
        var query = normalize(input.value);
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }

        var results = window.MOVIES.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.year,
            movie.region,
            movie.genre,
            movie.channel
          ].join(" "));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 12);

        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
          panel.classList.add("is-open");
          return;
        }

        panel.innerHTML = results.map(function (movie) {
          return [
            '<a class="search-result" href="./' + movie.url + '">',
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">',
            '<span>',
            '<strong>' + movie.title + '</strong>',
            '<span>' + movie.year + ' · ' + movie.region + ' · ' + movie.channel + '</span>',
            '</span>',
            '</a>'
          ].join("");
        }).join("");
        panel.classList.add("is-open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") {
          return;
        }
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });

      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupFilters() {
    var filter = document.querySelector("[data-filter]");
    if (!filter) {
      return;
    }

    var search = filter.querySelector("[data-filter-search]");
    var year = filter.querySelector("[data-filter-year]");
    var sort = filter.querySelector("[data-filter-sort]");
    var grid = document.querySelector("[data-filter-grid]");
    var empty = document.querySelector("[data-filter-empty]");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-item"));

    function apply() {
      var query = normalize(search ? search.value : "");
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre
        ].join(" "));
        var ok = (!query || haystack.indexOf(query) !== -1) &&
          (!yearValue || card.dataset.year === yearValue);

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      var activeCards = cards.filter(function (card) {
        return card.style.display !== "none";
      });

      if (sort && sort.value) {
        activeCards.sort(function (a, b) {
          if (sort.value === "year") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (sort.value === "rating") {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          }
          if (sort.value === "views") {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          return 0;
        });
        activeCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
