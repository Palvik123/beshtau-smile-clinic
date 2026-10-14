/**
 * Бештау Смайл Клиник — Основной клиентский скрипт
 * Версия: 2.0.0 (Medical UX & Compliance)
 * Запрет эмодзи, доступность по ГОСТ Р 52872, модальная запись
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBookingModal();
  initDoctorScheduleModal();
  initPriceFilters();
  initAccessibilityMode();
  initHeroSlideshow();
  initPromoSlider();
  initYandexMetrikaGoals();
  initLanguageSwitcher();
});

/**
 * 1. Мобильная навигация
 */
function initMobileMenu() {
  const burger = document.querySelector('.menu-burger');
  const navMenu = document.querySelector('.nav-menu');

  if (!burger || !navMenu) return;

  burger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Закрытие при клике на ссылку меню
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Закрытие при клике вне меню
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 2. Модальное окно онлайн-записи через Яндекс.Форму
 */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  const modalTitle = modal.querySelector('#modal-title');

  // Фирменная плашка доверия в шапке модального окна записи
  if (!modal.querySelector('.modal-trust-bar')) {
    const modalHeader = modal.querySelector('.modal-header');
    if (modalHeader) {
      const trustBar = document.createElement('div');
      trustBar.className = 'modal-trust-bar';
      trustBar.innerHTML = `
        <div class="modal-trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Прием по времени</span>
        </div>
        <div class="modal-trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Пн–Вс 09:00–20:00</span>
        </div>
        <div class="modal-trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Солнечный проезд, 10к1</span>
        </div>
      `;
      modalHeader.insertAdjacentElement('afterend', trustBar);
    }
  }

  const openModal = (contextTitle) => {
    if (contextTitle && modalTitle) {
      modalTitle.textContent = 'Запись на прием: ' + contextTitle;
    } else if (modalTitle) {
      modalTitle.textContent = 'Запись на прием к стоматологу';
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Надежное делегирование клика для любых кнопок и ссылок записи
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-modal="booking"], .cta-booking-btn, a[href="#booking-modal"]');
    if (trigger) {
      e.preventDefault();
      const targetDoctor = trigger.getAttribute('data-doctor');
      const targetService = trigger.getAttribute('data-service');
      const targetPromo = trigger.getAttribute('data-promo');
      const context = targetPromo
        ? ('по акции «' + targetPromo + '»')
        : (targetDoctor || targetService || '');
      openModal(context);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/**
 * 3. Фильтрация и поиск по прайс-листу (табы и поиск на лету)
 */
function initPriceFilters() {
  const tabs = document.querySelectorAll('.tab-btn');
  const searchInput = document.querySelector('.price-search-input');
  const tables = document.querySelectorAll('.price-table-card');

  if (!tabs.length && !searchInput) return;

  let currentCategory = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    tables.forEach(tableCard => {
      const tableCategory = tableCard.getAttribute('data-category');
      const rows = tableCard.querySelectorAll('tbody tr, .price-table tr:not(:first-child)');
      let hasVisibleRow = false;

      const categoryMatches = (currentCategory === 'all' || tableCategory === currentCategory);

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const serviceAttr = (row.querySelector('[data-service]')?.getAttribute('data-service') || '').toLowerCase();
        const matchesSearch = !searchQuery || text.includes(searchQuery) || serviceAttr.includes(searchQuery);

        if (categoryMatches && matchesSearch) {
          row.style.display = '';
          hasVisibleRow = true;
        } else {
          row.style.display = 'none';
        }
      });

      if (categoryMatches && hasVisibleRow) {
        tableCard.style.display = '';
      } else {
        tableCard.style.display = 'none';
      }
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/**
 * 4. Режим для слабовидящих (ГОСТ Р 52872)
 */
function initAccessibilityMode() {
  const toggleBtn = document.querySelector('.btn-a11y-toggle');
  const storageKey = 'beshtau_a11y_mode';

  // Восстановление состояния при загрузке страницы
  if (localStorage.getItem(storageKey) === 'active') {
    document.body.classList.add('a11y-active');
  }

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isActive = document.body.classList.toggle('a11y-active');
    localStorage.setItem(storageKey, isActive ? 'active' : 'inactive');
    toggleBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * 5. Всплывающий график приема врачей (7 дней, включая воскресенье)
 */
const DOCTOR_SCHEDULES = {
  fatahhov: {
    id: "fatahhov",
    name: "Фатахов Анзор Сулейманович",
    shortName: "Фатахов А.С.",
    specialty: "Стоматолог-хирург, имплантолог",
    exp: "Стаж 14 лет",
    photo: "doctor-fatahhov.jpg",
    cabinet: "Кабинет № 1 (Хирургия / Имплантология)",
    desc: "Атравматичное удаление зубов, дентальная имплантация, синус-лифтинг и костная пластика.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", active: true },
      { day: "Вт", dayFull: "Вторник", time: "10:00 – 16:00", active: true },
      { day: "Ср", dayFull: "Среда", time: "14:00 – 20:00", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", active: true },
      { day: "Пт", dayFull: "Пятница", time: "14:00 – 20:00", active: true },
      { day: "Сб", dayFull: "Суббота", time: "09:00 – 15:00", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 18:00", active: true }
    ]
  },
  gevorkyan: {
    id: "gevorkyan",
    name: "Геворкян Арут Эдикович",
    shortName: "Геворкян А.Э.",
    specialty: "Стоматолог-ортопед, имплантолог",
    exp: "Стаж 16 лет",
    photo: "doctor-gevorkyan.jpg",
    cabinet: "Кабинет № 2 (Ортопедия / Протезирование)",
    desc: "Тотальная функциональная реабилитация, безметалловая керамика E.max, оксид циркония, протезирование на имплантатах.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", active: true },
      { day: "Вт", dayFull: "Вторник", time: "14:00 – 20:00", active: true },
      { day: "Ср", dayFull: "Среда", time: "10:00 – 16:00", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", active: true },
      { day: "Пт", dayFull: "Пятница", time: "14:00 – 20:00", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 18:00", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 17:00", active: true }
    ]
  },
  bekisheva: {
    id: "bekisheva",
    name: "Бекишова Юлия Владимировна",
    shortName: "Бекишова Ю.В.",
    specialty: "Детский стоматолог, пародонтолог",
    exp: "Стаж 10 лет",
    photo: "doctor-bekisheva.jpg",
    cabinet: "Кабинет № 3 (Детское отделение / Пародонтология)",
    desc: "Адаптационный прием детей, лечение кариеса без бормашины (ICON), профилактика и терапия патологий пародонта.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", active: true },
      { day: "Вт", dayFull: "Вторник", time: "13:00 – 19:00", active: true },
      { day: "Ср", dayFull: "Среда", time: "09:00 – 15:00", active: true },
      { day: "Чт", dayFull: "Четверг", time: "13:00 – 19:00", active: true },
      { day: "Пт", dayFull: "Пятница", time: "09:00 – 15:00", active: true },
      { day: "Сб", dayFull: "Суббота", time: "09:00 – 16:00", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 16:00", active: true }
    ]
  },
  korolev: {
    id: "korolev",
    name: "Королев Дмитрий Александрович",
    shortName: "Королев Д.А.",
    specialty: "Стоматолог-терапевт, эндодонтист",
    exp: "Стаж 11 лет",
    photo: "doctor-korolev.jpg",
    cabinet: "Кабинет № 4 (Терапия / Эндодонтия под микроскопом)",
    desc: "Лечение и перелечивание труднопроходимых корневых каналов под микроскопом, эстетическая анатомическая реставрация.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "14:00 – 20:00", active: true },
      { day: "Вт", dayFull: "Вторник", time: "09:00 – 15:00", active: true },
      { day: "Ср", dayFull: "Среда", time: "14:00 – 20:00", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", active: true },
      { day: "Пт", dayFull: "Пятница", time: "09:00 – 15:00", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 17:00", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 18:00", active: true }
    ]
  },
  avetikova: {
    id: "avetikova",
    name: "Аветикова Анна Геннадьевна",
    shortName: "Аветикова А.Г.",
    specialty: "Стоматолог-ортодонт, детский ортодонт",
    exp: "Стаж 8 лет",
    photo: "doctor-avetikova.jpg",
    cabinet: "Кабинет № 2 (Ортодонтическое отделение)",
    desc: "Исправление прикуса современными брекет-системами Damon, лечение элайнерами, ранняя ортодонтия у детей.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "10:00 – 17:00", active: true },
      { day: "Вт", dayFull: "Вторник", time: "10:00 – 19:00", active: true },
      { day: "Ср", dayFull: "Среда", time: "10:00 – 16:00", active: true },
      { day: "Чт", dayFull: "Четверг", time: "11:00 – 18:00", active: true },
      { day: "Пт", dayFull: "Пятница", time: "11:00 – 19:00", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 18:00", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "11:00 – 17:00", active: true }
    ]
  }
};

function initDoctorScheduleModal() {
  const isSubdir = window.location.pathname.includes('/doctors/');
  const imgPrefix = isSubdir ? '../images/' : 'images/';

  // Создаем модальное окно графика в DOM, если его еще нет
  let modal = document.getElementById('doctor-schedule-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'doctor-schedule-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog schedule-modal-dialog">
        <div class="schedule-modal-header">
          <div class="schedule-modal-title-wrap">
            <div class="schedule-modal-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h3 class="schedule-modal-title">График приема врачей-стоматологов</h3>
              <p class="schedule-modal-subtitle">Бештау Смайл Клиник &bull; Ежедневно 09:00–20:00 (без выходных)</p>
            </div>
          </div>
          <button class="modal-close-btn schedule-modal-close" aria-label="Закрыть график">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="schedule-doctor-nav" id="schedule-tabs-container"></div>

        <div class="schedule-card-profile" id="schedule-profile-container"></div>

        <div class="schedule-grid-container" id="schedule-table-container"></div>

        <div class="schedule-modal-footer">
          <div class="schedule-footer-note">
            Прием ведется по предварительной записи. Для экстренных случаев с острой болью доступен неотложный прием в день обращения.
          </div>
          <button class="btn btn-primary btn-sm" id="schedule-book-btn">Записаться на прием к врачу</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const closeBtn = modal.querySelector('.schedule-modal-close');
  const tabsContainer = modal.querySelector('#schedule-tabs-container');
  const profileContainer = modal.querySelector('#schedule-profile-container');
  const tableContainer = modal.querySelector('#schedule-table-container');
  const bookBtn = modal.querySelector('#schedule-book-btn');

  let currentDoctorKey = 'fatahhov';

  // Индекс сегодняшнего дня: 0=Вс (индекс 6), 1=Пн (0), 2=Вт (1)... 6=Сб (5)
  const getTodayScheduleIndex = () => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  const renderSchedule = (doctorKey) => {
    const doc = DOCTOR_SCHEDULES[doctorKey] || DOCTOR_SCHEDULES.fatahhov;
    currentDoctorKey = doc.id;

    // 1. Рендер табов
    tabsContainer.innerHTML = Object.values(DOCTOR_SCHEDULES).map(d => `
      <button class="schedule-doctor-tab ${d.id === doc.id ? 'active' : ''}" data-doc-id="${d.id}">
        ${d.shortName}
      </button>
    `).join('');

    // Слушатели табов
    tabsContainer.querySelectorAll('.schedule-doctor-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        renderSchedule(tab.getAttribute('data-doc-id'));
      });
    });

    // 2. Рендер профиля доктора
    const avatarHtml = doc.photo
      ? `<img src="${imgPrefix}${doc.photo}" alt="${doc.name}" loading="lazy">`
      : `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 18px auto; display: block; color: #9CA3AF;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    profileContainer.innerHTML = `
      <div class="schedule-doc-avatar">${avatarHtml}</div>
      <div class="schedule-doc-info">
        <span class="schedule-doc-specialty">${doc.specialty}</span>
        <h4 class="schedule-doc-name">${doc.name}</h4>
        <div class="schedule-doc-meta">
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${doc.exp}
          </span>
          <span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${doc.cabinet}
          </span>
        </div>
      </div>
    `;

    // 3. Рендер сетки дней
    const todayIdx = getTodayScheduleIndex();
    const todayData = doc.days[todayIdx];
    const isTodayWorking = todayData && todayData.active;

    const rowsHtml = doc.days.map((item, idx) => {
      const isToday = idx === todayIdx;
      return `
        <tr class="${isToday ? 'today-row' : ''}">
          <td class="col-schedule-day">
            <div class="schedule-day-label">
              <span class="day-circle ${item.active ? 'active' : ''}">${item.day}</span>
              <span class="schedule-day-name">${item.dayFull}</span>
              ${isToday ? '<span class="schedule-today-badge">Сегодня</span>' : ''}
            </div>
          </td>
          <td class="col-schedule-time">
            <span class="schedule-time-val">${item.time}</span>
          </td>
          <td class="col-schedule-action" style="text-align: right;">
            <button type="button" class="btn-schedule-day-book" data-doc-name="${doc.name}" data-day="${item.dayFull}" data-time="${item.time}">Записаться</button>
          </td>
        </tr>
      `;
    }).join('');

    tableContainer.innerHTML = `
      <div class="schedule-grid-title">
        <h4>Недельный график приема (Пн – Вс)</h4>
        <div class="schedule-today-badge ${isTodayWorking ? '' : 'busy'}">
          ${isTodayWorking ? 'Сегодня приемный день: ' + todayData.time : 'Сегодня прием по предварительной записи'}
        </div>
      </div>
      <table class="schedule-table">
        <thead>
          <tr>
            <th>День недели</th>
            <th>Часы приема</th>
            <th style="text-align: right;">Запись</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    // Настройка кнопки записи
    if (bookBtn) {
      bookBtn.textContent = 'Записаться к доктору (' + doc.shortName + ')';
    }
    window.dispatchEvent(new CustomEvent('beshtau:render-schedule'));
  };

  const openScheduleModal = (doctorKey) => {
    // Определение врача по ключевому слову или имени
    let targetKey = 'fatahhov';
    if (doctorKey) {
      const lower = doctorKey.toLowerCase();
      if (lower.includes('геворкян') || lower.includes('gevorkyan')) targetKey = 'gevorkyan';
      else if (lower.includes('бекишов') || lower.includes('bekisheva') || lower.includes('bekishova')) targetKey = 'bekisheva';
      else if (lower.includes('королев') || lower.includes('korolev')) targetKey = 'korolev';
      else if (lower.includes('аветик') || lower.includes('avetikova')) targetKey = 'avetikova';
      else if (lower.includes('фатахов') || lower.includes('fatahhov') || lower.includes('fatahov')) targetKey = 'fatahhov';
    } else if (isSubdir) {
      // Автоопределение из URL текущей страницы
      const path = window.location.pathname;
      if (path.includes('gevorkyan')) targetKey = 'gevorkyan';
      else if (path.includes('bekisheva')) targetKey = 'bekisheva';
      else if (path.includes('korolev')) targetKey = 'korolev';
      else if (path.includes('avetikova')) targetKey = 'avetikova';
      else if (path.includes('fatahhov')) targetKey = 'fatahhov';
    }

    renderSchedule(targetKey);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeScheduleModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Клик по кнопкам открытия графика
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.btn-schedule-open, [data-open-schedule]');
    if (trigger) {
      e.preventDefault();
      const docKey = trigger.getAttribute('data-doctor') || trigger.getAttribute('data-open-schedule') || '';
      openScheduleModal(docKey);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeScheduleModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeScheduleModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeScheduleModal();
    }
  });

  // Кнопка записи из окна расписания (общая)
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      const activeDoc = DOCTOR_SCHEDULES[currentDoctorKey];
      closeScheduleModal();
      const bookingModal = document.getElementById('booking-modal');
      if (bookingModal) {
        const modalTitle = bookingModal.querySelector('#modal-title');
        if (modalTitle && activeDoc) {
          modalTitle.textContent = 'Запись на прием: ' + activeDoc.name;
        }
        bookingModal.classList.add('active');
        bookingModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Клик по кнопке быстрой записи рядом с конкретным днем
  modal.addEventListener('click', (e) => {
    const dayBtn = e.target.closest('.btn-schedule-day-book');
    if (dayBtn) {
      e.preventDefault();
      const docName = dayBtn.getAttribute('data-doc-name') || '';
      const dayName = dayBtn.getAttribute('data-day') || '';
      const timeVal = dayBtn.getAttribute('data-time') || '';

      closeScheduleModal();

      const bookingModal = document.getElementById('booking-modal');
      if (bookingModal) {
        const modalTitle = bookingModal.querySelector('#modal-title');
        if (modalTitle) {
          modalTitle.textContent = docName
            ? 'Запись на прием: ' + docName + ' (' + dayName + ', ' + timeVal + ')'
            : 'Запись на прием (' + dayName + ', ' + timeVal + ')';
        }
        bookingModal.classList.add('active');
        bookingModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }
  });
}

/**
 * 6. Автоматическое слайд-шоу фотографий клиники на главном экране (Hero)
 */
function initHeroSlideshow() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  const prevBtn = slider.querySelector('.hero-slider-btn.prev');
  const nextBtn = slider.querySelector('.hero-slider-btn.next');

  if (!slides.length) return;

  let currentIndex = 0;
  let intervalId = null;
  const slideDuration = 4500;

  const showSlide = (index) => {
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  };

  const nextSlide = () => showSlide(currentIndex + 1);
  const prevSlide = () => showSlide(currentIndex - 1);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalId = setInterval(nextSlide, slideDuration);
  };

  const stopAutoPlay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(idx);
      startAutoPlay();
    });
  });

  // Пауза при наведении мыши
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  // Свайп на мобильных устройствах
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startAutoPlay();
  }, { passive: true });

  startAutoPlay();
}

/**
 * 7. Интерактивный промо-слайдер акций в стиле Denta Keller
 */
function initPromoSlider() {
  const container = document.getElementById('promo-slider');
  if (!container) return;

  const track = container.querySelector('.promo-slider-track');
  const slides = container.querySelectorAll('.promo-slide');
  const dots = document.querySelectorAll('.promo-dot');
  const counter = document.getElementById('promo-counter');
  const prevBtn = document.getElementById('promo-prev-btn');
  const nextBtn = document.getElementById('promo-next-btn');

  if (!track || !slides.length) return;

  const total = slides.length;
  let currentIndex = 0;
  let intervalId = null;
  const slideDuration = 6000;

  const updateSlider = (index) => {
    currentIndex = (index + total) % total;
    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === currentIndex);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentIndex);
    });

    if (counter) {
      counter.textContent = (currentIndex + 1) + ' / ' + total;
    }
  };

  const nextPromo = () => updateSlider(currentIndex + 1);
  const prevPromo = () => updateSlider(currentIndex - 1);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalId = setInterval(nextPromo, slideDuration);
  };

  const stopAutoPlay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextPromo();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevPromo();
      startAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateSlider(idx);
      startAutoPlay();
    });
  });

  // Пауза при наведении мыши
  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  // Свайп на мобильных устройствах
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextPromo();
      else prevPromo();
    }
    startAutoPlay();
  }, { passive: true });

  updateSlider(0);
  startAutoPlay();
}

/**
 * 8. Отслеживание коммерческих конверсий в Яндекс.Метрике
 */
function initYandexMetrikaGoals() {
  const ymCounterId = 105891320;
  const reachGoal = (targetName, params) => {
    try {
      if (typeof window.ym === 'function') {
        window.ym(ymCounterId, 'reachGoal', targetName, params || {});
      }
    } catch (e) {
      // Игнорируем ошибки при наличии блокировщиков рекламы
    }
  };

  // 1. Открытие модального окна онлайн-записи
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-modal="booking"], .cta-booking-btn, a[href="#booking-modal"]');
    if (trigger) {
      const doctor = trigger.getAttribute('data-doctor') || '';
      const service = trigger.getAttribute('data-service') || '';
      const promo = trigger.getAttribute('data-promo') || '';
      reachGoal('booking_open', { doctor, service, promo });
    }
  });

  // 2. Клик по номеру телефона (звонок в регистратуру)
  document.addEventListener('click', (e) => {
    const phoneLink = e.target.closest('a[href^="tel:"]');
    if (phoneLink) {
      reachGoal('phone_click', { phone: phoneLink.getAttribute('href') });
    }
  });

  // 3. Переход в Яндекс.Карты или построение маршрута
  document.addEventListener('click', (e) => {
    const mapLink = e.target.closest('a[href*="yandex.ru/maps"], a[href*="yandex.com/maps"]');
    if (mapLink) {
      reachGoal('route_click', { href: mapLink.getAttribute('href') });
    }
  });

  // 4. Открытие графика работы врача
  document.addEventListener('click', (e) => {
    const scheduleBtn = e.target.closest('.btn-schedule-open');
    if (scheduleBtn) {
      const doc = scheduleBtn.getAttribute('data-doctor') || '';
      reachGoal('doctor_schedule_open', { doctor: doc });
    }
  });
}





/**
 * 9. Система переключения языков (RU / EN)
 */
function initLanguageSwitcher() {
  const STORAGE_KEY = 'beshtau_lang';

  const DICTIONARY = {
    "&copy; 2026 ООО «Бештау Смайл Клиник». Все права защищены.": "&copy; 2026 LLC Beshtau Smile Clinic. All rights reserved.",
    "1 000 руб.": "1,000 RUB",
    "10%": "10%",
    "16 лет": "16 years",
    "357340, Россия, Ставропольский край, г. Лермонтов, Солнечный проезд, д. 10, корп. 1, этаж 2": "357340, Russia, Stavropol Territory, Lermontov, Solnechny proezd 10, bldg. 1, 2nd floor",
    "357340, Ставропольский край, г. Лермонтов, Солнечный проезд, д. 10, корп. 1, этаж 2": "357340, Stavropol Territory, Lermontov, Solnechny proezd 10, bldg. 1, 2nd floor",
    "5 врачей": "5 Doctors",
    "Email: beshtausmail@yandex.ru": "Email: beshtausmail@yandex.ru",
    "ICON-лечение кариеса у детей": "ICON drill-free pediatric caries treatment",
    "M-Chip (1 челюсть) Электрофорез лекарственных препаратов": "M-Chip drug electrophoresis (1 jaw)",
    "M-Chip (локально 1-2 сегмента) Электрофорез лекарственных препаратов": "M-Chip drug electrophoresis (local 1-2 segments)",
    "© 2026 ООО «Бештау Смайл Клиник». Все права защищены.": "© 2026 LLC Beshtau Smile Clinic. All rights reserved.",
    "«Бештау Смайл Клиник» объединяет доказательную медицину, передовые технологии цифровой стоматологии и внимательное человеческое отношение к каждому пациенту.": "Beshtau Smile Clinic unites evidence-based medicine, advanced digital dentistry technologies, and attentive personal care for every patient.",
    "«Бештау Смайл Клиник» предлагает компаниям региона выгодные программы комплексного медицинского обслуживания сотрудников, профилактические чек-апы и специальные тарифы по прямому договору.": "Beshtau Smile Clinic offers regional companies beneficial comprehensive dental healthcare programs for employees, preventive checkups, and special tariffs under direct contracts.",
    "Аветикова Анна Геннадьевна": "Dr. Anna Avetikova",
    "Аветикова Анна Геннадьевна — Стоматолог-ортодонт — Бештау Смайл Клиник": "Dr. Anna Avetikova — Orthodontist — Beshtau Smile Clinic",
    "Адаптационный безболезненный прием для детей любого возраста": "Adaptation, pain-free visits for children of all ages",
    "Адаптационный прием детей младшего и школьного возраста": "Adaptation appointments for preschool and school-age children",
    "Адаптационный прием детей, лечение кариеса без сверления (ICON), профилактика и терапия воспалительных патологий пародонта.": "Child adaptation visits, drill-free ICON caries treatment, periodontal prevention and anti-inflammatory therapy.",
    "Адаптационный прием для маленьких пациентов": "Adaptation visits for young patients",
    "Адаптационный прием, безболезненное лечение молочных и постоянных зубов, цветные пломбы и герметизация фиссур.": "Adaptation visits, painless primary and permanent tooth treatments, colorful fillings, and fissure sealing.",
    "Адаптация (повторная) Психологическая подготовка ребенка к лечению": "Follow-up child psychological adaptation for dental treatment",
    "Адаптация Психологическая подготовка ребенка к лечению": "Child psychological adaptation for dental treatment",
    "Адрес клиники": "Clinic Address",
    "Адрес: 355000, г. Ставрополь, ул. Маршала Жукова, 42/311": "Address: 355000, Stavropol, Marshala Zhukova st., 42/311",
    "Адрес: 355008, г. Ставрополь, переулок Фадеева, 4": "Address: 355008, Stavropol, Fadeeva lane, 4",
    "Адрес: 355012, г. Ставрополь, ул. Голенева, 67Б": "Address: 355012, Stavropol, Goleneva st., 67B",
    "Актуальный официальный прайс-лист клиники Бештау Смайл в г. Лермонтов. 284 медицинские услуги без скрытых доплат.": "Official price list of Beshtau Smile Clinic in Lermontov. 284 dental services without hidden fees.",
    "Актуальный официальный прайс-лист стоматологии «Бештау Смайл Клиник» в г. Лермонтов. 284 медицинские услуги: лечение кариеса от 4500 руб., имплантация Osstem 30000 руб., коронки, брекеты, гигиена.": "Official price list of Beshtau Smile Clinic in Lermontov: caries treatment from 4,500 RUB, Osstem implants 30,000 RUB, crowns, braces, hygiene.",
    "Акции": "Special Offers",
    "Акции и программы заботы о вашей улыбке": "Special Offers and Smile Care Programs",
    "Акции и программы лояльности": "Special Offers & Loyalty Programs",
    "Акция 1": "Special Offer 1",
    "Акция 2": "Special Offer 2",
    "Акция 3": "Special Offer 3",
    "Акция 4": "Special Offer 4",
    "Акция 5": "Special Offer 5",
    "Акция 6": "Special Offer 6",
    "Акция месяца": "Special of the Month",
    "Анатомическая художественная реставрация жевательных и фронтальных зубов фотополимерами": "Anatomical aesthetic restoration of posterior and anterior teeth with photopolymers",
    "Анзор Сулейманович — практикующий хирург-стоматолог с 14-летним клиническим опытом. Проводит атравматичное удаление зубов любой степени сложности, установку современных систем имплантатов, реконструктивные костнопластические операции и пластику мягких тканей полости рта.": "Dr. Anzor Fatahkhov is a practicing dental surgeon with 14 years of clinical experience. He performs atraumatic extractions of any complexity, placement of modern implant systems, reconstructive bone grafting, and soft tissue surgery.",
    "Анна Геннадьевна — стоматолог-ортодонт с 8-летним опытом коррекции прикуса любой степени сложности. Работает со всеми видами брекет-систем (металлические, сапфировые, керамические, самолигирующие Damon), а также с передовыми цифровыми элайнерами.": "Dr. Anna Avetikova is an orthodontist with 8 years of experience correcting malocclusions of all degrees of complexity. She works with all types of bracket systems (metal, sapphire, ceramic, self-ligating Damon) as well as advanced digital aligners.",
    "Антисептическая повязка (1 челюсть)": "Antiseptic periodontal dressing (1 jaw)",
    "Антистресс-пространство в пастельных тонах с потолочным экраном для мультфильмов и игровой зоной.": "Anti-stress lounge in pastel tones with a ceiling cartoon display and a children play corner.",
    "Апикальная хирургия однокорневого зуба": "Apical microsurgery of single-rooted tooth",
    "Аппарат Twin Block": "Twin Block functional appliance",
    "Аппарат Марко-Росса": "Marco Rosa palatal expander",
    "Аппарат Хасс с опорой на винты": "Haas expander on skeletal micro-screws",
    "Аппаратная пародонтология (Vector-терапия, закрытый кюретаж)": "Instrumental periodontics (Vector therapy, closed curettage)",
    "Аппликация лекарственного препарата на слизистую оболочку полости рта": "Topical medication application on oral mucosa",
    "Арут Эдикович обладает 16-летним стажем в сфере ортопедической и хирургической стоматологии. Специализируется на комплексном тотальном протезировании, цифровом моделировании улыбки и восстановлении жевательной эффективности при полной или частичной адентии.": "Dr. Arut Gevorkyan has 16 years of experience in prosthodontics and dental surgery. He specializes in comprehensive full-mouth rehabilitation, digital smile design, and restoration of chewing efficiency in partial or complete edentulism.",
    "Атравматичная установка под эффективной анестезией": "Atraumatic placement under effective modern anesthesia",
    "Атравматичное удаление зубов любой сложности, костная пластика, синус-лифтинг и установка современных имплантационных систем с приживаемостью 99%.": "Atraumatic tooth extractions, bone grafting, sinus lifts, and placement of modern implant systems with a 99% success rate.",
    "Атравматичное удаление зубов, включая дистопированные и ретинированные зубы мудрости": "Atraumatic extractions, including impacted and retained wisdom teeth",
    "Атравматичное удаление зубов, дистопированных и ретинированных моляров («зубов мудрости»)": "Atraumatic extractions, impacted and retained molars (wisdom teeth)",
    "Аутотрансплантация зуба ( пересадка зуба)": "Tooth autotransplantation",
    "Ацеталовый протез (частичный )": "Acetal partial denture",
    "Банк и расчетный счет": "Bank and Settlement Account",
    "Без выходных": "Open 7 days a week",
    "Без очередей и ожидания": "No queues, no waiting",
    "Безметалловая вкладка, накладка E-max": "All-ceramic E-max inlay / onlay",
    "Безметалловые коронки из диоксида циркония": "All-Ceramic Zirconia Crowns",
    "Безналичный расчет, гибкая система депозитов и оптимизация налогообложения для юридических лиц. Индивидуальный персональный менеджер для оперативной записи сотрудников.": "Bank transfers, flexible deposit options, and tax optimization for corporate entities. Dedicated account manager for prompt employee booking.",
    "Безупречная эстетика и бережное лечение": "Impeccable Aesthetics and Gentle Treatment",
    "Бекишова Юлия Владимировна": "Dr. Yulia Bekisheva",
    "Бекишова Юлия Владимировна — Детский стоматолог, пародонтолог — Бештау Смайл Клиник": "Dr. Yulia Bekisheva — Pediatric Dentist, Periodontist — Beshtau Smile Clinic",
    "Бережная детская стоматология, адаптационные визиты, терапия кариеса без бормашины (ICON).": "Gentle pediatric dentistry, adaptation visits, drill-free caries therapy (ICON).",
    "Бережное лечение с сохранением здоровых тканей зуба. Использование японских и немецких нанокомпозитов, точно повторяющих естественную анатомию и оттенок.": "Gentle treatment preserving healthy tooth structure. Japanese and German nanocomposites matching natural anatomy and shade.",
    "Бесплатная парковка": "Free Parking",
    "Бесплатный контрольный осмотр после остеоинтеграции": "Free follow-up examination after osseointegration",
    "Бештау Смайл": "Beshtau Smile",
    "Бештау Смайл Клиник": "Beshtau Smile Clinic",
    "Билдап (преэндодонтическая подготовка зуба)": "Pre-endodontic tooth buildup",
    "Быстро добраться из городов КМВ:": "Quick access from KMV resort cities:",
    "Бюгельное и замковое протезирование высокой точности": "High-precision clasp and attachment removable partial dentures",
    "Бюгельные протезы с замковой и кламмерной фиксацией": "Removable partial dentures with clasp and attachment retention",
    "Бюгельный протез с замковой фиксацией на (2 замка)": "Precision attachment partial denture (2 attachments)",
    "Бюгельный протез с кламмерной фиксацией (2 кламмера)": "Clasp-retained partial denture (2 clasps)",
    "Бюгельный протез с опорой на имплантаты": "Implant-supported removable partial denture",
    "В «Бештау Смайл Клиник» реализован полный цикл стоматологической помощи: от первичной профилактики и детской адаптации до сложных хирургических и тотальных ортопедических операций.": "Beshtau Smile Clinic provides a full cycle of dental care: from early prevention and pediatric adaptation to complex surgical and full-arch prosthodontic rehabilitations.",
    "В клинической работе применяет метод щадящей микроинвазивной терапии (включая технологию ICON без сверления), безопасные реминерализирующие составы и современные протоколы лечения пародонтита и гингивита у подростков и взрослых пациентов.": "In clinical practice, she applies micro-invasive therapy (including drill-free ICON technology), safe remineralizing compounds, and modern protocols for periodontitis and gingivitis in adolescents and adults.",
    "В основе нашей практики лежит принцип «Никаких компромиссов в стерильности и материалах». Все лечебные кабинеты оснащены автономными системами вентиляции и дезинфекции воздуха, а инструментарий проходит трехэтапный контроль стерилизации по стандартам СанПиН.": "Our practice is grounded in the principle: 'Zero compromise in sterility and materials.' All treatment rooms are equipped with autonomous ventilation and air disinfection, and instruments undergo three-stage sterilization control adhering to SanPiN standards.",
    "В работе использует дентальные операционные микроскопы, ультразвуковые протоколы обработки каналов и биосовместимые силеры горячей конденсации гуттаперчи, гарантируя сохранение собственных зубов пациента на долгие годы.": "In his practice, he utilizes dental operating microscopes, ultrasonic canal disinfection protocols, and biocompatible warm gutta-percha condensation sealers, ensuring long-term tooth preservation.",
    "В своей практике доктор использует современные цифровые сканеры, высокоточные артикуляционные протоколы и биосовместимые материалы: диоксид циркония, прессованную керамику E.max, что гарантирует долговечность и естественный эстетический вид реставраций.": "In his practice, the doctor uses modern digital scanners, high-precision articulation protocols, and biocompatible materials: zirconia and pressed E.max ceramics, ensuring durability and natural aesthetics.",
    "В соответствии с Федеральным законом № 323-ФЗ «Об основах охраны здоровья граждан в РФ» при первом обращении в клинику пациенту необходимо иметь при себе:": "In accordance with Federal Law No. 323-FZ 'On the Fundamentals of Health Protection of Citizens in the Russian Federation', during your first clinic visit you must provide:",
    "Ведущие доктора клиники": "Leading Clinic Doctors",
    "Ведущий специалист клиники по детской стоматологии и профилактике заболеваний полости рта.": "Leading clinic specialist in pediatric dentistry and oral disease prevention.",
    "Ведущий специалист клиники по направлению терапевтической стоматологии и эстетической реставрации.": "Leading clinic specialist in therapeutic dentistry and aesthetic restorations.",
    "Ведущий специалист клиники по направлению хирургической стоматологии и дентальной имплантации.": "Leading clinic specialist in surgical dentistry and dental implantation.",
    "Ведущий специалист клиники по ортопедической стоматологии и сложной дентальной имплантации.": "Leading clinic specialist in prosthodontic dentistry and complex dental implantation.",
    "Версия для слабовидящих": "Accessibility Mode",
    "Вестибулопластика": "Vestibuloplasty",
    "Взятие образца биологического материала из очагов поражения органов рта": "Oral tissue biopsy sampling",
    "Внутрикостная дентальная имплантация (Osstem)": "Osstem endosseous dental implant placement",
    "Воздействие лазерным низкоинтенсивным излучением на область десен": "Low-level laser therapy for gum tissue",
    "Возможность оплаты в рассрочку без переплат": "Interest-free installment payment options",
    "Восковое моделирование (диагностическая постановка зубов)": "Diagnostic wax-up (tooth mock-up)",
    "Воскресенье": "Sunday",
    "Восстановление жевательной функции и эстетики улыбки: керамические виниры E.max, высокопрочные коронки из диоксида циркония и протезирование на имплантатах.": "Restoration of chewing function and smile aesthetics: E.max ceramic veneers, high-strength zirconia crowns, and implant prosthetics.",
    "Восстановление зуба (штифт + пломба)": "Tooth core restoration (post + composite)",
    "Восстановление зуба виниром,вкладками,": "Tooth restoration with ceramic veneer / inlays",
    "Восстановление зуба культевой вкладкой (литье/фрезеровка)": "Cast / milled core post restoration",
    "Восстановление зуба пломбировочными материалами с использованием анкерных штифтов": "Tooth composite restoration with anchor posts",
    "Восстановление зуба пломбой I, V, VI класс (1 пов-ть), кариес дентина": "Class I, V, VI composite restoration (1 surface), dentin caries",
    "Восстановление зуба пломбой I, V, VI класс по Блэку (1 поверхность)": "Black Class I, V, VI composite restoration (1 surface)",
    "Восстановление зуба пломбой I, V, VI класс по Блэку с использованием материалов из фотополимеров(2 поверхности )": "Black Class I, V, VI photopolymer composite restoration (2 surfaces)",
    "Восстановление зуба пломбой II, III класс (1 пов-ть), кариес дентина": "Class II, III composite restoration (1 surface), dentin caries",
    "Восстановление зуба пломбой II, III класс по Блэку (1 поверхность)": "Black Class II, III composite restoration (1 surface)",
    "Восстановление зуба пломбой II, III класс по Блэку с использованием материалов из фотополимеров (2 поверхности)": "Black Class II, III photopolymer composite restoration (2 surfaces)",
    "Восстановление зуба пломбой IV класс по Блэку с использованием материалов из фотополимеров": "Black Class IV photopolymer composite restoration",
    "Восстановление зуба пломбой не инвазивным методом ICON": "Non-invasive ICON resin caries infiltration restoration",
    "восстановление зуба пломбой с использованием стеклоиономерных цементов": "Glass ionomer cement tooth restoration",
    "Восстановление зуба пломбой с нарушением контактного пункта II, III класс по Блэку с использованием материалов из фотополимеров": "Black Class II, III composite restoration with contact point reconstruction",
    "Восстановление зуба пломбой с нарушением окклюзии (разрушение более 50%)": "Extensive composite restoration for severe crown breakdown (>50%)",
    "Восстановление зуба пломбой Эстетическая реставрация зуба 1-го зуба фронтальной группы": "Aesthetic composite restoration of 1 anterior tooth",
    "Восстановление зуба пломбой(Замена старой пломбы)": "Tooth composite restoration (replacement of old filling)",
    "Восстановление зуба после лечения витальным методом": "Tooth restoration following vital therapy",
    "восстановление зубной пломбы с использованием жидкотекучих композитов": "Flowable composite resin restoration",
    "Вправление вывиха нижней челюсти": "Mandibular dislocation reduction",
    "Врачебная коллегия": "Medical Board",
    "Врачи всех ключевых направлений": "Doctors in all key specialties",
    "Врачи и руководство": "Doctors & Management",
    "Врачи клиники": "Clinic Doctors",
    "Врачи клиники Бештау Смайл": "Doctors of Beshtau Smile Clinic",
    "Временная коронка": "Provisional crown",
    "Временная коронка на имплантатах": "Implant-supported provisional crown",
    "Временная усилиная конструкция на 4-х имплантатах": "Reinforced provisional fixed bridge on 4 implants",
    "Временного пломбирования корневых каналов (Кальций)": "Temporary root canal filling (Calcium hydroxide)",
    "Временное пломбирование канала лекарственным препаратом(кальцием )": "Temporary root canal medication (calcium hydroxide)",
    "Временное пломбирование лекарственным препаратом корневого канала(1 посещение)": "Temporary root canal medication (Visit 1)",
    "Временное пломбирование лекарственным препаратом корневого канала(2 посещение)": "Temporary root canal medication (Visit 2)",
    "Временное шинирование зубов композитным материалом (за 1 ед.)": "Temporary composite splinting (per 1 tooth)",
    "Временное шинирование зубов композитным материалом с использованием стекловолокна": "Temporary fiberglass composite splinting (per 1 tooth)",
    "Временное шинирование зубов с использованием металлической проволоки (1 зуб)": "Temporary wire splinting (per 1 tooth)",
    "Временное шинирование при заболеваниях пародонта": "Temporary splinting in periodontal disease",
    "Временный съемный пластиночный протез (иммедиат-протез) до 3х зубов": "Immediate partial denture (up to 3 teeth)",
    "Время приема": "Hours",
    "Все": "All",
    "Все диагностические и лечебные протоколы строго соответствуют клиническим рекомендациям Стоматологической Ассоциации России (СтАР).": "All diagnostic and treatment protocols strictly comply with clinical guidelines of the Dental Association of Russia (DARS).",
    "Все направления": "All Specialties",
    "Все специалисты клиники имеют профильное высшее образование, регулярные сертификации и многолетний стаж работы.": "All clinic specialists hold specialized higher medical degrees, regular board certifications, and extensive clinical experience.",
    "Все услуги": "All Services",
    "Вскрытие и дренирование абсцесса полости рта": "Incision and drainage of oral abscess",
    "Вскрытие и дренирование одонтогенного абсцесса": "Incision and drainage of odontogenic abscess",
    "Вскрытие подслизистого или поднадкостничного очага воспаления в полости рта": "Incision of submucosal or subperiosteal oral abscess",
    "Вся необходимая юридическая информация об организации в соответствии с требованиями Федерального закона № 323-ФЗ и Постановления Правительства РФ № 736.": "All required legal information about the medical organization in compliance with Federal Law No. 323-FZ and RF Government Decree No. 736.",
    "Вторник": "Tuesday",
    "Входная группа и здание клиники": "Entrance and Clinic Building",
    "Входная группа и фасад": "Main Entrance & Facade",
    "Выборочное пришлифовывание твердых тканей зуба (1 зуб)": "Selective occlusal equilibration (1 tooth)",
    "Выгода до 20%": "Up to 20% Savings",
    "Выгодные условия на имплантацию, профессиональную гигиену и семейное лечение зубов в клинике Бештау Смайл.": "Great rates on dental implants, professional hygiene, and family dental packages at Beshtau Smile Clinic.",
    "Высокоточная диагностика, лечение кариеса, пульпита и периодонтита под контролем оптики. Эстетическая реставрация зубов светоотверждаемыми композитами.": "High-precision diagnostics, treatment of caries, pulpitis and periodontitis under optical magnification. Aesthetic light-curing restorations.",
    "Высокоточная микроскопическая стоматология": "High-Precision Microscopic Dentistry",
    "Высокоточный операционный дентальный микроскоп для спасения сложных зубов и ювелирной эндодонтии.": "High-precision dental operating microscope for saving compromised teeth and intricate endodontics.",
    "Высшее медицинское образование по специальности «Стоматология»": "Higher medical degree in Dentistry",
    "г. Лермонтов, Солнечный проезд, 10, корп. 1": "Lermontov, Solnechny proezd 10, bldg. 1",
    "г. Лермонтов, Солнечный проезд, д. 10, корп. 1, этаж 2": "Lermontov, Solnechny proezd 10, bldg. 1, 2nd floor",
    "Галерея": "Gallery",
    "Галерея клиники": "Clinic Gallery",
    "Гарантийные обязательства клиники": "Clinic Warranty Obligations",
    "Гарантия и договор": "Warranty & Official Agreement",
    "Геворкян Арут Эдикович": "Dr. Arut Gevorkyan",
    "Геворкян Арут Эдикович — Стоматолог-ортопед, имплантолог — Бештау Смайл Клиник": "Dr. Arut Gevorkyan — Prosthodontist, Implantologist — Beshtau Smile Clinic",
    "Генеральный директор": "General Director",
    "Генеральный директор:": "General Director:",
    "Герметизация естественных углублений (фиссур) для защиты от бактерий": "Sealing of natural pits and fissures to prevent bacterial decay",
    "Герметизация фиссур зуба (1 зуб)": "Fissure sealant application (1 tooth)",
    "Герметизация фиссур и глубокое фторирование эмали": "Fissure sealing and deep enamel fluoridation",
    "Гигиена": "Hygiene",
    "Гигиена:": "Hygiene:",
    "Гингивопластика": "Gingivoplasty",
    "Гингивотомия": "Gingivotomy",
    "Гингивэктомия (1 сегмент)": "Gingivectomy (1 segment)",
    "Главная": "Home",
    "Глубокое фторирование эмали зуба": "Deep tooth enamel fluoridation",
    "Гнатологический анализ и коррекция нарушений прикуса при протезировании": "Gnathological analysis and occlusal correction during prosthodontic rehabilitation",
    "Готовы обсудить индивидуальные условия для вашей организации": "Ready to discuss tailored terms for your organization",
    "График": "Schedule",
    "График приема": "Doctor Schedule",
    "График приема врача": "Doctor Schedule",
    "График приема и кабинет доктора": "Doctor Reception Schedule and Room",
    "График приема:": "Doctor Schedule:",
    "График работы": "Working Hours",
    "Действие": "Action",
    "Действующие сертификаты государственного образца по хирургической стоматологии и дентальной имплантологии": "Valid state-certified board certifications in Oral Surgery and Dental Implantation",
    "Деликатный подход к маленьким пациентам, психологическая адаптация, лечение кариеса без бормашины по системе ICON, герметизация фиссур и профилактика.": "Delicate care for young patients, psychological adaptation, drill-free ICON caries treatment, fissure sealants, and prevention.",
    "Дентальная имплантация и костная пластика": "Dental Implantation and Bone Grafting",
    "Дентальная имплантация корейской системой Osstem": "Dental implants with Korean Osstem system",
    "Дентальная имплантация по классическому и одномоментному протоколу": "Dental implant placement via delayed and immediate loading protocols",
    "Дентальная имплантация, костная пластика, синус-лифтинг и сложное удаление зубов.": "Dental implants, bone grafting, sinus lifts, and complex surgical extractions.",
    "Дентальная имплантация, сложное удаление зубов, синус-лифтинг и реконструктивная хирургия альвеолярного гребня.": "Dental implants, complex extractions, sinus lift, and alveolar ridge reconstructive surgery.",
    "День недели": "Day of Week",
    "Детализированная ежемесячная отчетность по оказанным услугам": "Detailed monthly reports on rendered medical services",
    "Детская металлическая коронка": "Pediatric stainless steel crown",
    "Детская проф-гигиена полости рта": "Pediatric professional oral hygiene",
    "Детская стоматология": "Pediatric Dentistry",
    "Детская стоматология без боли и слез": "Pain-Free Pediatric Dentistry",
    "Детский кабинет": "Pediatric Room",
    "Детский стоматолог, пародонтолог": "Pediatric Dentist, Periodontist",
    "Детский стоматологический кабинет": "Pediatric Dental Room",
    "Детское": "Pediatrics",
    "Детское отделение": "Pediatric Department",
    "Детство": "Pediatrics",
    "Диагностика": "Diagnostics",
    "Диагностика височно-нижнечелюстного сустава (ВНЧС) перед началом ортопедического лечения": "Temporomandibular joint (TMJ) diagnostics prior to prosthodontic treatment",
    "Диагностическая модель": "Diagnostic study model",
    "Диагностический осмотр и составление паспорта здоровья зубов": "Comprehensive diagnostic examination and dental health record preparation",
    "Диагностический пришлифовывание (окклюзионная коррекция)": "Diagnostic occlusal adjustment",
    "Диатермокоагуляция десневого сосочка (1 зуб)": "Gingival papilla electrocoagulation (1 tooth)",
    "Диоксид циркония": "Zirconium Dioxide",
    "Для бизнеса и организаций": "For Corporate Clients and Organizations",
    "Для максимального комфорта и безопасности во время процедур рекомендуем соблюдать простые правила перед посещением клиники:": "For maximum comfort and clinical safety during procedures, please follow these simple recommendations before your visit:",
    "Для приема несовершеннолетних пациентов (до 15 лет) — присутствие одного из родителей или законного представителя со свидетельством о рождении ребенка или нотариальной доверенностью": "For visits of minor patients (under 15 years) — accompaniment by a parent or legal guardian with child birth certificate or notarized power of attorney",
    "Дмитрий Александрович имеет 11-летний стаж успешной врачебной практики. Специализируется на высокоточной эндодонтии — спасении зубов со сложной анатомией каналов, лечении гранулем и кист консервативным путем без удаления.": "Dr. Dmitry Korolev has 11 years of successful clinical practice. He specializes in high-precision endodontics: saving teeth with complex canal morphology and non-surgical conservative therapy of granulomas and cysts.",
    "до 20%": "up to 20%",
    "Доктор проводит углубленную телерентгенографическую (ТРГ) и 3D-цефалометрическую диагностику, что позволяет составлять точные персонализированные планы ортодонтического лечения, восстанавливая гармонию профиля лица и правильную функцию жевания.": "The doctor conducts in-depth cephalometric (lateral teleradiography) and 3D diagnostics, developing precise customized orthodontic plans that harmonize facial aesthetics and masticatory function.",
    "Документ, удостоверяющий личность (паспорт гражданина РФ)": "Official identification document (Passport of the Russian Federation)",
    "Документы, необходимые при первичном обращении": "Documents Required for Your First Visit",
    "Дополнительный замок к бюгельному протезу": "Additional precision attachment for partial denture",
    "Дружелюбная атмосфера, адаптационный прием и современные обезболивающие методики для здоровья зубов вашего ребенка.": "Friendly atmosphere, gentle adaptation visits, and modern anesthesia for your child’s dental health.",
    "Ежедневно с 09:00 до 20:00": "Daily from 09:00 to 20:00",
    "Если у вас температура, насморк или герпес в активной фазе, рекомендуем перенести плановый визит на другой день.": "If you have fever, acute rhinitis, or active herpes lesions, we recommend rescheduling your elective appointment.",
    "Если форма не отображается, нажмите здесь для открытия в новой вкладке": "If the form does not display, click here to open in a new tab",
    "Ессентуки (20 мин)": "Essentuki (20 min)",
    "Ессентуки ~20 мин": "Essentuki ~20 min",
    "Естественная светопроницаемость и подбор оттенка эмали": "Natural translucency and individualized enamel color matching",
    "Естественная эстетика десневого контура и красивая улыбка": "Natural gum contour aesthetics and a beautiful smile",
    "Ждем вас в современной клинике с удобным подъездом и комфортной зоной ожидания.": "We look forward to welcoming you to our modern clinic with easy access and a comfortable waiting lounge.",
    "Железноводск (25 мин)": "Zheleznovodsk (25 min)",
    "Железноводск ~25 мин": "Zheleznovodsk ~25 min",
    "За 24 часа до визита полностью исключите алкоголь, так как он снижает эффективность обезболивающих препаратов.": "Avoid alcohol completely for 24 hours prior to your visit, as it significantly impairs the efficacy of local anesthetics.",
    "Забор мягкотканного аутотрансплантата": "Soft tissue autograft harvesting",
    "Забота о близких": "Caring for Loved Ones",
    "Закрытая механическая очистка имплантата (1 имплант)": "Closed mechanical implant debridement (1 implant)",
    "Закрытие перфорации стенки корневого канала зуба": "Root canal perforation repair",
    "Закрытие перфорации стенки корневого канала зуба (MTA / ProRoot)": "Root canal perforation repair (MTA / ProRoot)",
    "Закрытие рецессии": "Gum recession coverage surgery",
    "Закрытие рецессии десны (1 зуб)": "Gingival recession coverage (1 tooth)",
    "Закрытый кюретаж в области 1-2 зубов": "Closed subgingival curettage (1-2 teeth)",
    "Закрытый кюретаж при заболеваниях пародонта в области зуба (1 сегмент)": "Closed curettage for periodontal disease (1 segment)",
    "Закрытый синус-лифтинг": "Closed sinus lift",
    "Закрыть": "Close",
    "Закрыть окно": "Close window",
    "Замена брекета (повторная фиксация)": "Bracket replacement (rebonding)",
    "Замена винта на имплантате": "Implant prosthetic screw replacement",
    "Замена винта на импланте": "Implant prosthetic screw replacement",
    "Замена лигатуры (эластическая/металлическая)": "Orthodontic ligature replacement (elastic / wire)",
    "Замена матрицы замкового крепления бюгельного протеза": "Attachment matrix replacement for partial denture",
    "Запечатывание фиссуры зуба герметиком (инвазивная)": "Invasive pit and fissure sealing",
    "Запечатывание фиссуры зуба герметиком (не ивазивная)": "Non-invasive pit and fissure sealing",
    "Записать ребенка": "Book for Child",
    "Записаться": "Book",
    "Записаться всей семьей": "Book for Whole Family",
    "Записаться к врачу": "Book with Doctor",
    "Записаться к детскому врачу": "Book with Pediatric Dentist",
    "Записаться к ортодонту": "Book with Orthodontist",
    "Записаться к ортопеду": "Book with Prosthodontist",
    "Записаться к хирургу": "Book with Surgeon",
    "Записаться к этому врачу": "Book with This Doctor",
    "Записаться на гигиену": "Book Hygiene Visit",
    "Записаться на консультацию": "Book a Consultation",
    "Записаться на прием": "Book an Appointment",
    "Записаться на экскурсию и консультацию": "Book a Tour & Consultation",
    "Записаться онлайн": "Book Online",
    "Записаться по акции": "Book with Special Offer",
    "Записаться через онлайн-форму": "Book via Online Form",
    "Запись": "Book",
    "Запись на прием к стоматологу": "Dental Appointment Booking",
    "Запись на прием:": "Appointment Booking:",
    "Запишитесь онлайн в удобное для вас время — администратор перезвонит в течение 15 минут.": "Book online at your preferred time — our receptionist will call back within 15 minutes.",
    "Заполните поля формы, и мы забронируем за вами удобный интервал приема": "Fill in the form fields, and our team will reserve a convenient time slot for you",
    "Запрашиваемая страница не существует или была перемещена": "The requested page does not exist or has been moved",
    "Запрашиваемый адрес устарел, был изменен или введен с опечаткой. Перейдите в интересующий раздел сайта или позвоните нам для записи на прием.": "The requested URL is outdated, moved, or mistyped. Please proceed to any section of interest or call our clinic for an appointment.",
    "Здоровье и эстетика вашей улыбки на экспертном уровне": "Health and Aesthetics of Your Smile at an Expert Level",
    "Здоровье эмали": "Enamel Health",
    "Зона ожидания и ресепшен": "Reception & Lounge Area",
    "Зона ресепшен и ожидания": "Reception and Lounge Area",
    "Извлечение сломанных инструментов и штифтовых конструкций из каналов": "Retrieval of separated instruments and broken posts from root canals",
    "Изготовление вестибулярная пластина": "Fabrication of vestibular orthodontic plate",
    "Изготовление диагностических моделей челюстей (1 челюсть)": "Diagnostic study model fabrication (1 jaw)",
    "Изготовление диагностического композитного макета реставрации": "Diagnostic composite mockup fabrication",
    "Изготовление контрольной модели": "Control study cast fabrication",
    "Изготовление прикусного валика": "Occlusal bite rim fabrication",
    "Изготовление рабочей и диагностической модели (1 челюсть)": "Working and diagnostic cast fabrication (1 jaw)",
    "Изоляция рабочего поля системой коффердам": "Rubber dam isolation for sterile, moisture-free field",
    "Имплантация": "Implants",
    "Имплантация «под ключ» Osstem": "Turnkey Osstem Dental Implants",
    "Имплантология": "Implantology",
    "Индивидуальная ложка": "Custom impression tray",
    "ИНН / КПП": "INN / KPP",
    "Инновационное восстановление полного зубного ряда челюсти на 4 или 6 имплантатах с установкой несъемного адаптационного протеза в кратчайшие сроки.": "Innovative full-arch rehabilitation on 4 or 6 implants with fast fixed provisional prosthetics.",
    "Инструментальная и медикаментозная обработка плохо проходимого корневого канала": "Instrumental and antiseptic preparation of calcified canal",
    "Инструментальная и медикаментозная обработка хорошо проходимого корневого канала": "Instrumental and antiseptic preparation of negotiable canal",
    "Инструментальная обработка и трехмерная обтурация каналов при пульпите": "Mechanical canal instrumentation and three-dimensional obturation for pulpitis",
    "Инфильтрационная анестезия (Ультракаин)": "Infiltration local anesthesia (Ultracain)",
    "Информация": "Information",
    "Информация для пациентов": "Patient Information",
    "Информация для пациентов — Стоматология Бештау Смайл Клиник": "Patient Information — Beshtau Smile Clinic",
    "Информация пациентам": "Patient Information",
    "Инъекционное введение лекарственных препаратов в челюстно-лицевую область(Hyalrepair)": "Hyalrepair injection into maxillofacial tissues",
    "Инъекционное введение лекарственных препаратов в челюстно-лицевую область(Revident)": "Revident injection into maxillofacial tissues",
    "Использование мембраны": "Barrier collagen membrane placement",
    "Используя сайт и заполняя формы обратной связи, вы подтверждаете свое согласие на обработку предоставленных контактных данных уполномоченными сотрудниками клиники.": "By using this website and submitting feedback forms, you confirm your consent to personal data processing by authorized clinic staff.",
    "Исправление прикуса и выравнивание зубных рядов самолигирующими брекетами Damon и элайнерами.": "Bite alignment and arch correction using self-ligating Damon braces and transparent aligners.",
    "Исправление прикуса и скученности зубов у подростков и взрослых": "Correction of malocclusions and tooth crowding in adolescents and adults",
    "Исправление прикуса на брекетах Damon и прозрачных элайнерах, детская ортодонтия.": "Bite correction with Damon braces and clear aligners, pediatric orthodontics.",
    "Исправление прикуса современными брекет-системами Damon, лечение прозрачными элайнерами, ранняя ортодонтия у детей.": "Bite correction with modern Damon self-ligating braces, transparent aligners, and early interceptive orthodontics for children.",
    "Иссечение новообразования мягких тканей": "Soft tissue benign lesion excision",
    "Кабинет": "Room",
    "Кабинет микроскопной стоматологии": "Microscopic Dental Operatory",
    "Кабинет ортодонта": "Orthodontic Room",
    "Кабинет ортопеда": "Prosthetic Room",
    "Кабинет терапевта": "Therapy Room",
    "Кабинет хирурга": "Surgical Room",
    "Кабинет № 1": "Room 1",
    "Кабинет № 2": "Room 2",
    "Кабинет № 3": "Room 3",
    "Кабинет № 4": "Room 4",
    "Кабинеты, стерилизационный блок и зона ожидания": "Treatment rooms, sterilization facility, and reception lounge",
    "Квалификация и образование": "Qualifications & Education",
    "Керамические виниры и накладки E.max для зоны улыбки": "E.max ceramic veneers and onlays for the aesthetic smile zone",
    "Керамические виниры и ультраниры для эстетической зоны": "Ceramic veneers and ultra-thin veneers for the aesthetic zone",
    "Клиника «Бештау Смайл Клиник» осуществляет медицинскую деятельность на основании бессрочной государственной лицензии, выданной Министерством здравоохранения Ставропольского края.": "Beshtau Smile Clinic operates under a permanent state medical license issued by the Ministry of Health of the Stavropol Territory.",
    "Клиника «Бештау Смайл Клиник» предоставляет официальную гарантию на все виды терапевтических пломб, ортопедических коронок, виниров и имплантационных конструкций при условии соблюдения пациентом правил домашней гигиены и прохождения контрольных осмотров с профессиональной чисткой не реже одного раза в 6 месяцев.": "Beshtau Smile Clinic provides an official warranty on all therapeutic restorations, prosthetic crowns, veneers, and implant restorations, provided the patient maintains proper oral hygiene and attends biannual preventive checkups with professional cleanings.",
    "Клиника на Яндекс.Картах": "Clinic on Yandex Maps",
    "Клиника расположена в удобной транспортной доступности: 15 минут от Пятигорска и Ессентуков, 25 минут от Минеральных Вод и Железноводска. Бесплатная просторная парковка у входа.": "The clinic is conveniently accessible: 15 minutes from Pyatigorsk and Essentuki, 25 minutes from Mineralnye Vody and Zheleznovodsk. Spacious free parking at the entrance.",
    "Клиническая ординатура по терапевтической стоматологии": "Clinical Residency in Operative and Endodontic Dentistry",
    "Клиническая перебазировка съемного протеза": "Chairside denture reline",
    "Клинические стандарты": "Clinical Standards",
    "Клинический процесс в 4 руки": "Four-Handed Dental Workflow",
    "Ключевые манипуляции:": "Key Clinical Procedures:",
    "Ключевые направления": "Key Clinical Areas",
    "Ключевые направления работы": "Key Areas of Practice",
    "Код услуги": "Service Code",
    "Команда профильных специалистов": "Team of Specialized Doctors",
    "Команда специалистов": "Team of Specialists",
    "Команда экспертов": "Expert Medical Team",
    "Комбинированный протез на имплантатах, I кат. сложности": "Combined implant-supported prosthesis, Category I",
    "Комплекс Air Flow": "Air Flow Package",
    "Комплекс гигиены: от 5 000 руб.": "Hygiene package: from 5,000 RUB",
    "Комплексная гигиена полости рта Air Flow, ультразвуковое удаление зубного камня, реминерализация эмали и терапия воспалительных процессов десен.": "Air Flow oral hygiene, ultrasonic tartar scaling, enamel remineralization, and targeted therapy for gum inflammation.",
    "Комплексная стоматологическая помощь полного цикла: цифровая диагностика, атравматичная хирургия, дентальная имплантация, исправление прикуса и высокоточная ортопедия. Без боли, стресса и скрытых платежей.": "Full-cycle comprehensive dental care: digital diagnostics, atraumatic oral surgery, dental implants, bite correction, and high-precision prosthodontics. Free from pain, stress, or hidden charges.",
    "Комплексное восстановление": "Comprehensive Restoration",
    "Комплексное восстановление улыбки: цифровая диагностика, дентальная имплантация Osstem, исправление прикуса брекетами и бережное лечение без боли.": "Comprehensive smile restoration: digital diagnostics, Osstem dental implants, orthodontic correction with braces, and gentle pain-free treatment.",
    "Комплексное стоматологическое сопровождение родителей и детей в одной клинике. Удобная запись в один день и персональная скидка 10% на семейный план.": "Comprehensive dental care for parents and children under one roof. Same-day family appointments and 10% discount.",
    "Комплексные направления стоматологии": "Comprehensive Dental Specialties",
    "Комплексные стоматологические услуги": "Comprehensive Dental Services",
    "Комплексные услуги стоматологии": "Comprehensive Dental Care Services",
    "Компьютерное 3D-планирование положения имплантата": "Computerized 3D implant position planning",
    "Комфортная зона ожидания и заботливый сервис": "Comfortable Lounge Area & Caring Service",
    "Комфортная обстановка, внимательные администраторы и отсутствие очередей.": "Comfortable atmosphere, attentive receptionists, and no waiting lines.",
    "Комфортный прием без ожидания": "Comfortable Visit Without Waiting",
    "Консервативная терапия околоверхушечных очагов (периодонтит)": "Conservative treatment of periapical lesions (periodontitis)",
    "Консервативное лечение воспалительных очагов (гранулемы, радикулярные кисты)": "Conservative management of inflammatory lesions (granulomas, radicular cysts)",
    "Консервация лунки (запечатывание лунки)": "Socket preservation (extraction socket sealing)",
    "Консультация ортодонта": "Orthodontist Consultation",
    "Консультация ортодонта для детей": "Pediatric orthodontic consultation",
    "Консультация ортодонта: 1 000 руб. / Брекет-система: от 50 000 руб.": "Orthodontist consultation: 1,000 RUB / Bracket system: from 50,000 RUB",
    "Консультация хирурга и КТ-снимок включены": "Surgeon consultation and CT scan included",
    "Консультация хирурга-имплантолога": "Implant surgeon consultation",
    "Консультация хирурга-имплантолога и персональный план лечения": "Implant surgeon consultation and personalized treatment plan",
    "Контактная информация": "Contact Information",
    "Контакты": "Contacts",
    "Контакты и запись на прием": "Contacts & Appointments",
    "Контакты и схема проезда": "Contacts & Location Map",
    "Контакты и схема проезда — Стоматология Бештау Смайл Клиник": "Contacts & Location Map — Beshtau Smile Clinic",
    "Контакты организации": "Organization Contacts",
    "Контурная аугментация в области одного имплантата": "Contour soft/hard tissue augmentation per implant",
    "Конусно-лучевой компьютерный томограф экспертного уровня с минимальной лучевой нагрузкой.": "Expert-grade cone beam computed tomograph (CBCT) with ultra-low radiation dose.",
    "Королев Дмитрий Александрович": "Dr. Dmitry Korolev",
    "Королев Дмитрий Александрович — Стоматолог-терапевт, эндодонтист — Бештау Смайл Клиник": "Dr. Dmitry Korolev — Dental Therapist, Endodontist — Beshtau Smile Clinic",
    "Коронка / винир": "Crown / Veneer",
    "Коронка временная (прямой/непрямой метод)": "Provisional crown (direct / indirect method)",
    "Коронка из Диоксида циркония": "Zirconia ceramic crown",
    "Коронка из диоксида циркония (CAD/CAM)": "CAD/CAM precision zirconia crown",
    "Коронка из прессованной керамики (E-max)": "Pressed ceramic crown (E-max)",
    "Коронка металлическая (штампованная/цельнолитая)": "Full metal crown (cast / stamped)",
    "Коронка металлокерамическая": "Porcelain-fused-to-metal (PFM) crown",
    "Коронка на импланте диоксид циркония": "Implant-supported zirconia crown",
    "Коронка цельнолитая (укрепленная)": "Reinforced cast metal crown",
    "Коронка цирконий: 22 000 руб. / Винир E-max: 23 000 руб.": "Zirconia crown: 22,000 RUB / E-max veneer: 23,000 RUB",
    "Коронки из диоксида циркония и безметалловой керамики E.max": "Zirconia and metal-free E.max ceramic crowns",
    "Коронки из диоксида циркония с высокой прочностью и биосовместимостью": "Zirconia crowns offering exceptional strength and biocompatibility",
    "Коронки из диоксида циркония, керамические виниры E.max, мостовидные и съемные протезы.": "Zirconium crowns, E.max ceramic veneers, dental bridges, and comfortable removable dentures.",
    "Корпоративная программа лояльности": "Corporate Loyalty Program",
    "Корпоративное обслуживание — Стоматология Бештау Смайл Клиник": "Corporate Healthcare — Beshtau Smile Clinic",
    "Корпоративные программы стоматологии": "Corporate Dental Programs",
    "Корпоративным клиентам": "Corporate Clients",
    "Коррекция зубочелюстных аномалий у детей и взрослых: металлические и сапфировые брекеты Damon, а также незаметные прозрачные элайнеры по 3D-модели.": "Correction of malocclusions in children and adults: Damon metal and sapphire braces, and invisible transparent aligners from 3D models.",
    "Коррекция объема и формы альвеолярного отростка": "Alveolar ridge contour re-shaping",
    "костная аугментация в области одного импланта": "Bone augmentation per single implant site",
    "Костная пластика (аугментация) при дефиците костной ткани": "Bone grafting (augmentation) in alveolar bone deficiencies",
    "костная пластика альвеолярного гребя по высоте с использованием титанового каркаса 1 зуба": "Vertical ridge augmentation with titanium mesh (1 tooth)",
    "Костная пластика альвеолярного гребя по высоте с использованием титанового каркаса 2-х зубов": "Vertical ridge augmentation with titanium mesh (2 teeth)",
    "костная пластика альвеолярного гребя по горезонтали в области 2х зубов": "Horizontal ridge augmentation in 2 teeth area",
    "Костная пластика в области одного зуба методикой IDR, B2C": "IDR / B2C immediate bone grafting (1 tooth)",
    "Костная пластика лицевой области (направленная костная регенерация)": "Guided bone regeneration (GBR) in maxillofacial region",
    "Костная пластика, расщепление альвеолярного гребня, направленная костная регенерация (НКР)": "Bone grafting, alveolar ridge split, guided bone regeneration (GBR)",
    "Культевая штифтовая вкладка из диоксида циркония": "Zirconia core post-and-core",
    "Культевая штифтовая вкладка из металическая": "Cast metal post-and-core",
    "Курсы психологической адаптации детей на стоматологическом приеме": "Certified training in child psychological adaptation in dental care",
    "Кюретаж пародонтального кармана": "Periodontal pocket curettage",
    "Лекарственные средства:": "Medications:",
    "Лермонтов": "Lermontov",
    "Лечебные кабинеты": "Treatment Rooms",
    "Лечебные кабинеты экспертного класса": "Expert-Class Dental Operatories",
    "Лечебный кабинет экспертного уровня": "Expert-Level Dental Operatory",
    "Лечение гингивита (1 челюсть консервативно)": "Conservative gingivitis therapy (1 jaw)",
    "Лечение гингивита, стоматита и воспалительных заболеваний десен": "Treatment of gingivitis, stomatitis, and inflammatory gum conditions",
    "Лечение заболеваний пародонта и профессиональная гигиена полости рта": "Periodontal disease treatment and professional oral hygiene",
    "Лечение кариеса и пульпита молочных и постоянных зубов": "Treatment of caries and pulpitis in primary and permanent teeth",
    "Лечение кариеса и эстетическая реставрация зубов": "Caries Treatment and Aesthetic Tooth Restoration",
    "Лечение кариеса молочного зуба I, класс (1 пов-ть), кариес дентина": "Primary tooth Class I caries treatment (1 surface)",
    "Лечение кариеса молочного зуба II, III IV класс (1 пов-ть), кариес дентина": "Primary tooth Class II, III, IV caries treatment (1 surface)",
    "Лечение кариеса молочных и постоянных зубов безопасными биоматериалами": "Treatment of caries in primary and permanent teeth with biocompatible materials",
    "Лечение кариеса, пульпита и периодонтита под микроскопом с надежной световой полимеризацией.": "Microscopic treatment of caries, pulpitis and periodontitis with durable light curing.",
    "Лечение клиновидного дефекта (реставрация )": "Abfraction / wedge defect aesthetic restoration",
    "Лечение на элайнерах на 1 зубную дугу (13-26 кап)": "Single-arch clear aligner treatment (13-26 trays)",
    "Лечение на элайнерах на 1 зубную дугу (27 и более кап)": "Single-arch clear aligner treatment (27+ trays)",
    "Лечение на элайнерах на 2 зубные дуги (13-26 кап)": "Dual-arch clear aligner treatment (13-26 trays)",
    "Лечение на элайнерах на 2 зубные дуги (27 и более кап)": "Dual-arch clear aligner treatment (27+ trays)",
    "Лечение на элайнерах на 2 зубные дуги (до 12 кап)": "Dual-arch clear aligner treatment (up to 12 trays)",
    "Лечение начальных форм кариеса методом инфильтрации ICON (без бормашины)": "Early caries therapy via ICON resin infiltration (drill-free)",
    "Лечение пародонтита (1 сеанс комплекс)": "Comprehensive periodontitis therapy (1 session)",
    "Лечение перикоронита (промывание, рассечение и/или иссечение капюшона)": "Pericoronitis treatment (opercelectomy / irrigation)",
    "Лечение периодонтита (1 посещение)": "Periodontitis therapy (Visit 1)",
    "Лечение периодонтита (1-одноканального)": "Single-canal periodontitis endodontic treatment",
    "Лечение периодонтита (2х-двухканального)": "Two-canal periodontitis endodontic treatment",
    "Лечение периодонтита (3х-трехканального)": "Three-canal periodontitis endodontic treatment",
    "Лечение поверхностного, среднего и глубокого кариеса": "Treatment of superficial, moderate, and deep dental caries",
    "Лечение прозрачными капами (элайнерами) по цифровому 3D-плану ClinCheck": "Clear aligner treatment based on ClinCheck 3D digital planning",
    "Лечение прозрачными ортодонтическими капами (элайнерами)": "Orthodontic clear aligner therapy",
    "Лечение пульпита 1-канал (пломбирование корневого канала зуба)": "Single-canal pulpitis therapy (obturation)",
    "Лечение пульпита девитальным методом (1 Посещение )": "Devital pulpitis treatment (Visit 1)",
    "Лечение пульпита девитальным методом (2 Посещение )": "Devital pulpitis treatment (Visit 2)",
    "Лечение пульпита девитальным методом (3 Посещение )": "Devital pulpitis treatment (Visit 3)",
    "Лечение пульпита и периодонтита под операционным микроскопом": "Pulpitis and periodontitis treatment under operating microscope",
    "Лицензия (PDF)": "License (PDF)",
    "Лицензия на осуществление медицинской деятельности": "Medical Practice License",
    "Лицензия на осуществление медицинской деятельности выдана Министерством здравоохранения Ставропольского края.": "Medical license issued by the Ministry of Health of the Stavropol Territory.",
    "Локальная пародонтологическая чистка (за 1 зуб)": "Local periodontal scaling (per 1 tooth)",
    "Лоскутная операция в полости рта": "Periodontal flap surgery",
    "Максимальный врачебный стаж специалистов клиники": "Maximum clinical experience of clinic specialists",
    "Материал конструкции": "Restoration Material",
    "Медикаментозное лечение десен (гингивит, пародонтит)": "Medical therapy for gum conditions (gingivitis, periodontitis)",
    "Медицинская деятельность осуществляется ООО «Бештау Смайл Клиник» на основании бессрочной лицензии, предоставленной Министерством здравоохранения Ставропольского края.": "Medical activity is carried out by LLC Beshtau Smile Clinic under a permanent license granted by the Ministry of Health of the Stavropol Territory.",
    "Медицинские направления": "Medical Specialties",
    "Медицинский комплаенс": "Medical Compliance",
    "Металлокерамическая коронка на импланте": "Implant-supported porcelain-fused-to-metal crown",
    "Металлопластмассовая конструкция на имплантатах (титан-акрил, титан-РМА)": "Implant-supported titanium-acrylic prosthesis",
    "Мех./мед. обработка полости при кариесе дентина": "Mechanical / antiseptic cavity preparation for dentin caries",
    "Микропротез Съемный": "Removable micro-denture (flipper)",
    "Микроскопическая эндодонтия, перелечивание труднопроходимых корневых каналов, художественная анатомическая реставрация зубов.": "Microscopic endodontics, retreatment of complex root canals, and anatomical artistic tooth restorations.",
    "Микроскопная эндодонтия, перелечивание труднопроходимых каналов, эстетическая реставрация.": "Microscopic endodontics, complex canal retreatment, aesthetic restoration.",
    "Минводы (30 мин)": "Mineralnye Vody (30 min)",
    "Минводы ~30 мин": "Mineralnye Vody ~30 min",
    "Минимальное препарирование и максимальное сохранение зуба": "Minimal preparation and maximum preservation of healthy tooth tissue",
    "Министерство здравоохранения Ставропольского края": "Ministry of Health of the Stavropol Territory",
    "Многоступенчатая стерилизация в автоклавах класса B и хранение инструментов в индивидуальных крафт-пакетах.": "Multi-stage sterilization in Class B autoclaves and instrument storage in sealed sterile pouches.",
    "Мустафаев Вадим Русланович": "Vadim Mustafaev",
    "Мы находимся в городе Лермонтов. Вы можете связаться с нами по телефону, написать на почту или оставить заявку на прием через онлайн-форму.": "We are located in Lermontov. You can contact us by phone, email, or send an appointment request via the online form.",
    "Мы решаем клинические задачи любой сложности с использованием доказательных протоколов и сертифицированных биосовместимых материалов.": "We solve clinical cases of any complexity using evidence-based protocols and certified biocompatible materials.",
    "Мы рядом": "Close to You",
    "На главную страницу": "Back to Home",
    "Навигационная цепочка": "Breadcrumbs",
    "Навигация": "Navigation",
    "Наименование медицинской услуги": "Medical Service Description",
    "Наложение временной пломбы": "Temporary filling placement",
    "Наложение коффердама (изоляция рабочего поля)": "Rubber dam application (field isolation)",
    "Наложение лечебной/изолирующей прокладки": "Therapeutic / insulating cavity liner placement",
    "Наложение шва на слизистую оболочку рта": "Oral mucosa suturing",
    "Наноматрицы Mashup (1 карман 1 матрица)": "Mashup periodontal nanomatrix (1 pocket)",
    "Направление включает лечение кариеса любой локализации, пульпита, периодонтита, а также художественную реставрацию зубов. В нашей клинике терапевтическое лечение осуществляется с обязательной изоляцией коффердамом, что исключает контакт слюны с рабочей зоной и обеспечивает долговечность реставраций.": "This department provides treatment of caries in all locations, pulpitis, periodontitis, and artistic restorations. In our clinic, all therapeutic care is delivered under mandatory rubber dam isolation, eliminating saliva contamination and maximizing durability.",
    "Направления лечения": "Clinical Specialties",
    "Наша клиника": "Our Clinic",
    "Наша миссия": "Our Mission",
    "Наши услуги": "Our Services",
    "Не приходите натощак. За 1.5–2 часа до приема рекомендуется легко поесть — сытый пациент легче переносит действие местной анестезии и выделяет меньше слюны.": "Please do not arrive on an empty stomach. We recommend a light meal 1.5–2 hours before your visit: patients tolerate local anesthesia better and produce less saliva.",
    "Неинвазивная терапия кариеса без сверления (ICON)": "Non-invasive caries treatment without drilling (ICON)",
    "Неинвазивное лечение начального кариеса препаратом ICON (без бормашины)": "Non-invasive early caries treatment with ICON (drill-free)",
    "Немедленная нагрузка": "Immediate Loading",
    "Непрямая реставрация из композита": "Indirect composite restoration",
    "Нехирургическая пластика десны (1 зуб)": "Non-surgical gingival contouring (1 tooth)",
    "Новые зубы за 1–3 дня": "New Teeth in 1–3 Days",
    "Номенклатура разрешенных видов медицинской помощи включает первичную доврачебную и врачебную медико-санитарную помощь по стоматологии общей практики, стоматологии терапевтической, хирургической, ортопедической, ортодонтии и детской стоматологии.": "The licensed scope of medical care includes primary healthcare in general dentistry, operative dentistry, oral surgery, prosthodontics, orthodontics, and pediatric dentistry.",
    "Номер регистратуры": "Reception Desk Phone",
    "Нормативная информация": "Regulatory Information",
    "Нужна консультация стоматолога?": "Need a Dental Consultation?",
    "Нужна срочная консультация?": "Need an urgent consultation?",
    "О враче": "About the Doctor",
    "О клинике": "About",
    "О клинике и врачи — Стоматология Бештау Смайл Клиник Лермонтов": "About Clinic & Doctors — Beshtau Smile Clinic Lermontov",
    "Оборудование экспертного класса и многоступенчатая стерилизация инструментов.": "Expert-class dental technology and multi-stage instrument sterilization.",
    "Образование и повышение квалификации": "Education & Advanced Training",
    "Образование и сертификация": "Education & Certification",
    "Обслуживание по прямому договору": "Corporate Service via Direct Contract",
    "Обучение гигиене и бережное удаление подвижных молочных зубов": "Oral hygiene education and gentle extraction of mobile primary teeth",
    "Общество с ограниченной ответственностью «Бештау Смайл Клиник»": "Limited Liability Company \"Beshtau Smile Clinic\"",
    "Обычная версия": "Standard Version",
    "Обязательно предупредите лечащего врача о наличии аллергических реакций, хронических заболеваниях (гипертония, сахарный диабет) и препаратах, которые вы принимаете на постоянной основе (особенно антикоагулянты).": "Be sure to inform your treating physician about drug allergies, chronic conditions (hypertension, diabetes), and regular medications (especially anticoagulants).",
    "ОГРН": "OGRN",
    "Ознакомиться с лицензией (PDF)": "View Medical License (PDF)",
    "Онлайн-запись": "Online Booking",
    "ООО «Бештау Смайл Клиник»": "LLC Beshtau Smile Clinic",
    "ООО «Бештау Смайл Клиник» &bull; ИНН 2629013921 &bull; ОГРН 1252600006460": "LLC Beshtau Smile Clinic &bull; INN 2629013921 &bull; OGRN 1252600006460",
    "ООО «Бештау Смайл Клиник» обеспечивает полную конфиденциальность персональных данных и медицинской тайны пациентов в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и Федерального закона от 21.11.2011 № 323-ФЗ.": "LLC Beshtau Smile Clinic ensures complete confidentiality of personal data and medical privacy in compliance with Federal Law No. 152-FZ and Federal Law No. 323-FZ.",
    "ООО «Бештау Смайл Клиник» • ИНН 2629013921 • ОГРН 1252600006460": "LLC Beshtau Smile Clinic • INN 2629013921 • OGRN 1252600006460",
    "Оперция на 4-х имплантах": "All-on-4 surgical protocol",
    "Оперция на 6-х имплантах": "All-on-6 surgical protocol",
    "Оперция на 8-х имплантах": "All-on-8 surgical protocol",
    "Опорная супраструктура на имплантате": "Implant-supported abutment suprastructure",
    "Определение вида смыкания зубных рядов с помощью лицевой дуги": "Facebow transfer and articulation analysis",
    "Определение прикуса (силиконовый регистратрация)": "Silicone bite registration record",
    "Определение центральной окклюзии (регистрация прикуса)": "Centric relation bite registration",
    "Опытные врачи-стоматологи высшей категории с непрерывной практикой от 8 до 16 лет.": "Experienced senior dental specialists with 8 to 16 years of continuous clinical practice.",
    "Организация плановых ежегодных осмотров коллектива для раннего выявления стоматологических патологий и предотвращения потерь рабочего времени из-за острой зубной боли.": "Annual scheduled team examinations for early pathology detection, avoiding lost work hours due to acute dental emergencies.",
    "Ординатура по специальности «Ортодонтия»": "Clinical Residency in Orthodontics",
    "Ординатура по специальности «Стоматология ортопедическая»": "Clinical Residency in Prosthodontics",
    "Ортодонтическая коррекция с применением лигатурной брекет-системы": "Orthodontic treatment with ligated bracket system",
    "Ортодонтическая коррекция съемным ортодонтическим аппаратом": "Removable orthodontic appliance therapy",
    "Ортодонтическая лицевая маска Диляра": "Delaire facial orthopedic mask",
    "Ортодонтическое отделение": "Orthodontic Department",
    "Ортодонтическое скрепление металлической проволокой": "Orthodontic wire retention splinting",
    "Ортодонтия": "Orthodontics",
    "Ортодонтия и исправление прикуса": "Orthodontics & Bite Correction",
    "Ортопантомография": "Orthopantomography (panoramic X-ray)",
    "Ортопедическая стоматология (коронки, виниры, протезы)": "Prosthetic Dentistry (Crowns, Veneers, Dentures)",
    "Ортопедическое лечение восстанавливает как функцию пережевывания пищи, так и гармонию улыбки. Мы работаем с безметалловыми циркониевыми каркасами и керамикой E.max, которые полностью имитируют оптические свойства живой эмали.": "Prosthetic treatment restores both masticatory function and smile harmony. We work with metal-free zirconia and E.max ceramics that naturally emulate natural enamel translucency.",
    "Ортопедическое отделение": "Prosthetic Department",
    "Ортопедия": "Prosthetics",
    "Ортопедия CAD/CAM": "CAD/CAM Prosthodontics",
    "Ортопедия и восстановление зубных рядов": "Prosthodontics & Arch Restoration",
    "Ортопедия и протезирование": "Prosthodontics & Restorations",
    "Оснащение и комфорт": "Equipment & Comfort",
    "Основное меню": "Main Menu",
    "Особое внимание в нашей клинике уделяется психологическому комфорту ребенка. Первый визит проходит в форме спокойного знакомства, без принуждения и боли. Мы сохраняем здоровье молочных зубов, формируя основу для правильного прорезывания постоянных.": "Special emphasis is placed on child comfort. The first visit is a gentle, pressure-free introduction without pain. We protect primary teeth, securing sound eruption for permanent teeth.",
    "Особое внимание доктор уделяет бережному отношению к костной ткани, применению современных протоколов обезболивания и сохранению анатомической эстетики десневого контура для последующего протезирования.": "The doctor places special focus on bone preservation, state-of-the-art anesthesia, and safeguarding gum aesthetics for future prosthetics.",
    "Оставить заявку на сотрудничество": "Submit Partnership Request",
    "Остановка луночного кровотечения с наложением швов": "Post-extraction socket hemostasis with sutures",
    "Острые респираторные состояния:": "Acute Respiratory Symptoms:",
    "от 1 000 руб.": "from 1,000 RUB",
    "от 13 000 руб.": "from 13,000 RUB",
    "от 3 500 руб.": "from 3,500 RUB",
    "от 33 000 руб.": "from 33,000 RUB",
    "от 4 500 руб.": "from 4,500 RUB",
    "от 5 000 руб.": "from 5,000 RUB",
    "Отказ от алкоголя:": "Alcohol Restriction:",
    "Открытый и закрытый синус-лифтинг": "Open and closed sinus floor elevation",
    "Открытый и закрытый синус-лифтинг верхнечелюстных пазух": "Open and closed maxillary sinus lift",
    "Открытый кюретаж в области 1-2 зубов": "Open periodontal curettage (1-2 teeth)",
    "Открытый кюретаж при заболеваниях пародонта в области зуба (1 сегмент)": "Open curettage for periodontal disease (1 segment)",
    "Открытый синус-лифтинг": "Open lateral sinus lift",
    "Открыть в Яндекс Картах": "Open in Yandex Maps",
    "Открыть лицензию в формате PDF": "Open License in PDF",
    "Открыть навигационное меню": "Open navigation menu",
    "Открыть полный график &rarr;": "View Full Schedule &rarr;",
    "Открыть полный график →": "View Full Schedule →",
    "Официальная лицензированная деятельность": "Fully Licensed Healthcare Operations",
    "Официальная медицинская лицензия Минздрава СК": "Official Medical License from the Ministry of Health of SK",
    "Официальный паспорт изделия с серийным номером": "Official product passport with authentic serial number",
    "Оформление медицинской карты, договора на оказание платных медицинских услуг и информированного добровольного согласия (ИДС) производится у администратора за 10 минут до начала приема": "Registration of patient charts, service agreements, and informed consent forms is handled at the reception desk 10 minutes prior to appointment",
    "Оцените оснащение нашей клиники: современная входная группа, просторный холл с комфортной зоной ожидания и специализированные лечебные кабинеты.": "Explore our clinic: modern entrance, spacious waiting lounge, and dedicated treatment operatory suites.",
    "Очищение корневого канала (при распломбировке)": "Root canal cleansing and debris removal",
    "Ошибка 404": "Error 404",
    "ПАКЕТ Анти-Воспаление+ (Профгигиена + ФДТ 1 челюсть + Hyalrepair)": "Anti-Inflammation+ Package (Hygiene + PDT 1 jaw + Hyalrepair)",
    "ПАКЕТ Комплекс Пародонтит (Лечение пародонтита + Revidеnt полный + Плазмолифтинг)": "Periodontitis Comprehensive Package (Periodontitis therapy + Revident + PRP)",
    "ПАКЕТ Наноматрицы Комплекс (Кюретаж + M-Chip 1 челюсть + ФДТ)": "Nanomatrix Complex Package (Curettage + M-Chip 1 jaw + PDT)",
    "ПАКЕТ Регенерация Десен (Кюретаж + Revidеnt 0.5 мл + Плазмолифтинг)": "Gum Regeneration Package (Curettage + Revident 0.5 ml + PRP)",
    "ПАКЕТ Старт Пародонт (Профгигиена + ФДТ 1 челюсть + Антисептическая повязка)": "Periodontal Start Package (Hygiene + PDT 1 jaw + Antiseptic dressing)",
    "Памятка: как подготовиться к приему врача-стоматолога": "Patient Guide: How to Prepare for Your Dental Visit",
    "Пародонтология": "Periodontics",
    "Пародонтология и лечение десен": "Periodontics and Gum Treatment",
    "Пародонтология и профгигиена": "Periodontics & Dental Hygiene",
    "Пародонтология и профессиональная гигиена": "Periodontics & Professional Hygiene",
    "Пациентам": "Patients",
    "Перебазировка съемного протеза": "Removable denture reline",
    "Перебазировка съемного протеза лабораторная": "Laboratory denture reline",
    "Перевязка после хирургической операции": "Post-surgical wound inspection and dressing",
    "Переделка коронки": "Crown remake and adjustment",
    "Передовые технологии, бережное отношение к пациентам и честные цены без скрытых доплат.": "Advanced technologies, gentle patient care, and honest prices without hidden charges.",
    "Перейти к полному прайс-листу": "Go to Full Price List",
    "Перейти на главную": "Go to Home",
    "Перелечивание каналов (1 посещение)": "Root canal retreatment (Visit 1)",
    "Перелечивание каналов (2 посещение)": "Root canal retreatment (Visit 2)",
    "Перелечивание каналов (3 посещение)": "Root canal retreatment (Visit 3)",
    "Перелечивание ранее некачественно запломбированных корневых каналов": "Endodontic retreatment of previously compromised root canals",
    "Плазмолифтинг PRP десен (1 челюсть расширенный)": "PRP gum plasmolifting (1 jaw, extended)",
    "Плазмолифтинг PRP десен (1 челюсть)": "PRP gum plasmolifting (1 jaw)",
    "Пластика альвеолярного отростка": "Alveolar process reconstruction",
    "Пластика мягких тканей в области 1-го импланта": "Soft tissue augmentation at 1 implant site",
    "Пластика мягкого неба": "Soft palate plasty",
    "Пластика перфорации верхнечелюстной пазухи": "Closure of oroantral fistula / sinus perforation",
    "Пластика уздечек языка и губ, вестибулопластика, устранение рецессий десны": "Lingual and labial frenectomy, vestibuloplasty, gum recession management",
    "Пластика уздечек языка и губ, мягкотканная пластика десневого края": "Frenectomy of lip and tongue, soft tissue gum margin contouring",
    "Пластика уздечки верхней губы": "Upper labial frenectomy",
    "Пластика уздечки губы": "Labial frenectomy",
    "Пластика уздечки нижней губы": "Lower labial frenectomy",
    "Пластика уздечки языка": "Lingual frenectomy",
    "Пломбирование 1 корневого канала гуттаперчей методом вертикальной компрессии": "Single root canal warm vertical gutta-percha obturation",
    "Пломбирование канала гуттаперчей (метод горячей вертикальной конденсации)": "Warm vertical gutta-percha canal obturation",
    "Пломбирование канала гуттаперчей (метод латеральной конденсации, 1 кан.)": "Lateral gutta-percha condensation (1 canal)",
    "Пломбирование корневого канала временного зуба": "Primary tooth root canal filling",
    "Пломбирование корневого канала зуба гуттаперчивыми штифтами (1-канал)": "Single-canal gutta-percha obturation",
    "Пломбирование корневого канала зуба гуттаперчивыми штифтами (2х-канала)": "Two-canal gutta-percha obturation",
    "Пломбирование корневого канала зуба гуттаперчивыми штифтами (3х-канала)": "Three-canal gutta-percha obturation",
    "Пломбирование корневого канала зуба пастой (1-канал)": "Single-canal paste obturation",
    "Пломбирование корневого канала зуба пастой (2-канала)": "Two-canal paste obturation",
    "Пломбирование корневого канала зуба пастой (3-канала)": "Three-canal paste obturation",
    "Пломбирование отсроченное": "Delayed definitive composite restoration",
    "Пн — Вс: 09:00 — 20:00": "Mon — Sun: 09:00 — 20:00",
    "Пн–Вс 09:00–20:00": "Mon–Sun 09:00–20:00",
    "Пн–Вс 09:00–20:00 (без выходных)": "Mon–Sun 09:00–20:00 (Every day)",
    "Повторная фиксация на постоянный цемент": "Recementation on permanent cement",
    "Повторное использование формирователя десны": "Gingival former reuse and disinfection",
    "Повторный прием на брекет-системе": "Orthodontic bracket follow-up visit",
    "Повязка Хлорофиллипт масляный": "Oily Chlorophyllipt oral dressing",
    "Подготовка зубных рядов к ортогнатической хирургии и имплантации": "Preparation of dental arches for orthognathic surgery and implants",
    "Поддерживающая пародонтологическая чистка": "Supportive periodontal maintenance cleaning",
    "Поддесневая механическая очистка имплантата (1 имплант)": "Subgingival mechanical implant debridement (1 unit)",
    "Подробнее": "Learn More",
    "Подробнее &rarr;": "Learn More &rarr;",
    "Подробнее о враче": "Doctor Profile",
    "Подробнее об услугах": "Learn More About Services",
    "Подробнее →": "Learn More →",
    "Подробные условия гарантии фиксируются в индивидуальном гарантийном талоне и плане лечения.": "Detailed warranty terms are specified in your personal warranty certificate and treatment plan.",
    "Позиционирование брекетов (1 челюсть)": "Orthodontic bracket bonding (1 arch)",
    "Поиск по названию услуги...": "Search by service description...",
    "Поиск по прайс-листу": "Search price list",
    "Поиск услуги или процедуры...": "Search for service or procedure...",
    "Покрытие дентима \" Tokuyama Shield force plusl\" лечение гиперчувствительности зубов": "Tokuyama Shield Force Plus desensitizing treatment",
    "Покрытие дентима &quot; Tokuyama Shield force plusl&quot; лечение гиперчувствительности зубов": "Tokuyama Shield Force Plus desensitizing treatment",
    "Покрытие дентима \\\" Tokuyama Shield force plusl\\\" лечение гиперчувствительности зубов": "Tokuyama Shield Force Plus desensitizing treatment",
    "Покрытие зубов фторлаком (1 зуб)": "Fluoride varnish application (1 tooth)",
    "Полезная информация": "Helpful Information",
    "Полирование ортодонтической конструкции": "Orthodontic appliance polishing",
    "Полировка до зеркального сухого блеска с долговечной защитой": "High-gloss mirror polishing with durable enamel protection",
    "Полировка и реминерализация эмали": "Enamel polishing and remineralization",
    "Полировка пломбы": "Composite restoration polishing",
    "Полировка поверхности эмали и межзубных контактов": "Enamel surface and interdental contact polishing",
    "Политика конфиденциальности (152-ФЗ)": "Privacy Policy (152-FZ)",
    "Политика обработки персональных данных (ФЗ № 152-ФЗ)": "Personal Data Processing Policy (152-FZ)",
    "Полная адентия": "Full Arch Restoration",
    "Полная профгигиена (ультразвук + AirFlow + полировка обе челюсти)": "Comprehensive hygiene (Ultrasound + AirFlow + Polishing both arches)",
    "Полное наименование": "Full Legal Name",
    "Полный отказ от съемных протезов и клеящих гелей": "Complete freedom from removable dentures and messy adhesives",
    "Полный спектр высокотехнологичной стоматологической помощи для взрослых и детей в Лермонтове.": "Full spectrum of high-tech dental care for adults and children in Lermontov.",
    "Полный съемный акриловый протез (1 челюсть)": "Complete acrylic denture (1 jaw)",
    "Полный съемный протез с армированием": "Reinforced complete removable denture",
    "Полный съемный протез с опорой на 2 имплантата": "Overdenture supported by 2 implants",
    "Получить расчет": "Get Cost Estimate",
    "Понедельник": "Monday",
    "Понедельник — Воскресенье: 09:00 – 20:00": "Monday — Sunday: 09:00 – 20:00",
    "Последипломная подготовка в клинической ординатуре по специальности «Стоматология хирургическая»": "Postgraduate clinical residency training in Oral and Maxillofacial Surgery",
    "Постановка временной пломбы (дентин-паста)": "Temporary dentin-paste dressing",
    "Постановка лечебной повязки (Септопак, Диплен)": "Periodontal dressing placement (Septopack, Diplen)",
    "Построить маршрут": "Get Directions",
    "Починка перелома базиса самотвердеющей пластмассой": "Denture base fracture acrylic repair",
    "Починка съемного протеза": "Removable denture repair",
    "Правильный прикус — залог здоровья зубов, височно-нижнечелюстного сустава и ровной осанки. Мы подбираем ортодонтические аппараты с учетом возраста, клинической картины и эстетических пожеланий пациента.": "Proper occlusion is key to tooth longevity, TMJ health, and posture. We select orthodontic appliances matching patient age, clinical indicators, and aesthetic goals.",
    "Правовая информация": "Legal Information",
    "Правовая информация и лицензии": "Legal Information & Licenses",
    "Правовая информация и лицензия — ООО «Бештау Смайл Клиник»": "Legal Information & License — LLC Beshtau Smile Clinic",
    "Прайс-лист": "Price List",
    "Предоставление персональных скидок на терапевтическое, ортодонтическое и ортопедическое лечение сотрудникам компаний-партнеров, а также членам их семей.": "Personal discounts on restorative, orthodontic, and prosthodontic care for partner company employees and their families.",
    "Предоставлять жителям и гостям региона Кавказских Минеральных Вод доступ к стоматологической помощи мирового уровня. Мы не просто лечим зубы — мы восстанавливаем уверенность в себе, сохраняем естественную анатомию и создаем здоровые гармоничные улыбки на десятилетия.": "Providing residents and guests of the Caucasian Mineral Waters region with world-class dental care. We do not just treat teeth: we rebuild confidence, preserve natural anatomy, and craft healthy smiles for decades.",
    "Предыдущая акция": "Previous offer",
    "Предыдущее фото": "Previous photo",
    "Премиальная остеоинтеграция 99.2% с пожизненной гарантией производителя. Восстановление утраченного зуба по международному хирургическому протоколу.": "Premium 99.2% osseointegration with manufacturer lifetime warranty. Missing tooth restoration according to international surgical protocols.",
    "Премиальная стоматология в Лермонтове": "Premium Dentistry in Lermontov",
    "Премиальная эстетика живого зуба и непревзойденная прочность. Идеальная биосовместимость без потемнения десны и риска аллергических реакций.": "Premium natural-tooth aesthetics and outstanding durability. Perfect biocompatibility without dark gum margins or allergies.",
    "Препарирование зуба под коронку": "Tooth preparation for crown",
    "Приварка зуба": "Tooth addition to denture",
    "Приварка кламмера": "Clasp addition to denture",
    "Прием (осмотр, консультация) врача-ортодонта первичный": "Initial orthodontic consultation and clinical examination",
    "Прием (осмотр, консультация) врача-стоматолога детского первичный": "Initial pediatric dental consultation and examination",
    "Прием (осмотр, консультация) врача-стоматолога детского повторный": "Follow-up pediatric dental visit and examination",
    "Прием (осмотр, консультация) врача-стоматолога детского с составлением плана лечения": "Pediatric dental examination with custom treatment plan",
    "Прием (осмотр, консультация) врача-стоматолога первичный": "Initial general dental consultation and clinical examination",
    "Прием (осмотр, консультация) врача-стоматолога повторный": "Follow-up general dental visit and examination",
    "Прием (осмотр, консультация) врача-стоматолога-ортопеда первичный": "Initial prosthodontist consultation and examination",
    "Прием (осмотр, консультация) врача-стоматолога-ортопеда повторный": "Follow-up prosthodontist visit and examination",
    "Прием (осмотр, консультация) врача-стоматолога-хирурга первичный": "Initial oral surgeon consultation and examination",
    "Прием (осмотр, консультация) врача-стоматолога-хирурга повторный": "Follow-up oral surgeon visit and examination",
    "Прием 7 дней в неделю без очередей и стресса": "Open 7 days a week with zero waiting and zero stress",
    "Прием граждан по личным вопросам осуществляется по предварительной записи через администратора клиники каждый четверг с 15:00 до 17:00.": "Appointments for personal administrative inquiries are held by appointment through clinic reception every Thursday from 15:00 to 17:00.",
    "Прием детского врача": "Pediatric visit",
    "Прием детского врача: от 1 000 руб. / Лечение: от 3 300 руб.": "Pediatric consultation: from 1,000 RUB / Treatment: from 3,300 RUB",
    "Прием ежедневно, без выходных": "Open daily, including weekends",
    "Прием консультация врача-пародонтолога первичный": "Initial periodontist consultation and examination",
    "Прием пищи:": "Meal Intake:",
    "Прием по времени": "On-Time Appointment",
    "Прием строго по времени": "Strictly by Appointment",
    "Приемные дни врача": "Doctor Reception Days",
    "Приемные дни: Пн, Вт, Ср, Чт, Пт, Сб, Вс (ежедневно по расписанию) &bull; Кабинет № 2": "Reception days: Mon, Tue, Wed, Thu, Fri, Sat, Sun (daily by schedule) &bull; Room 2",
    "Приемные дни: Пн, Вт, Ср, Чт, Пт, Сб, Вс (ежедневно по расписанию) • Кабинет № 2": "Reception days: Mon, Tue, Wed, Thu, Fri, Sat, Sun (daily by schedule) • Room 2",
    "Приемные дни: Понедельник, Вторник, Среда, Пятница, Суббота, Воскресенье &bull; Кабинет № 4": "Reception days: Monday, Tuesday, Wednesday, Friday, Saturday, Sunday &bull; Room 4",
    "Приемные дни: Понедельник, Вторник, Среда, Пятница, Суббота, Воскресенье • Кабинет № 4": "Reception days: Monday, Tuesday, Wednesday, Friday, Saturday, Sunday • Room 4",
    "Приемные дни: Понедельник, Вторник, Среда, Четверг, Суббота, Воскресенье &bull; Кабинет № 3": "Reception days: Monday, Tuesday, Wednesday, Thursday, Saturday, Sunday &bull; Room 3",
    "Приемные дни: Понедельник, Вторник, Среда, Четверг, Суббота, Воскресенье • Кабинет № 3": "Reception days: Monday, Tuesday, Wednesday, Thursday, Saturday, Sunday • Room 3",
    "Приемные дни: Понедельник, Вторник, Четверг, Пятница, Суббота, Воскресенье &bull; Кабинет № 2": "Reception days: Monday, Tuesday, Thursday, Friday, Saturday, Sunday &bull; Room 2",
    "Приемные дни: Понедельник, Вторник, Четверг, Пятница, Суббота, Воскресенье • Кабинет № 2": "Reception days: Monday, Tuesday, Thursday, Friday, Saturday, Sunday • Room 2",
    "Приемные дни: Понедельник, Среда, Четверг, Пятница, Воскресенье &bull; Кабинет № 1": "Reception days: Monday, Wednesday, Thursday, Friday, Sunday &bull; Room 1",
    "Приемные дни: Понедельник, Среда, Четверг, Пятница, Воскресенье • Кабинет № 1": "Reception days: Monday, Wednesday, Thursday, Friday, Sunday • Room 1",
    "Приоритетный выбор времени приема для сотрудников": "Priority appointment scheduling for employees",
    "Припасовка и фиксация коронки": "Crown fitting and cementation",
    "Прицельные цифровые радиовизиографы и конусно-лучевая томография с минимальной дозой облучения.": "Targeted digital radiovisiographs and cone beam CT scans with minimal radiation exposure.",
    "Проведение контролируемой чистки зубов": "Supervised oral hygiene demonstration",
    "Провизорная композитная коронка": "Provisional composite crown",
    "Проводниковая анестезия": "Block local anesthesia",
    "Проводниковая анестезия (ултракаин)": "Conduction local anesthesia (Ultracain)",
    "Проводниковая анестезия (ультракаин)": "Conduction local anesthesia (Ultracain)",
    "Прозрачная ценовая политика": "Transparent Pricing Policy",
    "Прозрачные цены без скрытых услуг": "Transparent prices with no hidden fees",
    "Промежуточная единица (зуб) в металлокерамическом мосту на имплантатах": "Pontic unit in implant-supported PFM bridge",
    "Промежуточная единица на диоксиде циркония в мосту на имплантатах": "Pontic unit in implant-supported zirconia bridge",
    "Промывание пародонтального кармана антисептиками": "Antiseptic pocket irrigation",
    "Простая ортодонтическая пластинка (с одним винтом)(Элайнеры)": "Simple orthodontic expansion plate (single screw)",
    "Простая фиксация коронки": "Standard crown cementation",
    "Простое удаление молочного зуба": "Simple primary tooth extraction",
    "Просторные кабинеты, эргономичные лечебные установки и строгий инфекционный контроль обеспечивают максимальную безопасность каждого визита.": "Spacious treatment rooms, ergonomic dental units, and strict infection control ensure maximum safety during every visit.",
    "Пространство клиники": "Clinic Spaces",
    "Протез Acry-Free полный съемный (1 челюсть)": "Acry-Free complete flexible denture (1 jaw)",
    "Протез Acry-Free частичный съемный (1 челюсть)": "Acry-Free partial flexible denture (1 jaw)",
    "Протезирование All-on-4 (несъемный адаптационный протез)": "All-on-4 immediate fixed provisional prosthesis",
    "Протезирование All-on-4 и All-on-6 под ключ": "Turnkey All-on-4 and All-on-6 Dental Implants",
    "Протезирование All-on-6 (несъемный адаптационный протез)": "All-on-6 immediate fixed provisional prosthesis",
    "Протезирование зубов полными съемными пластиночными протезами (1 челюсть)": "Complete removable plate denture (1 jaw)",
    "Протезирование на имплантатах (одиночные коронки, мосты, протоколы All-on-4 / All-on-6)": "Implant prosthetics (single crowns, bridges, All-on-4 / All-on-6 protocols)",
    "Протезирование на имплантатах: All-on-4, All-on-6, одиночные коронки и мостовидные конструкции": "Implant prosthodontics: All-on-4, All-on-6, single crowns, and dental bridges",
    "Протезирование полными съемными пластиночными протезами": "Complete removable plate denture prosthetics",
    "Протезирование съемными бюгельными протезами": "Removable partial clasp denture prosthetics",
    "Протезирование частичным съемным пластиночным протезом (1 челюсть)": "Partial removable plate denture (1 jaw)",
    "Профессиональная гигиена и профилактика для взрослых": "Professional hygiene and prevention for adult family members",
    "Профессиональная гигиена полости рта (комплекс Air Flow + ультразвук)": "Comprehensive oral hygiene (Air Flow + Ultrasound)",
    "Профессиональная гигиена полости рта (ультразвук)": "Ultrasonic professional oral scaling",
    "Профессиональная гигиена полости рта Air Flow": "Air Flow stain and plaque removal",
    "Профессиональная гигиена полости рта и зубов": "Professional dental and oral hygiene",
    "Профессиональная гигиена полости рта и подбор домашнего ухода": "Professional oral hygiene and home care product selection",
    "Профессиональная гигиена полости рта на льготных условиях": "Professional oral hygiene on preferred terms",
    "Профессиональное отбеливание зубов": "Professional in-office teeth whitening",
    "Профессиональный профиль": "Professional Profile",
    "Профилактика и профессиональная гигиена": "Prevention and Professional Hygiene",
    "Профилактические стоматологические чек-апы": "Preventive Dental Checkups",
    "Профилактическое отделение": "Preventive Department",
    "Профиль": "Profile",
    "Прямой телефон": "Direct Phone",
    "Психологическая адаптация ребенка к приему стоматолога": "Psychological adaptation of children to dental visits",
    "Пульпосептин (лекарство)": "Pulposeptin endodontic medicament",
    "Пульпотомия (ампутация коронковой пульпы)": "Coronal pulpotomy",
    "Пульпотомия (ампутация пульпы)": "Pulpotomy (coronal pulp amputation)",
    "Пульпотомия витальная": "Vital pulpotomy",
    "Пятигорск (15 мин)": "Pyatigorsk (15 min)",
    "Пятигорск ~15 мин": "Pyatigorsk ~15 min",
    "Пятница": "Friday",
    "р/с 40702810610001917614 в АО «ТБанк», БИК 044525974, к/с 30101810145250000974": "Settlement account 40702810610001917614 at JSC T-Bank, BIC 044525974, corr. 30101810145250000974",
    "Равномерное распределение жевательной нагрузки на костную ткань": "Uniform distribution of masticatory load across the jaw bone",
    "Радиовизиография (прицельный рентген-снимок 1 зуба)": "Radiovisiography (periapical digital X-ray of 1 tooth)",
    "Разборка мостовидного протеза (1 распил)": "Dental bridge sectioning (1 cut)",
    "Раннее ортодонтическое лечение детей: пластинки, функциональные аппараты, трейнеры": "Early interceptive orthodontics for children: plates, functional appliances, trainers",
    "Ранняя ортодонтическая коррекция у детей функциональными пластинками": "Early interceptive orthodontic correction in children with functional plates",
    "Распломбировка канала, запломбированного гуттаперчей": "Gutta-percha canal desobturation",
    "Распломбировка канала, ранее леченного пастой": "Paste-filled root canal desobturation",
    "Распломбировка корневого канала ранее леченного гуттаперчей": "Gutta-percha canal desobturation",
    "Распломбировка корневого канала ранее леченного пастой": "Paste canal desobturation",
    "Распломбировка корневого канала ранее леченного фосфат-цементом/ резорцин-формальдегидным методом": "Hard cement / resorcinol-formaldehyde canal desobturation",
    "Расщепление гребня кости": "Alveolar ridge split osteotomy",
    "Регистратура клиники работает ежедневно с 09:00 до 20:00": "Clinic reception is open daily from 09:00 to 20:00",
    "Регулярная профессиональная гигиена раз в 6 месяцев предотвращает 90% заболеваний зубов и десен. Мы используем швейцарский протокол GBT (Guided Biofilm Therapy) с минимальной абразивностью для эмали.": "Regular professional hygiene every 6 months prevents 90% of tooth and gum diseases. We use the Swiss GBT protocol (Guided Biofilm Therapy) with minimal enamel abrasion.",
    "Регулярное повышение квалификации по протоколам костной и мягкотканной аугментации": "Continuous advanced training in bone and soft tissue augmentation protocols",
    "Редукция альвеолярного гребня": "Alveoloplasty (alveolar ridge reduction)",
    "Режим работы": "Working Hours",
    "Режим работы: Пн–Вс 09:00–20:00, без выходных": "Hours: Mon–Sun 09:00–20:00, no days off",
    "Резекция верхушки корня": "Apicoectomy (root end resection)",
    "Реквизиты юридического лица": "Legal Entity Requisites",
    "Рекомендации по подготовке к визиту, правила внутреннего распорядка клиники и нормативные документы для ознакомления.": "Visit preparation recommendations, clinic code of conduct, and regulatory documentation.",
    "Реминерализация (фторирование)": "Enamel remineralization (fluoridation)",
    "Реминерализация и глубокое фторирование зубов": "Remineralization and deep fluoridation of teeth",
    "Ремонт ортодонического аппарата": "Orthodontic appliance repair",
    "Репозиция вывихнутых зубов с фиксацией гладкой лентой (без фиксации в прикусе) 7000": "Tooth repositioning with ribbond splint (without bite lock)",
    "Репозиция вывихнутых зубов с фиксацией гладкой лентой (с фиксацией в прикусе)": "Tooth repositioning with ribbond splint (with bite lock)",
    "Реставрация скола керамики на металлокерамическом протезе (1 ед.)": "Porcelain chip composite repair (1 unit)",
    "Ретенционная каппа (1 челюсть)": "Clear retention tray (1 arch)",
    "Ретенционный период: установка несъемных ретейнеров и капп для фиксации результата": "Retention phase: placement of bonded retainers and aligners to stabilize outcomes",
    "Ретракция десны (отодвигание десны для слепка)": "Gingival retraction cord placement",
    "Руководство организации": "Executive Management",
    "Самолигирующие брекет-системы Damon (металлические и эстетические)": "Damon self-ligating braces (metal and aesthetic)",
    "Сбор данных через онлайн-формы сайта осуществляется исключительно в целях обратной связи, координации времени записи на прием и предварительного информирования пациента. Персональные данные ни при каких обстоятельствах не передаются третьим лицам без письменного согласия субъекта персональных данных.": "Data collected through website forms is used exclusively for feedback, scheduling, and preliminary patient information. Personal data is never shared with third parties without written consent.",
    "Сведения о надзорных органах в сфере здравоохранения": "Information on Healthcare Supervisory Authorities",
    "Светлое пространство в спокойных тонах, комфортные зоны отдыха и внимательные координаторы лечения.": "Bright interior in calm tones, comfortable waiting lounges, and attentive patient coordinators.",
    "Свяжитесь с администрацией клиники по электронной почте или телефону регистратуры для подготовки коммерческого предложения.": "Contact our clinic administration by email or phone to receive a customized corporate proposal.",
    "Связь с клиникой": "Contacting the Clinic",
    "Семейная программа": "Family Care Program",
    "Семейная стоматология: прием со скидкой 10%": "Family Dentistry: 10% Discount on Care",
    "Сертификация по лечению с использованием элайнеров и цифровых кап": "Certified in clear aligner therapy and digital splints",
    "Сертифицированные врачи-стоматологи с непрерывным клиническим стажем от 8 до 16 лет. Регулярные участники российских и международных конференций.": "Certified dental specialists with continuous clinical experience of 8 to 16 years. Regular participants in national and international medical congresses.",
    "Сертифицированные курсы по дентальной имплантации и несъемному протезированию": "Certified courses in dental implantology and fixed prosthetics",
    "Сертифицированный специалист по адгезивным керамическим и композитным реставрациям": "Certified specialist in adhesive ceramic and composite restorations",
    "Сертифицированный специалист по работе с современными брекет-системами Ormco": "Certified specialist in modern Ormco orthodontic systems",
    "Сертифицированный специалист по современным протоколам реминерализирующей терапии": "Certified specialist in modern remineralizing therapy protocols",
    "Синус-лифтинг закрытый": "Closed crestal sinus lift",
    "Синус-лифтинг открытый": "Open lateral sinus lift",
    "Система фиксации с использованием ФГП": "Functional attachment retention system",
    "Скидка до 20% на комплексную имплантацию зубов": "Up to 20% discount on comprehensive dental implants",
    "Скидка на семейный прием": "Family visit discount",
    "Скидка увеличивается пропорционально объему вмешательства": "Discount increases proportionally with treatment volume",
    "Скидки до 15% на плановые стоматологические услуги": "Discounts up to 15% on scheduled dental services",
    "Слаженная работа врача и ассистента, соблюдение протокола стерильности и бережная анестезия.": "Coordinated four-handed doctor and assistant teamwork, sterile protocols, and gentle anesthesia.",
    "Слайд 1": "Slide 1",
    "Слайд 2": "Slide 2",
    "Слайд 3": "Slide 3",
    "Слайд 4": "Slide 4",
    "Слайд 5": "Slide 5",
    "Слайд 6": "Slide 6",
    "Следующая акция": "Next offer",
    "Следующее фото": "Next photo",
    "Сложное удаление молочного зуба": "Complex primary tooth extraction",
    "Смотреть всю галерею": "View Full Gallery",
    "Смотреть всю галерею клиники": "View Full Clinic Gallery",
    "Смотреть прайс-лист": "View Price List",
    "Смотреть услуги": "View Services",
    "Смотреть цены": "View Prices",
    "Смотреть цены в прайсе &rarr;": "View Prices in Price List &rarr;",
    "Смотреть цены в прайсе →": "View Prices in Price List →",
    "Смотреть цены и услуги": "View Prices & Services",
    "Снижение больничных листов по причине стоматологических осложнений": "Reduction of sick leaves caused by dental complications",
    "Снятие брекетов + полировка": "Bracket debonding and enamel polishing",
    "Снятие временной пломбы": "Temporary filling removal",
    "Снятие коронки": "Crown removal",
    "Снятие культевых вкладок ( простые)": "Simple post-and-core removal",
    "Снятие культевых вкладок (сложное )": "Complex post-and-core removal",
    "снятие оттиска одной челюсти А-силиконового": "A-silicone dental impression (1 jaw)",
    "снятие оттиска одной челюсти Альгинатного": "Alginate dental impression (1 jaw)",
    "снятие оттиска одной челюсти С-силиконового": "C-silicone dental impression (1 jaw)",
    "Снятие оттиска с одной челюсти": "Single jaw dental impression",
    "снятие распорки с зуба": "Tooth space maintainer removal",
    "Снятие твердых зубных отложений ультразвуком": "Ultrasonic scaling of calculus deposits",
    "Современное здание с удобным подъездом и выделенными парковочными местами для пациентов.": "Modern building with convenient vehicle access and reserved patient parking spaces.",
    "Современное оснащение и стерильность": "Modern Technology & Sterility",
    "Современный медицинский центр эстетической и функциональной стоматологии. Комплексный подход к здоровью улыбки для взрослых и детей.": "Modern center of aesthetic and functional dentistry. Comprehensive smile care for adults and children.",
    "Сокращенное наименование": "Abbreviated Company Name",
    "Солнечный проезд, 10к1": "Solnechny proezd 10/1",
    "Сошлифовывание твердых тканей зуба": "Tooth hard tissue odontoplasty",
    "Специализация и ключевые компетенции": "Specialization & Core Competencies",
    "Специализация и ключевые навыки": "Specialization & Key Skills",
    "Специализация клиники": "Clinical Specialties",
    "Специализация по детской стоматологии и пародонтологии": "Specialization in Pediatric Dentistry and Periodontics",
    "Специализированные курсы по микроскопной эндодонтии и трехмерной обтурации каналов": "Advanced courses in microscopic endodontics and 3D canal obturation",
    "Специалист по адаптационному приему детей, ранней профилактике кариеса и комплексному лечению заболеваний пародонта.": "Specialist in pediatric adaptation visits, early caries prevention, and comprehensive periodontal treatment.",
    "Специалист по исправлению зубочелюстных аномалий у детей и взрослых с применением брекет-систем и прозрачных элайнеров.": "Specialist in correcting dentofacial anomalies in children and adults using brackets and clear aligners.",
    "Специалист по исправлению прикуса и эстетической ортодонтии у детей и взрослых.": "Specialist in bite correction and aesthetic orthodontics for children and adults.",
    "Специальные предложения": "Special Offers",
    "Специальные условия на детское отделение клиники": "Special conditions for pediatric department care",
    "Специальные условия при установке нескольких имплантатов и комплексной реабилитации зубного ряда. Честная прозрачная смета без скрытых доплат.": "Special terms for multi-unit implant placement and full dental arch rehabilitation. Honest, transparent estimate.",
    "Спеццена за установку": "Special placement price",
    "Среда": "Wednesday",
    "Стаж 10 лет": "10 years of experience",
    "Стаж 11 лет": "11 years of experience",
    "Стаж 14 лет": "14 years of experience",
    "Стаж 16 лет": "16 years of experience",
    "Стаж 8 лет": "8 years of experience",
    "Стерилизационное отделение (ЦСО)": "Sterilization Department (CSSD)",
    "Стерилизационный блок по стандартам СанПиН": "Sterilization Unit Compliant with SanPiN Standards",
    "Стерилизационный контроль по стандартам СанПиН": "Sterilization Quality Control by SanPiN Standards",
    "Стоимость": "Price",
    "Стоимость лечения": "Treatment cost",
    "Стоимость под ключ": "All-inclusive cost",
    "Стоимость процедур фиксируется в плане лечения после консультации и очного осмотра. Никаких скрытых надбавок за материалы и анестезию.": "Procedure costs are fixed in your treatment plan following consultation and clinical examination. No hidden markups for materials or anesthesia.",
    "Стоимость: от 4 500 руб.": "Cost: from 4,500 RUB",
    "Стоматолог-ортодонт": "Orthodontist",
    "Стоматолог-ортодонт, детский ортодонт": "Orthodontist, Pediatric Orthodontist",
    "Стоматолог-ортопед, имплантолог": "Prosthodontist, Implantologist",
    "Стоматолог-терапевт, эндодонтист": "Dental Therapist, Endodontist",
    "Стоматолог-хирург, имплантолог": "Dental Surgeon, Implantologist",
    "Стоматологическая клиника": "Dental Clinic",
    "Стоматология Бештау Смайл Клиник — Лермонтов | КМВ, Пятигорск, Ессентуки": "Beshtau Smile Dental Clinic — Lermontov | KMV, Pyatigorsk, Essentuki",
    "Стоматология экспертного уровня в Лермонтове и на КМВ": "Expert-Level Dentistry in Lermontov and KMV Region",
    "Страница не найдена": "Page Not Found",
    "Страница не найдена — Бештау Смайл Клиник в Лермонтове": "Page Not Found — Beshtau Smile Clinic in Lermontov",
    "Суббота": "Saturday",
    "Съемная шина (Защитная каппа)": "Removable protective splint / mouthguard",
    "Телерентгенография челюстей": "Cephalometric radiography (lateral TRG)",
    "Телескопическая система фиксации (1 цилиндр)": "Telescopic crown retention unit (1 cylinder)",
    "Телефон горячей линии: 8 (800) 200-26-03": "Hotline phone: 8 (800) 200-26-03",
    "Телефон:": "Phone:",
    "Телефон: +7 (8652) 29-60-27": "Phone: +7 (8652) 29-60-27",
    "Телефон: 8 (800) 555-49-43": "Phone: 8 (800) 555-49-43",
    "Терапевтическая стоматология": "Therapeutic Dentistry",
    "Терапевтическая стоматология и эндодонтия": "Restorative Dentistry and Endodontics",
    "Терапевтическое отделение": "Restorative Department",
    "Терапия": "Therapy",
    "Территориальный орган Росздравнадзора по СК": "Territorial Body of Roszdravnadzor in Stavropol Territory",
    "Тотальная ортопедическая реабилитация, виниры E.max, циркониевые коронки и мосты.": "Full-mouth prosthodontic rehabilitation, E.max veneers, zirconia crowns, and bridges.",
    "Тотальное протезирование, высокоточная безметалловая керамика E.max, циркониевые коронки, протезирование на имплантатах.": "Full-mouth rehabilitation, precision E.max all-ceramic restorations, zirconia crowns, and implant-supported prosthetics.",
    "Точное воспроизведение бугров и фиссур для правильного прикуса": "Exact cusp and fissure reproduction for optimal occlusion",
    "Траумель инъекция": "Traumeel injection",
    "Трепанация зуба, искусственной коронки": "Crown / tooth trepanation",
    "Трепанация зуба, искусственной коронки (создание доступа)": "Endodontic access opening through crown",
    "Тщательно почистите зубы щеткой с пастой и используйте зубную нить перед визитом.": "Brush your teeth thoroughly with toothpaste and use dental floss prior to your visit.",
    "Удаление внутреннего дентального импланта": "Dental implant removal (explantation)",
    "Удаление внутриканального штифта/ вкладки Извлечение анкерного штифта": "Anchor post canal extraction",
    "Удаление внутриканального штифта/ вкладки Извлечение стекловолоконного штифта": "Fiber post canal extraction",
    "Удаление внутриканального штифта/ вкладки инородного тела": "Foreign body / broken instrument removal from canal",
    "Удаление временного зуба": "Primary tooth extraction",
    "Удаление временного зуба (простое)": "Simple primary tooth extraction",
    "Удаление зуба": "Tooth extraction",
    "Удаление зуба сложное с разъединением корней": "Complex surgical extraction with root separation",
    "Удаление инородного тела кости": "Bone foreign body removal",
    "Удаление наддесневых и поддесневых зубных отложений": "Supragingival and subgingival calculus scaling",
    "Удаление пигментированного налета порошком Air Flow на основе глицина": "Stain removal with glycine-based Air Flow powder",
    "Удаление постоянного зуба (простое)": "Simple permanent tooth extraction",
    "Удаление ретинированного, дистопированного зуба (1 степени сложности)": "Impacted / ectopic tooth surgical removal (Class I)",
    "Удаление ретинированного, дистопированного зуба 2 степени сложности": "Impacted / ectopic tooth surgical removal (Class II)",
    "Удаление: от 3 500 руб. / Имплантация Osstem: 30 000 руб.": "Extraction: from 3,500 RUB / Osstem Implant: 30,000 RUB",
    "Удобная парковочная зона прямо перед входом": "Convenient parking right in front of the main entrance",
    "Удобное расположение в Лермонтове с собственной парковкой.": "Convenient location in Lermontov with dedicated free parking.",
    "Удобное расположение и график": "Convenient Location & Schedule",
    "Ультразвуковое расширение корневого канала зуба": "Ultrasonic root canal debridement and widening",
    "Управление Роспотребнадзора по СК": "Rospotrebnadzor Office in Stavropol Territory",
    "Услуги": "Services",
    "Услуги клиники": "Clinic Services",
    "Услуги стоматологии Бештау Смайл Клиник — Лермонтов и регион КМВ": "Dental Services of Beshtau Smile Clinic — Lermontov and KMV",
    "Установка абатмента (формирователя десны)": "Healing abutment placement",
    "Установка брекет-системы на 1 челюсть (безлигатурные/самолигирующие брекеты) Damon clear": "Damon Clear self-ligating braces (1 arch)",
    "Установка брекет-системы на 1 челюсть (керамические/сапфировые брекеты) Damon Q2": "Damon Q2 aesthetic braces (1 arch)",
    "Установка брекет-системы на 1 челюсть (лингвальные брекеты)": "Lingual braces placement (1 arch)",
    "Установка брекет-системы на 1 челюсть (металлические лигатурные брекеты)": "Metal ligated braces placement (1 arch)",
    "Установка дентальных имплантатов ведущих мировых систем": "Placement of dental implants from leading global systems",
    "Установка и ведение самолигирующих брекет-систем Damon Q и Damon Clear": "Placement and management of Damon Q and Damon Clear self-ligating brackets",
    "Установка индивидуального абатмента (CAD/CAM)": "Custom CAD/CAM abutment placement",
    "Установка миниимплантата для фиксации ортодонтического аппарата MARPE": "MARPE orthodontic micro-implant placement",
    "Установка мультиюнита Osstem прямого": "Osstem straight multi-unit abutment placement",
    "Установка мультиюнита Osstem углового": "Osstem angled multi-unit abutment placement",
    "Установка несъемных ретейнеров после завершения перемещения зубов": "Placement of bonded lingual retainers following tooth movement",
    "Установка ортодонтического мини-винта Bio-Ray": "Bio-Ray orthodontic mini-screw insertion",
    "Установка ортодонтического мини-винта Osstem": "Osstem orthodontic mini-screw insertion",
    "Установка ретейнеров": "Orthodontic retainer bonding",
    "Установка формирователя десны Osstem": "Osstem gingival former placement",
    "Установка южнокорейского имплантата премиум-класса с пожизненной гарантией производителя по фиксированной стоимости.": "Placement of premium South Korean implant with manufacturer lifetime warranty at a fixed cost.",
    "Участник международных симпозиумов по функциональной окклюзии и цифровой стоматологии CAD/CAM": "Participant in international symposia on functional occlusion and digital CAD/CAM dentistry",
    "Фактический адрес": "Actual Clinic Address",
    "Фатахов Анзор Сулейманович": "Dr. Anzor Fatahkhov",
    "Фатахов Анзор Сулейманович — Стоматолог-хирург, имплантолог — Бештау Смайл Клиник": "Dr. Anzor Fatahkhov — Dental Surgeon, Implantologist — Beshtau Smile Clinic",
    "ФДТ пародонта (1 сегмент)": "Photodynamic periodontal therapy (1 segment)",
    "Фиксация внутриканального штифта/ вкладки стекловолоконного штифта": "Fiber post cementation in root canal",
    "Фиксация конструкции на адгезивный цемент": "Adhesive resin cementation",
    "Фиксация культевой вкладки (литой / цельнокерамической)": "Post-and-core cementation (cast / ceramic)",
    "Фиксация ортопедической конструкции на адгезивный цемент": "Prosthetic restoration adhesive resin cementation",
    "Фиксация ортопедической конструкции на временный цемент (1 ед.)": "Provisional cementation (1 unit)",
    "Фиксация ортопедической конструкции на постоянный цемент (1 ед.)": "Permanent cementation (1 unit)",
    "Фиксированный прайс на весь срок действия договора": "Fixed price list for the entire contract duration",
    "Философия клинического превосходства и заботы": "Philosophy of Clinical Excellence & Care",
    "Формат протокола": "Treatment Protocol",
    "Формирование уступа под безметалловую коронку (керамика/цирконий)": "Shoulder margin tooth preparation for all-ceramic crown",
    "Фотогалерея": "Photo Gallery",
    "Фотогалерея «Бештау Смайл Клиник»": "Beshtau Smile Clinic Photo Gallery",
    "Фотогалерея клиники": "Clinic Photo Gallery",
    "Фотогалерея клиники — Бештау Смайл Клиник в Лермонтове": "Clinic Photo Gallery — Beshtau Smile Clinic in Lermontov",
    "Фрезерованный винир E-max": "Milled E-max ceramic veneer",
    "Фрезеровка": "CAD/CAM milling",
    "Химическая пломба": "Chemical-curing composite filling",
    "Хирурги, ортопеды, ортодонты, терапевты и детские врачи": "Surgeons, prosthodontists, orthodontists, therapists, and pediatric dentists",
    "Хирургическая подготовка полости рта к ортодонтическому и ортопедическому лечению": "Surgical mouth preparation for orthodontic and prosthodontic treatment",
    "Хирургическая стоматология и имплантация": "Oral Surgery and Implantation",
    "Хирургическая стоматология и удаление зубов": "Oral Surgery and Extractions",
    "Хирургические вмешательства проводятся врачами с опытом от 14 лет с максимальным сохранением окружающих тканей. Дентальная имплантация позволяет восстановить утраченные зубы без обтачивания соседних здоровых единиц.": "Surgical procedures are performed by surgeons with 14+ years experience with maximum tissue preservation. Implants restore missing teeth without trimming adjacent teeth.",
    "Хирургический навигационный набор 1 имплант": "Surgical guided stent (1 implant)",
    "Хирургический навигационный набор 2-4 импланта": "Surgical guided stent (2-4 implants)",
    "Хирургический навигационный набор 5-8 имплантов": "Surgical guided stent (5-8 implants)",
    "Хирургическое отделение": "Surgical Department",
    "Хирургия": "Surgery",
    "Хирургия и имплантация": "Surgery & Implantation",
    "Хранитель места (устанавливается при преждевременной потери молочного зуба)": "Space maintainer for premature primary tooth loss",
    "Художественное восстановление анатомической формы и окклюзионной поверхности зуба": "Artistic restoration of tooth anatomy and occlusal surface",
    "Цены": "Prices",
    "Цены на медицинские услуги": "Medical Service Prices",
    "Цены на стоматологические услуги": "Prices for Dental Services",
    "Цены на стоматологические услуги — Бештау Смайл Клиник": "Dental Service Prices — Beshtau Smile Clinic",
    "Цены на стоматологические услуги — Бештау Смайл Клиник | Лермонтов, КМВ": "Dental Service Prices — Beshtau Smile Clinic | Lermontov, KMV",
    "Цистотомия": "Cystotomy",
    "Цистотомия или цистэктомия": "Cystotomy or cystectomy",
    "Цистэктомия": "Cystectomy",
    "Цифровая 3D-диагностика (КЛКТ)": "Digital 3D Diagnostics (CBCT)",
    "Цифровая 3D-диагностика и томография": "Digital 3D Diagnostics & Tomography",
    "Цифровая рентген-диагностика": "Digital X-Ray & Diagnostics",
    "Цифровое сканирование и CAD/CAM фрезерование с микронной точностью": "Digital intraoral scanning and CAD/CAM milling with micron precision",
    "Честные цены без скрытых платежей, современные сертифицированные протоколы и выгодные условия на имплантацию, протезирование и комплексное лечение.": "Honest pricing without hidden fees, modern certified protocols, and special terms for implants, prosthetics, and complex treatments.",
    "Четверг": "Thursday",
    "Экономия на плане лечения": "Treatment plan savings",
    "Эксперт в области микроскопической эндодонтии, сложной перелечивании корневых каналов и эстетической реставрации зубов.": "Expert in microscopic endodontics, complex root canal retreatment, and aesthetic restorations.",
    "Эксперт в области функциональной реабилитации зубных рядов, безметалловой керамики и протезирования на имплантатах.": "Expert in functional arch rehabilitation, metal-free ceramics, and implant-supported restorations.",
    "Экстирпация пульпы": "Pulp extirpation",
    "Электронная запись на прием": "Online Appointment Request",
    "Электронная почта": "Email Address",
    "Эргономичные стоматологические установки, бестеневое освещение и цифровой вывод снимков на монитор.": "Ergonomic dental operatories, shadowless lighting, and digital image display on chairside monitors.",
    "Эстетика и прочность": "Aesthetics and Strength",
    "Юлия Владимировна — детский стоматолог и пародонтолог с 10-летним стажем практической работы. Успешно находит контакт с детьми разного возраста, формируя у ребенка позитивное отношение к посещению стоматолога без страха и боли.": "Dr. Yulia Bekisheva is a pediatric dentist and periodontist with 10 years of clinical experience. She successfully engages with children of all ages, fostering a positive, pain-free attitude toward dentistry.",
    "Юридический и фактический адрес": "Legal and Actual Address",
    "№ 323-ФЗ": "Federal Law No. 323-FZ"
  };

  // Создаем обратный словарь EN -> RU для точного восстановления
  const REVERSE_DICTIONARY = {};
  for (const [ru, en] of Object.entries(DICTIONARY)) {
    REVERSE_DICTIONARY[en] = ru;
  }

  // Динамические паттерны
  const DYNAMIC_PATTERNS = [
    {
      // Запись на прием: Доктор (День, Время)
      regex: /^Запись на прием:\s*(.+?)(?:\s*\((.+?),\s*(.+?)\))?$/,
      replace: (match) => {
        const target = DICTIONARY[match[1]] || match[1];
        if (match[2] && match[3]) {
          const day = DICTIONARY[match[2]] || match[2];
          return 'Appointment Booking: ' + target + ' (' + day + ', ' + match[3] + ')';
        }
        return 'Appointment Booking: ' + target;
      }
    },
    {
      // Запись на прием (День, Время)
      regex: /^Запись на прием\s*\((.+?),\s*(.+?)\)$/,
      replace: (match) => {
        const day = DICTIONARY[match[1]] || match[1];
        return 'Appointment Booking (' + day + ', ' + match[2] + ')';
      }
    },
    {
      regex: /^График приема врача:\s*(.+)$/,
      replace: (match) => 'Doctor Schedule: ' + (DICTIONARY[match[1]] || match[1])
    },
    {
      regex: /^График приема:\s*(.+)$/,
      replace: (match) => 'Doctor Schedule: ' + (DICTIONARY[match[1]] || match[1])
    },
    {
      regex: /^Записаться к доктору\s*\((.+)\)$/,
      replace: (match) => 'Book with Doctor (' + (DICTIONARY[match[1]] || match[1]) + ')'
    },
    {
      regex: /^Сегодня приемный день:\s*(.+)$/,
      replace: (match) => 'Open for appointments today: ' + match[1]
    },
    {
      regex: /^Стаж:?\s*(\d+)\s*лет?$/,
      replace: (match) => match[1] + ' years of experience'
    },
    {
      // Цены: "от 4 500 руб.", "до 50 000 руб.", "500 руб.", "4 500 руб."
      regex: /^(?:(от|до)\s+)?([\d\s]+)\s*руб\.?$/i,
      replace: (match) => {
        const prefix = match[1] ? (match[1].toLowerCase() === 'от' ? 'from ' : 'up to ') : '';
        return prefix + match[2].trim() + ' RUB';
      }
    },
    {
      regex: /^до\s*(\d+)%$/,
      replace: (match) => 'up to ' + match[1] + '%'
    },
    {
      regex: /^Скидка\s*(\d+)%$/,
      replace: (match) => match[1] + '% Off'
    },
    {
      // Дни и часы приема: "Пн 09:00–15:00", "Ср 10:00–16:00"
      regex: /^(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s*(\d{2}:\d{2}\s*[–—-]\s*\d{2}:\d{2})$/,
      replace: (match) => {
        const dayMap = {
          'Пн': 'Mon', 'Вт': 'Tue', 'Ср': 'Wed', 'Чт': 'Thu',
          'Пт': 'Fri', 'Сб': 'Sat', 'Вс': 'Sun'
        };
        return (dayMap[match[1]] || match[1]) + ' ' + match[2];
      }
    }
  ];

  // Определяем язык при инициализации
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const hashLang = window.location.hash === '#en' ? 'en' : (window.location.hash === '#ru' ? 'ru' : null);
  const savedLang = localStorage.getItem(STORAGE_KEY);
  let currentLang = (urlLang === 'en' || hashLang === 'en' || savedLang === 'en') ? 'en' : 'ru';

  // Применяем язык
  applyLanguage(currentLang);

  // Слушатель кликов по кнопкам языка
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== currentLang) {
        currentLang = targetLang;
        try {
          localStorage.setItem(STORAGE_KEY, currentLang);
        } catch (err) {}
        applyLanguage(currentLang);
      }
    }
  });

  // Отслеживаем открытие модальных окон для динамического перевода
  const bookingModal = document.getElementById('booking-modal');
  if (bookingModal) {
    const observer = new MutationObserver(() => {
      if (bookingModal.classList.contains('active') && currentLang === 'en') {
        translateContainer(bookingModal);
      }
    });
    observer.observe(bookingModal, { attributes: true, attributeFilter: ['class'] });
  }

  const scheduleModal = document.getElementById('doctor-schedule-modal');
  if (scheduleModal) {
    const observer = new MutationObserver(() => {
      if (scheduleModal.classList.contains('active') && currentLang === 'en') {
        translateContainer(scheduleModal);
      }
    });
    observer.observe(scheduleModal, { attributes: true, attributeFilter: ['class'] });
  }

  // Слушатель перерендера графика врачей
  window.addEventListener('beshtau:render-schedule', () => {
    if (currentLang === 'en' && scheduleModal) {
      translateContainer(scheduleModal);
    }
  });

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    updateSwitcherButtons(lang);

    if (lang === 'en') {
      translateDOMToEnglish();
    } else {
      restoreDOMToRussian();
    }
  }

  function updateSwitcherButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function translateContainer(container) {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'iframe') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('.lang-switch, .lang-switch-mobile')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
      // Всегда берем оригинальный текст если он уже был сохранен ранее
      const rawText = node.__origText !== undefined ? node.__origText : node.nodeValue;
      const trimmed = rawText.trim();
      if (!trimmed) return;

      if (node.__origText === undefined) {
        node.__origText = rawText;
      }

      // Точное совпадение
      if (DICTIONARY[trimmed]) {
        const leading = rawText.match(/^\s*/)[0];
        const trailing = rawText.match(/\s*$/)[0];
        node.nodeValue = leading + DICTIONARY[trimmed] + trailing;
        return;
      }

      // Паттерны
      for (const pattern of DYNAMIC_PATTERNS) {
        const m = trimmed.match(pattern.regex);
        if (m) {
          const leading = rawText.match(/^\s*/)[0];
          const trailing = rawText.match(/\s*$/)[0];
          node.nodeValue = leading + pattern.replace(m) + trailing;
          return;
        }
      }
    });
  }

  function translateDOMToEnglish() {
    translateContainer(document.body);

    // Перевод placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      const orig = el.getAttribute('data-orig-ph') || el.getAttribute('placeholder');
      if (orig && DICTIONARY[orig.trim()]) {
        if (!el.hasAttribute('data-orig-ph')) {
          el.setAttribute('data-orig-ph', orig);
        }
        el.setAttribute('placeholder', DICTIONARY[orig.trim()]);
      }
    });

    // Перевод title и aria-label
    document.querySelectorAll('[title], [aria-label]').forEach(el => {
      const origTitle = el.getAttribute('data-orig-title') || el.getAttribute('title');
      if (origTitle && DICTIONARY[origTitle.trim()]) {
        if (!el.hasAttribute('data-orig-title')) {
          el.setAttribute('data-orig-title', origTitle);
        }
        el.setAttribute('title', DICTIONARY[origTitle.trim()]);
      }
      const origAria = el.getAttribute('data-orig-aria') || el.getAttribute('aria-label');
      if (origAria && DICTIONARY[origAria.trim()]) {
        if (!el.hasAttribute('data-orig-aria')) {
          el.setAttribute('data-orig-aria', origAria);
        }
        el.setAttribute('aria-label', DICTIONARY[origAria.trim()]);
      }
    });
  }

  function restoreDOMToRussian() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'iframe') {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest('.lang-switch, .lang-switch-mobile')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
      if (node.__origText !== undefined) {
        node.nodeValue = node.__origText;
      } else {
        const rawText = node.nodeValue;
        const trimmed = rawText.trim();
        if (trimmed && REVERSE_DICTIONARY[trimmed]) {
          const leading = rawText.match(/^\s*/)[0];
          const trailing = rawText.match(/\s*$/)[0];
          node.nodeValue = leading + REVERSE_DICTIONARY[trimmed] + trailing;
        }
      }
    });

    // Восстановление placeholders
    document.querySelectorAll('[data-orig-ph]').forEach(el => {
      el.setAttribute('placeholder', el.getAttribute('data-orig-ph'));
      el.removeAttribute('data-orig-ph');
    });

    // Восстановление title и aria-label
    document.querySelectorAll('[data-orig-title]').forEach(el => {
      el.setAttribute('title', el.getAttribute('data-orig-title'));
      el.removeAttribute('data-orig-title');
    });
    document.querySelectorAll('[data-orig-aria]').forEach(el => {
      el.setAttribute('aria-label', el.getAttribute('data-orig-aria'));
      el.removeAttribute('data-orig-aria');
    });
  }
}
