(function(){
  'use strict';
  const table = document.getElementById('scoreTable');
  if(!table) return;

  const defaultStyle = {
    width: table.style.width || '',
    borderSpacing: '1px',
    backgroundColor: '#fcfcf0',
    border: '1px solid #000'
  };

  window.changeWidth = (w)=> table.style.width = w;
  window.changeBorder = (s)=>{ table.style.border = s+'px solid #B6AE9F'; table.style.borderSpacing = s+'px'; };
  window.changeColor = (c)=> table.style.backgroundColor = c;

  const avgOut = document.getElementById('avgOut');
  const editBtn = document.getElementById('editToggle');

  function setEditable(on){
    [...table.querySelectorAll('td')].forEach(td=>{
      td.contentEditable = on ? 'true' : 'false';
      td.classList.toggle('editable', on);
    });
    editBtn.textContent = on ? 'Disable Edit' : 'Enable Edit';
    editBtn.dataset.on = on ? '1' : '0';
  }

  function resetTable(){
    table.style.width = defaultStyle.width;
    table.style.borderSpacing = defaultStyle.borderSpacing;
    table.style.backgroundColor = defaultStyle.backgroundColor;
    table.style.border = defaultStyle.border;
    setEditable(false);
    avgOut.textContent = '';
  }

  function calcAverages(){
    const rows = [...table.rows];
    if(rows.length < 2) return;
    const header = [...rows[0].cells].map(th=>th.textContent.trim());
    const dataRows = rows.slice(1);
    const sums = Array(header.length).fill(0);
    let nRows = 0;
    dataRows.forEach(tr=>{
      const tds = [...tr.cells];
      nRows++;
      tds.forEach((td,i)=>{
        const v = parseFloat(td.textContent.trim());
        if(!Number.isNaN(v)) sums[i]+=v;
      });
    });
    const avgs = sums.map(s=> (nRows?(s/nRows).toFixed(2):'—'));
    const overall = (nRows? (sums.reduce((a,b)=>a+b,0)/(nRows*header.length)).toFixed(2):'—');
    avgOut.innerHTML = `<div><b>Column Averages:</b> ${header.map((h,i)=>`${h}: ${avgs[i]}`).join(' ・ ')}</div>
    <div><b>Overall Average:</b> ${overall}</div>`;
  }

  document.getElementById('calcAvg').addEventListener('click', calcAverages);
  document.getElementById('resetBtn').addEventListener('click', resetTable);
  editBtn.addEventListener('click', ()=> setEditable(editBtn.dataset.on!=='1'));

  const btn = document.getElementById("toggleTable");
  const container = document.getElementById("tableContainer");
  let shown = false;
  btn.addEventListener("click",()=>{
    if(!shown){
      let html="<table border='1' class='fadein'><caption>2–9 Multiplication Table</caption>";
      for(let i=1;i<=9;i++){
        html+="<tr>";
        for(let j=2;j<=9;j++){ html+=`<td>${j} × ${i} = ${j*i}</td>`; }
        html+="</tr>";
      }
      html+="</table>";
      container.innerHTML=html;
      btn.textContent="Hide Multiplication Table";
      shown=true;
    }else{
      container.innerHTML="";
      btn.textContent="Show Multiplication Table";
      shown=false;
    }
  });
})();
