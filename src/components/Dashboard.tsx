import { useState, useEffect, useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { fetchUnifiedMasterData, triggerBrainOffEngine, UnifiedMasterData, Recommendation } from '../logic/api';
import StockCard from './StockCard';
import DetailModal from './DetailModal';

const Dashboard = () => {
  // 아이콘 심 컴포넌트
  const IconShim = ({ name, fallback, ...props }: any) => {
    const Component = (Lucide as any)[name] || (Lucide as any)[fallback] || (Lucide as any).Info;
    return <Component {...props} />;
  };

  const [masterData, setMasterData] = useState<UnifiedMasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScreening, setIsScreening] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlockedStocks, setUnlockedStocks] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<Recommendation | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedMasterData();
      if (data) {
        setMasterData(data);
      }
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEngine = async () => {
    if (!confirm("BRAIN-OFF 통합 엔진 v2.1을 실행하시겠습니까?\n\n- 실시간 지수 검증 (Adaptive Guard)\n- 수급 및 차트 정합성 분석\n- 마스터 JSON v2.1 생성\n\n약 30초~1분 정도 소요되며 백그라운드에서 진행됩니다.")) return;
    
    setIsScreening(true);
    try {
      const res = await triggerBrainOffEngine();
      if (res?.status === 'success') {
        alert(res.message);
        // 약 5초 후 첫 번째 갱신 시도
        setTimeout(loadData, 5000);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsScreening(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000); // 1분 간격 정적 파일 체크
    return () => clearInterval(timer);
  }, []);

  if (loading && !masterData) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem' }}>
        <IconShim name="RefreshCw" size={64} className="animate-spin" style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
        <p style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '1.2rem' }}>통합 마스터 JSON v2.1 로드 중...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>BRAIN-OFF <span style={{ color: 'var(--accent-primary)' }}>2.0</span></h1>
              <span style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                color: 'var(--accent-primary)', 
                border: '1px solid rgba(56, 189, 248, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '800'
              }}>
                {masterData?.system_integrity.version}
              </span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>당신의 뇌를 끄고 이 로직의 원칙을 켜라</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', marginRight: '1rem' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>LAST UPDATED (KST)</p>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#38bdf8' }}>{masterData?.system_integrity.last_updated_kst}</p>
            </div>
            <button
              onClick={() => {
                const pass = prompt("관리자 비밀번호를 입력하세요:");
                if (pass === "0000") setIsAdmin(!isAdmin);
                else alert("비밀번호가 틀렸습니다.");
              }}
              className={isAdmin ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <IconShim name={isAdmin ? "ShieldCheck" : "ShieldAlert"} size={18} style={{ marginRight: '0.5rem' }} />
              {isAdmin ? 'ADMIN ON' : 'ADMIN OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* 실시간 지수 섹션 */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {masterData?.market_dashboard.indices.map(idx => (
          <div key={idx.name} className="glass-card" style={{ padding: '1.5rem', border: idx.is_outlier ? '1px solid #ef4444' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dim)' }}>{idx.name}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '2px 8px', 
                borderRadius: '4px',
                background: idx.changeRate >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: idx.changeRate >= 0 ? '#10b981' : '#ef4444'
              }}>
                {idx.changeRate >= 0 ? 'STABLE' : 'WATCH'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: '900' }}>{idx.value}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: idx.changeRate >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {idx.changeRate >= 0 ? '+' : ''}{idx.changeRate}%
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>{idx.message}</p>
          </div>
        ))}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <IconShim name="ShieldCheck" size={20} color="#10b981" />
            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>PROTECTION MODE: {masterData?.market_dashboard.protection_mode.status}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
            {masterData?.market_dashboard.protection_mode.logic}
          </p>
        </div>
      </section>

      {/* 퍼포먼스 요약 스테이터스 */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="summary-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>종합 적중률</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{masterData?.portfolio_performance.total_win_rate}</p>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>월간 누적 수익</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--success)' }}>{masterData?.portfolio_performance.monthly_accumulated}</p>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>최근 실현 수익</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{masterData?.portfolio_performance.last_closed_return}</p>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>액티브 홀딩</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '900' }}>{masterData?.portfolio_performance.active_holdings_count}개</p>
          </div>
        </div>
      </section>

      {/* 리스트 헤더 및 컨트롤 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>🔥 오늘의 하이브리드 맥점</h2>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <span><IconShim name="CheckCircle2" size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {masterData?.system_integrity.data_validation.method}</span>
            <span>•</span>
            <span>신뢰도: {masterData?.system_integrity.data_validation.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleRunEngine} className="btn-primary" disabled={isScreening} style={{ background: 'var(--accent-primary)', color: 'black' }}>
            <IconShim name="Zap" size={18} className={isScreening ? 'animate-pulse' : ''} />
            {isScreening ? '엔진 가동 중...' : '통합 엔진 v2.1 실행'}
          </button>
          <button onClick={loadData} className="btn-secondary">
            <IconShim name="RefreshCw" size={18} />
          </button>
        </div>
      </div>

      {/* 종목 그리드 */}
      <section className="stock-grid">
        {masterData?.recommendations.map(stock => (
          <StockCard
            key={stock.id}
            stock={stock}
            isAdmin={isAdmin}
            isUnlocked={unlockedStocks.includes(stock.ticker)}
            onUnlock={() => {
              const pass = prompt("프리미엄 종목 잠금 해제 비밀번호를 입력하세요:");
              if (pass === "0000") setUnlockedStocks([...unlockedStocks, stock.ticker]);
              else alert("비밀번호가 올바르지 않습니다.");
            }}
            onClick={(s) => setSelectedStock(s)}
          />
        ))}
      </section>

      {/* 모달 */}
      {selectedStock && (
        <DetailModal
          stock={selectedStock as any} // DetailModal도 추후 v2.1 대응 필요하나 일단 타입 캐스팅
          isAdmin={isAdmin}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {/* 푸터 영역: 리스크 필터 */}
      <footer style={{ marginTop: '5rem', padding: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>적용된 하이브리드 리스크 필터</h4>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {masterData?.risk_filters.map(filter => (
            <span key={filter} style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-dim)', 
              background: 'rgba(255,255,255,0.03)', 
              padding: '6px 14px', 
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {filter}
            </span>
          ))}
        </div>
        <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', maxWidth: '800px', margin: '3rem auto 0', lineHeight: '1.6' }}>
          ※ 모든 투자의 책임은 본인에게 있으며, 알빠누는 데이터 기반 기계적 가이드만 제공합니다.
          v2.1 엔진은 전일 종가와 실시간 수급 데이터를 교차 검증하여 리스크가 최소화된 구간만 포착합니다.
        </p>
      </footer>

      <style>{`
        .animate-spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (max-width: 640px) { .stock-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Dashboard;
