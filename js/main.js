// Background particles
    const c=document.getElementById('p'); const x=c.getContext('2d');
    const DPR=Math.min(2, window.devicePixelRatio||1); let W,H; const P=[]; const N=80;
    function size(){ W= c.width = innerWidth*DPR; H= c.height = innerHeight*DPR; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; }
    function rnd(a,b){return Math.random()*(b-a)+a}
    function init(){ P.length=0; for(let i=0;i<N;i++){P.push({x:rnd(0,W), y:rnd(0,H), vx:rnd(-.18,.18), vy:rnd(-.18,.18), r:rnd(0.8,1.8)})} }
    function step(){ x.clearRect(0,0,W,H); for(const p of P){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1; const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*10);
      g.addColorStop(0,'rgba(124,58,237,.75)'); g.addColorStop(.65,'rgba(34,211,238,.3)'); g.addColorStop(1,'transparent'); x.fillStyle=g; x.beginPath(); x.arc(p.x,p.y,p.r*10,0,Math.PI*2); x.fill(); }
      requestAnimationFrame(step) }
    addEventListener('resize', ()=>{size(); init()}); size(); init(); step();

    // Cursor trail neon squares
    const tc=document.getElementById('trail'); const tx=tc.getContext('2d'); 
    let TW,TH; function tsize(){ TW= tc.width = innerWidth*DPR; TH= tc.height = innerHeight*DPR; tc.style.width=innerWidth+'px'; tc.style.height=innerHeight+'px'; }
    tsize(); addEventListener('resize', tsize);
    let target={x:innerWidth*DPR/2, y:innerHeight*DPR/2};
    addEventListener('pointermove',e=>{ target.x=e.clientX*DPR; target.y=e.clientY*DPR; });
    const segments=36; const pts=Array.from({length:segments},()=>({x:target.x, y:target.y}));
    (function loop(){ const baseEase=0.38; for(let i=0;i<pts.length;i++){ const lead = i===0 ? target : pts[i-1]; const ease = baseEase * (1 - i/pts.length*0.6) + 0.06; pts[i].x += (lead.x - pts[i].x)*ease; pts[i].y += (lead.y - pts[i].y)*ease; }
      tx.clearRect(0,0,TW,TH); const hueBase = (performance.now()/15)%360; for(let i=pts.length-1;i>=0;i--){ const p=pts[i]; const prog = i/pts.length; const size = 12 * (1 - prog) + 1; const alpha = Math.pow(1 - prog, 1.15) * 0.95; const hue = 200 + ((hueBase + i*8) % 120); tx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha*0.25})`; const g=size*1.9; tx.fillRect(p.x - g/2, p.y - g/2, g, g); tx.fillStyle = `hsla(${hue}, 100%, 60%, ${Math.min(alpha,1)})`; tx.fillRect(p.x - size/2, p.y - size/2, size, size); }
      requestAnimationFrame(loop); })();

    // Year
    document.getElementById('year').textContent=new Date().getFullYear();

    // Scroll bar
    const bar=document.getElementById('scrollbar');
    function updateScrollBar(){ const max=document.documentElement.scrollHeight - innerHeight; const v=Math.max(0, Math.min(1, scrollY/max)); bar.style.transform=`scaleX(${v})`; }
    updateScrollBar(); addEventListener('scroll', updateScrollBar, {passive:true});

    // Section activation & nav highlight + typing
    const pageSections=[...document.querySelectorAll('main section.page')];
    const navLinks=[...document.querySelectorAll('header nav a')];
    let activeSection=document.querySelector('section.page.active')||pageSections[0];
    const pageObserver=new IntersectionObserver((entries)=>{ let best=null, ratio=0; entries.forEach(e=>{ if(e.isIntersecting && e.intersectionRatio>ratio){ ratio=e.intersectionRatio; best=e.target; } }); if(best){ pageSections.forEach(s=>s.classList.toggle('active', s===best)); activeSection=best; const id=best.id; navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+id)); triggerTypingIn(best); } },{threshold:[0.55,0.66,0.85]});
    pageSections.forEach(s=>pageObserver.observe(s));

    const reveals=[...document.querySelectorAll('.reveal')];
    const rObserver=new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); rObserver.unobserve(e.target); } }); },{threshold:.12});
    reveals.forEach(el=>rObserver.observe(el));

    const titles=[...document.querySelectorAll('section.page .section-title')];
    titles.forEach(t=>{ t.dataset.src=t.textContent.trim(); t.textContent=''; t.classList.add('typing'); });
    function typeText(el, txt, speed=28, done){ if(!el || el.dataset.typed==='1') { if(done) done(); return; } el.dataset.typed='1'; let i=0; const step=()=>{ i++; el.textContent=txt.slice(0,i); if(i<txt.length){ setTimeout(step, speed); } else { el.classList.remove('typing'); el.classList.add('done'); if(done) done(); } }; step(); }
    function staggerReveal(section){ const items=[...section.querySelectorAll('.reveal')]; items.forEach((el,idx)=>{ setTimeout(()=>{ el.classList.add('in'); el.classList.add('fx-hint'); }, 90*idx); }); }
    function triggerTypingIn(section){ if(section.dataset.seqDone==='1') return; const speed=+section.dataset.typingSpeed||28; const title=section.querySelector('.section-title'); const sub= section.id==='about' ? section.querySelector('.sub') : null; const after=()=>{ staggerReveal(section); section.dataset.seqDone='1'; }; if(section.id==='about' && sub){ if(!sub.dataset.src){ sub.dataset.src=sub.getAttribute('data-typing-src')||sub.textContent.trim(); sub.textContent=''; } typeText(sub, sub.dataset.src, speed, after); } else if(title){ const src=title.dataset.src||title.textContent.trim(); typeText(title, src, speed, after); } else { after(); } }
    setTimeout(()=>triggerTypingIn(pageSections[0]), 60);

    // Tilt
    const maxTilt=10; function attachTilt(scope=document){ scope.querySelectorAll('.tilt').forEach(el=>{ el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width; const y=(e.clientY-r.top)/r.height; const rx=(maxTilt/2 - y*maxTilt).toFixed(2); const ry=(x*maxTilt - maxTilt/2).toFixed(2); el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;}); el.addEventListener('mouseleave',()=>{el.style.transform='perspective(900px) rotateX(0) rotateY(0)';}); }); }
    attachTilt();

    // Hero parallax
    const px=document.getElementById('px'); const layers=[...px.querySelectorAll('.layer')];
    const heroImg=document.getElementById('heroPhoto');
    px.addEventListener('mousemove',e=>{const r=px.getBoundingClientRect(); const cx=e.clientX-r.left; const cy=e.clientY-r.top; const nx=(cx/r.width-.5); const ny=(cy/r.height-.5); layers.forEach((l,i)=>{ const d=(i+1)*8; l.style.transform=`translate(${(-nx*d).toFixed(1)}px, ${(-ny*d).toFixed(1)}px)`; }); if(heroImg){ heroImg.style.transform=`translate(${(nx*6).toFixed(1)}px, ${(ny*6).toFixed(1)}px) scale(1.02)`; }});
    px.addEventListener('mouseleave',()=>{ if(heroImg){ heroImg.style.transform='translate(0,0) scale(1)'; } });

    // Data-driven sections
    const data = JSON.parse(document.getElementById('site-data').textContent);
    const eduList=document.getElementById('eduList');
    data.education.forEach(ed=>{ const item=document.createElement('div'); item.className='edu-item reveal'; item.innerHTML=`<div class="dot"></div><div class="card"><h3>${ed.school} · ${ed.degree}</h3><div class="muted">${ed.time}</div><ul>${ed.bullets.map(b=>`<li>${b}</li>`).join('')}</ul></div>`; eduList.appendChild(item); });

    const projList = document.getElementById('projList');

    function renderProjects() {
      projList.innerHTML = '';
      data.projects.forEach(p => {
        const card = document.createElement('article');
        card.className = 'project reveal tilt';
        card.dataset.tags = p.bucket;

        const img = document.createElement('img');
        img.src = p.img;
        img.alt = p.title;
        // 图片兜底（如果路径写错或文件缺失）
        img.onerror = () => {
          img.src =
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(
              "<?xml version='1.0'?><svg xmlns='http://www.w3.org/2000/svg' width='1000' height='700'><rect width='100%' height='100%' fill='%2312162b'/><text x='50%' y='54%' text-anchor='middle' fill='%23a7b3ff' font-family='Arial' font-size='28'>Image not found</text></svg>"
            );
        };

        const content = document.createElement('div');
        content.className = 'content';
        content.innerHTML = `
          <h3>${p.title}</h3>
          <p class="muted">${p.desc}</p>
          <div class="tags">${p.tags.map(t => `<span class='tag'>${t}</span>`).join('')}</div>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="${p.url}">Code / More</a>
        `;

        card.appendChild(img);
        card.appendChild(content);
        projList.appendChild(card);
      });
    }
    renderProjects();

    
    // Language switch (text only)
    const langBtn=document.getElementById('lang'); let curLang=localStorage.getItem('lang')||'en';
    function applyLang(l){ if(!window.__origTexts){ window.__origTexts={ nav:{about:document.querySelector('nav a[href="#about"]').textContent, hobbies:document.querySelector('nav a[href="#hobbies"]').textContent, edu:document.querySelector('nav a[href="#education"]').textContent, proj:document.querySelector('nav a[href="#projects"]').textContent, contact:document.querySelector('nav a[href="#contact"]').textContent}, headline:document.querySelector('#about .headline').innerHTML, sub:document.querySelector('#about .sub').innerHTML, hobbyTitle:document.querySelector('#hobbies .section-title').textContent, hobbyIntro:document.querySelector('#hobbies .hobby-intro').innerHTML, eduTitle:document.querySelector('#education .section-title').textContent, projTitle:document.querySelector('#projects .section-title').textContent, contactTitle:document.querySelector('#contact .section-title').textContent, footerTop:document.querySelector('footer a').textContent }; }
      if(l==='zh'){ document.querySelector('nav a[href="#about"]').textContent='个人陈述'; document.querySelector('nav a[href="#hobbies"]').textContent='兴趣爱好'; document.querySelector('nav a[href="#education"]').textContent='学历'; document.querySelector('nav a[href="#projects"]').textContent='项目'; document.querySelector('nav a[href="#contact"]').textContent='联系'; document.querySelector('#about .headline').innerHTML='<span class="grad">Yanhua Zhang</span> — 云原生 / 全栈 · 霓虹'; document.querySelector('#about .sub').innerHTML='软件工程硕士（Western University）。专注 <b>云原生、Kubernetes、CI/CD、ElasticSearch、React/Node</b>。主导过云端书店与加密货币预测引擎，强调可扩展性、可靠性与可观测性。'; document.querySelector('#hobbies .section-title').textContent='兴趣爱好 & 我家三只猫'; document.querySelector('#hobbies .hobby-intro').innerHTML='喜欢摄影、健身与技术写作。家里有 <b>三只猫</b>：它们分别活泼、黏人、和吃货，是工作之余最好的队友 🐱🐱🐱。'; document.querySelector('#education .section-title').textContent='学历'; document.querySelector('#projects .section-title').textContent='项目展示'; document.querySelector('#contact .section-title').textContent='联系方式'; document.querySelector('footer a').textContent='回到顶部 ↑'; } else { const o=window.__origTexts; document.querySelector('nav a[href="#about"]').textContent=o.nav.about; document.querySelector('nav a[href="#hobbies"]').textContent=o.nav.hobbies; document.querySelector('nav a[href="#education"]').textContent=o.nav.edu; document.querySelector('nav a[href="#projects"]').textContent=o.nav.proj; document.querySelector('nav a[href="#contact"]').textContent=o.nav.contact; document.querySelector('#about .headline').innerHTML=o.headline; document.querySelector('#about .sub').innerHTML=o.sub; document.querySelector('#hobbies .section-title').textContent=o.hobbyTitle; document.querySelector('#hobbies .hobby-intro').innerHTML=o.hobbyIntro; document.querySelector('#education .section-title').textContent=o.eduTitle; document.querySelector('#projects .section-title').textContent=o.projTitle; document.querySelector('#contact .section-title').textContent=o.contactTitle; document.querySelector('footer a').textContent=o.footerTop; }
      localStorage.setItem('lang',l); curLang=l; }
    applyLang(curLang); langBtn.addEventListener('click',()=>applyLang(curLang==='en'?'zh':'en'));

    // Accent color switch
    const colorBtn=document.getElementById('color');
    const palette=[["#7c3aed","#22d3ee","#f472b6"],["#22d3ee","#60a5fa","#a78bfa"],["#f472b6","#fb7185","#f59e0b"],["#10b981","#22d3ee","#60a5fa"]];
    let idx=+localStorage.getItem('accentIdx')||0; function setAccent(i){ const p=palette[i%palette.length]; document.documentElement.style.setProperty('--accent',p[0]); document.documentElement.style.setProperty('--accent-2',p[1]); document.documentElement.style.setProperty('--accent-3',p[2]); localStorage.setItem('accentIdx',i);} setAccent(idx);
    colorBtn.addEventListener('click',()=>{ idx=(idx+1)%palette.length; setAccent(idx);});

    // Contact helpers (copy + toast)
    function toast(msg){ let t=document.querySelector('.toast'); if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t);} t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1200); }
    function copy(text){ navigator.clipboard?.writeText(text).then(()=>toast('Copied')).catch(()=>{ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copied'); }); }
    const btnEmail=document.getElementById('copyEmail'); if(btnEmail) btnEmail.addEventListener('click',()=>copy('yzha5778@uwo.ca'));
    const btnPhone=document.getElementById('copyPhone'); if(btnPhone) btnPhone.addEventListener('click',()=>copy('+13437778688'));

    // Tests (console only)
    try {
      (function testHeroPhoto(){ const img=document.getElementById('heroPhoto'); console.assert(!!img, '[Test] hero photo element missing'); if(img){ const of=getComputedStyle(img).objectFit; console.assert(of==='cover', '[Test] hero photo should object-fit: cover'); } })();
      (function testCatsStatic(){ const cards=document.querySelectorAll('#hobbies .cat-card'); console.assert(cards.length===3, '[Test] Expected 3 cat cards, got '+cards.length); const noCarousel=!document.querySelector('#hobbies .carousel, #hobbies .track, #hobbies .slide, #hobbies .ctrl, #hobbies .arrow, #hobbies .dot'); console.assert(noCarousel, '[Test] Carousel leftovers should not exist'); })();
      (function testProjectsNoOverflow(){ const sec=document.getElementById('projects'); const overflow=sec.scrollWidth - sec.clientWidth; console.assert(overflow<=1, '[Test] Projects horizontally overflow by '+overflow+'px'); })();
      (function testPagerAndBar(){ const dots=[...document.querySelectorAll('.pager a')]; console.assert(dots.length===6, '[Test] pager dots count should be 6'); console.assert(typeof updateScrollBar==='function', '[Test] updateScrollBar should be a function'); })();
      (function testContactExists(){ const grid=document.querySelector('#contact .contact-grid'); console.assert(!!grid, '[Test] contact grid missing'); const copyE=document.getElementById('copyEmail'); const copyP=document.getElementById('copyPhone'); console.assert(!!copyE && !!copyP, '[Test] copy buttons missing'); })();
    } catch(e){ console.warn('[Tests] encountered error', e); }
