import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';

export enum MapType {
  CITY = 'city',
  FOREST = 'forest',
  LABORATORY = 'laboratory'
}

export interface MapConfig {
  type: MapType;
  background: string;
  obstacles?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  scrollSpeed?: number;
}

export class GameMap extends GameObject {
  private type: MapType;
  private obstacles: PIXI.Sprite[] = [];
  private scrollSpeed: number;
  private backgroundSprites: PIXI.Sprite[] = [];
  private backgroundTexture: PIXI.Texture;

  constructor(app: PIXI.Application, background: PIXI.Texture, config: MapConfig) {
    // 배경 타일링 스프라이트 생성 (TilingSprite 대신 Container 사용)
    const container = new PIXI.Container();
    
    super(app, container, 0, 0);
    
    this.backgroundTexture = background;
    this.type = config.type;
    this.scrollSpeed = config.scrollSpeed || 0;
    
    // 배경 초기화 호출
    this.initBackground();
    
    // 장애물 추가
    if (config.obstacles) {
      // 여기서 장애물 추가 로직 구현 (생략)
    }
  }

  // 업데이트 메서드
  public update(delta: number): void {
    if (!this.active) return;
    
    // 배경 스크롤링 (타일링 스프라이트 대신 개별 스프라이트 위치 조정)
    if (this.scrollSpeed > 0 && this.backgroundSprites.length >= 2) {
      // 각 배경 스프라이트 이동
      for (const sprite of this.backgroundSprites) {
        sprite.x -= this.scrollSpeed * delta;
        
        // 화면 밖으로 나간 경우 반대편으로 이동
        if (sprite.x <= -sprite.width) {
          sprite.x = this.backgroundSprites.length * sprite.width - sprite.width;
        }
      }
    }
  }

  public getType(): MapType {
    return this.type;
  }

  // 맵 크기 조정
  public resize(width: number, height: number): void {
    for (const sprite of this.backgroundSprites) {
      sprite.width = width;
      sprite.height = height;
    }
  }

  // 배경 초기화
  private initBackground(): void {
    // 기존 배경 제거
    if (this.backgroundSprites.length > 0) {
      for (const sprite of this.backgroundSprites) {
        this.app.stage.removeChild(sprite);
        sprite.destroy();
      }
      this.backgroundSprites = [];
    }
    
    // 새 배경 추가 (한 개만 생성)
    const sprite1 = new PIXI.Sprite(this.backgroundTexture);
    sprite1.width = this.app.screen.width;
    sprite1.height = this.app.screen.height;
    sprite1.x = 0;
    
    this.app.stage.addChild(sprite1);
    this.backgroundSprites.push(sprite1);
    
    // 필요시 두 번째 배경 추가 (스크롤 위해)
    const sprite2 = new PIXI.Sprite(this.backgroundTexture);
    sprite2.width = this.app.screen.width;
    sprite2.height = this.app.screen.height;
    sprite2.x = this.app.screen.width;
    
    this.app.stage.addChild(sprite2);
    this.backgroundSprites.push(sprite2);
  }
} 