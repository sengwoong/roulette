import React, { useState, useEffect, useRef } from 'react';

interface PrizeItem {
  id: number;
  name: string;
  color: string;
  percentage: number;
}

interface RouletteProps {
  prizeData: PrizeItem[];
  onSpinEnd: (selectedItem: number) => void;
}

const Roulette: React.FC<RouletteProps> = ({ prizeData, onSpinEnd }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotate, setRotate] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rouletteRef = useRef<HTMLDivElement>(null);

  // 가중치에 따른 각도 계산 함수
  const calculateAngles = () => {
    // ID 순서대로 정렬
    const sortedPrizeData = [...prizeData].sort((a, b) => a.id - b.id);
    const totalPercentage = sortedPrizeData.reduce((sum, item) => sum + item.percentage, 0);
    let startAngle = 270; // 상단은 270도로 시작 (양수로 변환)
    
    return sortedPrizeData.map(item => {
      const angle = (item.percentage / totalPercentage) * 360;
      const endAngle = (startAngle + angle) % 360; // 360도를 넘어가면 0부터 다시 시작
      // 중앙 각도 추가
      const midAngle = (startAngle + angle / 2) % 360;
      
      const result = {
        startAngle,
        endAngle,
        midAngle,
        angle,
        id: item.id,
        name: item.name
      };
      startAngle = endAngle;
      return result;
    });
  };

  // 캔버스에 룰렛 그리기
  const drawRoulette = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 설정
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    // 배경 지우기
    ctx.clearRect(0, 0, size, size);
    
    // 각도 계산 (ID 순서대로 정렬된 데이터 사용)
    const angles = calculateAngles();
    
    // 각 섹션 그리기 (시계 방향으로)
    angles.forEach((angle, index) => {
      // 각도를 라디안으로 변환
      const startRadian = (angle.startAngle * Math.PI) / 180;
      const endRadian = (angle.endAngle * Math.PI) / 180;
      
      // 섹션 그리기
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startRadian, endRadian, false);
      ctx.closePath();
      
      // ID로 원래 데이터 찾기
      const originalItem = prizeData.find(item => item.id === angle.id);
      if (!originalItem) return;
      
      ctx.fillStyle = originalItem.color;
      ctx.fill();
      ctx.strokeStyle = '#B1C8DE';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 텍스트 그리기
      // 중앙 각도를 라디안으로 변환
      const midRadian = (angle.midAngle * Math.PI) / 180;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(midRadian) * textRadius;
      const textY = centerY + Math.sin(midRadian) * textRadius;
      
      ctx.save();
      ctx.translate(textX, textY);
      
      // 텍스트 회전 조정 - 항상 바깥쪽을 향하도록
      let textRotation = midRadian;
   
      ctx.rotate(textRotation + Math.PI / 2);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Pretendard, Apple SD Gothic Neo, sans-serif';
      
      // 텍스트가 거꾸로 있으면 반전
      if (angle.midAngle > 90 && angle.midAngle < 270) {
        ctx.fillText(originalItem.name, 0, 0);
        // 디버깅용: 항목 ID 표시
        ctx.fillText(`(ID:${originalItem.id})`, 0, 15);
      } else {
        ctx.fillText(originalItem.name, 0, 0);
        // 디버깅용: 항목 ID 표시
        ctx.fillText(`(ID:${originalItem.id})`, 0, 15);
      }
      
      ctx.restore();
    });
    
    // 중앙 원 그리기
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#B1C8DE';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 중앙에 "도전" 텍스트 추가
    ctx.fillStyle = '#0080F1';
    ctx.font = 'bold 16px Pretendard, Apple SD Gothic Neo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('도전', centerX, centerY);
  };

  // 컴포넌트 마운트 시 및 크기 변경 시 캔버스 그리기
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && rouletteRef.current) {
        const size = rouletteRef.current.clientWidth;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        drawRoulette();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // prizeData가 변경될 때 룰렛 다시 그리기
  useEffect(() => {
    drawRoulette();
  }, [prizeData]);

  const handleClick = () => {
    if (!spinning) {
      // 회전 시작
      setSpinning(true);
      
      // 당첨 항목 선택 (가중치에 따라)
      const totalPercentage = prizeData.reduce((sum, item) => sum + item.percentage, 0);
      const randomValue = Math.random() * totalPercentage;
      
      let accumulatedPercentage = 0;
      let selectedItem = prizeData[0];
      
      for (let i = 0; i < prizeData.length; i++) {
        accumulatedPercentage += prizeData[i].percentage;
        if (randomValue <= accumulatedPercentage) {
          selectedItem = prizeData[i];
          break;
        }
      }
      
      console.log('선택된 항목:', selectedItem.name, 'ID:', selectedItem.id);
      
      // 각도 계산
      const angles = calculateAngles();
      
      // ID로 선택된 항목의 각도 찾기
      const selectedAngle = angles.find(angle => angle.id === selectedItem.id);
      if (!selectedAngle) return;
      
      // 선택된 항목의 중앙 각도
      const targetAngle = selectedAngle.midAngle;
      console.log('angles', angles);
      console.log('selectedAngle', selectedAngle);
      console.log('targetAngle', targetAngle);
      
      // 회전 각도 계산 - CSS transform rotate 속성에 맞게 계산
      // 화살표(상단, 270도)에 선택된 항목이 오도록 회전
      const rotationRequired = 270 - targetAngle;
      console.log('rotationRequired', rotationRequired);
      
      // 회전 수 설정
      const turns = 5;
      const totalRotation = turns * 360 + rotationRequired;
      
      console.log('선택된 항목:', selectedItem);
      console.log('선택된 항목 중앙 각도:', targetAngle);
      console.log('최종 회전 각도:', totalRotation);
      
      // 약간의 지연 후 회전 시작
      setTimeout(() => {
        setRotate(totalRotation);
      }, 10);
      
      // 회전 종료 후 처리
      setTimeout(() => {
        setSpinning(false);
        setRotate(0);
        onSpinEnd(prizeData.findIndex(item => item.id === selectedItem.id));
      }, 7000);
    }
  };

  return (
    <div className="rouletteContainer">
      <div className="rouletteOuter">
        <div 
          ref={rouletteRef}
          className={`roulette ${spinning ? 'on' : ''}`} 
          style={{ 
            transform: `rotate(${rotate}deg)`,
            transition: spinning ? 'transform 5s cubic-bezier(0.2, 0, 0.1, 1)' : 'none'
          } as React.CSSProperties}
        >
          <canvas ref={canvasRef} className="roulette-canvas"></canvas>
        </div>
        <div className="roulettePin"></div>
        <div className="centerButtonContainer">
          <button
            className="rouletteBtn"
            onClick={handleClick}
            disabled={spinning}
          >
            <p>도전</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roulette; 