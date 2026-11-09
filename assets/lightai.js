/* Copyright (c) 2026 Kenny / 李铿. SPDX-License-Identifier: MIT. */
/* Keep long role-evidence jumps precise in the lightweight mobile layout. */
(() => {
  const mobile = matchMedia('(max-width: 899px)');
  document.addEventListener('click', event => {
    if (!mobile.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href="#skills"], a[href="#workflow-case"], a[href="#nereid-center-reveal"], a[href="#ak50-shot-cards"], a[href="#nereid-shot-sequence"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    // The original target/menu handlers still run. Finish the distant jump
    // immediately instead of scrolling through and loading every project.
    event.preventDefault();
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  });
})();

/* A brief, non-blocking arrival notice, scoped to the opening screen. */
(() => {
  const notice = document.getElementById('connection-notice');
  if (!notice) return;
  if (location.hash && location.hash !== '#top') { notice.remove(); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  notice.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    notice.classList.add('is-visible');
    setTimeout(() => {
      // Keep the settled message on screen for ten seconds.
      notice.dataset.visibleSince = String(performance.now());
      setTimeout(() => {
        notice.classList.add('is-leaving');
        notice.setAttribute('aria-hidden', 'true');
        setTimeout(() => notice.remove(), reduce ? 0 : 450);
      }, 10000);
    }, reduce ? 0 : 550);
  }));
})();
