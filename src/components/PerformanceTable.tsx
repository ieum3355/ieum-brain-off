import { Stock } from '../data/mockStocks';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';

interface Props {
  history: Stock[];
  isAdmin: boolean;
  onSelectStock: (stock: Stock) => void;
}

const PerformanceTable = ({ history, isAdmin, onSelectStock }: Props) => {
  const calculateReturn = (current: number, recommended: number) => {
    return ((current - recommended) / recommended * 100).toFixed(1);
  };

  const calculateHoldingDays = (captureDate: string) => {
    const today = new Date();
    const capture = new Date(captureDate);
    const diffTime = today.getTime() - capture.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? '당일' : `${diffDays}일`;
  };

  return (
    <div className="performance-table-section" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '8px', color: 'black' }}>
          <BarChart3 size={20} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📊 성과 트래킹 기록표</h2>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>종목명</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>포착일시</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>포착가</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>현재가/종료가</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>누적 수익률</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>보유기간</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)', fontWeight: '600' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {history.map((stock) => {
                const isPremium = stock.albbanooScore >= 90;
                const isClosed = stock.status === 'closed' || stock.isClosed;
                const shouldMask = isPremium && !isAdmin && !isClosed;
                const ret = parseFloat(calculateReturn(stock.currentPrice, stock.recommendedPrice));
                
                return (
                  <tr 
                    key={stock.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s', cursor: 'pointer' }} 
                    className="table-row-hover"
                    onClick={() => onSelectStock(stock)}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: shouldMask ? '#ffd700' : 'white' }}>
                          {shouldMask ? '💎 PREMIUM 종목' : stock.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {shouldMask ? '******' : stock.ticker}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} />
                        {stock.captureDate} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{stock.captureTime}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500' }}>
                      {shouldMask ? '보안유지' : `${stock.recommendedPrice.toLocaleString()}원`}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700' }}>
                      {shouldMask ? '???,???원' : `${stock.currentPrice.toLocaleString()}원`}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        color: ret >= 0 ? 'var(--success)' : 'var(--danger)',
                        fontWeight: '800',
                        fontSize: '1rem'
                      }}>
                        <TrendingUp size={16} style={{ display: ret >= 0 ? 'block' : 'none' }} />
                        {shouldMask ? '??.?%' : `${ret > 0 ? '+' : ''}${ret}%`}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-dim)' }}>
                      {calculateHoldingDays(stock.captureDate)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className={`badge ${stock.status === 'closed' ? 'badge-secondary' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                        {stock.status === 'closed' ? '종료' : '진행중'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default PerformanceTable;
