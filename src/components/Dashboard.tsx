import { useState, useEffect, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { mockStocks, mockHistory, Stock } from '../data/mockStocks';
import { filterRecommendedStocks, checkMarketCondition, isRecommendationTime } from '../logic/screener';
import { fetchMarketIndex, MarketIndex } from '../logic/api';
import StockCard from './StockCard';
import DetailModal from './DetailModal';
import PerformanceTable from './PerformanceTable';
import { 
  PropensityQuiz, 
  DailyRoutine, 
  AILab, 
  TradingJournal, 
  InvestmentRoadmap, 
  TermsDictionary, 
  BeginnerMistakes, 
  RecommendedBooks 
} from './DashboardComponents';
import { CONTENT_DB } from '../data/content_db';

const Dashboard = () => {
  const IconShim = ({ name, fallback, ...props }: any) => {
    const Component = (Lucide as any)[name] || (Lucide as any)[fallback] || (Lucide as any).Info;
    return <Component {...props} />;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isScreening, setIsScreening] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'quiz' | 'routine' | 'lab' | 'journal' | 'roadmap' | 'dictionary' | 'mistakes' | 'books'>('main');

  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(mockStocks.map(s => s.captureDate)));
    return dates.sort((a, b) => b.localeCompare(a));
  }, []);

  const marketStatus = useMemo(() => {
    const kospi = marketIndices.find(idx => idx.name === 'KOSPI');
    return checkMarketCondition(kospi?.changeRate || 0);
  }, [marketIndices]);

  const loadData = async () => {
    setLoading(true);
    try {
      const indices = await fetchMarketIndex();
      setMarketIndices(indices);

      let liveDataMap: any = null;
      let baseStocks = mockStocks;

      const isLocal = window.location.hostname === 'localhost';
      const liveDataUrl = isLocal ? 'http://localhost:5000/api/live-stocks' : './live_stock_data.json';
      const candidatesUrl = isLocal ? 'http://localhost:5000/api/candidates' : './candidates.json';

      try {
        const [liveRes, candRes] = await Promise.all([
          fetch(liveDataUrl),
          fetch(candidatesUrl)
        ]);

        if (liveRes.ok) {
            const data = await liveRes.json();
            liveDataMap = data;
        }
        if (candRes.ok) {
          const candidates = await candRes.json();
          if (candidates?.length) baseStocks = candidates;
        }
      } catch (e) {
        console.warn("Using fallback data");
      }

      const dailyStocks = baseStocks.filter((s: any) => s.captureDate === selectedDate || !s.captureDate);

      const updatedStocks = dailyStocks.map((stock: any) => {
        if (selectedDate === todayStr && liveDataMap?.[stock.ticker]) {
          const live = liveDataMap[stock.ticker];
          setLastUpdated(live.time || "");
          return {
            ...stock,
            currentPrice: live.price,
            changeRate: live.change_rate,
            entryGrid: { ...stock.entryGrid, entry: live.open_price }
          };
        }
        return stock;
      });

      const kospi = indices.find(idx => idx.name === 'KOSPI');
      const filtered = showAll ? updatedStocks : filterRecommendedStocks(updatedStocks as any, kospi?.changeRate || 0);
      setStocks(filtered as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScreener = async () => {
    if (window.location.hostname !== 'localhost') {
      alert("로컬 환경에서만 실행 가능합니다.");
      return;
    }
    setIsScreening(true);
    try {
      await fetch('http://localhost:5000/api/run-screener', { method: 'POST' });
      alert("분석이 시작되었습니다.");
    } catch (e) {
      alert("서버 연결 실패");
    } finally {
      setIsScreening(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000);
    return () => clearInterval(timer);
  }, [showAll, selectedDate]);

  const totalCumulativeReturn = mockHistory.reduce((acc: number, s: Stock) => acc + (s.finalReturn || 0), 0);
  const winRate = (mockHistory.filter((s: Stock) => (s.finalReturn || 0) > 0).length / (mockHistory.length || 1) * 100).toFixed(1);
  const timeInfo = isRecommendationTime(new Date());

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ letterSpacing: '2px' }}>
              IEUM STOCK <span style={{ color: 'var(--accent-primary)' }}>ALPHA INSIDER</span>
              <span style={{ fontSize: '0.9rem', verticalAlign: 'middle', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px', marginLeft: '0.8rem', fontWeight: 'bold' }}>2026</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>당신의 뇌를 끄고 정해진 승리의 원칙에 집중하라</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {lastUpdated && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <IconShim name="Clock" size={12} style={{ marginRight: '0.5rem' }} />{lastUpdated}
                </div>
            )}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border:isAdmin ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                background: isAdmin ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: isAdmin ? 'var(--accent-primary)' : 'var(--text-dim)', cursor: 'pointer'
              }}
            >
              {isAdmin ? '관리자 모드 ON' : '관리자 모드 OFF'}
            </button>
          </div>
        </div>

        <div className="nav-shortcuts" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
          gap: '0.75rem', marginTop: '2.5rem' 
        }}>
          {[
            { id: 'quiz', icon: 'Brain', label: '성향 퀴즈' },
            { id: 'routine', icon: 'Calendar', label: '데일리 루틴' },
            { id: 'lab', icon: 'Microscope', label: 'AI 분석소' },
            { id: 'journal', icon: 'FileEdit', label: '매매일지' },
            { id: 'roadmap', icon: 'Map', label: '본격 로드맵' },
            { id: 'dictionary', icon: 'Book', label: '용어 사전' },
            { id: 'mistakes', icon: 'AlertTriangle', label: '초보 실수' },
            { id: 'books', icon: 'BookOpen', label: '추천 도서' },
            { id: 'main', icon: 'Zap', label: 'BRAIN-OFF', highlight: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className="glass-card nav-item"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem',
                border: currentView === item.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                background: currentView === item.id ? 'rgba(212, 175, 55, 0.1)' : (item.highlight ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.02)'),
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <IconShim name={item.icon} size={24} color={currentView === item.id || item.highlight ? 'var(--accent-primary)' : 'var(--text-dim)'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: currentView === item.id ? 'white' : 'var(--text-dim)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main style={{ marginTop: '2rem' }}>
        {currentView === 'quiz' && <PropensityQuiz />}
        {currentView === 'routine' && <DailyRoutine />}
        {currentView === 'lab' && <AILab />}
        {currentView === 'journal' && <TradingJournal />}
        {currentView === 'roadmap' && <InvestmentRoadmap />}
        {currentView === 'dictionary' && <TermsDictionary />}
        {currentView === 'mistakes' && <BeginnerMistakes />}
        {currentView === 'books' && <RecommendedBooks />}

        {currentView === 'main' && (
          <>
            <section style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {marketIndices.map(idx => (
                <div key={idx.name} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '180px' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-dim)' }}>{idx.name}</span>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{idx.value}</span>
                  <span style={{ color: idx.changeRate >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    {idx.changeRate >= 0 ? '+' : ''}{idx.changeRate}%
                  </span>
                </div>
              ))}
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <div style={{
                    padding: '1.25rem 1.5rem', borderRadius: '16px',
                    background: marketStatus.isSafe ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    border: `1px solid ${marketStatus.isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                    {marketStatus.isSafe ? <IconShim name="CheckCircle2" size={24} color="#10b981" /> : <IconShim name="AlertCircle" size={24} color="#ef4444" />}
                    <div>
                        <p style={{ fontWeight: '700', color: marketStatus.isSafe ? '#10b981' : '#ef4444', marginBottom: '0.1rem' }}>{marketStatus.isSafe ? '시장 환경 양호' : '시장 리스크 감지'}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{marketStatus.message}</p>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)', background: 'linear-gradient(to right, rgba(212,175,55,0.05), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <IconShim name="Zap" size={20} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>알파 인사이더: 오늘의 긴급 브리핑</h3>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#ccd6f6' }}>{CONTENT_DB.market_briefing}</p>
              </div>
            </section>

            <section style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '12px' }}>
                {availableDates.map(date => (
                    <button key={date} onClick={() => setSelectedDate(date)} style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                        background: selectedDate === date ? 'var(--accent-primary)' : 'transparent',
                        color: selectedDate === date ? 'black' : 'var(--text-dim)', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        {date === todayStr ? '오늘' : date}
                    </button>
                ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <IconShim name="Clock" size={14} />
                        {timeInfo.session === 'AM' ? '오전 세션' : '오후 세션'}
                    </div>
                    <button onClick={() => setShowAll(!showAll)} className="btn-secondary">{showAll ? '필터 해제' : '전체 보기'}</button>
                    <button onClick={handleRunScreener} className="btn-primary" disabled={isScreening} style={{ background: 'var(--accent-primary)', color: 'black' }}>
                        <IconShim name="Zap" size={16} className={isScreening ? 'animate-pulse' : ''} /> {isScreening ? '분석 중...' : '실시간 발굴'}
                    </button>
                </div>
            </section>

            <section className="performance-summary">
                <div className="summary-card">
                    <div className="summary-item">
                        <span className="summary-label">누적 검증 수익률</span>
                        <div className="summary-value" style={{ color: 'var(--success)' }}>+{totalCumulativeReturn.toFixed(1)}%</div>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item">
                        <span className="summary-label">알빠누 적중률</span>
                        <div className="summary-value">{winRate}%</div>
                    </div>
                </div>
            </section>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <IconShim name="RefreshCw" size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
                </div>
            ) : (
                <div className="stock-grid">
                    {stocks.map(stock => (
                        <StockCard key={stock.id} stock={stock} isAdmin={isAdmin} onClick={setSelectedStock} />
                    ))}
                </div>
            )}

            <PerformanceTable history={mockHistory} isAdmin={isAdmin} onSelectStock={setSelectedStock} />
          </>
        )}
      </main>

      {selectedStock && <DetailModal stock={selectedStock} isAdmin={isAdmin} onClose={() => setSelectedStock(null)} />}

      <footer style={{ marginTop: '5rem', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>© 2026 IEUMSTOCK. ALL RIGHTS RESERVED. ALPHA INSIDER v2.0</p>
      </footer>

      <style>{`
        .nav-item:hover { transform: translateY(-3px); border-color: var(--accent-primary); }
        .animate-spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .stock-grid { display: grid; gridTemplateColumns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
      `}</style>
    </div>
  );
};

export default Dashboard;
