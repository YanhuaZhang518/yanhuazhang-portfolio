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
    // ===== EN <-> ZH full-page toggle =====
  document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang');
    if (!langBtn) return; // safety
    let curLang   = localStorage.getItem('lang') || 'en';

    // 1) Exact phrase dictionary (extend freely)
    const dictZH = new Map([
      ['About','个人陈述'],['Meow','兴趣爱好'],['Education','学历'],['Projects','项目展示'],['Contact','联系'],
      ['Interests · Blog','兴趣 · 博客'],['My Three Cats','我家的三只猫'],['Personal Statement','个人陈述'],
      ['Contact Info','联系信息'],['Back to top ↑','回到顶部 ↑'],['⬇️ Download Résumé (PDF)','⬇️ 下载简历（PDF）'],
      ['📧 Email Me','📧 邮件联系'],['All','全部'],['Cloud','云端'],['AI/Data','AI / 数据'],
      ['Write','写邮件'],['Call','拨打'],['Open','打开'],
      ['Cloud experience','云平台经验'],['Containers/Orchestration','容器 / 编排'],['Full-stack delivery','全栈交付'],

      // Blog headings/captions
      ['Traditional Chinese Calligraphy Artist','传统书法爱好者'],
      ['Passionate About Fitness','热爱健身'],
      ['Cooking and Friendship','烹饪与友谊'],
      ['The character means “quiet,” yet the strokes feel lively and energetic.','这幅字的意思是“静”，但笔触充满动感与生命力。'],
      ['Written on a traditional Chinese paper fan, featuring a short poem and an orchid.','写在传统折扇上，配有短诗与兰花。'],
      ['I enjoy strength training and the sense of progress that comes with every drop of sweat.','我热爱力量训练，享受每一滴汗水带来的进步感。'],
      ['A home-style dinner I cooked for friends during my studies abroad — every dish carries the taste of home.','留学期间为朋友做的一桌家常菜——每道菜都有家的味道。'],
      ['A photo taken during one of our dinner gatherings — food always brings people closer together.','一次聚餐时的照片——美食总能让人更亲近。'],

      // Cats
      ['I have three cats — playful, cuddly, and foodie — my best teammates during my free time 🐱🐱🐱.','我有三只猫——分别活泼、黏人、和小吃货——是我闲暇时最好的队友 🐱🐱🐱。'],
      ['Li Sheng · Norwegian Forest Cat','李生 · 挪威森林猫'],
      ['My first adopted cat, a gentle Norwegian Forest beauty who is now 8 years old.','我第一只领养的猫咪，一只温柔的挪威森林猫，今年 8 岁。'],
      ['Quiet, shy, and a little quirky — she insists that I watch her eat and scratches the post whenever she feels awkward.','安静害羞，还有点小怪癖——吃饭时必须让我陪着看；尴尬时就挠抓柱。'],
      ['No matter what, she’ll always be my little princess.','无论怎样，她永远是我的小公主。'],
      ['Chicken Strip · Siamese Cat','鸡柳 · 暹罗猫'],
      ['My second rescue, a wise Siamese now 9 years old — the smartest in the house.','我第二只救助的猫，一只 9 岁的聪明暹罗——家里最机灵。'],
      ['She can sense emotions and react accordingly, with an incredible memory and persistence.','她能感知情绪并作出反应，记忆力与执着令人惊讶。'],
      ['She once figured out where the snacks were stored and learned to open the cabinet to get them when no one was around.','她曾找到零食的藏处，还学会在没人时打开柜门自取。'],
      ['Coke · Mixed Grey Short-haired Cat','可乐 · 混血灰色短毛猫'],
      ['My roommate’s cat, but we’ve lived together for six years. He is now 7 years old.','室友的猫，但我们一起生活了六年。它现在 7 岁。'],
      ['A strong, gray mixed-breed shorthair with endless energy — the most athletic and playful in the family.','灰色混血短毛，精力无穷——全家最爱运动、最爱玩的成员。'],
      ['Always running around the house, and yes, definitely the biggest eater too!','总是在家里飞奔，也是当之无愧的“大胃王”！'],

      // Contact blurb
      ['Prefer email for opportunities and collaboration. I usually reply within 24 hours.','机会与合作建议优先通过邮箱联系。我通常会在 24 小时内回复。'],
      ['Email','邮箱'],['Phone','电话'],['LinkedIn','领英'],['GitHub','GitHub']
    ]);

    // 2) Token fallback (lightweight)
    const tokenDict = new Map([
      ['about','关于'],['contact','联系'],['projects','项目'],['education','学历'],
      ['blog','博客'],['interests','兴趣'],['download','下载'],['resume','简历'],
      ['email','邮箱'],['phone','电话'],['open','打开'],
      ['i','我'],['my','我的'],['me','我'],['we','我们'],['our','我们的'],
      ['and','与'],['or','或'],['with','带有'],['in','在'],['on','于'],
      ['to','到'],['for','用于'],['of','的'],['the',''],
      ['is','是'],['are','是'],['was','是'],['were','是'],
      ['a',''],['an',''],['this','这'],['that','那'],
      ['strong','强健'],['gentle','温柔'],['quiet','安静'],['shy','害羞'],
      ['playful','活泼'],['energetic','精力充沛'],['foodie','吃货'],
      ['smart','聪明'],['intelligent','聪明'],['persistent','执着'],
      ['cat','猫'],['cats','猫'],['team','团队'],['teammates','队友'],
      ['cloud','云'],['kubernetes','Kubernetes'],['react','React'],['node','Node'],
      ['experience','经验'],['developer','开发者']
    ]);

    const norm = s => (s || '').trim()
      .replace(/\s+/g,' ')
      .replace(/[ \t\n\r]+/g,' ')
      .replace(/[\u2018\u2019]/g,"'")
      .replace(/[\u201C\u201D]/g,'"');

    const INDEX = {
      built: false,
      textNodes: [],   // {node, original}
      attrNodes: [],   // {el, attr, original}
      title: document.title,
      metaDesc: (document.querySelector('meta[name="description"]')?.getAttribute('content')) || ''
    };

    function shouldSkip(el){
      return (
        el.closest('script,style,code,pre,textarea,canvas,svg,[data-no-i18n]') ||
        el.hasAttribute?.('contenteditable')
      );
    }

    function buildIndex(){
      if (INDEX.built) return;

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
          if(!node.nodeValue) return NodeFilter.FILTER_REJECT;
          const text = node.nodeValue;
          if (!text.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent || shouldSkip(parent)) return NodeFilter.FILTER_REJECT;
          if (!/[A-Za-z]/.test(text)) return NodeFilter.FILTER_REJECT; // target English-ish
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let n;
      while((n = walker.nextNode())){
        INDEX.textNodes.push({ node: n, original: n.nodeValue });
      }

      document.querySelectorAll('[alt],[title],[aria-label]').forEach(el=>{
        ['alt','title','aria-label'].forEach(attr=>{
          if(el.hasAttribute(attr)){
            const val = el.getAttribute(attr);
            if (val && /[A-Za-z]/.test(val) && !shouldSkip(el)){
              INDEX.attrNodes.push({ el, attr, original: val });
            }
          }
        });
      });

      INDEX.built = true;
    }

    function translateExact(s){
      const key = norm(s);
      if (dictZH.has(key)) return dictZH.get(key);
      const alt = key.replace(/[.:;!?…]+$/,'');
      if (alt !== key && dictZH.has(alt)) return dictZH.get(alt);
      return null;
    }

    function translateTokens(s){
      return s.replace(/\b([A-Za-z][A-Za-z']*)\b/g, (m)=>{
        const lower = m.toLowerCase();
        return tokenDict.get(lower) ?? m;
      });
    }

    function translateGeneric(s){
      const exact = translateExact(s);
      if (exact) return exact;
      const tokened = translateTokens(s);
      if (tokened === s) return s;
      return tokened.replace(/\s+/g,' ').trim();
    }

    function applyLang(lang){
      buildIndex();

      if (lang === 'zh'){
        INDEX.textNodes.forEach(({node, original})=>{
          node.nodeValue = translateGeneric(original);
        });

        INDEX.attrNodes.forEach(({el, attr, original})=>{
          el.setAttribute(attr, translateGeneric(original));
        });

        document.title = translateGeneric(INDEX.title) || '个人主页 · 霓虹赛博';
        const meta = document.querySelector('meta[name="description"]');
        if (meta){
          meta.setAttribute('content', translateGeneric(INDEX.metaDesc));
        }

        // Optional: override hero sub with polished CN line
        const heroSub = document.querySelector('#about .sub');
        if (heroSub && heroSub.innerHTML){
          heroSub.innerHTML = '软件工程硕士（Western University）。专注 <b>云原生、Kubernetes、CI/CD、ElasticSearch、React/Node</b>。主导过云端书店与加密货币预测引擎，强调可扩展性、可靠性与可观测性。';
        }

      } else {
        INDEX.textNodes.forEach(({node, original})=> node.nodeValue = original);
        INDEX.attrNodes.forEach(({el, attr, original})=> el.setAttribute(attr, original));
        document.title = INDEX.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta){ meta.setAttribute('content', INDEX.metaDesc); }
      }

      langBtn.setAttribute('aria-label', 'Toggle language English/Chinese');
      localStorage.setItem('lang', lang);
      curLang = lang;
    }

    // Init + click
    applyLang(curLang);
    langBtn.addEventListener('click', ()=> applyLang(curLang === 'en' ? 'zh' : 'en'));
  });


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
