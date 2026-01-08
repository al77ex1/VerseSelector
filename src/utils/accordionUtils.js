/**
 * Открывает вкладку предпросмотра и устанавливает фокус на содержимое
 */
export const openPreviewTab = () => {
  const previewButton = document.querySelector('.preview-section .accordion-title');
  if (previewButton) {
    previewButton.click();
    
    // Устанавливаем фокус на контейнер стихов после открытия вкладки
    setTimeout(() => {
      const previewChapter = document.querySelector('.preview-chapter');
      if (previewChapter) {
        previewChapter.focus();
      }
    }, 300);
  }
};
