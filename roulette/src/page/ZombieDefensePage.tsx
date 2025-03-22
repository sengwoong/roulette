import React from 'react'
import './ZombieDefensePage.css'

function ZombieDefensePage() {
  return (
    <div className="zombie-defense-container">
      <div className="zombie-header">
        <h1>좀비 디펜스</h1>
        <div className="score-board">
          <span>점수: 0</span>
        </div>
      </div>
      
      <div className="game-canvas"></div>
      
      <div className="game-controls">
        <p>단어를 맞추어 공격하세요!</p>
      </div>
    </div>
  )
}

export default ZombieDefensePage
