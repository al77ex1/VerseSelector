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
import '../components.css';

/**
 * Accordion component that toggles between two panels using react-accordion
 */
const Accordion = ({ previewPanel, historyPanel, onClearHistory }) => {
  // Используем хук для создания провайдера аккордеона
  const providerValue = useAccordionProvider({
    transition: true,
    transitionTimeout: 250
  });

  // Получаем пропсы для аккордеона
  const { accordionProps } = useAccordion();

  return (
    <AccordionProvider value={providerValue}>
      <div className="accordion-container" {...accordionProps}>
        {/* Блок Предпросмотр всегда вверху */}
        <AccordionItem 
          header="Предпросмотр"
          itemKey="preview"
          initialEntered={true}
        >
          {previewPanel}
        </AccordionItem>
        
        {/* Блок История всегда внизу */}
        <AccordionItem 
          header="История"
          itemKey="history"
          initialEntered={false}
          headerAction={onClearHistory ? <ClearButton onClick={onClearHistory} /> : null}
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
const AccordionItem = ({ header, children, itemKey, initialEntered, disabled, headerAction }) => {
  // Используем хук для управления состоянием элемента аккордеона
  const { itemRef, state, toggle } = useAccordionItemEffect({
    itemKey,
    initialEntered,
    disabled
  });

  // Получаем пропсы для кнопки и панели
  const { buttonProps, panelProps } = useAccordionItem({
    state,
    toggle,
    disabled
  });

  // Используем хук для анимации высоты
  const [transitionStyle, panelRef] = useHeightTransition(state);
  
  // Получаем различные состояния из state
  const { status, isMounted, isEnter } = state;

  return (
    <div className="accordion-section" ref={itemRef}>
      <div 
        className={`accordion-header ${isEnter ? 'active' : ''}`}
      >
        <button
          className="accordion-title"
          type="button"
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
          className="accordion-content"
          style={{ 
            display: status === 'exited' ? 'none' : undefined,
            ...transitionStyle 
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
  onClearHistory: PropTypes.func
};

AccordionItem.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  itemKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialEntered: PropTypes.bool,
  disabled: PropTypes.bool,
  headerAction: PropTypes.node
};

export default Accordion;
