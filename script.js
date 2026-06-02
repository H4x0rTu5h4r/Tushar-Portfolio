/* ══════════════════════════════════════════════════════
   TUSHAR PORTFOLIO — script.js (Pro Edition)
   • Welcome screen dismiss with enhanced animations
   • Image-sequence hero (scroll-driven canvas)
   • Global background fade-in after hero
   • Section reveal on scroll with staggered animations
   • FAQ accordion interactions
   • Enhanced interaction effects
══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   IMAGE FILENAME MAP  (150 frames)
───────────────────────────────────────────────────── */

function buildFilenameMap(total) {
  const map = [];
  for (let i = 1; i <= total; i++) {
    const n = String(i).padStart(4, '0');
    let suffix;
    if (i === 1) {
      suffix = '0';
    } else {
      const pos = (i - 2) % 3;
      suffix = pos === 2 ? '4' : '3';
    }
    map.push(`images/${n}_${suffix}.jpeg`);
  }
  return map;
}

/* ─────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────── */
const FRAME_COUNT      = 150;
const PX_PER_FRAME     = 45;
const WELCOME_DURATION = 3200;

const FILENAMES = buildFilenameMap(FRAME_COUNT);

function getImagePath(idx) {
  return FILENAMES[Math.min(Math.max(idx, 0), FRAME_COUNT - 1)];
}

/* ═══════════════════════════════════════════════════
   WELCOME SCREEN — Enhanced
═══════════════════════════════════════════════════ */
const welcomeScreen = document.getElementById('welcome-screen');

function dismissWelcome() {
  if (!welcomeScreen) return;
  welcomeScreen.classList.add('hidden');
  welcomeScreen.addEventListener('transitionend', () => {
    welcomeScreen.remove();
  }, { once: true });
}

setTimeout(dismissWelcome, WELCOME_DURATION);
welcomeScreen && welcomeScreen.addEventListener('click', dismissWelcome);

/* ═══════════════════════════════════════════════════
   IMAGE SEQUENCE HERO
═══════════════════════════════════════════════════ */
const canvas      = document.getElementById('hero-canvas');
const ctx         = canvas.getContext('2d');
const heroSection = document.getElementById('hero');
const siteBody    = document.getElementById('site-body');
const globalBg    = document.getElementById('global-bg');

const frames = new Array(FRAME_COUNT);
let loadedCount   = 0;
let currentFrame  = 0;
let rafPending    = false;

function preloadImages() {
  const first = new Image();
  first.src = getImagePath(0);
  first.onload = () => {
    frames[0] = first;
    loadedCount++;
    resizeCanvas();
    renderFrame(0);
    loadRest();
  };
  first.onerror = () => { loadedCount++; loadRest(); };
  frames[0] = first;
}

function loadRest() {
  for (let i = 1; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getImagePath(i);
    img.onload  = () => { frames[i] = img; loadedCount++; };
    img.onerror = () => { loadedCount++; };
    frames[i] = img;
  }
}

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(currentFrame);
}

function renderFrame(idx) {
  const clamped = Math.min(Math.max(Math.round(idx), 0), FRAME_COUNT - 1);
  const img = frames[clamped];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(
    canvas.width  / img.naturalWidth,
    canvas.height / img.naturalHeight
  );
  const w  = img.naturalWidth  * scale;
  const h  = img.naturalHeight * scale;
  const ox = (canvas.width  - w) / 2;
  const oy = (canvas.height - h) / 2;

  ctx.drawImage(img, ox, oy, w, h);
  currentFrame = clamped;
}

function setHeroHeight() {
  heroSection.style.height =
    (FRAME_COUNT * PX_PER_FRAME + window.innerHeight) + 'px';
}

let targetFrame  = 0;
let displayFrame = 0;

function onScroll() {
  const scrollY    = window.scrollY;
  const heroTop    = heroSection.offsetTop;
  const heroH      = heroSection.offsetHeight;
  const heroBottom = heroTop + heroH;

  const progress = Math.min(
    Math.max((scrollY - heroTop) / (heroH - window.innerHeight), 0),
    1
  );

  targetFrame = progress * (FRAME_COUNT - 1);

  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(animateFrame);
  }

  const threshold = heroBottom - window.innerHeight * 0.15;
  if (scrollY >= threshold) {
    globalBg.classList.add('visible');
    siteBody.classList.add('bg-ready');
  } else {
    globalBg.classList.remove('visible');
    siteBody.classList.remove('bg-ready');
  }
}

function animateFrame() {
  displayFrame += (targetFrame - displayFrame) * 0.18;

  const rounded = Math.round(displayFrame);
  if (rounded !== currentFrame) {
    renderFrame(rounded);
  }

  if (Math.abs(targetFrame - displayFrame) > 0.2) {
    requestAnimationFrame(animateFrame);
  } else {
    rafPending = false;
  }
}

setHeroHeight();
resizeCanvas();
preloadImages();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  setHeroHeight();
  resizeCanvas();
  onScroll();
}, { passive: true });

/* ═══════════════════════════════════════════════════
   SECTION REVEAL ON SCROLL — Enhanced
═══════════════════════════════════════════════════ */
const sectionInners = document.querySelectorAll('.section-inner');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

sectionInners.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════
   FAQ ACCORDION INTERACTIONS
═══════════════════════════════════════════════════ */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    // Close other items
    faqItems.forEach(otherItem => {
      if (otherItem !== item && otherItem.classList.contains('active')) {
        otherItem.classList.remove('active');
      }
    });
    
    // Toggle current item
    item.classList.toggle('active');
  });
});

/* ═══════════════════════════════════════════════════
   SKILL PROGRESS ANIMATION ON SCROLL
═══════════════════════════════════════════════════ */
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.style.width;
        entry.target.style.width = '0';
        
        setTimeout(() => {
          entry.target.style.animation = `skill-bar-fill 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
          entry.target.style.width = width;
        }, 100);
        
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

skillBars.forEach(bar => skillObserver.observe(bar));

/* ═══════════════════════════════════════════════════
   ENHANCED INTERACTIONS
═══════════════════════════════════════════════════ */

// Smooth hover effects on project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
});

// Smooth hover effects on skill badges
const skillBadges = document.querySelectorAll('.skill-badge');
skillBadges.forEach(badge => {
  badge.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
});

// Smooth hover effects on social buttons
const socialBtns = document.querySelectorAll('.social-btn');
socialBtns.forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
});

// Service cards interaction
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
});

// Testimonial cards interaction
const testimonialCards = document.querySelectorAll('.testimonial-card');
testimonialCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
});

/* ═══════════════════════════════════════════════════
   PARALLAX EFFECT ON SCROLL
═══════════════════════════════════════════════════ */

function addParallaxEffect() {
  const scrollY = window.scrollY;
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    const offset = section.offsetTop;
    if (scrollY > offset - window.innerHeight) {
      const parallax = (scrollY - offset + window.innerHeight) * 0.05;
      section.style.transform = `translateY(${parallax}px)`;
    }
  });
}

window.addEventListener('scroll', addParallaxEffect, { passive: true });

/* ═══════════════════════════════════════════════════
   CURSOR GLOW EFFECT (Optional Enhancement)
═══════════════════════════════════════════════════ */

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

/* ═══════════════════════════════════════════════════
   SMOOTH SCROLL BEHAVIOR
═══════════════════════════════════════════════════ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      const offsetTop = target.offsetTop;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

/* ═══════════════════════════════════════════════════
   NAV — active link highlight
═══════════════════════════════════════════════════ */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    if (scrollMid >= top && scrollMid < bot) {
      navLinks.forEach(a => {
        a.style.color =
          a.getAttribute('href') === `#${sec.id}`
            ? 'var(--clr-accent)'
            : '';
      });
    }
  });
}

window.addEventListener('scroll', updateNav, { passive: true });

/* ═══════════════════════════════════════════════════
   SCROLL-TRIGGERED COUNTER ANIMATION
═══════════════════════════════════════════════════ */

function animateCounter(element, target, duration = 1500) {
  let current = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
let countersAnimated = false;

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        statNums.forEach(num => {
          const text = num.textContent;
          const numberMatch = text.match(/\d+/);
          if (numberMatch) {
            const target = parseInt(numberMatch[0]);
            animateCounter(num, target, 1500);
          }
        });
        countersAnimated = true;
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

if (statNums.length > 0) {
  counterObserver.observe(statNums[0].closest('.stat'));
}

/* ═══════════════════════════════════════════════════
   PERFORMANCE OPTIMIZATION
═══════════════════════════════════════════════════ */

let ticking = false;
function throttledScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      addParallaxEffect();
      updateNav();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', throttledScroll, { passive: true });

/* ═══════════════════════════════════════════════════
   PAGE LOAD ANIMATIONS
═══════════════════════════════════════════════════ */

window.addEventListener('load', () => {
  // Animate project cards on load
  projectCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animation = `project-fade 0.8s ease forwards`;
      card.style.animationDelay = `${index * 0.1}s`;
    }, 100);
  });

  // Animate service cards on load
  serviceCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animation = `service-fade 0.8s ease forwards`;
      card.style.animationDelay = `${index * 0.1}s`;
    }, 100);
  });

  // Animate testimonial cards on load
  testimonialCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animation = `testimonial-fade 0.8s ease forwards`;
      card.style.animationDelay = `${index * 0.1}s`;
    }, 100);
  });
});

/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS INDICATOR (Optional)
═══════════════════════════════════════════════════ */

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  
  // You can use this value to update a progress bar if needed
  // document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ─── Done ─── */

/* ═══════════════════════════════════════════════════
   HIRE ME BUTTON FUNCTIONALITY
═══════════════════════════════════════════════════ */
const hireMeBtn = document.getElementById('hire-me-btn');

if (hireMeBtn) {
  hireMeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    
    const contactLink = 'https://wa.me/+8801733377092';
    window.location.href = contactLink;
  });
  
  // Add smooth transition
  hireMeBtn.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
}

/* ─── Hire Features Animation ─── */
window.addEventListener('load', () => {
  const hireFeatures = document.querySelectorAll('.hire-feature');
  hireFeatures.forEach((feature, index) => {
    feature.style.animation = 'hire-feature-slide 0.6s ease forwards';
    feature.style.animationDelay = (0.5 + index * 0.1) + 's';
    feature.style.opacity = '0';
    feature.style.transform = 'translateX(-20px)';
  });
});
