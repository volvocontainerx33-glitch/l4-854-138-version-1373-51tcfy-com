(function () {
  function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var button = document.getElementById(config.buttonId);
    var hls = null;
    var loaded = false;

    if (!video || !cover || !button) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(config.url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          cover.classList.remove("is-hidden");
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.url;
      } else {
        cover.classList.remove("is-hidden");
      }
    }

    function start() {
      load();
      cover.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      video.play().catch(function () {
        cover.classList.remove("is-hidden");
      });
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });

    cover.addEventListener("click", start);

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
