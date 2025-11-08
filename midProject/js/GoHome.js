(function () {
  'use strict';
  const meme = document.getElementById('meme');
  const faceArea = document.getElementById('faceArea');
  if (!meme || !faceArea) return;

  faceArea.addEventListener('click', (e) => {
    e.preventDefault();
    meme.src = meme.src.replace('MemeManProfile.png', 'MemeManProfileEyes.png'); // 直接替換檔名
    setTimeout(() => {
      meme.src = meme.src.replace('MemeManProfileEyes.png', 'MemeManProfile.png');
      window.location.href = 'Index.html';
    }, 220);
  });
})();
