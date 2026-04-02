import { useState, useEffect, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { mockStocks, mockHistory, Stock } from '../data/mockStocks';
import { filterRecommendedStocks, checkMarketCondition, isRecommendationTime } from '../logic/screener';
import { fetchPublicStockData, fetchMarketIndex, MarketIndex } from '../logic/api';
import StockCard from './StockCard';
import DetailModal from './DetailModal';
import PerformanceTable from './PerformanceTable';

const Dashboard = () => {
  // 아이콘 심 컴포넌트 (버전 호환성 및 명칭 충돌 방지)
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

      // 로컬 실시간 브릿지(MCP Bridge)에서 데이터 가져오기
      let liveDataMap: any = null;
      let baseStocks = mockStocks;

      try {
        const [liveRes, candRes] = await Promise.all([
          fetch('http://localhost:5000/api/live-stocks'),
          fetch('http://localhost:5000/api/candidates')
        ]);

        if (liveRes.ok) {
          liveDataMap = await liveRes.json();
        }
        
        if (candRes.ok) {
          const candidates = await candRes.json();
          if (candidates && candidates.length > 0) {
            baseStocks = candidates;
          }
        }
      } catch (e) {
        console.warn("로컬 브릿지 연결 실패, 폴백 데이터 사용:", e);
      }

      const dailyStocks = baseStocks.filter(s => s.captureDate === selectedDate || !s.captureDate);

      const updatedStocks = await Promise.all(
        dailyStocks.map(async (stock) => {
          if (selectedDate === todayStr) {
            // 1. 브릿지(로컬 프록시) 데이터 우선
            if (liveDataMap && liveDataMap[stock.ticker]) {
              const live = liveDataMap[stock.ticker];
              setLastUpdated(live.time);
              return {
                ...stock,
                currentPrice: live.price,
                changeRate: live.change_rate,
                status: live.status === 'caution' ? 'caution' : stock.status,
                entryGrid: {
                  ...stock.entryGrid,
                  entry: live.open_price, // 시가를 진입/기준가로 활용
                } as any
              };
            }

            // 2. 브릿지 실패 시 기존 로컬 API 폴백
            const liveData = await fetchPublicStockData(stock.ticker);
            if (liveData) {
              setLastUpdated(liveData.lastUpdated);
              return {
                ...stock,
                currentPrice: parseInt(liveData.clpr),
                changeRate: parseFloat(liveData.fltRt),
                volume: parseInt(liveData.trqu)
              };
            }
          }
          return stock;
        })
      );

      const kospi = indices.find(idx => idx.name === 'KOSPI');
      const filtered = showAll
        ? updatedStocks
        : filterRecommendedStocks(updatedStocks, kospi?.changeRate || 0);

      setStocks(filtered);
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScreener = async () => {
    if (!confirm("시장 주도주 200개를 대상으로 '하이브리드 2.0 발굴'을 시작하시겠습니까? \n\n※ Naver+Yahoo 데이터를 실시간 분석하며, 약 1분 이내에 완료됩니다.")) return;
    
    setIsScreening(true);
    try {
      const res = await fetch('http://localhost:5000/api/run-screener', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success' || data.status === 'running') {
        alert(data.message || "발굴이 백그라운드에서 시작되었습니다. 약 1분 후 결과가 반영됩니다.");
        loadData(); // 현재 상태 한 번 갱신
      } else {
        alert("오류 발생: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("서버 연결에 실패했습니다. MCP 서버가 실행 중인지 확인하세요.");
    } finally {
      setIsScreening(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
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
            <h1>BRAIN-OFF <span style={{ fontSize: '0.9rem', verticalAlign: 'middle', background: 'var(--accent-primary)', color: 'black', padding: '2px 8px', borderRadius: '4px', marginLeft: '0.5rem' }}>PRO</span></h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>당신의 뇌를 끄고 이 로직의 원칙을 켜라</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {lastUpdated && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', marginRight: '0.5rem' }}></span>
                  Hybrid Engine Active
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <IconShim name="Clock" size={12} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  {lastUpdated}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                if (!isAdmin) {
                  const pass = prompt("관리자 비밀번호를 입력하세요:");
                  if (pass === "0000") {
                    setIsAdmin(true);
                  } else {
                    alert("비밀번호가 틀렸습니다.");
                  }
                } else {
                  setIsAdmin(false);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${isAdmin ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                background: isAdmin ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                color: isAdmin ? 'var(--accent-primary)' : 'var(--text-dim)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isAdmin ? '관리자 모드 ON' : '관리자 모드 OFF'}
            </button>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {marketIndices.map(idx => (
          <div key={idx.name} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, minWidth: '180px' }}>
            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-dim)' }}>{idx.name}</span>
            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{idx.value}</span>
            <span style={{ color: idx.changeRate >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600', fontSize: '0.9rem' }}>
              {idx.changeRate >= 0 ? '+' : ''}{idx.changeRate}%
            </span>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          background: marketStatus.isSafe ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          border: `1px solid ${marketStatus.isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {marketStatus.isSafe ? <IconShim name="CheckCircle2" fallback="CheckCircle" size={24} color="#10b981" /> : <IconShim name="AlertCircle" fallback="AlertTriangle" size={24} color="#ef4444" />}
          <div>
            <p style={{ fontWeight: '700', color: marketStatus.isSafe ? '#10b981' : '#ef4444', marginBottom: '0.1rem' }}>
              {marketStatus.isSafe ? '시장 환경 양호' : '시장 리스크 감지'}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{marketStatus.message}</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
          {availableDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedDate === date ? 'var(--accent-primary)' : 'transparent',
                color: selectedDate === date ? 'black' : 'var(--text-dim)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <IconShim name="Calendar" fallback="Calendar" size={14} />
              {date === todayStr ? '오늘의 분석' : date}
            </button>
          ))}
        </div>
      </section>

      <section className="performance-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">{selectedDate === todayStr ? '오늘의' : '해당일'} 평균 기대수익</span>
            <div className="summary-value">
              {(() => {
                const avgUpside = stocks.reduce((acc, s) => {
                  const upside = ((s.resistancePrice - s.currentPrice) / s.currentPrice) * 100;
                  return acc + upside;
                }, 0) / (stocks.length || 1);
                return (
                  <span className="text-success">
                    +{avgUpside.toFixed(1)}%
                  </span>
                );
              })()}
              <span className="summary-sub">분석 시점 목표가 기준</span>
            </div>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">누적 검증 수익률</span>
            <div className="summary-value">
              <span className="text-success" style={{ fontSize: '1.75rem' }}>
                +{totalCumulativeReturn.toFixed(1)}%
              </span>
              <span className="summary-sub">MVP 2.0 운영 합계</span>
            </div>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">알빠누 적중률</span>
            <div className="summary-value">
              {winRate}%
              <span className="summary-sub">수익 실현 확률</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {selectedDate === todayStr ? '🔥 오늘의 하이브리드 맥점' : `📊 ${selectedDate} 분석 결과`}
          </h2>
          {selectedDate === todayStr && (
            <div style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              background: timeInfo.canRecommend ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${timeInfo.canRecommend ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.1)'}`,
              fontSize: '0.75rem',
              fontWeight: '700',
              color: timeInfo.canRecommend ? 'var(--accent-primary)' : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <IconShim name="Clock" size={14} />
              {timeInfo.session === 'AM' ? '오전 세션 추천 중' : timeInfo.session === 'PM' ? '오후 세션 추천 중' : '다음 세션 대기 중'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
          >
            <IconShim name="ListFilter" fallback="Filter" size={18} />
            {showAll ? '기본(정규) 보기' : '필터해제(전체)'}
          </button>
          <button
            onClick={handleRunScreener}
            className="btn-primary"
            disabled={isScreening}
            style={{ background: 'var(--accent-primary)', color: 'black' }}
          >
            <IconShim name="Zap" fallback="Play" size={18} className={isScreening ? 'animate-pulse' : ''} />
            {isScreening ? '분석 중...' : 'Stage 1: 하이브리드 발굴'}
          </button>
          <button
            onClick={loadData}
            className="btn-secondary"
          >
            <IconShim name="RefreshCw" fallback="RotateCw" size={18} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <IconShim name="RefreshCw" fallback="RotateCw" size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>최신 데이터를 분석 중입니다...</p>
        </div>
      ) : (
        <>
          {stocks.length === 0 ? (
            <div className="glass-card" style={{ padding: '6rem 4rem', textAlign: 'center' }}>
              {!marketStatus.isSafe ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <IconShim name="AlertCircle" size={48} color="#ef4444" style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4444' }}>현 시점 적극적 매수 금지</p>
                  <p style={{ color: 'var(--text-dim)', maxWidth: '400px', lineHeight: '1.6' }}>
                    시장 지수가 급락하여 모든 종목의 변동성이 커진 상태입니다.
                    지수가 안정을 찾을 때까지 추천 리스트 노출이 제한됩니다.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <IconShim name="Info" size={48} style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
                  <p style={{ color: 'var(--text-dim)' }}>해당 날짜에 분석된 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="stock-grid">
              {stocks.map(stock => (
                <StockCard
                  key={`${stock.id}-${selectedDate}`}
                  stock={stock}
                  isAdmin={isAdmin}
                  onClick={(s) => setSelectedStock(s)}
                />
              ))}
            </div>
          )}

          <PerformanceTable
            history={[...mockStocks.filter(s => s.captureDate !== todayStr), ...mockHistory]}
            isAdmin={isAdmin}
            onSelectStock={(s) => setSelectedStock(s)}
          />
        </>
      )}

      {selectedStock && (
        <DetailModal
          stock={selectedStock as Stock}
          isAdmin={isAdmin}
          onClose={() => setSelectedStock(null)}
        />
      )}

      <footer style={{ marginTop: '5rem', padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            <p>모든 투자의 책임은 본인에게 있으며, 알빠누는 데이터 기반 기계적 가이드만 제공합니다.</p>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', maxWidth: '700px', lineHeight: '1.6' }}>
            ※ 본 알고리즘은 20일 신고가 돌파(Breakout)와 매집(Accumulation) 데이터를 하이브리드로 분석하여 스코어링 합니다.
            AI Score는 특정 수익률을 보장하지 않으며 지수 변동성에 따라 실시간으로 변할 수 있습니다.
            90점 이상의 프리미엄 종목은 과거 유사 패턴 성공률(Hit Rate)을 바탕으로 제공되나 개별 투자 환경에 따라 결과가 다를 수 있습니다.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (max-width: 640px) {
          .stock-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
