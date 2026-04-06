import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AILab: React.FC = () => {
    const data = useMemo(() => [
        { name: '1월', current: 15, ai: 18 },
        { name: '2월', current: 12, ai: 22 },
        { name: '3월', current: 18, ai: 28 },
        { name: '4월', current: 25, ai: 35 },
    ], []);

    return (
        <div className="ai-lab glass-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🔬 <span style={{ color: 'var(--accent-primary)' }}>AI 분석소</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>AI 수익 탐지 엔진</h3>
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} />
                                <YAxis stroke="var(--text-dim)" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ background: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    formatter={(value: any) => [`${value}%`, '수익률']}
                                />
                                <Area type="monotone" dataKey="ai" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAI)" />
                                <Area type="monotone" dataKey="current" stroke="var(--text-dim)" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>실시간 분석 리포트</h3>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                        <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>[오늘의 AI 모델 요약]</p>
                        <p>1. 삼성전자: 외국인 평단가 대비 +4.2% 상회. 추세 강화 구간.</p>
                        <p>2. 코스피 지수: 2,650선 강력한 지지선 형성 중.</p>
                        <p>3. 섹터 로테이션: 반도체에서 신재생 에너지로의 수급 분산 포착.</p>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '8px', border: '1px dashed var(--accent-primary)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>AI 예측 신호: </span>
                            <span style={{ fontWeight: 'bold' }}>STRONG BUY (78%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AILab;
