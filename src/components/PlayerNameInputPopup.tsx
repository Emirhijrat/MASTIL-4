import React, { useState, ChangeEvent } from 'react';
import { ElementType, ELEMENTS } from '../types/gameTypes';
import './PlayerNameInputPopup.css';

interface PlayerNameInputPopupProps {
  onSubmit: (name: string, element: ElementType) => void;
}

const PlayerNameInputPopup: React.FC<PlayerNameInputPopupProps> = ({ onSubmit }) => {
  console.log("PlayerNameInputPopup rendering.");
  
  const [playerName, setPlayerName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType>(ELEMENTS[0]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (playerName.trim() && selectedElement) {
      console.log('=== PLAYER INPUT SUBMIT ===');
      console.log('Name:', playerName.trim());
      console.log('Element:', selectedElement);
      console.log('About to call onSubmit from props with these values');
      
      try {
        onSubmit(playerName.trim(), selectedElement);
        console.log('onSubmit handler completed successfully');
      } catch (error) {
        console.error('Error in onSubmit handler:', error);
        throw error; // Re-throw to be caught by ErrorBoundary
      }
    } else {
      alert('Please enter your name and select an element.');
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  console.log('PlayerNameInputPopup state:', { playerName, selectedElement });

  return (
    <div className="popup-overlay">
      <div className="popup-container medieval-popup">
        <h2 className="popup-title">
          Wie lautet Euer Name, Majestät?
        </h2>
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Euer Name..."
              className="medieval-input"
              autoFocus
            />
          </div>
          <div className="element-selection">
            {ELEMENTS.map((element) => (
              <button
                key={element}
                type="button"
                className={`medieval-button element-button element-${element.toLowerCase()} ${
                  selectedElement === element ? 'selected' : ''
                }`}
                onClick={() => setSelectedElement(element)}
              >
                {element.charAt(0).toUpperCase() + element.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="medieval-button submit-button medieval-button-primary"
          >
            Bestätigen
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInputPopup;
