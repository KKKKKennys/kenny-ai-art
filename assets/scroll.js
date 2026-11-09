/* Copyright (c) 2026 Kenny / 李铿. SPDX-License-Identifier: MIT. */
(() => {
  'use strict';

  // A portfolio-specific desktop controller. Touch and nested panels remain native.
  class KennyPortfolioScroll {
    constructor() {
      this.motion = null;
      this.lastWrittenY = window.scrollY;
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.desktop = window.matchMedia('(min-width: 900px) and (pointer: fine)');
      this.onWheel = this.onWheel.bind(this);
      this.cancel = this.cancel.bind(this);
      window.addEventListener('wheel', this.onWheel, {passive: false});
      window.addEventListener('pointerdown', this.cancel, {passive: true});
      window.addEventListener('keydown', this.cancel);
      window.addEventListener('scroll', () => {
        if (this.motion && Math.abs(window.scrollY - this.lastWrittenY) > 3) this.cancel();
      }, {passive: true});
      this.reduced.addEventListener('change', this.cancel);
      this.desktop.addEventListener('change', this.cancel);
    }

    get limit() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    cancel() {
      this.motion = null;
      this.lastWrittenY = window.scrollY;
    }

    insideNativePanel(element, delta) {
      for (let node = element; node && node !== document.body; node = node.parentElement) {
        if (node.matches('input, textarea, select, [contenteditable="true"], [data-native-scroll]')) return true;
        const style = window.getComputedStyle(node);
        if (!/(auto|scroll)/.test(style.overflowY)) continue;
        const max = node.scrollHeight - node.clientHeight;
        if (max > 1 && (delta < 0 ? node.scrollTop > 0 : node.scrollTop < max - 1)) return true;
      }
      return false;
    }

    onWheel(event) {
      if (!this.desktop.matches || this.reduced.matches || event.defaultPrevented) return;
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
      const factor = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
      const delta = event.deltaY * factor;
      if (!delta || this.insideNativePanel(event.target, delta)) return;
      const startingTarget = this.motion ? this.motion.to : window.scrollY;
      const target = Math.min(this.limit, Math.max(0, startingTarget + delta));
      if (target === window.scrollY && !this.motion) return;
      event.preventDefault();
      this.animateTo(target, 300);
    }

    animateTo(destination, milliseconds) {
      const target = Math.max(0, Math.min(this.limit, destination));
      this.lastWrittenY = window.scrollY;
      this.motion = {from: window.scrollY, to: target, at: performance.now(), duration: milliseconds};
    }

    scrollTo(element, {offset = 0, duration = 1} = {}) {
      const destination = typeof element === 'number'
        ? element : element.getBoundingClientRect().top + window.scrollY;
      if (this.reduced.matches) {
        this.cancel();
        window.scrollTo({top: destination + offset, behavior: 'instant'});
        return;
      }
      this.animateTo(destination + offset, Math.max(180, Math.min(1400, duration * 1000)));
    }

    resize() {
      if (this.motion) this.motion.to = Math.min(this.motion.to, this.limit);
    }

    advance(now) {
      const motion = this.motion;
      if (!motion) return;
      const elapsed = Math.max(0, Math.min(1, (now - motion.at) / motion.duration));
      const remaining = 1 - elapsed;
      const eased = 1 - remaining * remaining * remaining;
      const nextY = motion.from + (motion.to - motion.from) * eased;
      window.scrollTo({top: nextY, behavior: 'instant'});
      this.lastWrittenY = window.scrollY;
      if (elapsed >= 1) this.motion = null;
    }
  }
  window.KennyPortfolioScroll = KennyPortfolioScroll;
})();
