import React from 'react';
import { CONTENT_DB } from '../data/content_db';

export const InvestmentRoadmap: React.FC = () => (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>🛣️ 본격 로드맵</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {CONTENT_DB.guides.map(g => (
                <div key={g.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--accent-primary)', color: 'black', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{g.step}</div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>{g.title}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>{g.content}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const TermsDictionary: React.FC = () => (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>📚 용어 사전</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {CONTENT_DB.dictionary.map(t => (
                <div key={t.id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t.term}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>{t.definition}</p>
                </div>
            ))}
        </div>
    </div>
);

export const BeginnerMistakes: React.FC = () => (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#f87171' }}>⚠️ 초보 실수</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {CONTENT_DB.mistakes.map(m => (
                <div key={m.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f87171' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{m.title}</h3>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>{m.description}</p>
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '1rem', borderRadius: '8px', color: '#38bdf8', fontSize: '0.9rem' }}>
                        <strong>✨ 해결책:</strong> {m.solution}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const RecommendedBooks: React.FC = () => (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>📖 추천 도서</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {CONTENT_DB.books.map(b => (
                <div key={b.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{b.category.toUpperCase()}</span>
                    <h3 style={{ fontSize: '1.2rem' }}>{b.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{b.author}</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>{b.description}</p>
                </div>
            ))}
        </div>
    </div>
);
