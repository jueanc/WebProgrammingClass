(function(){
  'use strict';
  // ===== Canvas Day/Night =====
  let shuffleStamp = 0; // 每次進夜晚就 +1，用來觸發每棟樓重洗一次
  shuffleStamp = 1; // 讓每棟樓知道：現在是第1次夜晚

  const canvas=document.getElementById('myCanvas4');
  const btn=document.getElementById('toggle');
  if(canvas && canvas.getContext){
    const ctx=canvas.getContext('2d');
    const dpr=Math.max(1,Math.floor(window.devicePixelRatio||1));
    const CSS_W=800,CSS_H=500;
    canvas.width=CSS_W*dpr; canvas.height=CSS_H*dpr; ctx.scale(dpr,dpr);

    let dayFactor=0,animFrom=0,animTo=0,animStart=0,animDur=900;
    const lerp=(a,b,t)=>a+(b-a)*t;
    const clamp01=x=>Math.max(0,Math.min(1,x));
    const ease=x=>(x<0.5?2*x*x:1-Math.pow(-2*x+2,2)/2);
    const hex2rgb=h=>{h=h.replace('#','');return{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}};
    const mix=(a,b,t)=>`rgb(${Math.round(lerp(a.r,b.r,t))},${Math.round(lerp(a.g,b.g,t))},${Math.round(lerp(a.b,b.b,t))})`;
    const mixColor=(c1,c2,t)=>mix(hex2rgb(c1),hex2rgb(c2),t);

    // Sky / ground / buildings palette
    const SKY_TOP_N='#065084',SKY_BOT_N='#0b0c0fff',SKY_TOP_D='#92dbf8ff',SKY_BOT_D='#fff1a1';
    const B1_N='#37353E',B1_D='#7e7f91',B2_N='#44444E',B2_D='#9b9cae';
    const TEXT_N='#ffffff',TEXT_D='#333333';
    const ROAD_D = '#9e9e9e', ROAD_N = '#3f3f46';
    const GRASS_D = '#7ec850', GRASS_N = '#2e4a2e';
    const LINE_D = '#ffd54f', LINE_N = '#ffe082';

    // Stars / clouds
    const stars=Array.from({length:90},()=>({x:Math.random()*CSS_W,y:Math.random()*300,r:Math.random()*1.4+.3,base:Math.random()*.5+.5,speed:Math.random()*.02+.005,phase:Math.random()*Math.PI*2}));
    const clouds=Array.from({length:6},()=>({x:Math.random()*CSS_W,y:Math.random()*120+30,s:Math.random()*.5+.8,v:Math.random()*.3+.2}));
    function drawCloud(x,y,s){ctx.fillStyle='white';ctx.beginPath();ctx.arc(x-20*s,y,16*s,0,Math.PI*2);ctx.arc(x,y-8*s,22*s,0,Math.PI*2);ctx.arc(x+22*s,y,16*s,0,Math.PI*2);ctx.fill();}

    // Buildings (base layer)
    const buildings=[
      {x:60,y:220,w:80,h:180},
      {x:180,y:200,w:80,h:200},
      {x:290,y:160,w:80,h:240},
      {x:450,y:190,w:80,h:210},
      {x:580,y:180,w:80,h:220}
    ];
    // 🌙 啟動時如果是夜晚(dayFactor=0)，預先洗一次亮燈 pattern
if (dayFactor < 0.5) {
  buildings.forEach(b=>{
    const cols = Math.max(2, Math.floor(b.w / 16));
    const rows = Math.max(3, Math.floor(b.h / 20));
    const total = rows * cols;
    b.pattern = Array.from({length: total}, () => Math.random() < 0.4);
    b._stamp = shuffleStamp; // 記住這是目前的版本
  });
}


    // ===== No-flicker buildings =====
    function drawBuilding(b, i, t) {
      // t = dayFactor
      const body = mixColor(i%2?B2_N:B1_N, i%2?B2_D:B1_D, t);

      // 主體
      ctx.fillStyle = body;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // 邊框 + 高光
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

      // 右側微陰影
      const side = ctx.createLinearGradient(b.x, b.y, b.x+b.w, b.y);
      side.addColorStop(0, 'rgba(0,0,0,0)');
      side.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = side;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // 屋頂
      ctx.fillStyle = 'rgba(255,255,255,'+(0.08 + 0.1*t)+')';
      ctx.fillRect(b.x, b.y-6, b.w, 6);

      // 天線
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.moveTo(b.x + b.w*0.7, b.y-6);
      ctx.lineTo(b.x + b.w*0.7, b.y-18);
      ctx.stroke();

      // 窗戶格
      const cols = Math.max(2, Math.floor(b.w / 16));
      const rows = Math.max(3, Math.floor(b.h / 20));
      const total = rows * cols;
      const padX = 6, padY = 10;
      const cellW = (b.w - padX*2) / cols;
      const cellH = (b.h - padY*2) / rows;

            // 生成固定的亮窗 pattern（僅第一次）
      if (!b._stamp) b._stamp = -1;        // 每棟樓自己的戳記
      if (!b.pattern || b.pattern.length !== total) b.pattern = new Array(total).fill(false);

      // 若偵測到新的夜晚戳記，才重洗（每棟一次）
      if (b._stamp !== shuffleStamp) {
        // 只有在夜晚才真的洗；白天切換不動
        if (animTo < animFrom) {
          for (let i = 0; i < total; i++) b.pattern[i] = Math.random() < 0.5; 
        }
        b._stamp = shuffleStamp;
      }

      // 顏色
      const winOff = mixColor('#5d6478', '#2a2f3a', t);
      const nightIntensity = Math.pow(1 - t, 1.5); 
      const winOn  = mixColor('#3e3e3e', '#ffe9a8', nightIntensity);

      for (let r=0; r<rows; r++){
        for (let c=0; c<cols; c++){
          const wx = b.x + padX + c*cellW + 2;
          const wy = b.y + padY + r*cellH + 2;
          const ww = cellW - 4;
          const wh = cellH - 6;

          const idx = r*cols + c;
          const on = (t < 0.9) && b.pattern[idx];

          ctx.fillStyle = on ? winOn : winOff;
          ctx.fillRect(wx, wy, ww, wh);

          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(wx+1, wy+1, 2, wh-2);
          ctx.globalAlpha = 1;
        }
      }
    }

    // 地面（草地 + 馬路 + 虛線）
    function drawGround(t){
      const grass = ctx.createLinearGradient(0, 400, 0, 500);
      grass.addColorStop(0, mixColor(GRASS_N, GRASS_D, t));
      grass.addColorStop(1, mixColor('#1d3a1d', '#5aa53e', t));
      ctx.fillStyle = grass;
      ctx.fillRect(0, 400, CSS_W, 100);

      const roadH = 42;
      const roadY = 400 + (100-roadH)/2;
      const road = ctx.createLinearGradient(0, roadY, 0, roadY+roadH);
      road.addColorStop(0, mixColor(ROAD_N, ROAD_D, t));
      road.addColorStop(1, mixColor('#2e2e37', '#b0b0b0', t));
      ctx.fillStyle = road;
      ctx.fillRect(0, roadY, CSS_W, roadH);

      ctx.lineWidth = 4;
      ctx.setLineDash([18, 12]);
      ctx.strokeStyle = mixColor(LINE_N, LINE_D, t);
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH/2);
      ctx.lineTo(CSS_W, roadY + roadH/2);
      ctx.stroke();
      ctx.setLineDash([]);

      const curb = ctx.createLinearGradient(0, roadY-6, 0, roadY);
      curb.addColorStop(0, 'rgba(0,0,0,0.18)');
      curb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = curb;
      ctx.fillRect(0, roadY-6, CSS_W, 6);
    }
      function drawHouse(t){
        const houseW = 32, houseH = 28;
        const roofH  = 15;
        const x = (CSS_W - houseW) / 2;
        const baseY = 400;
        const y = baseY - houseH;

        const bodyCol = mixColor('#37353E', '#7e7f91', t);
        const roofCol = mixColor('#5c2525ff', '#b55656', t);
        const strokeCol = 'rgba(0,0,0,0.25)';

        ctx.fillStyle = bodyCol;
        ctx.fillRect(x, y, houseW, houseH);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 0.7;
        ctx.strokeRect(x + 0.35, y + 0.35, houseW - 0.7, houseH - 0.7);

        const cx = x + houseW/2;
        ctx.beginPath();
        ctx.moveTo(x - 2, y);
        ctx.lineTo(cx, y - roofH);
        ctx.lineTo(x + houseW + 2, y);
        ctx.closePath();
        ctx.fillStyle = roofCol;
        ctx.fill();

        const roofGrad = ctx.createLinearGradient(x, y - roofH, x + houseW, y);
        roofGrad.addColorStop(0, 'rgba(255,255,255,'+(0.04 + 0.05*t)+')');
        roofGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = roofGrad;
        ctx.fill();

        const night = 1 - t;
        const winOff = mixColor('#5d6478', '#2a2f3a', t);
        const winOn  = mixColor('#3e3e3e', '#ffe9a8', Math.pow(night, 1.3));
        const winCol = (t < 0.95) ? winOn : winOff;

        const winW = 8, winH = 9;
        const winX = x + (houseW - winW)/2 + 3; // 偏右
        const winY = y + 8;

        ctx.fillStyle = winCol;
        ctx.fillRect(winX, winY, winW, winH);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(winX + 0.25, winY + 0.25, winW - 0.5, winH - 0.5);

        // 地面陰影
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, baseY - 1, houseW, 2);
      }


    function render(ts){
      if(animStart){
        const raw=clamp01((ts-animStart)/animDur);
        const e=ease(raw);
        dayFactor=lerp(animFrom,animTo,e);
        if(raw>=1)animStart=0;
      }

      const skyTop=mixColor(SKY_TOP_N,SKY_TOP_D,dayFactor);
      const skyBot=mixColor(SKY_BOT_N,SKY_BOT_D,dayFactor);
      const sky=ctx.createLinearGradient(0,0,0,400);
      sky.addColorStop(0,skyTop); sky.addColorStop(1,skyBot);
      ctx.fillStyle=sky; ctx.fillRect(0,0,CSS_W,400);

      const sunA=dayFactor, moonA=1-dayFactor;
      if(sunA>0){
        ctx.globalAlpha=sunA;
        let g=ctx.createRadialGradient(600,120,5,600,120,90);
        g.addColorStop(0,'#fff9c4'); g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(600,120,90,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(600,120,36,0,Math.PI*2); ctx.fillStyle='#fff59d'; ctx.fill();
      }
      if(moonA>0){
        ctx.globalAlpha=moonA;
        let g2=ctx.createRadialGradient(600,150,5,600,150,120);
        g2.addColorStop(0,'rgba(255,246,204,0.35)'); g2.addColorStop(1,'rgba(255,246,204,0)');
        ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(600,150,120,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(600,150,50,0,Math.PI*2); ctx.fillStyle='#fff6cc'; ctx.fill();
      }
      ctx.globalAlpha=1;

      // Stars
      const starGlobal=1-dayFactor;
      if(starGlobal>0){
        for(const s of stars){
          const flicker=s.base+.5*Math.sin(s.phase+ts*s.speed);
          ctx.globalAlpha=Math.max(0,Math.min(1,flicker*starGlobal));
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
          ctx.fillStyle='#fff'; ctx.fill();
        }
        ctx.globalAlpha=1;
      }

      if(dayFactor>0){
        ctx.globalAlpha=dayFactor;
        for(const c of clouds){ c.x+=c.v; if(c.x>CSS_W+40)c.x=-40; drawCloud(c.x,c.y,c.s*1.2); }
        ctx.globalAlpha=1;
      }

      drawGround(dayFactor);

      buildings.forEach((b,i)=> drawBuilding(b, i, dayFactor));

drawHouse(dayFactor);              

      ctx.shadowColor='rgba(0,0,0,0.4)';
      ctx.shadowBlur=6;
      ctx.fillStyle=mixColor('#ffffff','#1d1d1f',dayFactor);
      ctx.font='bold 30px "Segoe UI", Arial';
      ctx.fillText(dayFactor>0.5?'Sunny Day City':'Moon Night City',20,50);

      ctx.shadowBlur=3; ctx.font='18px "Segoe UI", Arial';
      ctx.fillText(dayFactor>0.5?'clouds drifting ☁️':'windows glowing ✨',20,80);
      ctx.shadowBlur=0;

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

btn?.addEventListener('click',()=>{
  const pressed = btn.getAttribute('aria-pressed') === 'true';
  animFrom = dayFactor;
  animTo   = pressed ? 0 : 1;       
  animStart = performance.now();
  btn.textContent = pressed ? '切換白天' : '切換黑夜';
  btn.setAttribute('aria-pressed', String(!pressed));

  if (animTo < animFrom) shuffleStamp++;
});

  }

  const wrap=document.querySelector('.polaroid-wrap');
  if(wrap){
    const imgs=[
      {src:'../Photo/PaulBear.png',cap:'Bear Coming'},
      {src:'../Photo/PaulBasket.png',cap:'Courtside Vibes'},
      {src:'../Photo/PaulOhtani.png',cap:'Two-Way Magic'},
      {src:'../Photo/PaulHipHop.png',cap:'Hip-Hop Night'},
      {src:'../Photo/PaulSoldier.png',cap:'Battle Ready'},
      {src:'../Photo/PaulKoLiang.png',cap:'Still Alive'}
    ];
    let idx=0;
    const imgEl=document.getElementById('polaImg');
    const capEl=document.getElementById('polaCap');
    const counterEl=document.getElementById('polaCounter');
    const chips=[...document.querySelectorAll('.thumbs .chip')];

    function renderP(i){
      idx=(i+imgs.length)%imgs.length;
      const cur=imgs[idx];
      imgEl.src=cur.src; capEl.textContent=cur.cap;
      counterEl.textContent=`Record ${idx+1} / ${imgs.length}`;
      chips.forEach((c,k)=>{c.classList.toggle('active',k===idx); c.setAttribute('aria-selected',k===idx);});
    }
    document.getElementById('prevBtn')?.addEventListener('click',()=>renderP(idx-1));
    document.getElementById('nextBtn')?.addEventListener('click',()=>renderP(idx+1));
    chips.forEach(ch=>ch.addEventListener('click',e=>renderP(parseInt(e.currentTarget.dataset.idx,10)||0)));
    wrap.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')renderP(idx-1);if(e.key==='ArrowRight')renderP(idx+1);});
    imgs.forEach(({src})=>{const im=new Image();im.src=src;});
    renderP(0);
  }
})();


