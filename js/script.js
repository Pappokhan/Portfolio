// Inject shared nav + footer partials, then wire up interactions
async function loadPartial(url, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch(url);
    mount.innerHTML = await res.text();
  } catch (err) {
    console.error('Could not load partial:', url, err);
  }
}

async function initLayout() {
  await Promise.all([
    loadPartial('partials/nav.html', 'nav-mount'),
    loadPartial('partials/footer.html', 'footer-mount'),
  ]);

  // Mark active nav link based on the current page
  const page = document.body.getAttribute('data-page');
  document.querySelectorAll('.nav-links a[data-page]').forEach((link) => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll progress bar
  const scanProgress = document.getElementById('scanProgress');
  function updateScanProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scanProgress) scanProgress.style.width = progress + '%';
  }
  window.addEventListener('scroll', updateScanProgress, { passive: true });
  updateScanProgress();
}

// Reveal-on-scroll for content sections
function initReveal() {
  const revealTargets = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// Gallery lightbox (only present on gallery.html)
function initGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('galleryLightboxClose');
  const media = document.getElementById('galleryLightboxMedia');
  const icon = document.getElementById('galleryLightboxIcon');
  const title = document.getElementById('galleryLightboxTitle');
  const desc = document.getElementById('galleryLightboxDesc');

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.gallery-media img');
      const existingImg = media.querySelector('img');
      if (existingImg) existingImg.remove();

      if (img && img.style.display !== 'none') {
        const clone = img.cloneNode(true);
        clone.removeAttribute('onerror');
        media.prepend(clone);
      }

      title.textContent = card.getAttribute('data-title') || '';
      desc.textContent = card.getAttribute('data-desc') || '';
      icon.textContent = card.querySelector('.gallery-placeholder-icon')?.textContent || '';

      lightbox.classList.add('open');
    });
  });

  function close() { lightbox.classList.remove('open'); }
  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initReveal();
  initGalleryLightbox();
});
