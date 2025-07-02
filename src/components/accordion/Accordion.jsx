import PropTypes from 'prop-types';
import { 
  useAccordion, 
  useAccordionProvider, 
  AccordionProvider,
  useAccordionItem, 
  useAccordionItemEffect,
  useHeightTransition
} from '@szhsin/react-accordion';
import ClearButton from '../common/ClearButton';
import './accordion.css';
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
      // Проверяем, что нажаны клавиши Ctrl+Shift
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
          case 'з':
            // Активируем Предпросмотр
            if (previewButtonRef.current) {
              previewButtonRef.current.click();
              event.preventDefault();
            }
            break;
          case 'f':
          case 'а':
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
          case 'h':
          case 'р':
            // Активируем Историю
            if (historyButtonRef.current) {
              historyButtonRef.current.click();
              event.preventDefault();
            }
            break;
          default:
            break;
        }
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

/**
 * AccordionItem component for individual accordion sections
 */
const AccordionItem = ({ header, children, itemKey, initialEntered, disabled, headerAction, className, buttonRef }) => {
  // Используем хук для управления состоянием элемента аккордеона
  const { itemRef, state, toggle } = useAccordionItemEffect({
    itemKey,
    initialEntered,
    disabled
  });

  // Создаем кастомную функцию переключения, которая не закрывает активный элемент
  const customToggle = () => {
    if (!state.isEnter) {
      toggle();
      
      // Если это секция поиска, фокусируемся на поле ввода после раскрытия
      if (itemKey === 'search') {
        setTimeout(() => {
          const searchInput = document.querySelector('.search-input');
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
    }
  };

  // Получаем пропсы для кнопки и панели
  const { buttonProps, panelProps } = useAccordionItem({
    state,
    toggle: customToggle,
    disabled
  });

  // Используем хук для анимации высоты
  const [transitionStyle, panelRef] = useHeightTransition(state);
  
  // Получаем различные состояния из state
  const { status, isMounted, isEnter } = state;

  return (
    <div className={`accordion-section ${className || ''} ${isEnter ? 'expanded' : ''}`} ref={itemRef}>
      <div 
        className={`accordion-header ${isEnter ? 'active' : ''}`}
      >
        <button
          className="accordion-title"
          type="button"
          ref={buttonRef}
          {...buttonProps}
        >
          <h3>{header}</h3>
        </button>
        {headerAction && (
          <div className="accordion-header-action">
            {headerAction}
          </div>
        )}
      </div>
      
      {isMounted && (
        <div 
          className={`accordion-content ${isEnter ? 'active' : ''}`}
          style={{ 
            display: status === 'exited' ? 'none' : undefined,
            ...transitionStyle,
            flex: isEnter ? '1 1 auto' : '0 0 auto'
          }}
        >
          <div 
            className="accordion-body"
            ref={panelRef}
            {...panelProps}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Prop types validation
Accordion.propTypes = {
  previewPanel: PropTypes.node.isRequired,
  historyPanel: PropTypes.node.isRequired,
  searchPanel: PropTypes.node.isRequired,
  onClearHistory: PropTypes.func
};

AccordionItem.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialEntered: PropTypes.bool,
  disabled: PropTypes.bool,
  headerAction: PropTypes.node,
  className: PropTypes.string,
  buttonRef: PropTypes.object
};

export default Accordion;
