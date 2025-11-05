(function () {
  'use strict';
  function bindHoverBackground(hostSelector, videoId) {
    const host = document.querySelector(hostSelector);
    const bg = document.getElementById(videoId);
    if (!host || !bg) return;

    function show() { bg.classList.add('is-on'); bg.play?.().catch(()=>{}); }
    function hide() { bg.classList.remove('is-on'); bg.pause?.(); bg.currentTime = 0; }

    ['mouseenter','focusin'].forEach(e => host.addEventListener(e, show));
    ['mouseleave','focusout'].forEach(e => host.addEventListener(e, hide));
  }

  bindHoverBackground('.FireEX-img','fireex-bg');
  bindHoverBackground('.darvish-img','darvish-bg');
})();
