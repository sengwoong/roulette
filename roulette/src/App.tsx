import React, { useState } from 'react';
import './App.css';
import Roulette from './components/Roulette';

interface PrizeItem {
  id: number;
  name: string;
  color: string;
  percentage: number;
}

const App: React.FC = () => {
  // 데이터와 가중치 (확률이 더 명확하게 보이도록 조정)
  const prizeData: PrizeItem[] = [
    { id: 1, name: 'Apple Vision Pro1', color: '#E7EFF3', percentage: 3 },
    { id: 2, name: 'LG TV2', color: '#ffffff', percentage: 7 },
    { id: 3, name: 'SAMSUNG 에어컨3', color: '#E7EFF3', percentage: 10 },
    { id: 4, name: '꽝4', color: '#ffffff', percentage: 20 },
    { id: 5, name: '꽝5', color: '#E7EFF3', percentage: 20 },
    { id: 6, name: '꽝6', color: '#ffffff', percentage: 20 },
    { id: 7, name: '꽝7', color: '#E7EFF3', percentage: 10 },
    { id: 8, name: '꽝8', color: '#ffffff', percentage: 10 },
  ];

  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpinEnd = (selected: number) => {
    console.log('selected', selected);
    setSelectedItem(selected);
    setShowResult(true);
  };

  return (
    <div className="wrap">
      <div className="contents">
        <h1>행운의 룰렛</h1>
        <Roulette prizeData={prizeData} onSpinEnd={handleSpinEnd} />
        
        {showResult && selectedItem !== null && (
          <div className="result-message">
            <span className="highlight">{prizeData[selectedItem].name}</span>이 당첨되었습니다!
          </div>
        )}
      </div>
    </div>
  );
};

export default App;