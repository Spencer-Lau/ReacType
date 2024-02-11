import React, { useState, useEffect } from 'react';
import ContentArea from '../components/left/ContentArea';
import Sidebar from '../components/left/Sidebar';

const App = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = (state: boolean) => {
    setIsVisible(state);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleVisibility={toggleVisibility}
      />
      <ContentArea activeTab={activeTab} isVisible={isVisible} />
    </div>
  );
};

export default App;
