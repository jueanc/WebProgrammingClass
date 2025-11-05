(function () {
  'use strict';
  const meme = document.getElementById('meme');
  const faceArea = document.getElementById('faceArea');
  if (!meme || !faceArea) return;

  faceArea.addEventListener('click', (e) => {
    e.preventDefault();
    meme.src = '../Photo/MemeManProfileEyes.png'; // flash
    setTimeout(() => {
      meme.src = '../Photo/MemeManProfile.png';
      window.location.href = 'Index.html';
    }, 444);
  });
})();
