import React, { useState, useEffect } from 'react';

interface Trade {
    id: number;
    date: string;
    stockName: string;
    tradeType: 'buy' | 'sell';
    quantity: number;
    price: number;
    total: number;
    memo: string;
    realizedProfit?: number;
    realizedRate?: number;
}

const TradingJournal: React.FC = () => {
    const STORAGE_KEY = 'trading_journal_data';
    const [trades, setTrades] = useState<Trade[]>([]);
    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-CA'),
        stockName: '',
        tradeType: 'buy' as 'buy' | 'sell',
        quantity: 0,
        price: 0,
        memo: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            const processed = processTrades(data);
            setTrades(processed);
        }
    };

    const processTrades = (rawTrades: Trade[]) => {
        if (!rawTrades.length) return [];
        const sorted = [...rawTrades].sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.tradeType === 'buy' ? -1 : 1;
        });

        const stockGroups: Record<string, Trade[]> = {};
        sorted.forEach(t => {
            if (!stockGroups[t.stockName]) stockGroups[t.stockName] = [];
            stockGroups[t.stockName].push(t);
        });

        Object.values(stockGroups).forEach(events => {
            let inventoryQty = 0;
            let inventoryCost = 0;
            events.forEach(event => {
                if (event.tradeType === 'buy') {
                    inventoryQty += event.quantity;
                    inventoryCost += event.total;
                } else if (inventoryQty > 0) {
                    const avgBuyPrice = inventoryCost / inventoryQty;
                    event.realizedProfit = (event.price - avgBuyPrice) * event.quantity;
                    event.realizedRate = ((event.price / avgBuyPrice) - 1) * 100;
                    inventoryCost -= (inventoryCost * Math.min(1, event.quantity / inventoryQty));
                    inventoryQty -= event.quantity;
                }
            });
        });
        return sorted.sort((a, b) => b.date.localeCompare(a.date));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextTrades = [...trades, { ...formData, id: Date.now(), total: formData.quantity * formData.price }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrades));
        setFormData({ ...formData, stockName: '', quantity: 0, price: 0, memo: '' });
        loadData();
    };

    const totalProfit = trades.reduce((sum, t) => sum + (t.realizedProfit || 0), 0);

    return (
        <div className="trading-journal glass-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>📝 매매일지</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>총 실현손익</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {Math.round(totalProfit).toLocaleString()}원
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} required />
                    <input type="text" value={formData.stockName} onChange={e => setFormData({...formData, stockName: e.target.value})} placeholder="종목명" style={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} required />
                    <select value={formData.tradeType} onChange={e => setFormData({...formData, tradeType: e.target.value as 'buy' | 'sell'})} style={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }}>
                        <option value="buy">매수</option>
                        <option value="sell">매도</option>
                    </select>
                    <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} placeholder="수량" style={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} required />
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="단가" style={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>기록 추가</button>
            </form>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}><th>날짜</th><th>종목</th><th>유형</th><th>금액</th><th>수익</th></tr></thead>
                    <tbody>
                        {trades.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem' }}>{t.date}</td>
                                <td>{t.stockName}</td>
                                <td style={{ color: t.tradeType === 'buy' ? 'var(--danger)' : 'var(--success)' }}>{t.tradeType === 'buy' ? '매수' : '매도'}</td>
                                <td style={{ textAlign: 'right' }}>{t.total.toLocaleString()}원</td>
                                <td style={{ textAlign: 'right', color: (t.realizedProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{t.realizedProfit ? Math.round(t.realizedProfit).toLocaleString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradingJournal;
