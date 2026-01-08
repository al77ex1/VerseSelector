import PropTypes from 'prop-types';
import { 
  useAccordionItem, 
  useAccordionItemEffect,
  useHeightTransition
} from '@szhsin/react-accordion';
import './accordion.scss';

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

export default AccordionItem;
