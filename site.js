/* Local interactions only. No tracking, network requests, accounts or saved data. */
(()=>{
 'use strict';
 const copy=JSON.parse(document.getElementById('page-copy').textContent);
 const menu=document.querySelector('.menu-toggle'),navigation=document.getElementById('navigation');
 const closeMenu=()=>{navigation.dataset.open='false';menu.setAttribute('aria-expanded','false')};
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.dataset.open=String(open)});
 navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus()}});
 const tabs=[...document.querySelectorAll('[role=tab]')];
 function selectTab(index,focus=false){tabs.forEach((tab,i)=>{const active=i===index;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!active});if(focus)tabs[index].focus()}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectTab(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectTab(next,true)}})});
 document.querySelectorAll('[data-select-tab]').forEach(button=>button.addEventListener('click',()=>selectTab(Number(button.dataset.selectTab),true)));
 function applyHash(){if(location.hash==='#atelier')selectTab(1);const target=document.getElementById(location.hash.slice(1));if(target?.matches('details.legal')){target.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}))}}
 window.addEventListener('hashchange',applyHash);applyHash();
 // Anchor clicks also activate the workshop when the hash is already #atelier.
 document.querySelectorAll('a[href="#atelier"]').forEach(a=>a.addEventListener('click',()=>selectTab(1)));
 document.querySelectorAll('a[href="#support"],a[href="#privacy"],a[href="#confidentialite"]').forEach(a=>a.addEventListener('click',()=>{const target=document.querySelector(a.getAttribute('href'));if(target)target.open=true}));
 const dialog=document.getElementById('lightbox'),lightboxImage=dialog.querySelector('img'),caption=dialog.querySelector('figcaption');let lastOpener;
 document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{lastOpener=button;lightboxImage.src=button.dataset.lightbox;lightboxImage.alt=button.dataset.caption;caption.textContent=button.dataset.caption;dialog.showModal()}));
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>lastOpener?.focus());
 const card=document.querySelector('.demo-card'),options=[...document.querySelectorAll('[data-resistor]')],reset=document.querySelector('.demo-reset'),title=document.getElementById('feedback-title'),text=document.getElementById('feedback-text'),current=document.getElementById('current-output'),formula=document.getElementById('demo-formula'),value=document.getElementById('resistor-value');
 function choose(resistance){const bands={47:["#e9c943","#775b9f","#1e221b","#bc963c"],100:["#6f4629","#1e221b","#6f4629","#bc963c"],330:["#d07832","#d07832","#6f4629","#bc963c"]};document.querySelectorAll(".resistor-band").forEach((band,i)=>band.style.fill=bands[resistance][i]);const state=resistance===100?'right':resistance<100?'low':'high',mA=1000/resistance;card.dataset.state=state;options.forEach(o=>o.setAttribute('aria-pressed',String(Number(o.dataset.resistor)===resistance)));title.textContent=copy.feedback[state][0];text.textContent=copy.feedback[state][1];current.textContent=new Intl.NumberFormat(copy.lang,{maximumFractionDigits:1}).format(mA)+' mA';value.textContent=`R = ${resistance} Ω`;formula.textContent=`I = (3 − 2) ÷ ${resistance} × 1000 = ${new Intl.NumberFormat(copy.lang,{maximumFractionDigits:1}).format(mA)} mA`;formula.hidden=false;reset.hidden=false;}
 // Formula expresses the conversion to mA explicitly, to keep the units correct.
 options.forEach(button=>button.addEventListener('click',()=>choose(Number(button.dataset.resistor))));
 reset.addEventListener('click',()=>{delete card.dataset.state;document.querySelectorAll('.resistor-band').forEach(b=>b.style.removeProperty('fill'));options.forEach(o=>o.setAttribute('aria-pressed','false'));title.textContent=copy.initialTitle;text.textContent=copy.initialText;current.textContent='— mA';value.textContent='R = ?';formula.hidden=true;reset.hidden=true;options[0].focus()});
})();

// The video stays unloaded until requested. Native controls remain available without JavaScript.
(()=>{
 const video=document.getElementById('gameplay');if(!video)return;
 const cover=document.querySelector('.film-play'),chapters=[...document.querySelectorAll('[data-seek]')];
 cover.hidden=false;
 const embedded=document.getElementById('video-captions');
 if(embedded){
  const url=URL.createObjectURL(new Blob([JSON.parse(embedded.textContent)],{type:'text/vtt'}));
  video.querySelector('track').src=url;
  window.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
 }
 let pendingSeek=null;
 video.addEventListener('loadedmetadata',()=>{
  if(pendingSeek!==null){video.currentTime=pendingSeek;pendingSeek=null;}
 });
 const begin=(time)=>{
  cover.hidden=true;
  if(Number.isFinite(time)){
   if(video.readyState>=1)video.currentTime=time;else pendingSeek=time;
  }
  // Call play during the user gesture, including on iOS Safari.
  video.play().catch(()=>{video.controls=true;video.focus()});
 };
 cover.addEventListener('click',()=>{begin();video.focus()});
 chapters.forEach(button=>button.addEventListener('click',()=>begin(Number(button.dataset.seek))));
 video.addEventListener('play',()=>cover.hidden=true);
 video.addEventListener('timeupdate',()=>{
  const active=chapters.findLast(b=>video.currentTime>=Number(b.dataset.seek)-.1);
  chapters.forEach(b=>{if(b===active)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
 });
 // Cue text supplements the visible UI, so the same demo also works without sound.
})();
