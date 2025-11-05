(function(){
  'use strict';
  // ===== Canvas Day/Night =====
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
    const SKY_TOP_N='#065084',SKY_BOT_N='#222831',SKY_TOP_D='#87ceeb',SKY_BOT_D='#fff1a1';
    const GROUND_N='#111111',GROUND_D='#4caf50';
    const B1_N='#37353E',B1_D='#7e7f91',B2_N='#44444E',B2_D='#9b9cae';
    const TEXT_N='#ffffff',TEXT_D='#333333';
    const stars=Array.from({length:90},()=>({x:Math.random()*CSS_W,y:Math.random()*300,r:Math.random()*1.4+.3,base:Math.random()*.5+.5,speed:Math.random()*.02+.005,phase:Math.random()*Math.PI*2}));
    const clouds=Array.from({length:6},()=>({x:Math.random()*CSS_W,y:Math.random()*120+30,s:Math.random()*.5+.8,v:Math.random()*.3+.2}));
    function drawCloud(x,y,s){ctx.fillStyle='white';ctx.beginPath();ctx.arc(x-20*s,y,16*s,0,Math.PI*2);ctx.arc(x,y-8*s,22*s,0,Math.PI*2);ctx.arc(x+22*s,y,16*s,0,Math.PI*2);ctx.fill();}
    const buildings=[{x:60,y:220,w:80,h:180},{x:180,y:200,w:80,h:200},{x:300,y:180,w:80,h:220},{x:450,y:190,w:80,h:210},{x:600,y:180,w:80,h:220}];
    function render(ts){
      if(animStart){const raw=clamp01((ts-animStart)/animDur);const e=ease(raw);dayFactor=lerp(animFrom,animTo,e);if(raw>=1)animStart=0;}
      const skyTop=mixColor(SKY_TOP_N,SKY_TOP_D,dayFactor),skyBot=mixColor(SKY_BOT_N,SKY_BOT_D,dayFactor);
      const sky=ctx.createLinearGradient(0,0,0,400);sky.addColorStop(0,skyTop);sky.addColorStop(1,skyBot);ctx.fillStyle=sky;ctx.fillRect(0,0,CSS_W,400);
      const sunA=dayFactor,moonA=1-dayFactor;
      if(sunA>0){ctx.globalAlpha=sunA;let g=ctx.createRadialGradient(600,120,5,600,120,90);g.addColorStop(0,'#fff9c4');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(600,120,90,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(600,120,36,0,Math.PI*2);ctx.fillStyle='#fff59d';ctx.fill();}
      if(moonA>0){ctx.globalAlpha=moonA;let g2=ctx.createRadialGradient(600,150,5,600,150,120);g2.addColorStop(0,'rgba(255,246,204,0.35)');g2.addColorStop(1,'rgba(255,246,204,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(600,150,120,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(600,150,50,0,Math.PI*2);ctx.fillStyle='#fff6cc';ctx.fill();}
      ctx.globalAlpha=1;
      const starGlobal=1-dayFactor;
      if(starGlobal>0){for(const s of stars){const flicker=s.base+.5*Math.sin(s.phase+ts*s.speed);ctx.globalAlpha=Math.max(0,Math.min(1,flicker*starGlobal));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();}ctx.globalAlpha=1;}
      if(dayFactor>0){ctx.globalAlpha=dayFactor;for(const c of clouds){c.x+=c.v;if(c.x>CSS_W+40)c.x=-40;drawCloud(c.x,c.y,c.s*1.2);}ctx.globalAlpha=1;}
      ctx.fillStyle=mixColor(GROUND_N,GROUND_D,dayFactor);ctx.fillRect(0,400,CSS_W,100);
      buildings.forEach((b,i)=>{ctx.fillStyle=mixColor(i%2?B2_N:B1_N,i%2?B2_D:B1_D,dayFactor);ctx.fillRect(b.x,b.y,b.w,b.h);});
      ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=8;ctx.fillStyle=mixColor(TEXT_N,TEXT_D,dayFactor);
      ctx.font='bold 30px Arial';ctx.fillText(dayFactor>0.5?'Sunny Day City':'Moon Night City',20,50);
      ctx.shadowBlur=4;ctx.font='20px Arial';ctx.fillText(dayFactor>0.5?'clouds drifting ☁️':'stars twinkling ✨',20,80);ctx.shadowBlur=0;
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    btn?.addEventListener('click',()=>{
      const pressed=btn.getAttribute('aria-pressed')==='true';
      animFrom=dayFactor; animTo=pressed?0:1; animStart=performance.now();
      btn.textContent=pressed?'切換白天':'切換黑夜';
      btn.setAttribute('aria-pressed',String(!pressed));
    });
  }

  // ===== Polaroid =====
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
    function render(i){
      idx=(i+imgs.length)%imgs.length;
      const cur=imgs[idx];
      imgEl.src=cur.src; capEl.textContent=cur.cap;
      counterEl.textContent=`Image ${idx+1} of ${imgs.length}`;
      chips.forEach((c,k)=>{c.classList.toggle('active',k===idx); c.setAttribute('aria-selected',k===idx);});
    }
    document.getElementById('prevBtn').addEventListener('click',()=>render(idx-1));
    document.getElementById('nextBtn').addEventListener('click',()=>render(idx+1));
    chips.forEach(ch=>ch.addEventListener('click',e=>render(parseInt(e.currentTarget.dataset.idx,10)||0)));
    wrap.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')render(idx-1);if(e.key==='ArrowRight')render(idx+1);});
    imgs.forEach(({src})=>{const im=new Image();im.src=src;});
    render(0);
  }
})();
