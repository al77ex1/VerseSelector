import React, { useState } from 'react';
import { EyeSlashIcon, EyeIcon, FilmIcon, SwatchIcon, MoonIcon, ComputerDesktopIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  sendNextSlide,
  sendPreviousSlide,
  sendShowPresentation,
  sendShowTheme,
  sendShowBlank,
  sendShowDesktop,
} from '../../api';
import './live.scss';

const TVScreenButtons = ({ onScreenToggle }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [showEyeIcon, setShowEyeIcon] = useState(false);

  const handleButtonClick = (buttonName) => {
    if (buttonName === 'eyeSlash') {
      setShowEyeIcon(true);
      // Скрываем экран
      onScreenToggle(false);
    } else if (buttonName === 'eye') {
      setShowEyeIcon(false);
      // Показываем экран
      onScreenToggle(true);
    } else {
      setActiveButton(buttonName);
    }
  };

  return (
    <div className="buttons">
      <span className="tv-label">Screen:</span>
      
      {/* Условный рендеринг EyeSlashIcon и EyeIcon */}
      {!showEyeIcon ? (
        <EyeSlashIcon 
          className="button"
          onClick={() => handleButtonClick('eyeSlash')}
        />
      ) : (
        <EyeIcon 
          className="button active" // EyeIcon всегда активна если showEyeIcon=true
          onClick={() => handleButtonClick('eye')}
        />
      )}
      
      <FilmIcon 
        className={`button ${activeButton === 'film' ? 'active' : ''}`}
        onClick={async () => {
          await handleButtonClick('film');
          await sendShowPresentation();
        }}
      />
      <SwatchIcon 
        className={`button ${activeButton === 'swatch' ? 'active' : ''}`}
        onClick={async () => {
          await handleButtonClick('swatch');
          await sendShowTheme();
        }}
      />
      <MoonIcon 
        className={`button ${activeButton === 'moon' ? 'active' : ''}`}
        onClick={async () => {
          await handleButtonClick('moon');
          await sendShowBlank();
        }}
      />
      <ComputerDesktopIcon 
        className={`button ${activeButton === 'computer' ? 'active' : ''}`}
        onClick={async () => {
          await handleButtonClick('computer');
          await sendShowDesktop();
        }}
      />
      <ChevronLeftIcon 
        className="button" 
        onClick={async () => {
          await sendPreviousSlide();
        }}
      />
      <ChevronRightIcon 
        className="button" 
        onClick={async () => {
          await sendNextSlide();
        }}
      />
    </div>
  );
};

export default TVScreenButtons;
