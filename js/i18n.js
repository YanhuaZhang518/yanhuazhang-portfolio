// js/i18n.js
(function(){
    const LANG_STORAGE_KEY = 'lang';
  
    // Initialize i18next
    i18next
      .use(i18nextHttpBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        debug: false,
        fallbackLng: 'en',
        lng: localStorage.getItem(LANG_STORAGE_KEY) || 'en',
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json'
        },
        ns: ['translation','data'],
        defaultNS: 'translation'
      }, (err) => {
        if (err) console.error('i18n init error:', err);
        translateStatic();
        renderDynamic(); // education/projects from data.json
        bindEvents();
      });
  
    function $(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }
  
    // Apply text content
    function translateStatic(){
      // text nodes
      $('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const html = i18next.t(key);
        // If your key contains HTML (e.g., <b>), use innerHTML, else textContent
        if (/<[a-z][\s\S]*>/i.test(html)) el.innerHTML = html;
        else el.textContent = html;
      });
  
      // attributes: data-i18n-attr="attr:key; attr2:key2"
      $('[data-i18n-attr]').forEach(el => {
        const defs = el.getAttribute('data-i18n-attr').split(';').map(s=>s.trim()).filter(Boolean);
        defs.forEach(def=>{
          const [attr, key] = def.split(':').map(s=>s.trim());
          const v = i18next.t(key);
          if (attr && v != null) {
            // Special: <title> element
            if (el.tagName === 'TITLE' && attr.toLowerCase() === 'text') {
              document.title = v;
            } else {
              el.setAttribute(attr, v);
            }
          }
        });
      });
  
      // meta description with data-i18n-attr="content:meta.description" is already handled above
    }
  
    // Render dynamic lists (Education & Projects) from /locales/{lng}/data.json
    async function renderDynamic(){
      // load the "data" namespace (already loaded by init, but ensure)
      const data = i18next.getResourceBundle(i18next.language, 'data');
      if (!data) return;
  
      // Education
      const eduWrap = document.getElementById('eduList');
      if (eduWrap && Array.isArray(data.education)) {
        eduWrap.innerHTML = data.education.map(item => `
          <div class="edu-item card reveal">
            <div class="edu-head">
              <b>${item.school}</b> · ${item.degree}
            </div>
            <div class="muted">${item.time}</div>
            ${item.bullets?.length ? `<ul class="muted">${item.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`:''}
          </div>
        `).join('');
      }
  
      // Projects
      const projWrap = document.getElementById('projList');
      if (projWrap && Array.isArray(data.projects)) {
        projWrap.innerHTML = data.projects.map(p => `
          <article class="project card reveal" data-tags="${(p.tags||[]).join(',')}">
            <img src="${p.img}" alt="${p.title}" loading="lazy" />
            <div class="project-info">
              <h3>${p.title}</h3>
              <p class="muted">${p.desc}</p>
              <div class="chips">${(p.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
              ${p.url ? `<a class="btn" href="${p.url}" target="_blank" rel="noopener">${i18next.t('projects.view', { defaultValue: 'Open' })}</a>` : ''}
            </div>
          </article>
        `).join('');
      }
    }
  
    function bindEvents(){
      const btn = document.getElementById('lang');
      if (!btn) return;
  
      btn.addEventListener('click', async () => {
        const next = i18next.language === 'en' ? 'zh' : 'en';
        await i18next.changeLanguage(next);
        localStorage.setItem(LANG_STORAGE_KEY, next);
        translateStatic();
        renderDynamic();
      });
    }
  
    // When language changes (e.g., by detector), re-render automatically
    i18next.on('languageChanged', () => {
      translateStatic();
      renderDynamic();
      document.documentElement.lang = i18next.language;
    });
  })();
  