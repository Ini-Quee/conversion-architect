import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════
   SCROLL REVEAL HOOK (IntersectionObserver)
   threshold: 0.15, rootMargin: '0px 0px -50px 0px'
   ═══════════════════════════════════════════ */
function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const el = containerRef.current;
    if (el) {
      el.querySelectorAll('.reveal').forEach((s) => observer.observe(s));
    }
    return () => observer.disconnect();
  }, []);

  return containerRef;
}

/* ═══════════════════════════════════════════
   AVATAR GUIDE MESSAGE MAP
   Exact match to finalized JS guideMessages
   ═══════════════════════════════════════════ */
interface GuideOption {
  label: string;
  action: 'scrollTo' | 'minimize';
  target?: string;
  followUp: {
    text: string;
  };
}

interface GuideMessage {
  text: string;
  showOptions: boolean;
  options?: GuideOption[];
}

const defaultMessages: Record<string, GuideMessage> = {
  hero: {
    text: "Hey \u2014 I'm Erica. I help SaaS and fintech companies fix landing pages that don't convert. What brings you here?",
    showOptions: true,
    options: [
      {
        label: "I run a SaaS/fintech company",
        action: 'scrollTo',
        target: '#project-bananacrystal',
        followUp: { text: "Good. Let me show you something relevant. Built this system for a fintech platform. $800 budget. 2,500 activated users. Not a typo." },
      },
      {
        label: "I'm a coach",
        action: 'scrollTo',
        target: '#email-portfolio',
        followUp: { text: "I've written 40+ email sequences for coaches across 10 industries. These samples will show you how I think about your world." },
      },
      {
        label: "Just looking around",
        action: 'minimize',
        followUp: { text: "No pressure. I'm here if you need me. \u270C\uFE0F" },
      },
    ],
  },
  problem: {
    text: "If any of this sounds familiar \u2014 you're in the right place. I've seen this pattern more times than I can count.",
    showOptions: false,
  },
  approach: {
    text: "This is what most copywriters skip. Research first. Writing second. That order matters more than people think.",
    showOptions: false,
  },
  projects: {
    text: "Real projects. Real constraints. Real results. Click any to see the full breakdown.",
    showOptions: false,
  },
  'project-bananacrystal': {
    text: "This one's my favorite. $800 budget. Traditional agencies quoted $45,000. Same result. Different thinking.",
    showOptions: false,
  },
  'project-wifi': {
    text: "The research method here is exactly what I use for landing page copy. Find the real words. Put them where they belong.",
    showOptions: false,
  },
  'project-education': {
    text: "Psychology-driven copy works in any context. Understanding WHY people act matters more than telling them to act.",
    showOptions: false,
  },
  emails: {
    text: "40 real samples. Click any to expand. I annotated each one so you can see the psychology, not just the words.",
    showOptions: false,
  },
  faq: {
    text: "I tried to answer every hesitation you might have. If I missed one \u2014 the next section is where you can reach me.",
    showOptions: false,
  },
  cta: {
    text: "Send me your landing page. I'll record a personal video showing you what I'd change. No pitch. No call. Just me looking at your page and telling you the truth. That's it.",
    showOptions: false,
  },
};

const returnMessages: Record<string, GuideMessage> = {
  hero: {
    text: "Welcome back. Anything specific you're looking for this time?",
    showOptions: true,
    options: [
      {
        label: "Show me your work",
        action: 'scrollTo',
        target: '#projects',
        followUp: { text: "Here's everything. Click any project for the full breakdown." },
      },
      {
        label: "I'm ready to send my page",
        action: 'scrollTo',
        target: '#cta',
        followUp: { text: "Let's do it. Send your URL right here." },
      },
      {
        label: "Just browsing again",
        action: 'minimize',
        followUp: { text: "You know where to find me. \u270C\uFE0F" },
      },
    ],
  },
};

/* ═══════════════════════════════════════════
   AVATAR GUIDE COMPONENT
   Matches finalized JS behavior exactly:
   - Section observer with threshold: 0.5
   - Bubble opacity fade (0 -> 300ms -> 1)
   - Idle timer at 30000ms
   - Mobile: hide bubble on scroll, show after 2000ms
   - Content expand/collapse hides guide
   - Minimize with 200ms opacity fade
   - Follow-up on "minimize" action: show 2000ms then minimize
   ═══════════════════════════════════════════ */
function AvatarGuide({ contentExpanded }: { contentExpanded: boolean }) {
  const [minimized, setMinimized] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [bubbleText, setBubbleText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<GuideOption[] | undefined>(undefined);
  const [showAvatarNav, setShowAvatarNav] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [bubbleOpacity, setBubbleOpacity] = useState(1);
  const [containerOpacity, setContainerOpacity] = useState(1);
  const [containerHidden, setContainerHidden] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSectionRef = useRef('hero');
  const minimizedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { minimizedRef.current = minimized; }, [minimized]);
  useEffect(() => { currentSectionRef.current = currentSection; }, [currentSection]);

  // Check return visitor
  useEffect(() => {
    const visited = localStorage.getItem('eca-visited');
    if (visited) {
      setIsReturning(true);
    } else {
      localStorage.setItem('eca-visited', 'true');
    }
  }, []);

  // Get messages map
  const getMessages = useCallback(() => {
    return isReturning ? { ...defaultMessages, ...returnMessages } : defaultMessages;
  }, [isReturning]);

  // Update guide — matches JS updateGuide() with opacity fade
  const updateGuide = useCallback((msg: GuideMessage) => {
    setBubbleOpacity(0);
    setTimeout(() => {
      setBubbleText(msg.text);
      setShowOptions(msg.showOptions);
      setCurrentOptions(msg.options);
      setBubbleOpacity(1);
    }, 300);
  }, []);

  // Set initial message
  useEffect(() => {
    const messages = getMessages();
    updateGuide(messages.hero);
  }, [isReturning, getMessages, updateGuide]);

  // Section observer — threshold: 0.5
  useEffect(() => {
    const sections = document.querySelectorAll('section[data-guide]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !minimizedRef.current) {
            const sectionId = (entry.target as HTMLElement).dataset.guide;
            if (sectionId && sectionId !== currentSectionRef.current) {
              currentSectionRef.current = sectionId;
              setCurrentSection(sectionId);
              const messages = isReturning ? { ...defaultMessages, ...returnMessages } : defaultMessages;
              const msg = messages[sectionId];
              if (msg) {
                updateGuide(msg);
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isReturning, updateGuide]);

  // Idle detection — 30000ms
  const resetIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!minimizedRef.current) {
        setBubbleText("Take your time. I'm not going anywhere.");
        setShowOptions(false);
      }
    }, 30000);
  }, []);

  useEffect(() => {
    const events = ['scroll', 'mousemove', 'touchstart', 'keydown'];
    events.forEach((e) => document.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdle]);

  // Mobile: hide bubble during active scroll, show after 2000ms
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (!minimizedRef.current) {
        setBubbleOpacity(0);
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          setBubbleOpacity(1);
        }, 2000);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Auto-hide during content expansion (onContentExpand/onContentCollapse)
  useEffect(() => {
    if (minimized) return;
    if (contentExpanded) {
      setContainerOpacity(0);
    } else {
      setContainerOpacity(1);
    }
  }, [contentExpanded, minimized]);

  // Handle option click — matches JS handleOption()
  const handleOptionClick = (option: GuideOption) => {
    if (option.action === 'scrollTo' && option.target) {
      const target = document.querySelector(option.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }

    if (option.followUp) {
      if (option.action === 'minimize') {
        // Show follow-up briefly, then minimize after 2000ms
        updateGuide({ text: option.followUp.text, showOptions: false });
        setTimeout(() => {
          minimizeGuide();
        }, 2000);
      } else {
        updateGuide({ text: option.followUp.text, showOptions: false });
      }
    }
  };

  // Minimize — matches JS minimizeGuide() with 200ms opacity fade
  const minimizeGuide = () => {
    setContainerOpacity(0);
    setTimeout(() => {
      setMinimized(true);
      setContainerHidden(true);
    }, 200);
  };

  // Reopen — matches JS reopenGuide()
  const reopenGuide = () => {
    setMinimized(false);
    minimizedRef.current = false;
    setContainerHidden(false);
    setShowAvatarNav(false);
    // Force reflow then show
    setTimeout(() => {
      setContainerOpacity(1);
      const messages = getMessages();
      const msg = messages[currentSectionRef.current];
      if (msg) updateGuide(msg);
    }, 10);
  };

  const scrollToSection = (id: string) => {
    setShowAvatarNav(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Reopen button (minimized state)
  if (minimized) {
    return (
      <button
        id="guide-reopen"
        className="guide-reopen"
        onClick={reopenGuide}
        aria-label="Reopen guide"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <rect x="10" y="2" width="11" height="11" transform="rotate(45 10 10)" fill="#D4A843" />
        </svg>
      </button>
    );
  }

  return (
    <div
      id="guide-container"
      className={`guide-container ${containerHidden ? 'hidden' : ''}`}
      style={{ opacity: containerOpacity, transition: 'opacity 0.2s ease' }}
    >
      {/* Speech Bubble */}
      <div
        className="guide-bubble"
        id="guide-bubble"
        style={{ opacity: bubbleOpacity, transition: 'opacity 0.3s ease' }}
      >
        <button className="guide-close" id="guide-close" onClick={minimizeGuide} aria-label="Close guide">
          &times;
        </button>
        <p id="bubble-text">{bubbleText}</p>
        {showOptions && currentOptions && (
          <div className="guide-options" id="guide-options">
            {currentOptions.map((opt, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); handleOptionClick(opt); }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar — EI text placeholder */}
      <div style={{ position: 'relative' }}>
        <div
          className="guide-avatar-placeholder"
          id="guide-avatar"
          onClick={() => setShowAvatarNav(!showAvatarNav)}
          role="button"
          tabIndex={0}
          aria-label="Erica \u2014 your page guide. Click to navigate."
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAvatarNav(!showAvatarNav); } }}
        >
          EI
        </div>

        {/* Avatar Nav Menu — matches spec: click avatar to jump to sections */}
        {showAvatarNav && (
          <div className="avatar-nav">
            <div className="avatar-nav-title">Jump to...</div>
            <button onClick={() => scrollToSection('#approach')}>My approach</button>
            <button onClick={() => scrollToSection('#projects')}>My work</button>
            <button onClick={() => scrollToSection('#email-portfolio')}>Email samples</button>
            <button onClick={() => scrollToSection('#faq')}>FAQ</button>
            <button onClick={() => scrollToSection('#cta')}>Get a free page diagnosis</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   NAVIGATION
   Matches finalized JS exactly:
   - scrollY > 80: add .scrolled
   - scrollY > 100: hide scroll indicator
   - Mobile menu: body overflow lock
   ═══════════════════════════════════════════ */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      // Hide scroll indicator after scrolling (matches JS)
      const indicator = document.getElementById('scroll-indicator');
      if (indicator && window.scrollY > 100) {
        indicator.style.opacity = '0';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMobileMenu = () => {
    setMobileOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  const navigate = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    closeMobileMenu();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Skip Link */}
      <a href="#hero" className="skip-link">Skip to content</a>

      <nav id="main-nav" className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Erica Innocent
          </a>
          <div className="nav-links" id="nav-links">
            <a href="#projects" className="nav-link animated-link" onClick={(e) => navigate(e, '#projects')}>Work</a>
            <a href="#approach" className="nav-link animated-link" onClick={(e) => navigate(e, '#approach')}>Approach</a>
            <a href="#email-portfolio" className="nav-link animated-link" onClick={(e) => navigate(e, '#email-portfolio')}>Results</a>
            <a href="#cta" className="nav-link animated-link" onClick={(e) => navigate(e, '#cta')}>Contact</a>
          </div>
          <button className="nav-hamburger" id="nav-hamburger" aria-label="Open menu" onClick={openMobileMenu}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu — matches finalized HTML */}
      {mobileOpen && (
        <div id="mobile-menu" className="mobile-menu">
          <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">&times;</button>
          <a href="#projects" onClick={(e) => navigate(e, '#projects')}>Work</a>
          <a href="#approach" onClick={(e) => navigate(e, '#approach')}>Approach</a>
          <a href="#email-portfolio" onClick={(e) => navigate(e, '#email-portfolio')}>Results</a>
          <a href="#cta" onClick={(e) => navigate(e, '#cta')}>Contact</a>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section id="hero" data-guide="hero" className="hero">
      <div className="hero-grid-bg"></div>
      <div className="hero-content">
        <h1 className="reveal">
          <span className="hero-line">Your Sales Team Closes 35% Of Demos.</span>
          <span className="hero-line">Your Landing Page Closes 1.5%.</span>
          <span className="hero-line hero-accent">Same Product. Different Conversation.</span>
        </h1>
        <p className="hero-subhead reveal">I fix the conversation.</p>
        <p className="hero-description reveal">Conversion copy for B2B SaaS, fintech, and high-ticket coaches — built on customer research, not guesswork.</p>
        <div className="hero-cta reveal">
          <a href="#cta" className="btn-primary" onClick={(e) => { e.preventDefault(); document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Find The Line That's Costing You Customers →
          </a>
          <span className="hero-cta-sub">Free 15-minute page diagnosis</span>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="trust-bar-inner">
          <div className="trust-item reveal-stagger"><span className="trust-dash">—</span> Background: Cybersecurity → Conversion Architecture</div>
          <div className="trust-item reveal-stagger"><span className="trust-dash">—</span> Method: Customer-Language Research → Strategic Copy</div>
          <div className="trust-item reveal-stagger"><span className="trust-dash">—</span> Standard: Measure Everything. Guess Nothing.</div>
        </div>
      </div>

      {/* Scroll indicator — hidden via JS when scrollY > 100 */}
      <div className="scroll-indicator" id="scroll-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROBLEM SECTION
   ═══════════════════════════════════════════ */
function ProblemSection() {
  return (
    <section id="problem" data-guide="problem" className="section-primary">
      <div className="text-container">
        <span className="section-label reveal">THE PROBLEM</span>
        <h2 className="reveal">You've Already Tried Fixing This.</h2>
        <div className="body-copy reveal">
          <p>You rewrote the landing page yourself.</p>
          <p>Spent a weekend on it. Maybe a full week. Stared at it until the words stopped looking like words, shipped it on a Friday because you were tired of second-guessing, and told yourself <span className="emphasis">"this version is better."</span></p>
          <p>The conversion rate didn't move.</p>
          <p>So you hired someone. Found a copywriter with good reviews. Paid somewhere between enough-to-sting and enough-to-question-your-judgment. They sent you an intake form that felt like <span className="emphasis">a job application for your own business,</span> disappeared for a week, and came back with something smooth.</p>
          <p>Professional. Polished. Could have sold any product in any industry.</p>
          <p>Which is exactly the problem — <span className="emphasis">it sounded like it could sell anything. Not YOUR thing. Not to YOUR buyer. Not in YOUR buyer's language.</span></p>
          <p>The conversion rate didn't move.</p>
          <p>Now you're stuck in the worst place a founder can be. You know the page is the bottleneck. You've felt it for months. Your product is good — customers who get in stay for years. Your sales team can close in person. But the page that's supposed to do that job twenty-four hours a day, seven days a week, to every single visitor?</p>
          <p><span className="emphasis">It's not selling. It's just... there.</span></p>
          <p>And every month it stays broken is another $15,000 to $180,000 in revenue that landed on your page, looked around, and decided you weren't worth the click.</p>
        </div>
        <div className="callout reveal">
          <p>Stanford researchers documented why this keeps happening in 1990. They called it the Curse of Knowledge. Tappers who knew a song predicted 50% of listeners would recognize their tapping. Actual result: 2.5%. You hear your product's melody. Your visitor hears noise. The copywriter you hired just made the noise sound prettier.</p>
          <p className="source">— Chip & Dan Heath, Made to Stick (Stanford, 1990)</p>
        </div>
        <div className="body-copy reveal">
          <p><span className="emphasis">That's not a writing problem. That's a translation problem.</span></p>
          <p>Your page is having a conversation your visitor hasn't arrived at yet.</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   APPROACH SECTION
   ═══════════════════════════════════════════ */
function ApproachSection() {
  return (
    <section id="approach" data-guide="approach" className="section-secondary">
      <div className="text-container">
        <span className="section-label reveal">THE APPROACH</span>
        <h2 className="reveal">How I Fix The Conversation.</h2>
        <p className="section-subhead reveal">Not with prettier words. With the right words in the right order for the right person.</p>
      </div>

      <div className="card-container">
        {/* Step 1 */}
        <div className="card step-card reveal">
          <span className="step-number">STEP 01</span>
          <h3>I Find What Your Customers Actually Say.</h3>
          <p>Not what you think they care about. What they actually type at 2 AM in Reddit threads, G2 reviews, support tickets, and cancellation surveys.</p>
          <p>Your best headlines already exist. Written by customers who didn't know they were writing your copy.</p>
          <div className="callout-inline"><p className="citation">Content Marketing Institute, 2024: Only 29% of B2B marketers rate their content as effective at connecting with audience pain points. The other 71% are guessing. I don't guess. I mine.</p></div>
        </div>

        {/* Step 2 */}
        <div className="card step-card reveal">
          <span className="step-number">STEP 02</span>
          <h3>I Find Where Your Page Loses People.</h3>
          <p>Using Eugene Schwartz's awareness framework — originally published in 1966, still unmatched — I identify the exact point where your page starts having a conversation your visitor hasn't arrived at yet.</p>
          <p>Usually it's above the fold. Usually it's the first sentence.</p>
          <div className="callout-inline"><p className="citation">Gong's analysis of 30,000 B2B sales calls: Sellers who lead with the customer's problem close 28% more often than those who lead with product capabilities. Your landing page is a seller. What's it leading with?</p></div>
        </div>

        {/* Step 3 */}
        <div className="card step-card reveal">
          <span className="step-number">STEP 03</span>
          <h3>I Rebuild The Conversation.</h3>
          <p>Every headline, every subhead, every section — rewritten around what your customer needs to hear, in the order they need to hear it, using the words they already use.</p>
          <p>Not my words. Not your words. Theirs.</p>
          <div className="callout-inline"><p className="citation">Joseph Sugarman called this the slippery slide — every line pulling the reader to the next line so naturally that stopping feels incomplete. That's not clever writing. That's architecture.</p></div>
        </div>

        {/* Step 4 */}
        <div className="card step-card reveal">
          <span className="step-number">STEP 04</span>
          <h3>We Measure What Happened.</h3>
          <p>Conversion rate before. Conversion rate after. Revenue impact calculated.</p>
          <p>If a 1% lift on 10,000 monthly visitors at $50/month doesn't sound like much — that's $60,000 per year. From changing words on a page.</p>
          <p>No vanity metrics. No "brand awareness." Revenue.</p>
        </div>

        {/* Differentiator Block */}
        <div className="differentiator-card reveal">
          <h3>Why I'm Different From The Last Copywriter You Hired</h3>
          <div className="diff-grid">
            <div className="diff-row">
              <span className="diff-before">They sent you a questionnaire.</span>
              <span className="diff-arrow">→</span>
              <span className="diff-after">I interview your customers.</span>
            </div>
            <div className="diff-row">
              <span className="diff-before">They polished your words.</span>
              <span className="diff-arrow">→</span>
              <span className="diff-after">I find new ones — from the people who buy.</span>
            </div>
            <div className="diff-row">
              <span className="diff-before">They delivered "copy."</span>
              <span className="diff-arrow">→</span>
              <span className="diff-after">I deliver conversion architecture.</span>
            </div>
            <div className="diff-row">
              <span className="diff-before">They come from marketing.</span>
              <span className="diff-arrow">→</span>
              <span className="diff-after">I come from cybersecurity — where one wrong line breaks everything and precision isn't optional.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROJECTS SECTION
   ═══════════════════════════════════════════ */
function ProjectsSection() {
  return (
    <section id="projects" data-guide="projects" className="section-primary">
      <div className="text-container">
        <span className="section-label reveal">THE WORK</span>
        <h2 className="reveal">What My Thinking Looks Like In Practice.</h2>
        <p className="section-subhead reveal">Real projects. Real strategy. Real results on real budgets.</p>
      </div>

      <div className="card-container">
        {/* PROJECT 1: BananaCrystal */}
        <div id="project-bananacrystal" data-guide="project-bananacrystal" className="card card-accent project-card reveal">
          <div className="project-header">
            <span className="section-label">BANANACRYSTAL — P2P CURRENCY EXCHANGE</span>
            <h3>How I Turned $800 Into 2,500 Activated Users For A Fintech Platform</h3>
          </div>
          <div className="project-stats">
            <div className="stat reveal-stagger"><span className="stat-number">2,500</span><span className="stat-label">Engaged Members</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">$800</span><span className="stat-label">Total Budget</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">98%</span><span className="stat-label">Cost Savings</span></div>
          </div>
          <div className="project-body">
            <p><strong>The Problem:</strong> A P2P currency exchange platform needed to grow their community from zero to 1,500+ engaged members. Traditional approach would cost $45,000+. Their budget: $800. That's not a marketing budget. That's a rounding error.</p>
            <p><strong>What Most Marketers Would Do:</strong> Spend the $800 on ads. Get maybe 50-80 clicks. Maybe 10-15 signups. Call it "awareness building."</p>
            <p><strong>What I Did Instead:</strong> I designed a system where the budget didn't pay for ads — it paid the community to build itself. A quest-to-earn engine where every member who completed social tasks earned real USDT into their platform account. The twist: earning the reward required creating an account, making a deposit, and experiencing the product. Every marketing dollar doubled as an activation dollar. By Week 3, each member was recruiting 3+ people who recruited 3+ more. The marketing became self-sustaining.</p>
          </div>
          <div className="project-takeaway"><h4>What This Proves</h4><p>I don't just write words. I design systems where every piece of copy, every task description, every reward prompt serves a strategic conversion goal. $800 budget. $45,000 in results. That's not copywriting. That's conversion architecture.</p></div>
        </div>

        {/* PROJECT 2: Campus Wi-Fi */}
        <div id="project-wifi" data-guide="project-wifi" className="card card-accent project-card reveal">
          <div className="project-header">
            <span className="section-label">EDTECH STARTUP — CAMPUS WI-FI</span>
            <h3>Deep Customer Research That Uncovered A ₦1.9 Trillion Opportunity Hiding In Student Complaints</h3>
          </div>
          <div className="project-stats">
            <div className="stat reveal-stagger"><span className="stat-number">₦1.9T</span><span className="stat-label">Market Identified</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">₦1.4B</span><span className="stat-label">Y2 Revenue Projection</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">1.8M</span><span className="stat-label">Target Students</span></div>
          </div>
          <div className="project-body">
            <p><strong>The Problem:</strong> A startup believed Nigerian university students would pay for campus Wi-Fi instead of expensive mobile data. But "believed" doesn't raise funding. They needed proof that makes an investor put down their phone and lean forward.</p>
            <p><strong>What I Did:</strong> I went where 1.8 million students actually complain — forums, WhatsApp groups, Twitter threads, Facebook discussions. Not to collect data. To hear language.</p>
            <div className="callout">
              <p>"I spend ₦8,000-₦10,000 on data monthly. That's more than what I spend on feeding."</p>
              <p className="source">— Real student quote from forum research</p>
            </div>
            <p>That language didn't just validate the market. It BECAME the pitch. When an investor reads "choosing between data and food" — that's not a statistic. That's a human being. And human beings move capital faster than spreadsheets.</p>
          </div>
          <div className="project-takeaway"><h4>What This Proves</h4><p>The research methodology I used here — mining real customer language from forums and social platforms — is the same methodology I use for landing page copy. Finding the exact words your customers use when they describe their problem. Then putting those words on your page so visitors feel understood before they've read three sentences. ₦1.9T market identified. Not from a spreadsheet. From listening.</p></div>
        </div>

        {/* PROJECT 3: Education */}
        <div id="project-education" data-guide="project-education" className="card card-accent project-card reveal">
          <div className="project-header">
            <span className="section-label">UDIMKING FOUNDATION — SOCIAL IMPACT</span>
            <h3>Using Cognitive Psychology To Change Behavior At Scale</h3>
          </div>
          <div className="project-stats">
            <div className="stat reveal-stagger"><span className="stat-number">1,800+</span><span className="stat-label">Students Reached</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">95%</span><span className="stat-label">Satisfaction Rating</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">100%</span><span className="stat-label">Psychology-Backed</span></div>
          </div>
          <div className="project-body">
            <p><strong>The Problem:</strong> A foundation wanted to reduce exam cheating among Nigerian secondary school students. Previous approaches — punishment threats, moral lectures, surveillance — had all failed. Every approach treated the symptom. None addressed the cause.</p>
            <p><strong>What I Did:</strong> I researched WHY students cheat. Not the moral failure. The psychological driver. The answer: fear of failure. Students don't cheat because they're dishonest. They cheat because the fear of a bad result is more powerful than the fear of getting caught.</p>
            <p>Using cognitive science and emotional intelligence frameworks, I created messaging that normalized the fear of failure, gave students practical strategies that reduced anxiety, and reframed exam performance from identity threat to skill development. Behavior change through messaging alone — no punishment, no surveillance.</p>
          </div>
          <div className="project-takeaway"><h4>What This Proves</h4><p>Copy that changes behavior doesn't start with what you want the audience to DO. It starts with what they're FEELING. You can't push people into action. You have to understand what's holding them back and remove the barrier. That's what I do on landing pages. Find the psychological barrier. Remove it with the right words.</p></div>
        </div>

        {/* PROJECT 4: Email Campaigns */}
        <div className="card card-accent project-card reveal">
          <div className="project-header">
            <span className="section-label">MULTI-INDUSTRY EMAIL CAMPAIGNS</span>
            <h3>40+ Email Sequences That Outperform Industry Averages By 2x</h3>
          </div>
          <div className="project-stats">
            <div className="stat reveal-stagger"><span className="stat-number">40+</span><span className="stat-label">Sequences Written</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">25-40%</span><span className="stat-label">Open Rates</span></div>
            <div className="stat reveal-stagger"><span className="stat-number">2x</span><span className="stat-label">Industry Average</span></div>
          </div>
          <div className="project-body">
            <p><strong>The Approach:</strong> Every email follows a framework built from studying Schwartz, Sugarman, Cialdini, and Hormozi. Hook with a specific pain the reader felt this morning. Agitate with a scenario so specific they think I'm reading their journal. Reframe with an insight that changes how they see the problem. Deliver one actionable step they can use before tomorrow.</p>
            <p>The same customer-research methodology that works for landing pages works for email. Find the language. Mirror the frustration. Deliver the reframe. Earn the click.</p>
            <p><a href="#email-portfolio" className="animated-link" style={{ color: 'var(--amber)' }} onClick={(e) => { e.preventDefault(); document.querySelector('#email-portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>See full email samples below ↓</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   EMAIL PORTFOLIO SECTION
   toggleEmail matches finalized JS exactly:
   - Close all other open emails
   - Toggle clicked email
   - Call onContentExpand/onContentCollapse
   - scrollIntoView after 350ms
   ═══════════════════════════════════════════ */
function EmailPortfolioSection({ onContentChange }: { onContentChange: (expanded: boolean) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleEmail = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
      onContentChange(false);
    } else {
      setOpenIndex(index);
      onContentChange(true);
      // Scroll card into view after accordion opens
      setTimeout(() => {
        const cards = document.querySelectorAll('.email-card');
        if (cards[index]) cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
  };

  return (
    <section id="email-portfolio" data-guide="emails" className="section-secondary">
      <div className="text-container">
        <span className="section-label reveal">EMAIL PORTFOLIO</span>
        <h2 className="reveal">40+ Email Sequences. 2x Industry Average.</h2>
        <p className="section-subhead reveal">Samples from real campaigns across 10+ industries. Click to expand. Each one annotated with the psychology behind it.</p>
      </div>

      <div className="card-container">
        {/* Email 1 */}
        <div className={`email-card reveal ${openIndex === 0 ? 'open' : ''}`} onClick={() => toggleEmail(0)}>
          <div className="email-header">
            <div className="email-meta"><span className="email-tag">SOCIAL MEDIA</span><span className="email-tag">CONVERSION</span></div>
            <h4 className="email-subject">Why your 100K followers aren't buying</h4>
            <span className="email-expand-icon">+</span>
          </div>
          <div className={`email-content accordion-content ${openIndex === 0 ? 'open' : ''}`}>
            <div className="email-body">
              <p>[First Name],</p>
              <p>A hundred thousand people follow you on Instagram.</p>
              <p>You post every day. Reels. Carousels. Stories. You've been consistent for two years.</p>
              <p>So you launched your offer last Tuesday.</p>
              <p>And by Wednesday morning you'd made three sales.</p>
              <p>Three. Out of a hundred thousand.</p>
              <p>That's a 0.003% conversion rate.</p>
              <p>Your landing page — the one everyone says is "so bad" — converts at 1.2%.</p>
              <p>Your Instagram audience converts 400x WORSE than your worst performing page.</p>
              <p>Here's why.</p>
              <p>You built a crowd. Not a customer base.</p>
              <p>Robert Cialdini documented this in his research on commitment. People who consume free content have made a psychological commitment to being FREE CONSUMERS. Every free post they engage with reinforces that identity.</p>
              <p>"I'm someone who gets value from [Your Name] for free."</p>
              <p>And identity is sticky.</p>
              <p>Asking them to buy isn't asking for money. It's asking them to become a different person. That's a much bigger ask than $497.</p>
              <p>So what's the fix?</p>
              <p>Stop attracting everyone. Start filtering for buyers.</p>
              <p>Dan Kennedy calls this "repelling the wrong people to attract the right ones."</p>
              <p>Your content should do three things:</p>
              <p><strong>ONE: Pre-qualify.</strong> Every post should include a detail that only resonates with someone who's ready to invest.</p>
              <p><strong>TWO: Pre-sell.</strong> Share the FRAMEWORK, not just the tip. Tips create consumers. Frameworks create buyers.</p>
              <p><strong>THREE: Pre-close.</strong> By launch day, your buyer should already know they're buying. The launch email isn't a pitch. It's a permission slip.</p>
              <p>Tomorrow — the exact content filter framework that separates fans from buyers before you ever open the cart.</p>
              <p>Talk soon,<br />[Signature]</p>
              <p>P.S. Cialdini's research showed that people who take one small action consistent with an identity are 4x more likely to take a larger action consistent with that same identity. Your free followers have been taking the action of "free consumer" for two years. That's a deep groove to redirect. But it's not impossible.</p>
            </div>
            <div className="email-annotation">
              <h5>Why This Works</h5>
              <p>Opens with a specific, painful number (0.003%) that reframes the follower count from achievement to liability. Uses Cialdini's commitment principle to explain WHY they don't buy at the identity level. Three-step solution gives actionable structure.</p>
              <p className="citation">Frameworks: Cialdini's Commitment & Consistency + Kennedy's Takeaway Positioning</p>
            </div>
          </div>
        </div>

        {/* Email 2 */}
        <div className={`email-card reveal ${openIndex === 1 ? 'open' : ''}`} onClick={() => toggleEmail(1)}>
          <div className="email-header">
            <div className="email-meta"><span className="email-tag">CREATIVE BUSINESS</span><span className="email-tag">POSITIONING</span></div>
            <h4 className="email-subject">Your $500 logo problem isn't a pricing problem.</h4>
            <span className="email-expand-icon">+</span>
          </div>
          <div className={`email-content accordion-content ${openIndex === 1 ? 'open' : ''}`}>
            <div className="email-body">
              <p>[First Name],</p>
              <p>Client offered you $500 for a logo.</p>
              <p>You know you're worth $5,000. But you took the $500.</p>
              <p>Not because you're desperate. Because something worse.</p>
              <p>You couldn't ARTICULATE why yours is worth 10x more.</p>
              <p>And when you can't articulate the difference, price becomes the only difference.</p>
              <p>Al Ries and Jack Trout wrote about this in 1981. They called it the commodity trap. When a buyer can't see a meaningful difference between Option A and Option B, they default to the cheapest one.</p>
              <p>"Charge what you're worth" is the worst advice in creative business.</p>
              <p>Worth isn't what YOU believe. Worth is what the BUYER perceives. And perception is built on three things:</p>
              <p><strong>ONE: Specificity of outcome.</strong> "I design logos" = commodity. "I design brand identities for Series A SaaS companies that need to look fundable before their next raise" = specialist.</p>
              <p><strong>TWO: Diagnosis before prescription.</strong> Blair Enns calls this the difference between a vendor and an expert. Vendors say "send me your brief." Experts say "let me look at your situation first."</p>
              <p><strong>THREE: Proof that specificity works.</strong> "My last client's rebrand contributed to closing their Series A 45 days after launch." That's not a logo. That's a fundraising asset.</p>
              <p>Talk soon,<br />[Signature]</p>
              <p>P.S. You didn't take the $500 because you lack confidence. You took it because the market couldn't see what makes you different. That's not a mindset problem. That's a positioning problem. And positioning is fixable in about a week.</p>
            </div>
            <div className="email-annotation">
              <h5>Why This Works</h5>
              <p>Reframes pricing from mindset ("charge what you're worth") to positioning (make the difference visible). References three authoritative sources. The P.S. removes shame and replaces it with a solvable, tactical problem.</p>
              <p className="citation">Frameworks: Ries & Trout's Positioning + Thiel's Monopoly Theory + Enns' Expert vs Vendor</p>
            </div>
          </div>
        </div>

        {/* Email 3 */}
        <div className={`email-card reveal ${openIndex === 2 ? 'open' : ''}`} onClick={() => toggleEmail(2)}>
          <div className="email-header">
            <div className="email-meta"><span className="email-tag">HEALTH COACHING</span><span className="email-tag">LEVERAGE</span></div>
            <h4 className="email-subject">You're great at coaching. Terrible at business.</h4>
            <span className="email-expand-icon">+</span>
          </div>
          <div className={`email-content accordion-content ${openIndex === 2 ? 'open' : ''}`}>
            <div className="email-body">
              <p>[First Name],</p>
              <p>Let me guess:</p>
              <p>Your clients LOVE you. Testimonials everywhere. Before/after photos that are incredible.</p>
              <p>You've changed lives.</p>
              <p>But you're making $4K/month. Working 50 hours/week.</p>
              <p>One client cancels and your whole month is ruined.</p>
              <p>Here's the problem:</p>
              <p>You're a great COACH. But a terrible BUSINESS OWNER.</p>
              <p>And I don't mean that as an insult.</p>
              <p>Nobody taught you business. They taught you nutrition, exercise science, behavior change, client psychology. But NOT pricing models, leveraged systems, or scaling without burning out.</p>
              <p>So you default to what you know: 1:1 coaching. $200/month. Trading your time for money.</p>
              <p><strong>Stop selling your TIME. Start selling your SYSTEM.</strong></p>
              <p>Group programs. Digital courses. Templates. Community accountability. These are all LEVERAGED. Build once. Sell forever. Without adding hours to your week.</p>
              <p>That's how you go from $4K/month to $40K/month.</p>
              <p>Talk soon,<br />[Signature]</p>
              <p>P.S. You're not a bad business owner because you care too much. You're stuck because nobody taught you leverage. Let's fix that.</p>
            </div>
            <div className="email-annotation">
              <h5>Why This Works</h5>
              <p>Opens with validation ("your clients love you") before the hard truth — creating psychological safety before confrontation. "Nobody taught you" removes shame and replaces blame with explanation. The P.S. reinforces: the problem isn't character, it's education.</p>
              <p className="citation">Frameworks: Hormozi's Value Equation + Carnegie's Save Face Principle</p>
            </div>
          </div>
        </div>

        {/* View More */}
        <div className="email-more reveal">
          <p>3 of 40 samples shown. <a href="mailto:erica.iniking.2000@gmail.com?subject=Full%20Email%20Portfolio%20Request&body=Hi%20Erica%2C%0A%0AI%27d%20love%20to%20see%20the%20full%2040-email%20portfolio.%0A%0AMy%20industry%3A%20%0A%0AThanks!" className="animated-link" style={{ color: 'var(--amber)' }}>Contact for the complete collection →</a></p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FAQ SECTION
   toggleFaq matches finalized JS exactly:
   - Close all other open items
   - Toggle clicked item
   ═══════════════════════════════════════════ */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" data-guide="faq" className="section-primary">
      <div className="text-container">
        <span className="section-label reveal">QUESTIONS</span>
        <h2 className="reveal">Questions You're Already Thinking.</h2>
        <p className="section-subhead reveal">I'd rather answer them here than have them stop you from reaching out.</p>

        {/* FAQ 1 */}
        <div className={`faq-item reveal ${openIndex === 0 ? 'open' : ''}`} onClick={() => toggleFaq(0)} role="button" tabIndex={0} aria-expanded={openIndex === 0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(0); } }}>
          <div className="faq-question"><h4>"I've been burned by a copywriter before."</h4><span className="faq-icon">+</span></div>
          <div className={`faq-answer accordion-content ${openIndex === 0 ? 'open' : ''}`}>
            <p>Most copywriters are vendors. They take your brief, polish your words, and hand them back in a nicer font. I'm not a vendor. I'm a diagnostician. Before I write a word, I research your customers — what they say in reviews, how they describe their frustration, what language they use when nobody's marketing to them. If your last copywriter didn't interview your customers, they weren't doing copywriting. They were doing expensive editing.</p>
          </div>
        </div>

        {/* FAQ 2 */}
        <div className={`faq-item reveal ${openIndex === 1 ? 'open' : ''}`} onClick={() => toggleFaq(1)} role="button" tabIndex={0} aria-expanded={openIndex === 1} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(1); } }}>
          <div className="faq-question"><h4>"How do I know you understand my technical product?"</h4><span className="faq-icon">+</span></div>
          <div className={`faq-answer accordion-content ${openIndex === 1 ? 'open' : ''}`}>
            <p>I come from cybersecurity. One of the most technical industries that exists. I've spent years translating complex systems into language that non-technical decision-makers can act on. API integrations, data pipelines, compliance frameworks, encryption protocols — I don't need three weeks to learn what your product does. I already speak the language. My job is translating it into your customer's language.</p>
          </div>
        </div>

        {/* FAQ 3 */}
        <div className={`faq-item reveal ${openIndex === 2 ? 'open' : ''}`} onClick={() => toggleFaq(2)} role="button" tabIndex={0} aria-expanded={openIndex === 2} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(2); } }}>
          <div className="faq-question"><h4>"What if it doesn't work?"</h4><span className="faq-icon">+</span></div>
          <div className={`faq-answer accordion-content ${openIndex === 2 ? 'open' : ''}`}>
            <p>I can't guarantee a specific conversion rate. Anyone who does is lying. I don't control your traffic quality, your pricing, your competitors, or the economy. What I can guarantee: my process — customer interviews, competitor analysis, message-market alignment. My standard — every project gets research before writing. My integrity — if I can't help, I'll tell you before you spend a dollar. If after 90 days there's no measurable improvement, I'll redo the research and rewrite at no additional charge.</p>
          </div>
        </div>

        {/* FAQ 4 */}
        <div className={`faq-item reveal ${openIndex === 3 ? 'open' : ''}`} onClick={() => toggleFaq(3)} role="button" tabIndex={0} aria-expanded={openIndex === 3} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(3); } }}>
          <div className="faq-question"><h4>"Why should I pay premium when AI can write copy?"</h4><span className="faq-icon">+</span></div>
          <div className={`faq-answer accordion-content ${openIndex === 3 ? 'open' : ''}`}>
            <p>You should use AI. I do. Every day. AI is a tool for speed and variation. But AI doesn't know which of your G2 reviews contains your next headline. AI doesn't understand why a CFO hesitates at the pricing section. AI doesn't know that your customer's real pain isn't "inefficient workflows" but "I spend every Sunday night dreading Monday's reports." AI generates words. Strategy, positioning, and customer empathy require a human who's done the research. I use AI to move faster. I use research to move in the right direction. Speed in the wrong direction is just expensive failure with better grammar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section id="cta" data-guide="cta" className="section-cta">
      <div className="text-container" style={{ maxWidth: '640px' }}>
        <h2 className="reveal">One Page. That's All I Need To Show You What I See.</h2>
        <div className="body-copy reveal">
          <p>Send me your landing page URL.</p>
          <p>No call. No commitment. No pitch.</p>
          <p>I'll spend 15 minutes recording a personalized video telling you three things:</p>
          <p><span className="emphasis">→ The specific line that's costing you the most customers</span></p>
          <p><span className="emphasis">→ Why your visitor leaves at the exact point they leave</span></p>
          <p><span className="emphasis">→ The one change that would have the biggest impact on your conversion rate</span></p>
          <p>No charge. No obligation. No "just checking in" follow-up emails.</p>
          <p>If what I find is useful — we'll talk about what a full rewrite looks like. If it's not — you still walk away with a diagnosis most agencies charge $500+ for.</p>
          <p><span className="emphasis">Either way, you win.</span></p>
          <p>I'd rather earn skeptics than convince optimists.</p>
        </div>
        <div className="cta-action reveal">
          <a href="mailto:erica.iniking.2000@gmail.com?subject=Free%20Page%20Diagnosis%20Request&body=Hi%20Erica%2C%0A%0AHere%27s%20my%20landing%20page%20URL%3A%20%0A%0AA%20bit%20about%20my%20business%3A%20%0A%0AMain%20challenge%20I%27m%20facing%3A%20" className="btn-primary btn-large">
            Send My Page — Get The Free Diagnosis →
          </a>
          <p className="cta-subtext">Response time: 48 hours. No templates. No AI-generated PDFs.<br />A real video of a real person looking at your real page.</p>
        </div>
        <div className="capacity-badge reveal">
          <p className="capacity-main">Currently accepting 3 new projects per month.</p>
          <p className="capacity-sub">Deep work doesn't scale. And I'm okay with that.</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function FooterSection() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">Erica Innocent</p>
          <p className="footer-title">The Conversion Architect</p>
          <p className="footer-tagline">"Your best copy has already been written. By a customer who didn't know they were writing it. I just find it and put it where it belongs."</p>
        </div>
        <div className="footer-links">
          <a href="#projects" className="animated-link" onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}>Work</a>
          <a href="#approach" className="animated-link" onClick={(e) => { e.preventDefault(); document.querySelector('#approach')?.scrollIntoView({ behavior: 'smooth' }); }}>Approach</a>
          <a href="#email-portfolio" className="animated-link" onClick={(e) => { e.preventDefault(); document.querySelector('#email-portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}>Results</a>
          <a href="#cta" className="animated-link" onClick={(e) => { e.preventDefault(); document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
        </div>
        <div className="footer-connect">
          <a href="https://www.linkedin.com/in/erica-innocent-542147265/" target="_blank" rel="noopener noreferrer" className="animated-link">LinkedIn</a>
          <a href="mailto:erica.iniking.2000@gmail.com" className="animated-link">Email</a>
          <a href="https://wa.me/2348028792878?text=Hi%20Erica%2C%20I%20saw%20your%20portfolio%20and%20I%27d%20like%20to%20discuss%20my%20landing%20page." target="_blank" rel="noopener noreferrer" className="animated-link">WhatsApp</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Erica Innocent Effiong. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   APP — ENTRY POINT
   ═══════════════════════════════════════════ */
export function App() {
  const containerRef = useScrollReveal();
  const [contentExpanded, setContentExpanded] = useState(false);

  return (
    <div ref={containerRef}>
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <ApproachSection />
        <ProjectsSection />
        <EmailPortfolioSection onContentChange={setContentExpanded} />
        <FAQSection />
        <CTASection />
      </main>
      <FooterSection />
      <AvatarGuide contentExpanded={contentExpanded} />
    </div>
  );
}
