// js/GoHome.js
document.addEventListener('DOMContentLoaded', () => {
  const meme = document.getElementById('meme');
  const faceArea = document.getElementById('faceArea');
  if (!meme || !faceArea) return;

  const NORMAL = new URL('../Photo/MemeManProfile.png', location.href).href;
  const EYES   = new URL('../Photo/MemeManProfileEyes.png', location.href).href;

  // 先預載眼睛圖（遠端最關鍵）
  const pre = new Image();
  pre.src = EYES;

  faceArea.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      // 若尚未載完，等到載完（遠端第一次很容易卡在這）
      if (!pre.complete) {
        await new Promise(res => { pre.onload = res; pre.onerror = res; });
      }

      // 換成眼睛
      meme.src = EYES;

      // 確保真的解碼並可繪製
      if (meme.decode) {
        try { await meme.decode(); } catch {}   // 某些瀏覽器會丟錯，無視即可
      }

      // 兩次 rAF，給瀏覽器一次完整重繪週期
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 留點時間讓人眼看得到 300ms 左右就夠
      await new Promise(r => setTimeout(r, 320));
    } finally {
      meme.src = NORMAL;
      location.href = 'Index.html';
    }
  });
});
