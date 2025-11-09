// js/GoHome.js
document.addEventListener('DOMContentLoaded', () => {
  const meme = document.getElementById('meme');
  const faceArea = document.getElementById('faceArea');
  if (!meme || !faceArea) return;

  const NORMAL = new URL('../Photo/MemeManProfile.png', location.href).href;
  const EYES   = new URL('../Photo/MemeManProfileEyes.png', location.href).href;
  const pre = new Image(); pre.src = EYES;

  faceArea.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (!pre.complete) await new Promise(r => { pre.onload = r; pre.onerror = r; });
      meme.src = EYES;
      if (meme.decode) { try { await meme.decode(); } catch {} }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise(r => setTimeout(r, 320));
    } finally {
      meme.src = NORMAL;
      // 判斷：如果 body 有 data-page="home" → 去 About
      // 否則回首頁
      const target = document.body.dataset.page === 'home'
        ? 'About.html'
        : 'Index.html';
      location.href = target;
    }
  });
});
