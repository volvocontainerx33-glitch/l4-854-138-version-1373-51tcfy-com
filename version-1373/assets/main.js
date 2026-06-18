(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
      mobileToggle.textContent = isOpen ? "×" : "☰";
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 320) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    showHero(0);
    startHero();
  }

  var filterInput = document.getElementById("filterInput");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
  var filterChips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var activeFilter = "全部";

  function textOfCard(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-tags") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-genre") || ""
    ].join(" ").toLowerCase();
  }

  function applyFilter() {
    if (!filterCards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var chip = activeFilter === "全部" ? "" : activeFilter.toLowerCase();

    filterCards.forEach(function (card) {
      var value = textOfCard(card);
      var matchesQuery = !query || value.indexOf(query) !== -1;
      var matchesChip = !chip || value.indexOf(chip) !== -1;
      card.classList.toggle("is-hidden-by-filter", !(matchesQuery && matchesChip));
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      filterInput.value = q;
    }

    filterInput.addEventListener("input", applyFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeFilter = chip.getAttribute("data-filter") || "全部";
      filterChips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });
      applyFilter();
    });
  });

  if (filterChips.length) {
    filterChips[0].classList.add("is-active");
  }

  applyFilter();
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-video");
  var layer = document.querySelector(".player-layer");
  var attached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlay() {
    attachStream();
    video.controls = true;

    if (layer) {
      layer.classList.add("is-hidden");
    }

    var playTask = video.play();

    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        if (layer) {
          layer.classList.remove("is-hidden");
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener("click", startPlay);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener("play", function () {
    if (layer) {
      layer.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (layer) {
      layer.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
