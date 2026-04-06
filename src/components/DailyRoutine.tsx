import React, { useState, useEffect } from 'react';

const DailyRoutine: React.FC = () => {
    const checklistItems = [
        { id: 'check-news', label: '글로벌 주요 뉴스 확인' },
        { id: 'check-indices', label: '지수 및 환율 체크' },
        { id: 'check-holdings', label: '보유 종목 현황 점검' },
        { id: 'check-plan', label: '오늘의 매매 계획 수립' },
        { id: 'check-diary', label: '매매일지 작성 마무리' }
    ];

    const getTodayKey = () => {
        const now = new Date();
        return `routine_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const [status, setStatus] = useState<Record<string, boolean>>({});
    const [history, setHistory] = useState<{ label: string, count: number }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const todayKey = getTodayKey();
        const saved = localStorage.getItem(todayKey);
        if (saved) setStatus(JSON.parse(saved));

        const historyData = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const key = `routine_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const label = i === 0 ? "오늘" : `${date.getMonth() + 1}/${date.getDate()}`;
            const savedDay = localStorage.getItem(key);
            let count = 0;
            if (savedDay) {
                const dayStatus = JSON.parse(savedDay);
                count = Object.values(dayStatus).filter(v => v).length;
            }
            historyData.push({ label, count });
        }
        setHistory(historyData);
    };

    const handleCheckChange = (id: string, checked: boolean) => {
        const nextStatus = { ...status, [id]: checked };
        setStatus(nextStatus);
        localStorage.setItem(getTodayKey(), JSON.stringify(nextStatus));
        const nextHistory = [...history];
        nextHistory[0].count = Object.values(nextStatus).filter(v => v).length;
        setHistory(nextHistory);
    };

    const completedCount = checklistItems.filter(item => status[item.id]).length;
    const progress = Math.round((completedCount / checklistItems.length) * 100);

    return (
        <div className="daily-routine glass-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📅 <span style={{ color: 'var(--accent-primary)' }}>데일리 루틴</span></h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>완료: {completedCount}/{checklistItems.length}</span>
            </div>
            <div className="checklist" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {checklistItems.map(item => (
                    <label key={item.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', cursor: 'pointer',
                        border: '1px solid transparent', borderColor: status[item.id] ? 'var(--accent-primary)' : 'transparent', transition: 'all 0.2s'
                    }}>
                        <input type="checkbox" checked={status[item.id] || false} onChange={(e) => handleCheckChange(item.id, e.target.checked)} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }} />
                        <span style={{ textDecoration: status[item.id] ? 'line-through' : 'none', color: status[item.id] ? 'var(--text-dim)' : 'var(--text-main)' }}>{item.label}</span>
                    </label>
                ))}
            </div>
            <div className="history-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-dim)' }}>최근 7일 기록 ({progress}%)</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {history.map((day, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ height: `${(day.count / checklistItems.length) * 100}%`, width: '100%', background: 'var(--accent-primary)', position: 'absolute', bottom: 0, opacity: 0.6 }}></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{day.label}</span>
                        </div>
                    )).reverse()}
                </div>
            </div>
        </div>
    );
};

export default DailyRoutine;
