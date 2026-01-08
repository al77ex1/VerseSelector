import PropTypes from 'prop-types';
import { 
  useAccordion, 
  useAccordionProvider, 
  AccordionProvider
} from '@szhsin/react-accordion';
import AccordionItem from './AccordionItem';
import ClearButton from '../common/ClearButton';
import './accordion.scss';
import { useEffect, useRef } from 'react';

/**
 * Accordion component that toggles between two panels using react-accordion
 */
const Accordion = ({ previewPanel, historyPanel, searchPanel, onClearHistory }) => {
  // Используем хук для создания провайдера аккордеона
  const providerValue = useAccordionProvider({
    transition: true,
    transitionTimeout: 250
  });

  // Получаем пропсы для аккордеона
  const { accordionProps } = useAccordion();
  
  // Refs для кнопок аккордеона
  const previewButtonRef = useRef(null);
  const searchButtonRef = useRef(null);
  const historyButtonRef = useRef(null);
  
  // Обработчик клавиатурных сочетаний
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Используем функциональные клавиши F8, F9, F10
      switch (event.key) {
        case 'F8':
          // Активируем Предпросмотр
          if (previewButtonRef.current) {
            previewButtonRef.current.click();
            event.preventDefault();
          }
          break;
        case 'F9':
          // Активируем Поиск и фокусируемся на поле ввода
          if (searchButtonRef.current) {
            searchButtonRef.current.click();
            event.preventDefault();
            
            // Даем немного времени для раскрытия аккордеона перед фокусировкой
            setTimeout(() => {
              // Находим поле ввода поиска и фокусируемся на нем
              const searchInput = document.querySelector('.search-input');
              if (searchInput) {
                searchInput.focus();
              }
            }, 100);
          }
          break;
        case 'F10':
          // Активируем Историю
          if (historyButtonRef.current) {
            historyButtonRef.current.click();
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    // Добавляем обработчик события
    document.addEventListener('keydown', handleKeyDown);

    // Удаляем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AccordionProvider value={providerValue}>
      <div className="accordion-container" {...accordionProps}>
        {/* Блок Предпросмотр всегда вверху */}
        <AccordionItem 
          header="Предпросмотр"
          itemKey="preview"
          initialEntered={true}
          className="preview-section"
          buttonRef={previewButtonRef}
        >
          {previewPanel}
        </AccordionItem>
        
        {/* Блок Поиск в середине */}
        <AccordionItem 
          header="Поиск"
          itemKey="search"
          initialEntered={false}
          className="search-section"
          buttonRef={searchButtonRef}
        >
          {searchPanel}
        </AccordionItem>
        
        {/* Блок История всегда внизу */}
        <AccordionItem 
          header="История"
          itemKey="history"
          initialEntered={false}
          headerAction={onClearHistory ? <ClearButton onClick={onClearHistory} /> : null}
          className="history-section"
          buttonRef={historyButtonRef}
        >
          {historyPanel}
        </AccordionItem>
      </div>
    </AccordionProvider>
  );
};

// Prop types validation
Accordion.propTypes = {
  previewPanel: PropTypes.node.isRequired,
  historyPanel: PropTypes.node.isRequired,
  searchPanel: PropTypes.node.isRequired,
  onClearHistory: PropTypes.func
};

export default Accordion;
