export interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  category: 'basic' | 'technical' | 'macro';
}

export interface Mistake {
  id: string;
  title: string;
  description: string;
  solution: string;
}

export interface StrategyGuide {
  id: string;
  step: number;
  title: string;
  content: string;
}

export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  category: 'psychology' | 'technical' | 'value';
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface MarketInsight {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  description: string;
}

export const CONTENT_DB = {
  market_briefing: "2026년 반도체 업적 개선세와 금리 인하 기대감이 공존하는 장세입니다. 외국인 수급이 시총 상위주로 유입되고 있으며, 하이브리드 2.0 기법상 4단계 돌파 지점에 위치한 종목들에 주목해야 합니다. 지수의 일시적 조정은 건강한 매수 기회로 판단됩니다.",
  
  insights: [
    {
      id: "insight-1",
      title: "2026 삼성전자 HBM 공급망 심층 분석",
      slug: "samsung-electronics-2026-outlook",
      date: "2026-03-25",
      category: "기업분석",
      description: "삼성전자의 5세대 HBM(HBM3E) 양산 속도가 예상보다 빨라지고 있습니다. 이는 관련 후공정 장비주들에게 큰 상방 모멘텀이 될 것입니다."
    },
    {
        id: "insight-2",
        title: "AI 가속기 시장의 지각변동: 엔비디아 독주 끝날까?",
        slug: "ai-accelerator-market-shift",
        date: "2026-03-24",
        category: "산업분석",
        description: "커스텀 실리콘(ASIC) 시장의 성장이 범용 GPU 시장의 파이를 일부 가져오고 있습니다. 국내 팹리스 및 디자인하우스 기업들의 수혜 여부를 분석합니다."
    },
    {
        id: "insight-3",
        title: "금리 인하 사이클에서의 배당주 투자 전략",
        slug: "dividend-strategy-2026",
        date: "2026-03-23",
        category: "거시전략",
        description: "금리가 낮아질수록 고배당주의 매력도는 상대적으로 높아집니다. 단순 배당률보다 배당 성향과 현금 흐름이 개선되는 '성장형 배당주'에 집중하세요."
    }
  ],

  dictionary: [
    { id: '1', term: '눌림목', definition: '주가가 상승 추세 중에 일시적으로 조정받는 구간', category: 'technical' },
    { id: '2', term: '손절매(Stop-loss)', definition: '추가 하락에 따른 손실을 방지하기 위해 가격이 일정 수준 이하로 내려가면 매도하는 것', category: 'basic' },
    { id: '3', term: '정배열', definition: '이동평균선이 단기, 중기, 장기 순서대로 위에서부터 정렬된 상태', category: 'technical' },
    { id: '4', term: '양적완화', definition: '중앙은행이 시장에 화폐를 직접 공급하여 경기를 부양하는 정책', category: 'macro' }
  ] as DictionaryTerm[],

  mistakes: [
    { 
      id: 'm1', 
      title: '뇌동매매', 
      description: '계획 없이 급등하는 종목을 추격 매수하는 행위', 
      solution: '진입 전 반드시 손절가와 익절가를 설정하고 기계적으로 대응하세요.' 
    },
    { 
      id: 'm2', 
      title: '몰빵 투자', 
      description: '한 종목에 모든 자산을 투입하여 리스크를 키우는 행위', 
      solution: '자산의 20% 이상을 한 종목에 담지 않는 포트폴리오 분산 원칙을 지키세요.' 
    }
  ] as Mistake[],

  guides: [
    { id: 'g1', step: 1, title: '기본기 확립', content: '차트의 기본 원리와 이동평균선의 의미를 공부합니다.' },
    { id: 'g2', step: 2, title: '전략 수립', content: '자신만의 매수/매도 원칙을 세우고 백테스트합니다.' },
    { id: 'g3', step: 3, title: '실전 연습', content: '소액으로 원칙을 지키는 연습을 하며 일지를 기록합니다.' }
  ] as StrategyGuide[],

  books: [
    { id: 'b1', title: '어느 주식투자자의 회상', author: '에드윈 르페브르', category: 'psychology', description: '주식 투자의 고전 중의 고전, 시장의 본질을 꿰뚫는 통찰' },
    { id: 'b2', title: '금융 투자의 역사', author: '에드워드 찬슬러', category: 'value', description: '투기 열풍과 거품의 역사를 통해 시장의 사이클을 이해' }
  ] as RecommendedBook[],

  quiz: [
    {
      id: 'q1',
      question: '주가가 10% 급등했을 때 당신의 반응은?',
      options: [
        { text: '당장 추격 매수한다', score: 10 },
        { text: '눌림목이 오길 기다린다', score: 5 },
        { text: '관심 종목에만 넣어둔다', score: 2 }
      ]
    },
    {
      id: 'q2',
      question: '보유 종목이 -5% 하락했을 때 당신은?',
      options: [
        { text: '원칙대로 손절한다', score: 5 },
        { text: '더 떨어지면 물을 탄다', score: 8 },
        { text: '앱을 지우고 잊는다', score: 12 }
      ]
    }
  ] as QuizQuestion[]
};
