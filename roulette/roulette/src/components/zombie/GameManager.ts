import * as PIXI from 'pixi.js';
import { Monster, MonsterType, MonsterConfig } from './Monster';
import { GameMap, MapType, MapConfig } from './GameMap';
import { Reward, RewardType, RewardConfig } from './Reward';

export interface GameConfig {
  width: number;
  height: number;
  difficulty: number;
  monsterSpawnRate: number;
  rewardSpawnRate: number;
}

export class GameManager {
  private app: PIXI.Application;
  private gameMap: GameMap | null = null;
  private monsters: Monster[] = [];
  private rewards: Reward[] = [];
  private gameObjects: Array<Monster | Reward> = [];
  private config: GameConfig;
  private score: number = 0;
  private onScoreChange: (score: number) => void;
  private spawnTimers: { monster: number; reward: number } = { monster: 0, reward: 0 };
  private onMonsterReachedBoundary: ((damage: number) => void) | null = null;

  constructor(app: PIXI.Application, config: GameConfig, onScoreChange: (score: number) => void) {
    this.app = app;
    this.config = config;
    this.onScoreChange = onScoreChange;
    
    // 애니메이션 루프 시작
    this.app.ticker.add(this.update, this);
  }

  // 맵 설정
  public async setMap(mapConfig: MapConfig, backgroundTexture: PIXI.Texture): Promise<void> {
    // 기존 맵 제거
    if (this.gameMap) {
      this.gameMap.destroy();
    }
    
    // 새 맵 생성
    this.gameMap = new GameMap(this.app, backgroundTexture, mapConfig);
  }

  // 몬스터 생성
  public spawnMonster(texture: PIXI.Texture[], config: MonsterConfig): number {
    // 애니메이션 스프라이트 생성
    const animatedSprite = new PIXI.AnimatedSprite(texture);
    
    // 초기 위치 설정
    const x = -50;
    const y = this.app.screen.height / 2 + 150;
    
    // 몬스터 ID 생성 (간단히 배열 길이 + 1로 설정)
    const monsterId = this.monsters.length + 1;
    
    // 몬스터 생성
    const monster = new Monster(this.app, animatedSprite, config, x, y, monsterId);
    
    // 배열에 추가
    this.monsters.push(monster);
    this.gameObjects.push(monster);
    
    return monsterId;
  }

  // 보상 생성
  public spawnReward(texture: PIXI.Texture, config: RewardConfig): void {
    // 스프라이트 생성
    const sprite = new PIXI.Sprite(texture);
    
    // 위치 설정
    const x = Math.random() * this.app.screen.width;
    const y = Math.random() * (this.app.screen.height - 100) + 50;
    
    // 보상 ID 생성
    const rewardId = this.rewards.length + 1;
    
    // 보상 생성 (ID 전달)
    const reward = new Reward(this.app, sprite, config, x, y, rewardId);
    
    // 배열에 추가
    this.rewards.push(reward);
    this.gameObjects.push(reward);
    
    // 클릭 이벤트 설정
    sprite.on('pointertap', () => {
      const rewardData = reward.collect();
      if (rewardData.type === RewardType.SCORE) {
        this.addScore(rewardData.value);
      }
      // 다른 보상 타입 처리 (생략)
    });
  }

  // 점수 추가
  public addScore(value: number): void {
    this.score += value;
    this.onScoreChange(this.score);
  }

  // 몬스터 클릭 핸들러 설정
  public setMonsterClickHandler(monsterId: number, handler: () => void): void {
    const monster = this.monsters.find(m => m.getId() === monsterId);
    if (monster) {
      monster.setClickHandler(handler);
    }
  }

  // 몬스터 데미지 적용
  public damageMonster(monsterId: number, damage: number): boolean {
    const monster = this.monsters.find(m => m.getId() === monsterId);
    if (!monster) return false;
    
    const isKilled = monster.takeDamage(damage);
    if (isKilled) {
      this.addScore(monster.getScoreValue());
    }
    
    return isKilled;
  }

  // 업데이트 메서드
  public update(delta: PIXI.Ticker): void {
    // 맵 업데이트
    if (this.gameMap) {
      this.gameMap.update(delta.deltaTime);
    }
    
    // 몬스터 경계 체크 - 삭제하지 않고 데미지만 적용
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      
      // 몬스터가 활성화 상태인 경우만 체크
      if (monster.isActive()) {
        // 업데이트 실행
        monster.update(delta.deltaTime);
        
        // 화면 오른쪽 경계 도달 체크
        if (monster.checkBoundary()) {
          // 몬스터 데미지만큼 포인트 차감 이벤트 발생
          if (this.onMonsterReachedBoundary) {
            this.onMonsterReachedBoundary(monster.getDamage());
          }
          
          // 몬스터는 삭제하지 않음 - 이미 Monster.update에서 다시 왼쪽으로 이동시킴
        }
      }
    }
    
    // 모든 게임 객체 업데이트
    for (const gameObject of this.gameObjects) {
      if (gameObject.isActive()) {
        gameObject.update(delta.deltaTime);
      }
    }
    
    // 몬스터 생성 타이머
    this.spawnTimers.monster += delta.deltaTime;
    if (this.spawnTimers.monster >= this.config.monsterSpawnRate * 60) {
      this.spawnTimers.monster = 0;
      // 몬스터 생성 로직 (실제 구현은 외부 메서드 호출)
    }
    
    // 보상 생성 타이머
    this.spawnTimers.reward += delta.deltaTime;
    if (this.spawnTimers.reward >= this.config.rewardSpawnRate * 60) {
      this.spawnTimers.reward = 0;
      // 보상 생성 로직 (실제 구현은 외부 메서드 호출)
    }
  }

  // 게임 리셋
  public reset(): void {
    // 모든 게임 객체 제거
    for (const gameObject of this.gameObjects) {
      gameObject.destroy();
    }
    
    // 배열 초기화
    this.monsters = [];
    this.rewards = [];
    this.gameObjects = [];
    this.score = 0;
    this.onScoreChange(this.score);
  }

  // 리소스 정리
  public destroy(): void {
    this.reset();
    this.app.ticker.remove(this.update, this);
    if (this.gameMap) {
      this.gameMap.destroy();
    }
  }

  // 커스텀 위치에 몬스터 생성
  public spawnCustomMonster(texture: PIXI.Texture[], config: MonsterConfig, x: number, y: number): number {
    // 애니메이션 스프라이트 생성
    const animatedSprite = new PIXI.AnimatedSprite(texture);
    
    // 몬스터 ID 생성 (간단히 배열 길이 + 1로 설정)
    const monsterId = this.monsters.length + 1;
    
    // 몬스터 생성
    const monster = new Monster(this.app, animatedSprite, config, x, y, monsterId);
    
    // 배열에 추가
    this.monsters.push(monster);
    this.gameObjects.push(monster);
    
    return monsterId;
  }

  // 맵 크기 조정 메서드 추가
  public resizeMap(width: number, height: number): void {
    if (this.gameMap) {
      this.gameMap.resize(width, height);
    }
  }

  // 보상 클릭 핸들러 설정
  public setRewardClickHandler(handler: (reward: {id: number, value: number}) => void): void {
    this.rewards.forEach(reward => {
      reward.setClickHandler(() => {
        handler({
          id: reward.getId(),
          value: reward.getValue()
        });
      });
    });
  }

  // 보상 제거
  public removeReward(rewardId: number): void {
    const rewardIndex = this.rewards.findIndex(r => r.getId() === rewardId);
    if (rewardIndex !== -1) {
      const reward = this.rewards[rewardIndex];
      
      // 배열에서 제거
      this.rewards.splice(rewardIndex, 1);
      
      // gameObjects 배열에서도 제거
      const objectIndex = this.gameObjects.indexOf(reward);
      if (objectIndex !== -1) {
        this.gameObjects.splice(objectIndex, 1);
      }
      
      // 리소스 정리
      reward.destroy();
    }
  }

  // 경계 도달 콜백 설정 메서드
  public setMonsterReachedBoundaryHandler(handler: (damage: number) => void): void {
    this.onMonsterReachedBoundary = handler;
  }

  // 활성 몬스터 목록 가져오기
  getActiveMonsters() {
    return this.monsters.filter(m => m.isActive());
  }
} 