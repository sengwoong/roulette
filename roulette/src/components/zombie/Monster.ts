import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';

export enum MonsterType {
  ZOMBIE = 'zombie',
  SKELETON = 'skeleton',
  BOSS = 'boss'
}

export interface MonsterConfig {
  type: MonsterType;
  hp: number;
  speed: number;
  damage: number;
  scoreValue: number;
  frameSpeed: number;
}

export class Monster extends GameObject {
  private type: MonsterType;
  private hp: number;
  private maxHp: number;
  private speed: number;
  private damage: number;
  private scoreValue: number;
  private animatedSprite: PIXI.AnimatedSprite;
  private healthBar: PIXI.Graphics;
  private id: number;

  constructor(
    app: PIXI.Application, 
    animatedSprite: PIXI.AnimatedSprite, 
    config: MonsterConfig, 
    x: number, 
    y: number,
    id: number = 0
  ) {
    super(app, animatedSprite, x, y);
    
    this.id = id;
    this.animatedSprite = animatedSprite;
    this.type = config.type;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.scoreValue = config.scoreValue;
    
    // 애니메이션 설정
    this.animatedSprite.animationSpeed = config.frameSpeed;
    this.animatedSprite.play();
    
    // 몬스터 앵커 설정
    this.animatedSprite.anchor.set(0.5);
    
    // 체력바 생성
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    this.app.stage.addChild(this.healthBar);
    
    // 인터랙티브 설정
    this.animatedSprite.eventMode = 'static';
    this.animatedSprite.cursor = 'pointer';
  }

  // 데미지 적용
  public takeDamage(damage: number): boolean {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.onDeath();
      return true; // 사망
    }
    
    this.updateHealthBar();
    return false; // 생존
  }

  // 체력바 업데이트
  private updateHealthBar(): void {
    const width = 50;
    const height = 5;
    const x = this.position.x - width / 2;
    const y = this.position.y - this.animatedSprite.height / 2 - 10;
    
    this.healthBar.clear();
    this.healthBar.beginFill(0xff0000); // 빨간색 배경 (총 체력)
    this.healthBar.drawRect(x, y, width, height);
    this.healthBar.beginFill(0x00ff00); // 녹색 전경 (현재 체력)
    this.healthBar.drawRect(x, y, width * (this.hp / this.maxHp), height);
    this.healthBar.endFill();
  }

  // 사망 처리
  private onDeath(): void {
    this.setActive(false);
    // 애니메이션 정지
    this.animatedSprite.stop();
    // 체력바 제거
    this.healthBar.clear();
  }

  // 게터
  public getType(): MonsterType {
    return this.type;
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }

  public getDamage(): number {
    return this.damage;
  }

  // 업데이트 메서드
  public update(delta: number): void {
    if (!this.active) return;
    
    // 좌우 이동
    this.setPosition(this.position.x + (this.speed * delta), this.position.y);
    
    // 체력바 위치 업데이트
    this.updateHealthBar();
    
    // 화면 밖으로 나가면 다시 왼쪽에서 시작
    if (this.position.x > this.app.screen.width + 50) {
      this.setPosition(-50, this.position.y);
    }
  }

  // 확장된 제거 메서드 (체력바 제거 추가)
  public override destroy(): void {
    super.destroy();
    if (this.healthBar) {
      this.app.stage.removeChild(this.healthBar);
      this.healthBar.destroy();
    }
  }

  // 게터
  public isActive(): boolean {
    return this.active;
  }

  // 클릭 핸들러 설정
  public setClickHandler(handler: () => void): void {
    this.animatedSprite.on('pointerdown', handler);
  }

  // ID 반환
  public getId(): number {
    return this.id;
  }
} 