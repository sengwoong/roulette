import * as PIXI from 'pixi.js';

// 모든 게임 객체의 기본 클래스
export abstract class GameObject {
  protected sprite: PIXI.Container;
  protected app: PIXI.Application;
  protected position: { x: number; y: number };
  protected active: boolean;

  constructor(app: PIXI.Application, sprite: PIXI.Container, x: number, y: number) {
    this.app = app;
    this.sprite = sprite;
    this.position = { x, y };
    this.active = true;

    // 스프라이트 위치 설정
    this.setPosition(x, y);
    
    // 스테이지에 추가
    this.app.stage.addChild(this.sprite);
  }

  // 위치 설정
  public setPosition(x: number, y: number): void {
    this.position = { x, y };
    if ('x' in this.sprite && 'y' in this.sprite) {
      this.sprite.x = x;
      this.sprite.y = y;
    }
  }

  // 활성화 상태 확인
  public isActive(): boolean {
    return this.active;
  }

  // 활성화 상태 설정
  public setActive(active: boolean): void {
    this.active = active;
    if (this.sprite instanceof PIXI.Sprite || this.sprite instanceof PIXI.AnimatedSprite) {
      this.sprite.visible = active;
    }
  }

  // 객체 제거
  public destroy(): void {
    this.app.stage.removeChild(this.sprite);
    if ('destroy' in this.sprite && typeof this.sprite.destroy === 'function') {
      this.sprite.destroy();
    }
  }

  // 업데이트 메서드 (매 프레임 호출)
  public abstract update(delta: number): void;
} 