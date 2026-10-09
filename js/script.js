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
      const context = targetDoctor || targetService || '';
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
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", shift: "Утренняя смена", badgeClass: "shift-morning", active: true },
      { day: "Вт", dayFull: "Вторник", time: "10:00 – 16:00", shift: "Операционный день", badgeClass: "shift-morning", active: true },
      { day: "Ср", dayFull: "Среда", time: "14:00 – 20:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", shift: "Утренняя смена", badgeClass: "shift-morning", active: true },
      { day: "Пт", dayFull: "Пятница", time: "14:00 – 20:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Сб", dayFull: "Суббота", time: "09:00 – 15:00", shift: "Дневная смена", badgeClass: "shift-morning", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 18:00", shift: "Прием по записи", badgeClass: "shift-full", active: true }
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
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", shift: "Ортопедический прием", badgeClass: "shift-morning", active: true },
      { day: "Вт", dayFull: "Вторник", time: "14:00 – 20:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Ср", dayFull: "Среда", time: "10:00 – 16:00", shift: "Лабораторный прием", badgeClass: "shift-morning", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", shift: "Ортопедический прием", badgeClass: "shift-morning", active: true },
      { day: "Пт", dayFull: "Пятница", time: "14:00 – 20:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 18:00", shift: "Полная смена", badgeClass: "shift-full", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 17:00", shift: "Прием по записи", badgeClass: "shift-full", active: true }
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
      { day: "Пн", dayFull: "Понедельник", time: "09:00 – 15:00", shift: "Детский прием", badgeClass: "shift-morning", active: true },
      { day: "Вт", dayFull: "Вторник", time: "13:00 – 19:00", shift: "Пародонтология", badgeClass: "shift-evening", active: true },
      { day: "Ср", dayFull: "Среда", time: "09:00 – 15:00", shift: "Детский прием", badgeClass: "shift-morning", active: true },
      { day: "Чт", dayFull: "Четверг", time: "13:00 – 19:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Пт", dayFull: "Пятница", time: "09:00 – 15:00", shift: "Терапевтический прием", badgeClass: "shift-morning", active: true },
      { day: "Сб", dayFull: "Суббота", time: "09:00 – 16:00", shift: "Детский день", badgeClass: "shift-morning", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 16:00", shift: "Прием по записи", badgeClass: "shift-full", active: true }
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
      { day: "Пн", dayFull: "Понедельник", time: "14:00 – 20:00", shift: "Вечерняя смена", badgeClass: "shift-evening", active: true },
      { day: "Вт", dayFull: "Вторник", time: "09:00 – 15:00", shift: "Утренняя смена", badgeClass: "shift-morning", active: true },
      { day: "Ср", dayFull: "Среда", time: "14:00 – 20:00", shift: "Лечение под микроскопом", badgeClass: "shift-evening", active: true },
      { day: "Чт", dayFull: "Четверг", time: "09:00 – 15:00", shift: "Эндодонтический прием", badgeClass: "shift-morning", active: true },
      { day: "Пт", dayFull: "Пятница", time: "09:00 – 15:00", shift: "Эндодонтия и реставрация", badgeClass: "shift-morning", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 17:00", shift: "Терапевтический прием", badgeClass: "shift-full", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "10:00 – 18:00", shift: "Прием по записи", badgeClass: "shift-full", active: true }
    ]
  },
  avetikova: {
    id: "avetikova",
    name: "Аветикова Анна Геннадьевна",
    shortName: "Аветикова А.Г.",
    specialty: "Стоматолог-ортодонт, детский ортодонт",
    exp: "Стаж 8 лет",
    photo: "",
    cabinet: "Кабинет № 2 (Ортодонтическое отделение)",
    desc: "Исправление прикуса современными брекет-системами Damon, лечение элайнерами, ранняя ортодонтия у детей.",
    days: [
      { day: "Пн", dayFull: "Понедельник", time: "10:00 – 17:00", shift: "Ортодонтический прием", badgeClass: "shift-morning", active: true },
      { day: "Вт", dayFull: "Вторник", time: "10:00 – 19:00", shift: "Брекеты и элайнеры", badgeClass: "shift-evening", active: true },
      { day: "Ср", dayFull: "Среда", time: "10:00 – 16:00", shift: "Ортодонтическая коррекция", badgeClass: "shift-morning", active: true },
      { day: "Чт", dayFull: "Четверг", time: "11:00 – 18:00", shift: "Прием пациентов", badgeClass: "shift-morning", active: true },
      { day: "Пт", dayFull: "Пятница", time: "11:00 – 19:00", shift: "Ортодонтия и диагностика", badgeClass: "shift-evening", active: true },
      { day: "Сб", dayFull: "Суббота", time: "10:00 – 18:00", shift: "Прием детей и взрослых", badgeClass: "shift-full", active: true },
      { day: "Вс", dayFull: "Воскресенье", time: "11:00 – 17:00", shift: "Консультации по записи", badgeClass: "shift-full", active: true }
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
          <td style="width: 140px;">
            <div class="schedule-day-label">
              <span class="day-circle ${item.active ? 'active' : ''}">${item.day}</span>
              <span>${item.dayFull}</span>
              ${isToday ? '<span class="schedule-today-badge">Сегодня</span>' : ''}
            </div>
          </td>
          <td>
            <span class="schedule-time-val">${item.time}</span>
          </td>
          <td style="width: 180px; text-align: right;">
            <span class="schedule-badge-status ${item.badgeClass}">${item.shift}</span>
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
            <th style="text-align: right;">Смена / Формат приема</th>
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

  // Кнопка записи из окна расписания
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
}

