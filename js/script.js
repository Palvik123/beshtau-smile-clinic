/*
 * Главный JavaScript файл для сайта стоматологической клиники.
 *
 * Здесь реализованы функции для работы мобильного меню,
 * а также базовая обработка формы связи. При желании эти
 * функции можно расширять и подключать дополнительные библиотеки.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Переключение мобильного меню
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('header');

  if (menuToggle && header) {
    menuToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });
  }

  // Обработка формы контакта/записи на приём
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Сбор данных формы
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // В реальном проекте здесь можно отправить данные на сервер
      // через fetch/AJAX. Пока просто выводим сообщение об успешной отправке.
      alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
      contactForm.reset();
    });
  }
});
