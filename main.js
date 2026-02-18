// ==========================================
// THE CONVERSION ARCHITECT — COMPLETE JS
// ==========================================

// ---- NAV SCROLL BEHAVIOR ----
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  // Hide scroll indicator after scrolling
  const indicator = document.getElementById('scroll-indicator');
  if (indicator && window.scrollY > 100) {
    indicator.style.opacity = '0';
  }
}, { passive: true });

// ---- MOBILE MENU ----
function openMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.add('hidden');
  document.body.style.overflow = '';
}

// ---- SCROLL REVEAL ----
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// ---- EMAIL ACCORDION ----
function toggleEmail(card) {
  const content = card.querySelector('.email-content');
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.email-card.open').forEach(c => {
    if (c !== card) { c.classList.remove('open'); c.querySelector('.email-content').classList.remove('open'); }
  });
  if (wasOpen) { card.classList.remove('open'); content.classList.remove('open'); onContentCollapse(); }
  else { card.classList.add('open'); content.classList.add('open'); onContentExpand(); setTimeout(() => { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350); }
}

// ---- FAQ ACCORDION ----
function toggleFaq(item) {
  const answer = item.querySelector('.faq-answer');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    if (i !== item) { i.classList.remove('open'); i.querySelector('.faq-answer').classList.remove('open'); }
  });
  if (wasOpen) { item.classList.remove('open'); answer.classList.remove('open'); }
  else { item.classList.add('open'); answer.classList.add('open'); }
}

// ---- AVATAR GUIDE SYSTEM ----
const guideMessages = {
  hero: { text: "Hey \u2014 I'm Erica. I help SaaS and fintech companies fix landing pages that don't convert. What brings you here?", showOptions: true, options: [
    { label: "I run a SaaS/fintech company", action: 'scrollTo', target: '#project-bananacrystal', followUp: { text: "Good. Let me show you something relevant. Built this system for a fintech platform. $800 budget. 2,500 activated users. Not a typo." } },
    { label: "I'm a coach", action: 'scrollTo', target: '#email-portfolio', followUp: { text: "I've written 40+ email sequences for coaches across 10 industries. These samples will show you how I think about your world." } },
    { label: "Just looking around", action: 'minimize', followUp: { text: "No pressure. I'm here if you need me. \u270C\uFE0F" } }
  ]},
  problem: { text: "If any of this sounds familiar \u2014 you're in the right place. I've seen this pattern more times than I can count.", showOptions: false },
  approach: { text: "This is what most copywriters skip. Research first. Writing second. That order matters more than people think.", showOptions: false },
  projects: { text: "Real projects. Real constraints. Real results. Click any to see the full breakdown.", showOptions: false },
  'project-bananacrystal': { text: "This one's my favorite. $800 budget. Traditional agencies quoted $45,000. Same result. Different thinking.", showOptions: false },
  'project-wifi': { text: "The research method here is exactly what I use for landing page copy. Find the real words. Put them where they belong.", showOptions: false },
  'project-education': { text: "Psychology-driven copy works in any context. Understanding WHY people act matters more than telling them to act.", showOptions: false },
  emails: { text: "40 real samples. Click any to expand. I annotated each one so you can see the psychology, not just the words.", showOptions: false },
  faq: { text: "I tried to answer every hesitation you might have. If I missed one \u2014 the next section is where you can reach me.", showOptions: false },
  cta: { text: "Send me your landing page. I'll record a personal video showing you what I'd change. No pitch. No call. Just me looking at your page and telling you the truth. That's it.", showOptions: false }
};

let guideMinimized = false;
let currentSection = 'hero';
let idleTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const isReturning = localStorage.getItem('eca-visited');
  if (isReturning) {
    guideMessages.hero.text = "Welcome back. Anything specific you're looking for this time?";
    guideMessages.hero.options = [
      { label: "Show me your work", action: 'scrollTo', target: '#projects', followUp: { text: "Here's everything. Click any project for the full breakdown." } },
      { label: "I'm ready to send my page", action: 'scrollTo', target: '#cta', followUp: { text: "Let's do it. Send your URL right here." } },
      { label: "Just browsing again", action: 'minimize', followUp: { text: "You know where to find me. \u270C\uFE0F" } }
    ];
  } else { localStorage.setItem('eca-visited', 'true'); }
  updateGuide(guideMessages.hero);
  setupGuideObservers();
  setupIdleDetection();
});

function setupGuideObservers() {
  const sections = document.querySelectorAll('section[data-guide]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !guideMinimized) {
        const id = entry.target.dataset.guide;
        if (id !== currentSection && guideMessages[id]) {
          currentSection = id;
          updateGuide(guideMessages[id]);
        }
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => obs.observe(s));
}

function updateGuide(msg) {
  const bubble = document.getElementById('guide-bubble');
  const text = document.getElementById('bubble-text');
  const opts = document.getElementById('guide-options');
  bubble.style.opacity = '0';
  setTimeout(() => {
    text.textContent = msg.text;
    opts.innerHTML = '';
    if (msg.showOptions && msg.options) {
      opts.style.display = 'block';
      msg.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.addEventListener('click', () => handleOption(opt));
        opts.appendChild(btn);
      });
    } else { opts.style.display = 'none'; }
    bubble.style.opacity = '1';
  }, 300);
  resetIdle();
}

function handleOption(opt) {
  if (opt.action === 'scrollTo') {
    const el = document.querySelector(opt.target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  if (opt.followUp) {
    if (opt.action === 'minimize') {
      updateGuide({ text: opt.followUp.text, showOptions: false });
      setTimeout(minimizeGuide, 2000);
    } else {
      updateGuide({ text: opt.followUp.text, showOptions: false });
    }
  }
}

function minimizeGuide() {
  guideMinimized = true;
  const c = document.getElementById('guide-container');
  const r = document.getElementById('guide-reopen');
  c.style.opacity = '0';
  setTimeout(() => { c.classList.add('hidden'); r.classList.remove('hidden'); }, 200);
}

function reopenGuide() {
  guideMinimized = false;
  const c = document.getElementById('guide-container');
  const r = document.getElementById('guide-reopen');
  r.classList.add('hidden');
  c.classList.remove('hidden');
  c.offsetHeight;
  c.style.opacity = '1';
  if (guideMessages[currentSection]) updateGuide(guideMessages[currentSection]);
}

function onContentExpand() { if (!guideMinimized) document.getElementById('guide-container').style.opacity = '0'; }
function onContentCollapse() { if (!guideMinimized) document.getElementById('guide-container').style.opacity = '1'; }

function setupIdleDetection() {
  ['scroll','mousemove','touchstart','keydown'].forEach(e => {
    document.addEventListener(e, resetIdle, { passive: true });
  });
}

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!guideMinimized) {
      document.getElementById('bubble-text').textContent = "Take your time. I'm not going anywhere.";
    }
  }, 30000);
}

// Mobile: hide bubble during active scroll
if (window.innerWidth < 768) {
  let st = null;
  window.addEventListener('scroll', () => {
    if (!guideMinimized) {
      const b = document.getElementById('guide-bubble');
      if (b) b.style.opacity = '0';
      clearTimeout(st);
      st = setTimeout(() => { if (b) b.style.opacity = '1'; }, 2000);
    }
  }, { passive: true });
}
