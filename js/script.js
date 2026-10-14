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
        const matchesSearch = !searchQuery || text.includes(searchQuery);

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
  "Бештау Смайл": "Beshtau Smile",
  "Стоматологическая клиника": "Dental Clinic",
  "г. Лермонтов, Солнечный проезд, 10, корп. 1": "Lermontov, Solnechny proezd 10, bldg. 1",
  "357340, Ставропольский край, г. Лермонтов, Солнечный проезд, д. 10, корп. 1, этаж 2": "357340, Stavropol Territory, Lermontov, Solnechny proezd 10, bldg. 1, 2nd floor",
  "Пн–Вс 09:00–20:00 (без выходных)": "Mon–Sun 09:00–20:00 (Every day)",
  "Пн–Вс 09:00–20:00": "Mon–Sun 09:00–20:00",
  "Пн — Вс: 09:00 — 20:00": "Mon — Sun: 09:00 — 20:00",
  "Без выходных": "Open 7 days a week",
  "Версия для слабовидящих": "Accessibility Mode",
  "Обычная версия": "Standard Version",
  "Главная": "Home",
  "Акции": "Special Offers",
  "Услуги": "Services",
  "Цены": "Prices",
  "О клинике": "About",
  "Пациентам": "Patients",
  "Галерея": "Gallery",
  "Контакты": "Contacts",
  "Записаться на прием": "Book an Appointment",
  "Записаться на консультацию": "Book a Consultation",
  "Записаться онлайн": "Book Online",
  "Записаться по акции": "Book with Special Offer",
  "Записаться всей семьей": "Book for Whole Family",
  "Записаться к этому врачу": "Book with This Doctor",
  "Записаться через онлайн-форму": "Book via Online Form",
  "График приема врача": "Doctor Schedule",
  "График приема": "Doctor Schedule",
  "Подробнее о враче": "Doctor Profile",
  "Подробнее": "Learn More",
  "Подробнее →": "Learn More →",
  "Смотреть услуги": "View Services",
  "Смотреть прайс-лист": "View Price List",
  "Смотреть цены": "View Prices",
  "Перейти к полному прайс-листу": "Go to Full Price List",
  "Смотреть всю галерею": "View Full Gallery",
  "Смотреть всю галерею клиники": "View Full Clinic Gallery",
  "Открыть в Яндекс Картах": "Open in Yandex Maps",
  "Клиника на Яндекс.Картах": "Clinic on Yandex Maps",
  "Построить маршрут": "Get Directions",
  "Получить расчет": "Get Cost Estimate",
  "Ознакомиться с лицензией (PDF)": "View Medical License (PDF)",
  "Лицензия (PDF)": "License (PDF)",
  "Открыть лицензию в формате PDF": "Open License in PDF",
  "Политика конфиденциальности (152-ФЗ)": "Privacy Policy (152-FZ)",
  "Запись на прием к стоматологу": "Dental Appointment Booking",
  "Запись на прием:": "Appointment Booking:",
  "График приема:": "Doctor Schedule:",
  "Прием строго по времени": "Strictly by Appointment",
  "Без очередей и ожидания": "No queues, no waiting",
  "Команда экспертов": "Expert Medical Team",
  "Врачи всех ключевых направлений": "Doctors in all key specialties",
  "Гарантия и договор": "Warranty & Official Agreement",
  "Прозрачные цены без скрытых услуг": "Transparent prices with no hidden fees",
  "Нужна срочная консультация?": "Need an urgent consultation?",
  "Ежедневно с 09:00 до 20:00": "Daily from 09:00 to 20:00",
  "Онлайн-запись": "Online Booking",
  "Электронная запись на прием": "Online Appointment Request",
  "Заполните поля формы, и мы забронируем за вами удобный интервал приема": "Fill in the form fields, and our team will reserve a convenient time slot for you",
  "Информация": "Information",
  "Удобное расположение и график": "Convenient Location & Schedule",
  "Ждем вас в современной клинике с удобным подъездом и комфортной зоной ожидания.": "We look forward to welcoming you to our modern clinic with easy access and a comfortable waiting lounge.",
  "Бесплатная парковка": "Free Parking",
  "Удобная парковочная зона прямо перед входом": "Convenient parking right in front of the main entrance",
  "Быстро добраться из городов КМВ:": "Quick access from KMV resort cities:",
  "Пятигорск ~15 мин": "Pyatigorsk ~15 min",
  "Ессентуки ~20 мин": "Essentuki ~20 min",
  "Железноводск ~25 мин": "Zheleznovodsk ~25 min",
  "Минводы ~30 мин": "Mineralnye Vody ~30 min",
  "Лермонтов": "Lermontov",
  "Пятигорск (15 мин)": "Pyatigorsk (15 min)",
  "Ессентуки (20 мин)": "Essentuki (20 min)",
  "Железноводск (25 мин)": "Zheleznovodsk (25 min)",
  "Минводы (30 мин)": "Mineralnye Vody (30 min)",
  "Контактная информация": "Contact Information",
  "Адрес клиники": "Clinic Address",
  "Прямой телефон": "Direct Phone",
  "Электронная почта": "Email Address",
  "Номер регистратуры": "Reception Desk Phone",
  "Режим работы": "Working Hours",
  "Понедельник — Воскресенье: 09:00 – 20:00": "Monday — Sunday: 09:00 – 20:00",
  "Прием ежедневно, без выходных": "Open daily, including weekends",
  "Комфортный прием без ожидания": "Comfortable Visit Without Waiting",
  "Запишитесь онлайн в удобное для вас время — администратор перезвонит в течение 15 минут.": "Book online at your preferred time — our receptionist will call back within 15 minutes.",
  "Прием по времени": "On-Time Appointment",
  "Солнечный проезд, 10к1": "Solnechny proezd 10/1",
  "Если форма не отображается, нажмите здесь для открытия в новой вкладке": "If the form does not display, click here to open in a new tab",
  "Современный медицинский центр эстетической и функциональной стоматологии. Комплексный подход к здоровью улыбки для взрослых и детей.": "Modern center of aesthetic and functional dentistry. Comprehensive smile care for adults and children.",
  "Лицензия на осуществление медицинской деятельности выдана Министерством здравоохранения Ставропольского края.": "Medical license issued by the Ministry of Health of the Stavropol Territory.",
  "ООО «Бештау Смайл Клиник» • ИНН 2629013921 • ОГРН 1252600006460": "LLC Beshtau Smile Clinic • INN 2629013921 • OGRN 1252600006460",
  "Навигация": "Navigation",
  "Услуги клиники": "Clinic Services",
  "Врачи и руководство": "Doctors & Management",
  "Информация пациентам": "Patient Information",
  "Галерея клиники": "Clinic Gallery",
  "Корпоративным клиентам": "Corporate Clients",
  "Правовая информация": "Legal Information",
  "Контакты и схема проезда": "Contacts & Location Map",
  "Телефон:": "Phone:",
  "Email: beshtausmail@yandex.ru": "Email: beshtausmail@yandex.ru",
  "Режим работы: Пн–Вс 09:00–20:00, без выходных": "Hours: Mon–Sun 09:00–20:00, no days off",
  "© 2026 ООО «Бештау Смайл Клиник». Все права защищены.": "© 2026 LLC Beshtau Smile Clinic. All rights reserved.",
  "Премиальная стоматология в Лермонтове": "Premium Dentistry in Lermontov",
  "Здоровье и эстетика вашей улыбки на экспертном уровне": "Health and Aesthetics of Your Smile at an Expert Level",
  "Стоматология экспертного уровня в Лермонтове и на КМВ": "Expert-Level Dentistry in Lermontov and KMV Region",
  "Комплексное восстановление улыбки: цифровая диагностика, дентальная имплантация Osstem, исправление прикуса брекетами и бережное лечение без боли.": "Comprehensive smile restoration: digital diagnostics, Osstem dental implants, orthodontic correction with braces, and gentle pain-free treatment.",
  "Безупречная эстетика и бережное лечение": "Impeccable Aesthetics and Gentle Treatment",
  "Передовые технологии, бережное отношение к пациентам и честные цены без скрытых доплат.": "Advanced technologies, gentle patient care, and honest prices without hidden charges.",
  "Детская стоматология без боли и слез": "Pain-Free Pediatric Dentistry",
  "Дружелюбная атмосфера, адаптационный прием и современные обезболивающие методики для здоровья зубов вашего ребенка.": "Friendly atmosphere, gentle adaptation visits, and modern anesthesia for your child’s dental health.",
  "Наши услуги": "Our Services",
  "Записать ребенка": "Book for Child",
  "Специальные предложения": "Special Offers",
  "Акции и программы лояльности": "Special Offers & Loyalty Programs",
  "Выгодные условия на имплантацию, профессиональную гигиену и семейное лечение зубов в клинике Бештау Смайл.": "Great rates on dental implants, professional hygiene, and family dental packages at Beshtau Smile Clinic.",
  "Акция месяца": "Special of the Month",
  "Имплантация «под ключ» Osstem": "Turnkey Osstem Dental Implants",
  "Установка южнокорейского имплантата премиум-класса с пожизненной гарантией производителя по фиксированной стоимости.": "Placement of premium South Korean implant with manufacturer lifetime warranty at a fixed cost.",
  "Консультация хирурга и КТ-снимок включены": "Surgeon consultation and CT scan included",
  "Компьютерное 3D-планирование положения имплантата": "Computerized 3D implant position planning",
  "Атравматичная установка под эффективной анестезией": "Atraumatic placement under effective modern anesthesia",
  "Официальный паспорт изделия с серийным номером": "Official product passport with authentic serial number",
  "Спеццена за установку": "Special placement price",
  "от 33 000 руб.": "from 33,000 RUB",
  "Выгода до 20%": "Up to 20% Savings",
  "Комплексное восстановление": "Comprehensive Restoration",
  "Скидка до 20% на комплексную имплантацию зубов": "Up to 20% discount on comprehensive dental implants",
  "Специальные условия при установке нескольких имплантатов и комплексной реабилитации зубного ряда. Честная прозрачная смета без скрытых доплат.": "Special terms for multi-unit implant placement and full dental arch rehabilitation. Honest, transparent estimate.",
  "Консультация хирурга-имплантолога и персональный план лечения": "Implant surgeon consultation and personalized treatment plan",
  "Скидка увеличивается пропорционально объему вмешательства": "Discount increases proportionally with treatment volume",
  "Бесплатный контрольный осмотр после остеоинтеграции": "Free follow-up examination after osseointegration",
  "Экономия на плане лечения": "Treatment plan savings",
  "до 20%": "up to 20%",
  "Прайс-лист": "Price List",
  "Новые зубы за 1–3 дня": "New Teeth in 1–3 Days",
  "Полная адентия": "Full Arch Restoration",
  "Протезирование All-on-4 и All-on-6 под ключ": "Turnkey All-on-4 and All-on-6 Dental Implants",
  "Инновационное восстановление полного зубного ряда челюсти на 4 или 6 имплантатах с установкой несъемного адаптационного протеза в кратчайшие сроки.": "Innovative full-arch rehabilitation on 4 or 6 implants with fast fixed provisional prosthetics.",
  "Полный отказ от съемных протезов и клеящих гелей": "Complete freedom from removable dentures and messy adhesives",
  "Равномерное распределение жевательной нагрузки на костную ткань": "Uniform distribution of masticatory load across the jaw bone",
  "Естественная эстетика десневого контура и красивая улыбка": "Natural gum contour aesthetics and a beautiful smile",
  "Формат протокола": "Treatment Protocol",
  "Немедленная нагрузка": "Immediate Loading",
  "Здоровье эмали": "Enamel Health",
  "Терапевтическая стоматология": "Therapeutic Dentistry",
  "Лечение кариеса и эстетическая реставрация зубов": "Caries Treatment and Aesthetic Tooth Restoration",
  "Бережное лечение с сохранением здоровых тканей зуба. Использование японских и немецких нанокомпозитов, точно повторяющих естественную анатомию и оттенок.": "Gentle treatment preserving healthy tooth structure. Japanese and German nanocomposites matching natural anatomy and shade.",
  "Изоляция рабочего поля системой коффердам": "Rubber dam isolation for sterile, moisture-free field",
  "Точное воспроизведение бугров и фиссур для правильного прикуса": "Exact cusp and fissure reproduction for optimal occlusion",
  "Полировка до зеркального сухого блеска с долговечной защитой": "High-gloss mirror polishing with durable enamel protection",
  "Стоимость под ключ": "All-inclusive cost",
  "от 3 500 руб.": "from 3,500 RUB",
  "Эстетика и прочность": "Aesthetics and Strength",
  "Ортопедия CAD/CAM": "CAD/CAM Prosthodontics",
  "Безметалловые коронки из диоксида циркония": "All-Ceramic Zirconia Crowns",
  "Премиальная эстетика живого зуба и непревзойденная прочность. Идеальная биосовместимость без потемнения десны и риска аллергических реакций.": "Premium natural-tooth aesthetics and outstanding durability. Perfect biocompatibility without dark gum margins or allergies.",
  "Цифровое сканирование и CAD/CAM фрезерование с микронной точностью": "Digital intraoral scanning and CAD/CAM milling with micron precision",
  "Естественная светопроницаемость и подбор оттенка эмали": "Natural translucency and individualized enamel color matching",
  "Минимальное препарирование и максимальное сохранение зуба": "Minimal preparation and maximum preservation of healthy tooth tissue",
  "Материал конструкции": "Restoration Material",
  "Диоксид циркония": "Zirconium Dioxide",
  "Семейная программа": "Family Care Program",
  "Забота о близких": "Caring for Loved Ones",
  "Семейная стоматология: прием со скидкой 10%": "Family Dentistry: 10% Discount on Care",
  "Комплексное стоматологическое сопровождение родителей и детей в одной клинике. Удобная запись в один день и персональная скидка 10% на семейный план.": "Comprehensive dental care for parents and children under one roof. Same-day family appointments and 10% discount.",
  "Адаптационный безболезненный прием для детей любого возраста": "Adaptation, pain-free visits for children of all ages",
  "Профессиональная гигиена и профилактика для взрослых": "Professional hygiene and prevention for adult family members",
  "Прием 7 дней в неделю без очередей и стресса": "Open 7 days a week with zero waiting and zero stress",
  "Скидка на семейный прием": "Family visit discount",
  "10%": "10%",
  "Специализация клиники": "Clinical Specialties",
  "Комплексные направления стоматологии": "Comprehensive Dental Specialties",
  "Мы решаем клинические задачи любой сложности с использованием доказательных протоколов и сертифицированных биосовместимых материалов.": "We solve clinical cases of any complexity using evidence-based protocols and certified biocompatible materials.",
  "Направления лечения": "Clinical Specialties",
  "Комплексные стоматологические услуги": "Comprehensive Dental Services",
  "Полный спектр высокотехнологичной стоматологической помощи для взрослых и детей в Лермонтове.": "Full spectrum of high-tech dental care for adults and children in Lermontov.",
  "Терапия": "Therapy",
  "Высокоточная диагностика, лечение кариеса, пульпита и периодонтита под контролем оптики. Эстетическая реставрация зубов светоотверждаемыми композитами.": "High-precision diagnostics, treatment of caries, pulpitis and periodontitis under optical magnification. Aesthetic light-curing restorations.",
  "Лечение кариеса, пульпита и периодонтита под микроскопом с надежной световой полимеризацией.": "Microscopic treatment of caries, pulpitis and periodontitis with durable light curing.",
  "Стоимость лечения": "Treatment cost",
  "от 4 500 руб.": "from 4,500 RUB",
  "Хирургия": "Surgery",
  "Хирургия и имплантация": "Surgery & Implantation",
  "Атравматичное удаление зубов любой сложности, костная пластика, синус-лифтинг и установка современных имплантационных систем с приживаемостью 99%.": "Atraumatic tooth extractions, bone grafting, sinus lifts, and placement of modern implant systems with a 99% success rate.",
  "Удаление зуба": "Tooth extraction",
  "Ортопедия": "Prosthetics",
  "Ортопедия и протезирование": "Prosthodontics & Restorations",
  "Восстановление жевательной функции и эстетики улыбки: керамические виниры E.max, высокопрочные коронки из диоксида циркония и протезирование на имплантатах.": "Restoration of chewing function and smile aesthetics: E.max ceramic veneers, high-strength zirconia crowns, and implant prosthetics.",
  "Коронки из диоксида циркония, керамические виниры E.max, мостовидные и съемные протезы.": "Zirconium crowns, E.max ceramic veneers, dental bridges, and comfortable removable dentures.",
  "Коронка / винир": "Crown / Veneer",
  "от 13 000 руб.": "from 13,000 RUB",
  "Ортодонтия": "Orthodontics",
  "Ортодонтия и исправление прикуса": "Orthodontics & Bite Correction",
  "Коррекция зубочелюстных аномалий у детей и взрослых: металлические и сапфировые брекеты Damon, а также незаметные прозрачные элайнеры по 3D-модели.": "Correction of malocclusions in children and adults: Damon metal and sapphire braces, and invisible transparent aligners from 3D models.",
  "Исправление прикуса и выравнивание зубных рядов самолигирующими брекетами Damon и элайнерами.": "Bite alignment and arch correction using self-ligating Damon braces and transparent aligners.",
  "Консультация ортодонта": "Orthodontist Consultation",
  "1 000 руб.": "1,000 RUB",
  "Детское": "Pediatrics",
  "Детская стоматология": "Pediatric Dentistry",
  "Деликатный подход к маленьким пациентам, психологическая адаптация, лечение кариеса без бормашины по системе ICON, герметизация фиссур и профилактика.": "Delicate care for young patients, psychological adaptation, drill-free ICON caries treatment, fissure sealants, and prevention.",
  "Адаптационный прием, безболезненное лечение молочных и постоянных зубов, цветные пломбы и герметизация фиссур.": "Adaptation visits, painless primary and permanent tooth treatments, colorful fillings, and fissure sealing.",
  "Прием детского врача": "Pediatric visit",
  "от 1 000 руб.": "from 1,000 RUB",
  "Гигиена": "Hygiene",
  "Пародонтология и профгигиена": "Periodontics & Dental Hygiene",
  "Комплексная гигиена полости рта Air Flow, ультразвуковое удаление зубного камня, реминерализация эмали и терапия воспалительных процессов десен.": "Air Flow oral hygiene, ultrasonic tartar scaling, enamel remineralization, and targeted therapy for gum inflammation.",
  "Комплекс Air Flow": "Air Flow Package",
  "от 5 000 руб.": "from 5,000 RUB",
  "Цифровая рентген-диагностика": "Digital X-Ray & Diagnostics",
  "Прицельные цифровые радиовизиографы и конусно-лучевая томография с минимальной дозой облучения.": "Targeted digital radiovisiographs and cone beam CT scans with minimal radiation exposure.",
  "Подробнее об услугах": "Learn More About Services",
  "Врачебная коллегия": "Medical Board",
  "Ведущие доктора клиники": "Leading Clinic Doctors",
  "Сертифицированные врачи-стоматологи с непрерывным клиническим стажем от 8 до 16 лет. Регулярные участники российских и международных конференций.": "Certified dental specialists with continuous clinical experience of 8 to 16 years. Regular participants in national and international medical congresses.",
  "Команда специалистов": "Team of Specialists",
  "Врачи клиники Бештау Смайл": "Doctors of Beshtau Smile Clinic",
  "Опытные врачи-стоматологи высшей категории с непрерывной практикой от 8 до 16 лет.": "Experienced senior dental specialists with 8 to 16 years of continuous clinical practice.",
  "Стаж 14 лет": "14 years of experience",
  "Стоматолог-хирург, имплантолог": "Dental Surgeon, Implantologist",
  "Фатахов Анзор Сулейманович": "Dr. Anzor Fatahkhov",
  "Дентальная имплантация, сложное удаление зубов, синус-лифтинг и реконструктивная хирургия альвеолярного гребня.": "Dental implants, complex extractions, sinus lift, and alveolar ridge reconstructive surgery.",
  "Профиль": "Profile",
  "График": "Schedule",
  "Запись": "Book",
  "Стаж 16 лет": "16 years of experience",
  "Стоматолог-ортопед, имплантолог": "Prosthodontist, Implantologist",
  "Геворкян Арут Эдикович": "Dr. Arut Gevorkyan",
  "Тотальное протезирование, высокоточная безметалловая керамика E.max, циркониевые коронки, протезирование на имплантатах.": "Full-mouth rehabilitation, precision E.max all-ceramic restorations, zirconia crowns, and implant-supported prosthetics.",
  "Стаж 10 лет": "10 years of experience",
  "Детский стоматолог, пародонтолог": "Pediatric Dentist, Periodontist",
  "Бекишова Юлия Владимировна": "Dr. Yulia Bekisheva",
  "Адаптационный прием детей, лечение кариеса без сверления (ICON), профилактика и терапия воспалительных патологий пародонта.": "Child adaptation visits, drill-free ICON caries treatment, periodontal prevention and anti-inflammatory therapy.",
  "Стаж 11 лет": "11 years of experience",
  "Стоматолог-терапевт, эндодонтист": "Dental Therapist, Endodontist",
  "Королев Дмитрий Александрович": "Dr. Dmitry Korolev",
  "Микроскопическая эндодонтия, перелечивание труднопроходимых корневых каналов, художественная анатомическая реставрация зубов.": "Microscopic endodontics, retreatment of complex root canals, and anatomical artistic tooth restorations.",
  "Стаж 8 лет": "8 years of experience",
  "Стоматолог-ортодонт, детский ортодонт": "Orthodontist, Pediatric Orthodontist",
  "Стоматолог-ортодонт": "Orthodontist",
  "Аветикова Анна Геннадьевна": "Dr. Anna Avetikova",
  "Исправление прикуса современными брекет-системами Damon, лечение прозрачными элайнерами, ранняя ортодонтия у детей.": "Bite correction with modern Damon self-ligating braces, transparent aligners, and early interceptive orthodontics for children.",
  "Оснащение и комфорт": "Equipment & Comfort",
  "Наша клиника": "Our Clinic",
  "Просторные кабинеты, эргономичные лечебные установки и строгий инфекционный контроль обеспечивают максимальную безопасность каждого визита.": "Spacious treatment rooms, ergonomic dental units, and strict infection control ensure maximum safety during every visit.",
  "Входная группа и фасад": "Main Entrance & Facade",
  "Удобное расположение в Лермонтове с собственной парковкой.": "Convenient location in Lermontov with dedicated free parking.",
  "Зона ожидания и ресепшен": "Reception & Lounge Area",
  "Комфортная обстановка, внимательные администраторы и отсутствие очередей.": "Comfortable atmosphere, attentive receptionists, and no waiting lines.",
  "Лечебные кабинеты": "Treatment Rooms",
  "Оборудование экспертного класса и многоступенчатая стерилизация инструментов.": "Expert-class dental technology and multi-stage instrument sterilization.",
  "Фотогалерея клиники": "Clinic Photo Gallery",
  "Современное оснащение и стерильность": "Modern Technology & Sterility",
  "Кабинеты, стерилизационный блок и зона ожидания": "Treatment rooms, sterilization facility, and reception lounge",
  "Медицинский комплаенс": "Medical Compliance",
  "Официальная лицензированная деятельность": "Fully Licensed Healthcare Operations",
  "Клиника «Бештау Смайл Клиник» осуществляет медицинскую деятельность на основании бессрочной государственной лицензии, выданной Министерством здравоохранения Ставропольского края.": "Beshtau Smile Clinic operates under a permanent state medical license issued by the Ministry of Health of the Stavropol Territory.",
  "Все диагностические и лечебные протоколы строго соответствуют клиническим рекомендациям Стоматологической Ассоциации России (СтАР).": "All diagnostic and treatment protocols strictly comply with clinical guidelines of the Dental Association of Russia (DARS).",
  "Цены на стоматологические услуги — Бештау Смайл Клиник": "Dental Service Prices — Beshtau Smile Clinic",
  "Цены на стоматологические услуги": "Prices for Dental Services",
  "Актуальный официальный прайс-лист клиники Бештау Смайл в г. Лермонтов. 284 медицинские услуги без скрытых доплат.": "Official price list of Beshtau Smile Clinic in Lermontov. 284 dental services without hidden fees.",
  "Актуальный официальный прайс-лист стоматологии «Бештау Смайл Клиник» в г. Лермонтов. 284 медицинские услуги: лечение кариеса от 4500 руб., имплантация Osstem 30000 руб., коронки, брекеты, гигиена.": "Official price list of Beshtau Smile Clinic in Lermontov: caries treatment from 4,500 RUB, Osstem implants 30,000 RUB, crowns, braces, hygiene.",
  "Все": "All",
  "Детство": "Pediatrics",
  "Диагностика": "Diagnostics",
  "Имплантация": "Implants",
  "Код услуги": "Service Code",
  "Наименование медицинской услуги": "Medical Service Description",
  "Стоимость": "Price",
  "Поиск по названию услуги...": "Search by service description...",
  "День недели": "Day of Week",
  "Время приема": "Hours",
  "Кабинет": "Room",
  "Понедельник": "Monday",
  "Вторник": "Tuesday",
  "Среда": "Wednesday",
  "Четверг": "Thursday",
  "Пятница": "Friday",
  "Суббота": "Saturday",
  "Воскресенье": "Sunday",
  "Кабинет терапевта": "Therapy Room",
  "Кабинет хирурга": "Surgical Room",
  "Кабинет ортодонта": "Orthodontic Room",
  "Кабинет ортопеда": "Prosthetic Room",
  "Детский кабинет": "Pediatric Room",
  "Закрыть": "Close",
  "О враче": "About the Doctor",
  "Специализация и ключевые навыки": "Specialization & Key Skills",
  "Образование и повышение квалификации": "Education & Advanced Training",
  "Ведущий специалист клиники по направлению хирургической стоматологии и дентальной имплантации.": "Leading clinic specialist in surgical dentistry and dental implantation.",
  "Ведущий специалист клиники по направлению терапевтической стоматологии и эстетической реставрации.": "Leading clinic specialist in therapeutic dentistry and aesthetic restorations.",
  "Ведущий специалист клиники по детской стоматологии и профилактике заболеваний полости рта.": "Leading clinic specialist in pediatric dentistry and oral disease prevention.",
  "Специалист по исправлению прикуса и эстетической ортодонтии у детей и взрослых.": "Specialist in bite correction and aesthetic orthodontics for children and adults.",
  "Ведущий специалист клиники по ортопедической стоматологии и сложной дентальной имплантации.": "Leading clinic specialist in prosthodontic dentistry and complex dental implantation.",
  "Страница не найдена": "Page Not Found",
  "Запрашиваемая страница не существует или была перемещена": "The requested page does not exist or has been moved",
  "Перейти на главную": "Go to Home"
};

  // Создаем обратный словарь EN -> RU для точного восстановления
  const REVERSE_DICTIONARY = {};
  for (const [ru, en] of Object.entries(DICTIONARY)) {
    REVERSE_DICTIONARY[en] = ru;
  }

  // Динамические паттерны
  const DYNAMIC_PATTERNS = [
    {
      regex: /^Запись на прием:\s*(.+)$/,
      replace: (match) => 'Appointment Booking: ' + (DICTIONARY[match[1]] || match[1])
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
      regex: /^Стаж:\s*(\d+)\s*лет$/,
      replace: (match) => match[1] + ' years of experience'
    },
    {
      regex: /^Стаж\s*(\d+)\s*лет$/,
      replace: (match) => match[1] + ' years of experience'
    },
    {
      regex: /^от\s*([\d\s]+)\s*руб\.$/,
      replace: (match) => 'from ' + match[1] + ' RUB'
    },
    {
      regex: /^до\s*(\d+)%$/,
      replace: (match) => 'up to ' + match[1] + '%'
    },
    {
      regex: /^Скидка\s*(\d+)%$/,
      replace: (match) => match[1] + '% Off'
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
      const rawText = node.nodeValue;
      const trimmed = rawText.trim();
      if (!trimmed) return;

      // Точное совпадение
      if (DICTIONARY[trimmed]) {
        if (!node.parentElement.hasAttribute('data-orig-text')) {
          node.parentElement.setAttribute('data-orig-text', rawText);
        }
        const leading = rawText.match(/^\s*/)[0];
        const trailing = rawText.match(/\s*$/)[0];
        node.nodeValue = leading + DICTIONARY[trimmed] + trailing;
        return;
      }

      // Паттерны
      for (const pattern of DYNAMIC_PATTERNS) {
        const m = trimmed.match(pattern.regex);
        if (m) {
          if (!node.parentElement.hasAttribute('data-orig-text')) {
            node.parentElement.setAttribute('data-orig-text', rawText);
          }
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
      const ph = el.getAttribute('placeholder');
      if (ph && DICTIONARY[ph.trim()]) {
        if (!el.hasAttribute('data-orig-ph')) {
          el.setAttribute('data-orig-ph', ph);
        }
        el.setAttribute('placeholder', DICTIONARY[ph.trim()]);
      }
    });

    // Перевод title и aria-label
    document.querySelectorAll('[title], [aria-label]').forEach(el => {
      const title = el.getAttribute('title');
      if (title && DICTIONARY[title.trim()]) {
        if (!el.hasAttribute('data-orig-title')) {
          el.setAttribute('data-orig-title', title);
        }
        el.setAttribute('title', DICTIONARY[title.trim()]);
      }
      const aria = el.getAttribute('aria-label');
      if (aria && DICTIONARY[aria.trim()]) {
        if (!el.hasAttribute('data-orig-aria')) {
          el.setAttribute('data-orig-aria', aria);
        }
        el.setAttribute('aria-label', DICTIONARY[aria.trim()]);
      }
    });
  }

  function restoreDOMToRussian() {
    // 1. Восстановление сохраненных оригиналов
    document.querySelectorAll('[data-orig-text]').forEach(el => {
      const orig = el.getAttribute('data-orig-text');
      if (orig !== null) {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
          el.childNodes[0].nodeValue = orig;
        } else {
          el.textContent = orig;
        }
        el.removeAttribute('data-orig-text');
      }
    });

    // 2. Дополнительный проход по TreeWalker с обратным словарем
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
      const rawText = node.nodeValue;
      const trimmed = rawText.trim();
      if (!trimmed) return;

      if (REVERSE_DICTIONARY[trimmed]) {
        const leading = rawText.match(/^\s*/)[0];
        const trailing = rawText.match(/\s*$/)[0];
        node.nodeValue = leading + REVERSE_DICTIONARY[trimmed] + trailing;
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
