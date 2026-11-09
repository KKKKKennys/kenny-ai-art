/* Copyright (c) 2026 Kenny / 李铿. SPDX-License-Identifier: MIT. */
(() => {
  'use strict';

  const page = document.documentElement;
  const trigger = document.getElementById('project-toggle');
  const popup = document.getElementById('project-menu');
  const sidebar = document.querySelector('.project-rail');
  const list = sidebar?.querySelector('.rail-list');
  const narrowScreen = window.matchMedia('(width < 1100px)');
  const projectLinks = Array.from(list?.querySelectorAll('a[data-project-jump]') || []);
  const projects = projectLinks.map((link, index) => ({
    element: document.getElementById(link.hash.substring(1)),
    link,
    number: index + 1,
    title: link.dataset.label || link.textContent.trim(),
  })).filter(project => project.element);
  let menuScrollOrigin = 0;

  function closeMenu(returnFocus = false) {
    if (!trigger || !popup) return;
    popup.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', '打开项目导航');
    if (returnFocus) trigger.focus({preventScroll: true});
  }

  if (trigger && popup) {
    trigger.addEventListener('click', () => {
      if (!popup.hidden) {
        closeMenu();
        return;
      }
      if (!narrowScreen.matches) return;
      menuScrollOrigin = window.scrollY;
      popup.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', '收起项目导航');
    });
    document.addEventListener('pointerdown', event => {
      if (!event.target.closest('.project-progress')) closeMenu();
    });
    document.addEventListener('focusin', event => {
      if (!event.target.closest('.project-progress')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !popup.hidden) closeMenu(true);
    });
    popup.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    narrowScreen.addEventListener('change', () => closeMenu());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') closeMenu();
    });
  }

  // Phone jumps bypass the intervening galleries and recheck the landing once
  // lazy media has established its height. Any new user gesture cancels this.
  let pendingJump = 0;
  const phone = window.matchMedia('(max-width: 899px)');
  const clearPendingJump = () => { pendingJump += 1; };
  document.addEventListener('wheel', clearPendingJump, {passive: true});
  document.addEventListener('touchstart', clearPendingJump, {passive: true});
  document.addEventListener('pointerdown', clearPendingJump, {passive: true});
  document.addEventListener('keydown', clearPendingJump);
  document.addEventListener('click', event => {
    if (!phone.matches || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[data-project-jump]');
    const target = link && document.getElementById(link.hash.substring(1));
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeMenu();
    const jump = ++pendingJump;
    const land = () => {
      if (jump === pendingJump) target.scrollIntoView({block: 'start', behavior: 'instant'});
    };
    land();
    requestAnimationFrame(land);
    [180, 480, 950].forEach(delay => setTimeout(land, delay));
  }, true);

  const folder = document.querySelector('.resource-folder');
  const folderButton = document.getElementById('folder-toggle');
  const downloads = document.getElementById('resource-files');
  function showDownloads(visible) {
    if (!folder || !folderButton || !downloads) return;
    folder.classList.toggle('is-open', visible);
    folderButton.setAttribute('aria-expanded', String(visible));
    downloads.setAttribute('aria-hidden', String(!visible));
    downloads.inert = !visible;
    const text = folderButton.querySelector('.folder-action > span');
    if (text) text.textContent = visible ? '收起资料夹' : '打开资料夹';
  }
  if (folderButton) {
    folderButton.addEventListener('click', () => {
      showDownloads(folderButton.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href="#resources"]');
      if (link) showDownloads(true);
    });
    window.addEventListener('hashchange', () => {
      if (location.hash === '#resources') showDownloads(true);
    });
    showDownloads(location.hash === '#resources');
  }

  const landmarks = [
    ...projects.map(project => ({
      element: project.element,
      title: project.title,
      caption: `${String(project.number).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`,
      project,
    })),
    {id: 'about', title: '关于我', caption: 'ABOUT KENNY'},
    {id: 'skills', title: 'Agent Skills', caption: 'SKILLS'},
    {id: 'resources', title: '作品资料', caption: '02 FILES'},
    {id: 'contact', title: '联系我', caption: 'LET’S TALK'},
  ].map(item => ({...item, element: item.element || document.getElementById(item.id)}))
    .filter(item => item.element);
  let positions = [];
  let scheduled = false;
  let previousY = window.scrollY;
  let currentId = null;

  function renderPosition() {
    scheduled = false;
    const y = window.scrollY;
    if (popup && !popup.hidden && Math.abs(y - menuScrollOrigin) > 30) closeMenu();
    if (sidebar && Math.abs(y - previousY) > 4) {
      sidebar.style.setProperty('--rail-direction', y > previousY ? '180deg' : '0deg');
      previousY = y;
    }
    const readingLine = y + Math.min(220, window.innerHeight / 3);
    let chosen = null;
    for (const entry of positions) {
      if (entry.top > readingLine) break;
      chosen = entry.item;
    }
    const selectedId = chosen?.element.id || 'top';
    if (selectedId === currentId) return;
    currentId = selectedId;

    document.querySelectorAll('[data-project-jump], .rail-skills, .menu-skills, .rail-resources')
      .forEach(link => {
        if (link.hash === '#' + selectedId) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    const title = trigger?.querySelector('.project-label');
    const count = trigger?.querySelector('.project-count');
    const selectedText = chosen?.title || '作品导览';
    if (title) title.textContent = selectedText;
    if (count) count.textContent = chosen?.caption || `${projects.length} 个项目`;

    const selectedProject = chosen?.project;
    const completedProjects = selectedProject
      ? selectedProject.number - 1
      : chosen ? projects.length : 0;
    projects.forEach((project, i) => project.link.classList.toggle('is-past', i < completedProjects));
    sidebar?.classList.toggle('has-project', Boolean(selectedProject));
    if (sidebar && selectedProject) {
      const target = selectedProject.link;
      const center = target.offsetTop + target.offsetHeight / 2;
      sidebar.style.setProperty('--rail-y', `${center - 9}px`);
      sidebar.style.setProperty('--rail-fill', `${Math.max(0, center - 26)}px`);
    } else if (sidebar) {
      sidebar.style.setProperty('--rail-fill', chosen ? '100%' : '0px');
    }
  }

  function schedulePosition() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(renderPosition);
  }
  let layoutPending = false;
  function scheduleLayout() {
    if (layoutPending) return;
    layoutPending = true;
    requestAnimationFrame(() => {
      layoutPending = false;
      const origin = window.scrollY;
      positions = landmarks.map(item => ({
        item,
        top: origin + item.element.getBoundingClientRect().top,
      })).sort((a, b) => a.top - b.top);
      currentId = null;
      schedulePosition();
    });
  }
  window.addEventListener('scroll', schedulePosition, {passive: true});
  window.addEventListener('resize', scheduleLayout, {passive: true});
  window.addEventListener('load', scheduleLayout);
  if (document.fonts) document.fonts.ready.then(scheduleLayout);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleLayout).observe(document.body);
  page.classList.add('navigation-ready');
  scheduleLayout();
})();
