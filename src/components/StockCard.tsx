import * as Lucide from 'lucide-react';
import { Stock } from '../data/mockStocks';

interface Props {
  stock: Stock;
  onClick: (stock: Stock) => void;
  isAdmin?: boolean;
}

const StockCard = ({ stock, onClick, isAdmin }: Props) => {
  // 아이콘 심 컴포넌트 (버전 호환성 및 명칭 충돌 방지)
  const IconShim = ({ name, fallback, ...props }: any) => {
    const Component = (Lucide as any)[name] || (Lucide as any)[fallback] || (Lucide as any).Info;
    return <Component {...props} />;
  };

  const isPremium = (stock.albbanooScore || 0) >= 90;
  const isClosed = stock.status === 'closed' || stock.isClosed;
  const shouldMask = isPremium && !isAdmin && !isClosed;
  
  const displayName = shouldMask ? "💎 PREMIUM 종목 (S급)" : stock.name;
  const displayTicker = shouldMask ? "******" : stock.ticker;

  const upside = (((stock.resistancePrice - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1);

  const calculateHoldingDays = (captureDate: string) => {
    const today = new Date('2026-03-27');
    const capture = new Date(captureDate);
    const diffTime = Math.abs(today.getTime() - capture.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? '당일 포착' : `보유 ${diffDays}일차`;
  };

  const statusMap = {
    stable: { label: '안정', color: 'badge-success' },
    rising: { label: '상승 중', color: 'badge-success' },
    target_near: { label: '목표가 근접', color: 'badge-warning' },
    caution: { label: '손절 주의', color: 'badge-danger' },
  };

  const currentStatus = (statusMap as any)[stock.status] || { label: '관찰 중', color: 'badge-secondary' };
  const currentReturn = ((stock.currentPrice - stock.recommendedPrice) / stock.recommendedPrice * 100).toFixed(1);

  const handleCardClick = () => {
    if (shouldMask) {
      alert("🔒 해당 종목은 PREMIUM 데이터입니다.\n\n하지만 이미 수익 실현이 완료된 종목이나 관리자 모드에서는 투명하게 공개됩니다.");
      return;
    }
    onClick(stock);
  };

  return (
    <div 
      className={`glass-card hover-card ${isPremium ? 'premium-card locked' : ''}`} 
      onClick={handleCardClick}
      style={{
        border: isPremium ? '1px solid rgba(255, 215, 0, 0.4)' : undefined,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {isPremium && (
        <div className="premium-badge">
          <IconShim name="Zap" size={10} fill="black" /> PREMIUM
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isPremium ? '#ffd700' : 'white' }}>{displayName}</h3>
            <span className={`badge ${currentStatus.color}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
              {isPremium ? 'S급 분석완료' : currentStatus.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
            <span>{displayTicker}</span>
            <span>•</span>
            <span>{calculateHoldingDays(stock.captureDate)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className={`badge ${parseFloat(currentReturn) >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.5rem 0.8rem', fontWeight: '800' }}>
            {shouldMask ? '???' : (parseFloat(currentReturn) > 0 ? '+' : '') + currentReturn}%
          </div>
          <div className={`badge ${stock.albbanooScore >= 80 ? 'badge-success' : 'badge-warning'}`} style={{
            background: isPremium ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : undefined,
            color: isPremium ? 'black' : undefined,
            fontWeight: isPremium ? 'bold' : undefined
          }}>
            AI Score {stock.albbanooScore}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>AI 포착가</span>
          <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-dim)' }}>{shouldMask ? '보안유지' : `${stock.recommendedPrice.toLocaleString()}원`}</span>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          {shouldMask ? '???,???원' : `${stock.currentPrice.toLocaleString()}원`}
          <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: parseFloat(currentReturn) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {parseFloat(currentReturn) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(currentReturn)).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${stock.albbanooScore}%`, background: isPremium ? 'linear-gradient(90deg, #ffd700, #ff8c00)' : (stock.albbanooScore >= 80 ? 'var(--success)' : 'var(--accent-primary)') }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.8125rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>지지선</p>
          <p style={{ fontWeight: '600' }}>{shouldMask ? '120일선 부근' : `${stock.supportPrice.toLocaleString()}원`}</p>
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          <p style={{ color: 'var(--text-dim)' }}>목표가</p>
          <p style={{ fontWeight: '600', color: isPremium ? '#ffd700' : 'var(--accent-primary)', textShadow: isPremium ? '0 0 10px rgba(255,215,0,0.3)' : 'none' }}>
            {shouldMask ? 'PREMIUM 데이터' : `${stock.resistancePrice.toLocaleString()}원`}
          </p>
        </div>
      </div>

      {shouldMask ? (
        <div className="premium-mask-info">
          <IconShim name="Lock" size={16} />
          <span>상세 전략은 프리미엄 채널에서 공개</span>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', opacity: 0.8 }}>알빠누 매매 체크리스트</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <IconShim name="Zap" size={14} color={stock.volumeRatio >= 3 ? 'var(--accent-primary)' : '#4b5563'} />
              <span style={{ color: stock.volumeRatio >= 3 ? 'white' : '#4b5563' }}>대량 거래 수급 ({stock.volumeRatio}배)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <IconShim name="ShieldCheck" fallback="Shield" size={14} color={stock.maTrend === 'up' ? 'var(--accent-primary)' : '#4b5563'} />
              <span style={{ color: stock.maTrend === 'up' ? 'white' : '#4b5563' }}>상승 추세/정배열</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <IconShim name="Target" fallback="Crosshair" size={14} color={parseFloat(upside) >= 10 ? 'var(--accent-primary)' : '#4b5563'} />
              <span style={{ color: parseFloat(upside) >= 10 ? 'white' : '#4b5563' }}>무주공산 수익구간 ({upside}%)</span>
            </div>
          </div>
        </div>
      )}

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
        .premium-mask-info {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(255, 180, 0, 0.05);
          border-radius: 8px;
          border: 1px dashed rgba(255, 215, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ffd700;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default StockCard;
