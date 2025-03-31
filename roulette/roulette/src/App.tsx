import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import RoulettePage from './page/RoulettePage';
import ZombieDefensePage from './page/ZombieDefensePage';
import './App.css'; // CSS 파일 불러오기

// 레이아웃 컴포넌트 추가
const Layout: React.FC = () => {
  return (
    <div>
      <header className="main-header">
        <nav>
          <Link to="/roulette" className="nav-link">룰렛</Link>
          <Link to="/zombie" className="nav-link">좀비 디펜스</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

// NotFound 페이지 컴포넌트
const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <h2>404</h2>
      <p>페이지를 찾을 수 없습니다</p>
      <Link to="/" className="home-link">홈으로 이동</Link>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>

        <Routes>
          {/* 공통 레이아웃을 적용하는 중첩 라우트 */}
          <Route element={<Layout />}>
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="/zombie" element={<ZombieDefensePage />} />
            
            {/* 리다이렉트 예시 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* 존재하지 않는 경로에 대한 처리 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

    </BrowserRouter>
  );
};

export default App;