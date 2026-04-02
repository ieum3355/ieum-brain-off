import { X, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Stock } from '../data/mockStocks';

interface Props {
  stock: Stock;
  isAdmin?: boolean;
  onClose: () => void;
}

const DetailModal = ({ stock, isAdmin, onClose }: Props) => {
  const isPremium = (stock.albbanooScore || 0) >= 90;
  const isClosed = stock.status === 'closed' || stock.isClosed;
  const shouldMask = isPremium && !isAdmin && !isClosed;

  if (!stock.reasoning) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="badge badge-success" style={{ marginBottom: '0.5rem', background: isPremium ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : undefined, color: isPremium ? 'black' : 'white' }}>
            AI 장전 분석 완료 {isPremium && "💎 PREMIUM"}
          </div>
          <h2>{shouldMask ? "💎 PREMIUM 종목 (S급)" : stock.reasoning.title}</h2>
          <p className="modal-subtitle">{shouldMask ? "본 종목은 프리미엄 전용 분석 대상입니다. 하지만 수익 실현이 완료된 종목이나 관리자 모드에서는 투명하게 공개됩니다." : stock.reasoning.content}</p>
        </div>

        <div className="modal-body">
          <div className="reasoning-grid">
            {stock.reasoning.steps.map((step, index) => (
              <div key={index} className="reasoning-item">
                <div className="reasoning-item-header">
                  <div className="reasoning-label">
                    {step.status === 'success' ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <AlertCircle size={18} className="text-warning" />
                    )}
                    <span>{step.label}</span>
                  </div>
                  <span className={`reasoning-value ${step.status === 'success' ? 'text-success' : 'text-warning'}`}>
                    {shouldMask ? '분석완료' : step.value}
                  </span>
                </div>
                {!shouldMask && <p className="reasoning-desc">{step.desc}</p>}
                {step.label.includes('무주공산') && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                    🎯 <strong>무주공산 포인트:</strong> 현재가부터 저항대까지 <strong>{((stock.resistancePrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(1)}%</strong>의 매물 공백 구간이 확인되었습니다.
                  </div>
                )}
              </div>
            ))}
          </div>


          <div className="trading-plan">
            <h3>📈 기계적 대응 계획</h3>
            <div className="plan-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="plan-item" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="label">포착일</span>
                <span className="value">{stock.captureDate}</span>
              </div>
              <div className="plan-item" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="label">현재 상태</span>
                <span className="value">
                  {stock.status === 'stable' ? '안정' :
                    stock.status === 'rising' ? '상승 중' :
                      stock.status === 'target_near' ? '목표가 근접' :
                        stock.status === 'caution' ? '손절 주의' : '관찰 중'}
                </span>
              </div>
              <div className="plan-item" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-primary)' }}>
                <span className="label">기대 손익비</span>
                <span className="value" style={{ color: 'var(--accent-primary)' }}>
                  {Math.abs((stock.resistancePrice - stock.recommendedPrice) / (stock.supportPrice - stock.recommendedPrice)).toFixed(2)}:1
                </span>
              </div>
            </div>

            <div className="plan-grid">
              <div className="plan-item">
                <span className="label">손절 대비 리스크</span>
                <div className="value text-danger">
                  {((stock.supportPrice - stock.recommendedPrice) / stock.recommendedPrice * 100).toFixed(1)}%
                  <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: '400', color: 'var(--text-dim)' }}>
                    ({stock.supportPrice.toLocaleString()}원)
                  </span>
                </div>
              </div>
              <div className="plan-item">
                <span className="label">보유 예정 기간</span>
                <span className="value">2~3일 (단기)</span>
              </div>
            </div>

            <div className="plan-grid">
              <div className="plan-item">
                <span className="label">AI 포착 및 시간</span>
                <span className="value">{shouldMask ? "보안유지" : `${stock.recommendedPrice.toLocaleString()}원`} <small className="text-dim">({stock.captureTime})</small></span>
              </div>
              <div className="plan-item">
                <span className="label">매수 권장 구간</span>
                <span className="value text-success">
                  {shouldMask ? "PREMIUM 데이터" : `${stock.recommendedPrice.toLocaleString()} ~ ${(stock.recommendedPrice * 1.02).toLocaleString()}원`}
                </span>
                {!shouldMask && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>포착가 대비 +2% 이내 진입 권장</span>}
              </div>
              <div className="plan-item">
                <span className="label">현재 수익률</span>
                <span className={`value ${((stock.currentPrice - stock.recommendedPrice) / stock.recommendedPrice) >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontWeight: '800', fontSize: '1.25rem' }}>
                  {shouldMask ? "??.?" : ((stock.currentPrice - stock.recommendedPrice) / stock.recommendedPrice * 100).toFixed(1)}%
                </span>
              </div>
              <div className="plan-item">
                <span className="label">목표/손절 계획</span>
                <div className="value">
                  <span className="text-success" style={{ display: 'block' }}>익절 {shouldMask ? "???" : `+${((stock.resistancePrice - stock.recommendedPrice) / stock.recommendedPrice * 100).toFixed(1)}% (${stock.resistancePrice.toLocaleString()}원)`}</span>
                  <span className="text-danger" style={{ display: 'block' }}>손절 {shouldMask ? "???" : `-${((stock.recommendedPrice - stock.supportPrice) / stock.recommendedPrice * 100).toFixed(1)}% (${stock.supportPrice.toLocaleString()}원)`}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--secondary)' }}>💡 알빠누 매수 가이드</h5>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                <li><strong>기준점:</strong> AI 포착가는 오전 수급과 차트 패턴이 완성된 시점의 가격입니다.</li>
                <li><strong>매수 타이밍:</strong> 포착가 대비 2% 이상 급등했을 때는 추격 매수를 지양하고 눌림을 기다립니다.</li>
                <li><strong>계획 매매:</strong> 설정된 손절가 이탈 시 감정을 배제하고 기계적으로 대응합니다.</li>
              </ul>
            </div>

            {isAdmin && (
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => alert("에이전트에게 '브라우저로 이 종목 차트 캡처해서 최종 컨펌해줘'라고 말하세요.")}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--accent-primary)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--accent-primary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Search size={18} />
                  🔍 AI 실전 호가/차트 컨펌 (Browser)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: white;
        }

        .modal-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-subtitle {
          color: var(--text-dim);
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .modal-body {
          margin-top: 2rem;
        }

        .reasoning-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .reasoning-item {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .reasoning-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .reasoning-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .reasoning-value {
          font-weight: 700;
          font-size: 1rem;
        }

        .reasoning-desc {
          font-size: 0.9375rem;
          color: var(--text-dim);
          line-height: 1.5;
        }

        .trading-plan {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .trading-plan h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }

        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .plan-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
        }

        .plan-item .label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }

        .plan-item .value {
          font-weight: 700;
          font-size: 0.9375rem;
        }

        .text-success { color: var(--success); }
        .text-warning { color: var(--warning); }
        .text-danger { color: var(--danger); }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DetailModal;
