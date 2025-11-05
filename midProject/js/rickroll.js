(function () {
  'use strict';
  const links = document.querySelectorAll('.rr-link');
  const bg = document.getElementById('rr-bg');
  if (!bg || !links.length) return;

  function show() { bg.classList.add('is-on'); bg.play?.().catch(()=>{}); }
  function hide() { bg.classList.remove('is-on'); bg.pause?.(); bg.currentTime = 0; }

  links.forEach(a=>{
    a.addEventListener('mouseenter', show);
    a.addEventListener('mouseleave', hide);
    a.addEventListener('focus', show);
    a.addEventListener('blur', hide);
  });
})();
