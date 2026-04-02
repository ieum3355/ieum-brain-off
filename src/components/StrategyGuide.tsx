import * as Lucide from 'lucide-react';

const StrategyGuide = () => {
  // 아이콘 심 컴포넌트 (버전 호환성 및 명칭 충돌 방지)
  const IconShim = ({ name, fallback, ...props }: any) => {
    const Component = (Lucide as any)[name] || (Lucide as any)[fallback] || (Lucide as any).Info;
    return <Component {...props} />;
  };

  return (
    <div className="strategy-guide-wrapper" style={{ marginTop: '5rem', marginBottom: '6rem' }}>
      <div className="glass-card" style={{ padding: '3.5rem 2.5rem', border: '1px solid rgba(56, 189, 248, 0.2)', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorative Element */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

        {/* Main Header */}
        <header style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            OFFICIAL STRATEGY GUIDE
          </div>
          <h2 style={{ fontSize: '2.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1.25rem', letterSpacing: '-0.025em' }}>
            브레인오프 (BRAIN-OFF) <span style={{ color: 'var(--accent-primary)' }}>통합 전략 가이드</span>
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            "당신의 뇌를 끄고 이 로직의 원칙을 켜라"<br />
            감정을 배제하고 데이터와 원칙에 충실한 기계적 스윙 트레이딩의 정수
          </p>
        </header>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative', zIndex: 1 }}>
          
          {/* Section 1: 핵심 철학 */}
          <section id="philosophy">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
                <IconShim name="Target" size={24} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>1. 핵심 철학: 브레인오프 (BRAIN-OFF)</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: '700' }}>감정 배제 (Logic First)</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                  뉴스나 개인적 추측, 커뮤니티의 분위기에 휘둘리지 않습니다. 오직 가격 액션(Price Action)과 수급 데이터에 근거하여 기계적으로 대응합니다.
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: '700' }}>기준 최우선 (Standard Rules)</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                  시장의 모든 변수를 완벽히 이해할 필요는 없습니다. 정해진 '매매 기준'을 엄격히 준수하는 반복적 행위가 장기적 수익의 핵심입니다.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: 매매 전략 */}
          <section id="strategy">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px' }}>
                <IconShim name="Zap" size={24} color="var(--accent-secondary)" />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>2. 매매 전략: 2~3일 단기 스윙 (Short Swing)</h3>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              세력의 수급이 유입된 후, 에너지가 응축되어 <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>신고가 돌파가 임박한 종목</span>을 공략합니다.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { step: '01', title: '[수급 확인]', desc: '최근 1주일 내 평소 거래량의 5배 이상 터진 매집봉 발생' },
                { step: '02', title: '[에너지 응축]', desc: '대량 거래 이후 1~3일간 거래량 급감하며 개미 털기 구간 진행' },
                { step: '03', title: '[지지선 확인]', desc: '60일 또는 120일 이동평균선 근처에서 지지를 받으며 상방 턴' },
                { step: '04', title: '[무주공산 확인]', desc: '현재가와 다음 주요 저항대 사이 매물대가 비어 있는 구간 확보' }
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)', position: 'absolute', top: '0.5rem', right: '1rem' }}>{item.step}</span>
                  <h4 style={{ fontWeight: '700', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: 스코어링 시스템 */}
          <section id="scoring">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                <IconShim name="BarChart3" size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>3. 정밀 스코어링 시스템 (MVP 2.0)</h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: '700', color: 'var(--text-dim)', fontSize: '0.9rem' }}>평가 항목</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: '700', color: 'var(--text-dim)', fontSize: '0.9rem' }}>상세 기준</th>
                    <th style={{ padding: '1.25rem 2rem', fontWeight: '700', color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'right' }}>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '돌파 에너지', criteria: '20일 신고가 돌파 여부 및 실시간 거래량 순위', Weight: '40점' },
                    { label: '매집 신뢰도', criteria: '최근 19일 내 강력한 매집봉 존재 여부 및 추세', Weight: '30점' },
                    { label: '에너지 응축', criteria: '돌파 전 거래량 급감 및 변동성 축소 정도', Weight: '20점' },
                    { label: '수급의 질', criteria: '기관/외인 수급 및 시장 강도(Strength)', Weight: '10점' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === 3 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1.25rem 2rem', fontWeight: '700' }}>{row.label}</td>
                      <td style={{ padding: '1.25rem 2rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>{row.criteria}</td>
                      <td style={{ padding: '1.25rem 2rem', textAlign: 'right', fontWeight: '800', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{row.Weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1.25rem 2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <IconShim name="AlertTriangle" size={20} color="#ef4444" />
              <p style={{ fontSize: '0.95rem', color: '#f87171', fontWeight: '600' }}>
                하락 추세이거나 기초 필터(시총 800억 미만, 위험 종목) 위반 시 즉시 <span style={{ textDecoration: 'underline' }}>0점 처리</span>합니다.
              </p>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Section 4: 시장 상황별 추천 정책 */}
            <section id="timing">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                  <IconShim name="CalendarClock" size={24} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>4. 추천 정책 (Timing)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>오전 세션</span>
                    <span style={{ fontWeight: '800' }}>10:00 AM</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>장 초반 노이즈를 제거하고 지수 방향성이 확정된 시점 추천</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>오후 세션</span>
                    <span style={{ fontWeight: '800' }}>13:30 ~ 14:30</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>조정 후 수급 재유입 또는 시장 반등 시 주도주 포착</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', gap: '0.75rem' }}>
                  <IconShim name="ShieldAlert" size={16} color="#ef4444" />
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: '700' }}>시장 지수 자동 보호 (Risk Management)</p>
                    <p style={{ fontSize: '0.8rem', color: '#f87171' }}>지수 -1.5% 이상 하락 시 추천 제한 및 보호 모드 자동 활성화</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: 3단계 검증 프로세스 */}
            <section id="verification">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
                  <IconShim name="CheckCircle" size={24} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>5. 검증 프로세스</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { step: '1', title: '알고리즘 스코어링', sub: '4단계 공식 기반 기술적 점수 산출' },
                  { step: '2', title: '패턴 신뢰도 크로스체크', sub: '거래량의 질과 과거 패턴 승률 대조' },
                  { step: '3', title: '시장 정합성 검증', sub: '현재 지수 흐름과 상관관계 최종 확인' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'var(--accent-primary)', color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem', flexShrink: 0 }}>{item.step}</div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Section 6: 수익 모델 */}
          <section id="freemium">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '12px' }}>
                <IconShim name="Gem" size={24} color="#ffd700" />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>6. 수익 모델 (Freemium 정책)</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  무료 <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '500' }}>(Standard)</span>
                </h4>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1.5rem' }}>80 ~ 89<span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>점</span></div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Check" size={16} color="#10b981" /> 기본 종목 정보 공개</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Check" size={16} color="#10b981" /> 알고리즘 스코어 분석</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Check" size={16} color="#10b981" /> 매매 기준 준수 확인용</li>
                </ul>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 165, 0, 0.05) 100%)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255, 215, 0, 0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#ffd700', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900' }}>BEST CHOICE</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffd700' }}>
                  프리미엄 <span style={{ color: 'rgba(255,215,0,0.6)', fontSize: '0.9rem', fontWeight: '500' }}>(Premium)</span>
                </h4>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffd700', marginBottom: '1.5rem' }}>90 ~ 100<span style={{ fontSize: '1rem', color: 'rgba(255,215,0,0.6)' }}>점</span></div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Sparkles" size={16} color="#ffd700" /> 종목명 및 티커 마스킹 해제</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Sparkles" size={16} color="#ffd700" /> 과거 유사 패턴 수익 확률(Hit Rate) 제공</li>
                  <li style={{ display: 'flex', gap: '0.5rem' }}><IconShim name="Sparkles" size={16} color="#ffd700" /> 정밀 가이드(Entry / Target / Stop) 데이터</li>
                </ul>
                <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(90deg, #ffd700, #ffa500)', color: 'black', border: 'none', fontWeight: '900' }}>지금 프리미엄 신청하기</button>
              </div>
            </div>
          </section>

          {/* Section 7: 데이터 무결성 원칙 */}
          <section id="integrity" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <IconShim name="Shield" size={20} color="var(--text-dim)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>7. 데이터 무결성 원칙 (Accuracy)</h3>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.7', maxWidth: '600px' }}>
                  알빠누는 신뢰를 최우선으로 합니다. 로컬 하이브리드 엔진(Hybrid 2.0)과 Zero-CORS 아키텍처를 통해 데이터 무결성을 보장하며, 안정성을 위한 합리적 지연(1~5분) 내에서 최적의 데이터를 제공합니다.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <IconShim name="Zap" size={24} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>실시간성</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>현재 시점 실시간 가격 제시</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <IconShim name="Activity" size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>투명성</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>초 단위 업데이트 타임스탬프</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
            © 2026 ALBBANOO ALGORITHM TRADING SYSTEM. ALL RIGHTS RESERVED.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            최종 수정일: 2026-04-02 (하이브리드 2.0 및 Zero-CORS 원칙 적용)
          </p>
        </footer>
      </div>

      <style>{`
        .strategy-guide-wrapper {
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section {
          transition: transform 0.3s ease;
        }
        section:hover {
          transform: translateX(4px);
        }
        table tr:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>
    </div>
  );
};

export default StrategyGuide;
