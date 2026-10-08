/**
 * Бештау Смайл Клиник — Основной клиентский скрипт
 * Версия: 2.0.0 (Medical UX & Compliance)
 * Запрет эмодзи, доступность по ГОСТ Р 52872, модальная запись
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBookingModal();
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
  const bookingBtns = document.querySelectorAll('[data-open-modal="booking"], .cta-booking-btn');

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

  bookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetDoctor = btn.getAttribute('data-doctor');
      const targetService = btn.getAttribute('data-service');
      const context = targetDoctor || targetService || '';
      openModal(context);
    });
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
