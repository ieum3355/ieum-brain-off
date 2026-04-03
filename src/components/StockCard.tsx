import * as Lucide from 'lucide-react';
import { Recommendation } from '../logic/api';

interface Props {
  stock: Recommendation;
  onClick: (stock: Recommendation) => void;
  isAdmin?: boolean;
  isUnlocked?: boolean;
  onUnlock?: () => void;
}

const StockCard = ({ stock, onClick, isAdmin, isUnlocked, onUnlock }: Props) => {
  // 아이콘 심 컴포넌트 (버전 호환성 및 명칭 충돌 방지)
  const IconShim = ({ name, fallback, ...props }: any) => {
    const Component = (Lucide as any)[name] || (Lucide as any)[fallback] || (Lucide as any).Info;
    return <Component {...props} />;
  };

  const isPremium = stock.tier === 'Premium';
  const shouldMask = stock.is_locked && !isAdmin && !isUnlocked;
  
  const displayName = shouldMask ? stock.display_name : stock.name;
  const displayTicker = shouldMask ? "******" : stock.ticker;

  const currentReturn = stock.live_tracking.profit_pct.replace('%', '');
  const isPositive = parseFloat(currentReturn) >= 0;

  const handleCardClick = () => {
    if (shouldMask) {
      if (onUnlock) onUnlock();
      return;
    }
    onClick(stock);
  };

  return (
    <div 
      className={`glass-card hover-card ${isPremium ? 'premium-card' : ''} ${shouldMask ? 'locked' : ''}`} 
      onClick={handleCardClick}
      style={{
        border: isPremium ? '1px solid rgba(255, 215, 0, 0.4)' : undefined,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        padding: '1.5rem'
      }}
    >
      {shouldMask && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          gap: '1rem',
          padding: '1rem'
        }}>
          <div style={{ 
            background: 'rgba(255, 215, 0, 0.1)', 
            padding: '1.2rem', 
            borderRadius: '50%',
            border: '2px solid rgba(255, 215, 0, 0.3)'
          }}>
            <IconShim name="Lock" size={28} color="#ffd700" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '800', color: '#ffd700', fontSize: '1rem', marginBottom: '0.25rem' }}>PREMIUM DATA LOCKED</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>비밀번호를 입력하여<br/>v2.1 상세 분석 정보를 확인하세요.</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); if(onUnlock) onUnlock(); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              color: 'black',
              fontWeight: '800',
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
            }}
          >
            잠금 해제 (Unlock)
          </button>
        </div>
      )}

      {isPremium && (
        <div className="premium-badge">
          <IconShim name="Zap" size={10} fill="black" /> PREMIUM v2.1
        </div>
      )}
      
      <div style={{ opacity: shouldMask ? 0.3 : 1, filter: shouldMask ? 'blur(4px)' : 'none', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isPremium ? '#ffd700' : 'white' }}>{displayName}</h3>
              <span className={`badge ${isPremium ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                {stock.live_tracking.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
              <span>{displayTicker}</span>
              <span>•</span>
              <span>{stock.sector}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.5rem 0.8rem', fontWeight: '800' }}>
              {shouldMask ? '???' : stock.live_tracking.profit_pct}
            </div>
            <div className={`badge`} style={{
              background: isPremium ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : 'rgba(255,255,255,0.1)',
              color: isPremium ? 'black' : 'white',
              fontWeight: 'bold'
            }}>
              MVP {stock.mvp_score}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
            {stock.analysis.summary}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>AI 포착가</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-dim)' }}>{shouldMask ? '보안유지' : `${stock.live_tracking.entry_price.toLocaleString()}원`}</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {shouldMask ? '???,???원' : `${stock.live_tracking.current_price.toLocaleString()}원`}
            <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
              {isPositive ? '▲' : '▼'} {stock.live_tracking.profit_pct}
            </span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${stock.mvp_score}%`, background: isPremium ? 'linear-gradient(90deg, #ffd700, #ff8c00)' : 'var(--accent-primary)' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8125rem' }}>
            <p style={{ color: 'var(--text-dim)' }}>손절가 (Stop)</p>
            <p style={{ fontWeight: '600' }}>{shouldMask ? '분석 데이터' : `${stock.live_tracking.stop_loss.toLocaleString()}원`}</p>
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            <p style={{ color: 'var(--text-dim)' }}>목표가 (Target)</p>
            <p style={{ fontWeight: '600', color: isPremium ? '#ffd700' : 'var(--accent-primary)' }}>
              {shouldMask ? 'PREMIUM 데이터' : `${stock.live_tracking.target_price.toLocaleString()}원`}
            </p>
          </div>
        </div>

        {!shouldMask && (
          <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <IconShim name="TrendingUp" size={14} color="#ffd700" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffd700' }}>과거 유사 패턴 적중률: {stock.history_hit_rate}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
              {stock.analysis.detail.substring(0, 80)}...
            </p>
          </div>
        )}
      </div>

      <style>{`
        .premium-card {
          background: rgba(255, 215, 0, 0.03) !important;
          box-shadow: 0 8px 32px 0 rgba(255, 215, 0, 0.05) !important;
        }
        .premium-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          color: black;
          padding: 3px 12px;
          font-size: 0.65rem;
          font-weight: 800;
          border-radius: 0 0 0 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .locked .premium-badge {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default StockCard;
