import React, { useEffect, useRef, useState } from 'react'
import './ZombieDefensePage.css'
import * as PIXI from 'pixi.js';
// 에셋 가져오기
import zombieImg from '../assets/img/ZombieMan/Walk.png'; // 좀비 이미지 경로
import backgroundImg from '../assets/img/BackGround/lv1.png'; // 배경 이미지 경로
import punch from '../assets/sound/punch.mp3'; // 사운드 경로
import { GameManager, MapType, MonsterType, RewardType } from '../components/zombie';

function ZombieDefensePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(100); // 공격 포인트 (시작값 100)
  const gameManagerRef = useRef<GameManager | null>(null);
  const zombieFramesRef = useRef<PIXI.Texture[]>([]);
  const [zombieCount, setZombieCount] = useState(0);
  const MAX_ZOMBIES = 3; // 최대 좀비 수
  const MIN_ZOMBIES = 1; // 최소 좀비 수
  const ZOMBIE_SPAWN_CHANCE = 0.2; // 좀비 생성 확률 (30%)

  // getScreenSize 함수를 컴포넌트 레벨로 이동
  const getScreenSize = () => {
    // 화면 크기에 따라 적절한 게임 크기 반환
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (isMobile) {
      return {
        width: Math.min(440, window.innerWidth * 0.95),
        height: Math.min(130, window.innerHeight * 0.7)
      };
    } else if (isTablet) {
      return {
        width: Math.min(600, window.innerWidth * 0.8),
        height: Math.min(260, window.innerHeight * 0.7)
      };
    } else {
      return {
        width: Math.min(800, window.innerWidth * 0.7),
        height: Math.min(300, window.innerHeight * 0.7)
      };
    }
  };

  // 좀비 공격 함수
  const attackZombie = (monsterId: number, damage: number = 10) => {
    // 포인트가 부족하면 공격 불가
    if (points < damage) {
      // 포인트 부족 경고 표시
      return;
    }
    
    const gameManager = gameManagerRef.current;
    if (!gameManager) return;

    // 포인트 차감 (함수형 업데이트 사용)
    setPoints(prevPoints => {
      const newPoints = prevPoints - damage;
      return Math.max(0, newPoints); // 0 미만으로 내려가지 않도록 보장
    });
    
    // 몬스터에게 데미지 적용
    const isKilled = gameManager.damageMonster(monsterId, damage);
    
    // 사운드 재생
    const sound = new Audio(punch);
    sound.play();
    
    // 몬스터가 죽으면 점수 추가하고 새 좀비 생성 여부 결정
    if (isKilled) {
      setScore(prev => prev + 50);
      setZombieCount(prev => {
        const newCount = prev - 1;
        console.log(newCount);
        // 확률에 따라 좀비 생성 결정 (좀비가 최대 수보다 적을 때만)
        if (newCount < MAX_ZOMBIES-1) {
          // 랜덤 확률로 좀비 생성
          if (Math.random() < ZOMBIE_SPAWN_CHANCE) {
            setTimeout(() => spawnZombie(), 1000 + Math.random() * 2000); // 1~3초 후 생성
          }
        }
        
        // 좀비가 최소 수보다 적으면 무조건 생성
        if (newCount < MIN_ZOMBIES) {
          setTimeout(() => spawnZombie(), 500); // 0.5초 후 생성
        }
        
        return newCount;
      });
    }
  };
  
  // 좀비 생성 함수
  const spawnZombie = () => {
    // 최대 좀비 수 체크
    if (zombieCount >= MAX_ZOMBIES) return;
    
    const gameManager = gameManagerRef.current;
    if (!gameManager || zombieFramesRef.current.length === 0) return;
    
    const frames = zombieFramesRef.current;
    
    // 위치와 속도를 약간 랜덤하게 설정하여 다양성 부여
    const x = -50 - Math.random() * 100; // 화면 왼쪽 바깥에서 시작
    const y = (Math.random() * 0.3 + 0.5) * appRef.current!.screen.height; // 화면 절반 아래에서 랜덤
    const speed = 0.1 + Math.random() * 0.3; // 0.8~1.3 사이 랜덤 속도
    
    const monsterId = gameManager.spawnCustomMonster(frames, {
      type: MonsterType.ZOMBIE,
      hp: 10,
      speed: speed,
      damage: 10,
      scoreValue: 50,
      frameSpeed: 0.1
    }, x, y);
    
    // 좀비 클릭 이벤트 설정
    gameManager.setMonsterClickHandler(monsterId, () => {
      attackZombie(monsterId);
    });
    
    // 좀비 카운트 증가
    setZombieCount(prev => prev + 1);
    
    return monsterId;
  };

  useEffect(() => {
    // PIXI 애플리케이션 초기화
    const initGame = async () => {
      try {
        // PIXI 애플리케이션 생성
        const app = new PIXI.Application();
        
        // PIXI 앱 초기화
        const { width, height } = getScreenSize();
        await app.init({
          backgroundAlpha: 1,
          backgroundColor: 0x000000,
          width: width,
          height: height
        });
        
        // DOM에 캔버스 추가
        if (canvasRef.current) {
          canvasRef.current.appendChild(app.canvas);
          appRef.current = app;
          
          // 리소스 로드
          PIXI.Assets.add({alias: 'zombie', src: zombieImg});
          PIXI.Assets.add({alias: 'background', src: backgroundImg});
          
          // 리소스 불러오기
          const resources = await PIXI.Assets.load(['zombie', 'background']);
          
          // 게임 매니저 생성
          const gameManager = new GameManager(
            app, 
            {
              width: app.screen.width,
              height: app.screen.height,
              difficulty: 1,
              monsterSpawnRate: 5, // 5초마다 몬스터 생성
              rewardSpawnRate: 10, // 10초마다 보상 생성
            },
            (newScore) => {
              setScore(newScore);
            }
          );
          
          gameManagerRef.current = gameManager;
          
          // 맵 설정
          await gameManager.setMap(
            {
              type: MapType.CITY,
              background: resources.background,
              scrollSpeed: 1
            },
            resources.background
          );
          
          // 좀비 스프라이트 생성
          const zombieTexture = resources.zombie;
          const frames = [];
          
          // 좀비 이미지의 프레임 크기 계산
          const frameWidth = zombieTexture.width / 8;
          const frameHeight = zombieTexture.height;
          
          // 스프라이트 시트에서 8개 프레임 추출
          for (let i = 0; i < 8; i++) {
            const frame = new PIXI.Texture({
              source: zombieTexture,
              frame: new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight)
            });
            frames.push(frame);
          }
          
          // 좀비 프레임 저장
          zombieFramesRef.current = frames;
          
          // 초기 좀비 생성 (1~2마리)
          const initialZombies = 1; // 일단 1마리만 생성하여 테스트
          for (let i = 0; i < initialZombies; i++) {
            spawnZombie();
          }
          
          // 애니메이션 루프
          app.ticker.add((delta) => {
            gameManager.update(delta);
          });
        }
        
      } catch (error) {
        console.error('게임 초기화 중 오류 발생:', error);
      }
    };
    

    
    // 창 크기 변경 이벤트 리스너
    const handleResize = () => {
      if (appRef.current) {
        const { width, height } = getScreenSize();
        appRef.current.renderer.resize(width, height);
        
        if (gameManagerRef.current) {
          gameManagerRef.current.resizeMap(width, height);
        }
      }
    };

    // 리사이즈 이벤트 등록
    window.addEventListener('resize', handleResize);

    // 정리 함수에 이벤트 리스너 제거 추가
    return () => {
       initGame();
    };
  }, []);

  // 포인트 보충 버튼 핸들러
  const refillPoints = () => {
    setPoints(100);
  };

  return (
    <div className="zombie-defense-container">
      <div className="zombie-header">
    
        <div className="score-board">
          <span>점수: {score}</span>
          <span className="points">포인트: {points}</span>
          <span className="zombies">좀비: {zombieCount}/{MAX_ZOMBIES}</span>
        </div>
      </div>
      
      <div ref={canvasRef} className="game-canvas"></div>
      
      <div className="game-controls">
        <p>좀비를 클릭하여 공격하세요! (공격력: 10)</p>
        {points <= 0 && (
          <div className="warning-container">
            <p className="warning">포인트가 부족합니다!</p>
            <button onClick={refillPoints} className="refill-button">포인트 보충</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ZombieDefensePage
