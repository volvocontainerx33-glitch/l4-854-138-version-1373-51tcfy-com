(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  window.createMoviePlayer = function (source) {
    ready(function () {
      var video = document.querySelector(".movie-video");
      var overlay = document.querySelector(".player-overlay");
      var button = document.querySelector(".player-start");
      if (!video || !source) {
        return;
      }
      var hlsInstance = null;
      var attached = false;
      var attachSource = function () {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      };
      var play = function () {
        attachSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener("click", play);
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
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
