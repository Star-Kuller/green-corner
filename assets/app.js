'use strict';
(() => {
  // The queue is only a local verification aid; it is not a connected analytics service.
  const eventLog = [];
  window.greenCornerEvents = eventLog;
  window.greenCornerTrack = (name, properties = {}) => {
    const event = { name, properties, timestamp: new Date().toISOString(), page: location.pathname };
    eventLog.push(event);
    if (eventLog.length > 100) eventLog.shift();
    window.dispatchEvent(new CustomEvent('green-corner:event', { detail: event }));
  };

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.focus();
      }
    });
  }

  document.querySelectorAll('[data-event]').forEach(link => {
    link.addEventListener('click', () => {
      window.greenCornerTrack(link.dataset.event, { resource: link.dataset.resource });
    });
  });

  const form = document.querySelector('#plant-form');
  if (!form) return;
  const candidates = [
    { id: 'snake', name: 'Сансевиерия', light: ['bright', 'medium', 'low'], care: 'little', space: 'compact', reason: 'Её вертикальные листья занимают немного места, а просушивание грунта между поливами соответствует спокойному ритму ухода.' },
    { id: 'zz', name: 'Замиокулькас', light: ['medium', 'low', 'bright'], care: 'little', space: 'roomy', reason: 'Вы выделили место для роста и предпочитаете паузы в уходе. Замиокулькасу подходят рассеянный свет или полутень и просушивание грунта между поливами.' },
    { id: 'spider', name: 'Хлорофитум', light: ['bright', 'medium'], care: 'regular', space: 'compact', reason: 'Ему подойдёт полка с непрямым светом, а ваша готовность регулярно проверять грунт поможет поддерживать его слегка влажным без застоя воды.' },
    { id: 'monstera', name: 'Монстера', light: ['bright'], care: 'regular', space: 'roomy', reason: 'Яркий рассеянный свет, место для роста и регулярное внимание — хорошая отправная точка для знакомства с монстерой. Позже ей пригодится опора.' },
    { id: 'pothos', name: 'Эпипремнум', light: ['medium', 'low'], care: 'regular', space: 'roomy', reason: 'Его побеги можно направить по опоре или оставить свисать. В ваших условиях стоит начать с доступного рассеянного света и наблюдать за ростом.' },
    { id: 'pilea', name: 'Пилея', light: ['medium'], care: 'regular', space: 'compact', reason: 'Компактная пилея может стать небольшим акцентом в полутени. Проверяйте состояние грунта и не оставляйте воду в кашпо.' }
  ];
  const result = document.querySelector('#plant-result');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const answers = { light: data.get('light'), care: data.get('care'), space: data.get('space') };
    // Light is a prerequisite; the remaining preferences rank the compatible candidates.
    const ranked = candidates.filter(plant => plant.light.includes(answers.light)).map(plant => ({
      plant, score: (plant.care === answers.care ? 4 : 0) + (plant.space === answers.space ? 3 : 0) + (plant.light[0] === answers.light ? 1 : 0)
    })).sort((a, b) => b.score - a.score);
    const chosen = ranked[0].plant;
    document.querySelector('#result-title').textContent = chosen.name;
    document.querySelector('#result-reason').textContent = chosen.reason;
    document.querySelector('#result-link').href = 'catalog.html#' + chosen.id;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 300');
    svg.setAttribute('class', 'plant-art');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Иллюстрация: ' + chosen.name);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', 'assets/plants.svg#' + chosen.id);
    svg.append(use);
    document.querySelector('#result-art').replaceChildren(svg);
    form.hidden = true;
    result.hidden = false;
    window.greenCornerTrack('plant_match_complete', { ...answers, plant: chosen.id });
    document.querySelector('#result-title').focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  document.querySelector('#restart-quiz').addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    form.querySelector('input:checked, input').focus();
  });
})();
