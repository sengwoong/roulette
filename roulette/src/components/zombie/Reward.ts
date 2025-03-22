import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';

export enum RewardType {
  SCORE = 'score',
  HEALTH = 'health',
  WEAPON = 'weapon',
  POWER_UP = 'powerUp'
}

export interface RewardConfig {
  type: RewardType;
  value: number;
  duration?: number; // 지속 시간 (파워업의 경우)
  texture: PIXI.Texture;
}

export class Reward extends GameObject {
  private type: RewardType;
  private value: number;
  private duration: number;
  private rewardSprite: PIXI.Sprite;
  private collected: boolean = false;
  private floatAnimation: boolean = true;
  private initialY: number;
  private id: number;

  constructor(app: PIXI.Application, sprite: PIXI.Sprite, config: RewardConfig, x: number, y: number, id: number = 0) {
    super(app, sprite, x, y);
    
    this.rewardSprite = sprite;
    this.type = config.type;
    this.value = config.value;
    this.duration = config.duration || 0;
    this.initialY = y;
    this.id = id || Math.floor(Math.random() * 10000);
    
    // 스프라이트 앵커 설정
    this.rewardSprite.anchor.set(0.5);
    
    // 인터랙티브 설정
    this.rewardSprite.eventMode = 'static';
    this.rewardSprite.cursor = 'pointer';
  }

  // 보상 수집
  public collect(): { type: RewardType; value: number; duration: number } {
    if (this.collected) return { type: this.type, value: 0, duration: 0 };
    
    this.collected = true;
    this.setActive(false);
    
    return {
      type: this.type,
      value: this.value,
      duration: this.duration
    };
  }

  // 업데이트 메서드
  public update(delta: number): void {
    if (!this.active || this.collected) return;
    
    // 부드러운 상하 움직임 애니메이션
    if (this.floatAnimation) {
      const time = this.app.ticker.lastTime / 1000;
      this.setPosition(
        this.position.x,
        this.initialY + Math.sin(time * 2) * 5
      );
    }
  }

  public getType(): RewardType {
    return this.type;
  }

  public getValue(): number {
    return this.value;
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public setClickHandler(handler: () => void): void {
    this.sprite.on('pointerdown', handler);
  }

  public getId(): number {
    return this.id;
  }
} 