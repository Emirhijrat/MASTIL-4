import React, { useEffect, useState } from 'react';

interface MessageBoxProps {
  message: string | null;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  if (!message) return null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 bg-[var(--mastil-bg-secondary)] bg-opacity-80 backdrop-blur-md 
                 text-[var(--mastil-text-primary)] p-3 rounded-lg shadow-xl transition-all duration-300 
                 max-w-xs text-sm z-50 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {message}
    </div>
  );
};

export default MessageBox;