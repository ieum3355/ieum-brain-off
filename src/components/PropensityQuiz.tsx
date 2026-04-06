import React, { useState } from 'react';
import { CONTENT_DB, QuizQuestion } from '../data/content_db';

export const PropensityQuiz: React.FC = () => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const questions: QuizQuestion[] = CONTENT_DB.quiz;

    const handleAnswer = (s: number) => {
        setScore(score + s);
        if (step + 1 < questions.length) {
            setStep(step + 1);
        } else {
            setFinished(true);
        }
    };

    const getResult = () => {
        if (score <= 10) return { type: '안정형', desc: '손실을 극도로 꺼리며 안전한 적금 위주가 어울립니다.' };
        if (score <= 15) return { type: '공격형', desc: '변동성을 즐기며 하이리스크 하이리턴을 추구합니다.' };
        return { type: '초월형', desc: '시장의 파동을 무시하고 자신의 길을 가는 고수입니다.' };
    };

    if (finished) {
        const res = getResult();
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>테스트 결과</h2>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>{res.type}</h1>
                <p style={{ lineHeight: '1.6', color: 'white' }}>{res.desc}</p>
                <button onClick={() => { setStep(0); setScore(0); setFinished(false); }} className="btn-primary" style={{ marginTop: '2rem' }}>다시 하기</button>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>Q {step + 1} / {questions.length}</span>
                <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem', lineHeight: '1.4' }}>{questions[step].question}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions[step].options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt.score)} className="glass-card" style={{ 
                        padding: '1.2rem', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s',
                        fontSize: '1rem'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                        {opt.text}
                    </button>
                ))}
            </div>
        </div>
    );
};
