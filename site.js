(() => {
  'use strict';
  const toggle = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#site-menu');
  if (toggle && menu) {
    const close = () => menu.close();
    toggle.addEventListener('click', () => {
      menu.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-open');
    });
    menu.querySelector('.menu-close').addEventListener('click', close);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    menu.addEventListener('close', () => {
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
    });
    menu.addEventListener('click', event => {
      const box = menu.getBoundingClientRect();
      if (event.target === menu && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close();
    });
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const track = document.querySelector('#work-track');
  if (track) {
    const previous = document.querySelector('#previous-project');
    const next = document.querySelector('#next-project');
    const move = direction => {
      const distance = track.querySelector('.project').getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      track.scrollBy({left:direction * distance, behavior:reduced.matches ? 'instant' : 'smooth'});
    };
    const controls = () => {
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.target === track && ['ArrowLeft','ArrowRight'].includes(event.key)) {
        event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    track.addEventListener('scroll', controls, {passive:true});
    window.addEventListener('resize', controls, {passive:true});
    controls();
  }
  const frame = document.querySelector('.hero-frame');
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const header = document.querySelector('.site-header');
  const beliefs = document.querySelector('.belief-track');
  let pending = false;
  const paint = () => {
    pending = false;
    if (hero && header) {
      header.classList.toggle('header-over-content', hero.getBoundingClientRect().bottom <= header.offsetHeight);
    }
    // The hero follows the user's scroll directly; it has no autoplay or inertia.
    if (frame && hero && stage) {
      const distance = Math.max(1, hero.offsetHeight - stage.offsetHeight);
      const amount = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / distance));
      const content = document.querySelector('.about-layout');
      const gutter = content ? parseFloat(getComputedStyle(content).paddingLeft) : 0;
      const endScale = Math.max(0, Math.min(1, (stage.clientWidth - gutter * 2) / stage.clientWidth));
      const eased = amount * amount * (3 - 2 * amount);
      frame.style.transform = `scale(${1 - (1 - endScale) * eased})`;
    }
    if (beliefs && reduced.matches) {
      beliefs.style.removeProperty('transform');
    } else if (beliefs) {
      const rect = beliefs.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight * .6 - rect.top) / window.innerHeight));
      beliefs.style.transform = `translateX(calc(-50% - ${progress * 65}px))`;
    }
  };
  const schedule = () => {if (!pending) {pending = true; requestAnimationFrame(paint);}};
  if (frame || beliefs) {
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule, {passive:true});
    window.addEventListener('pageshow', schedule);
    if (typeof reduced.addEventListener === 'function') {
      reduced.addEventListener('change', schedule);
    } else if (typeof reduced.addListener === 'function') {
      reduced.addListener(schedule);
    }
    paint();
  }
})();
