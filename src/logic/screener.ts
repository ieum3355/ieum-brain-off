import { Stock } from '../data/mockStocks';

/**
 * 시장 종합 상황 체크 (Risk Management)
 * - 지수가 -1.5% 이하로 급락하거나 하락 에너지가 강할 경우 추천을 제한합니다.
 */
export const checkMarketCondition = (indexChange: number): { isSafe: boolean; message: string } => {
  if (indexChange <= -1.5) {
    return {
      isSafe: false,
      message: "시장 지수 급락으로 인한 리스크 관리 모드 - 추천을 보류합니다."
    };
  }
  if (indexChange <= -0.8) {
    return {
      isSafe: true,
      message: "시장 변동성 주의 구간입니다. 보수적 접근을 권장합니다."
    };
  }
  return { isSafe: true, message: "시장 상황이 안정적입니다. 전략 노출 종목에 집중하세요." };
};

/**
 * 알빠누 MVP 2.0: 꼼꼼한 하이브리드 점수 체계 (100점 만점)
 * - 높은 점수일수록 수익화 확률이 비례하도록 가중치 설계
 * - 돌파(40) + 매집(30) + 응축(20) + 수급(10)
 */
export const calculateAlbbanooScore = (stock: Stock): number => {
  // 0단계: 기초 필터 (P/F) - 시총 700억 미만 또는 위험 종목 제로 처리 (전략 가이드 3.2 반영)
  if (stock.isRisky || stock.marketCap < 700) return 0;

  let score = 0;

  // 1단계: 매집 신뢰도 (가중치 30) - 최근 19일 내 500% 매집봉 여부
  if (stock.hasAccumulation) score += 20;
  if (stock.maTrend === 'up') score += 10;
  else if (stock.maTrend === 'flat') score += 5;

  // 2단계: 에너지 응축/조정 (가중치 20) - 최근 의도된 음봉/눌림목 확인 (전략 가이드 2.3 반영)
  // 실시간 거래량 비율(volumeRatio)이 0.6 이하일 때 바닥권으로 판단
  if (stock.volumeRatio <= 0.6) score += 10;
  else if (stock.volumeRatio <= 1.2) score += 5;

  // 실시간 이평선 이격도(maDistance) 2.5% 이내 밀착 시 가점
  if (stock.maDistance <= 2.5) score += 10;
  else if (stock.maDistance <= 5) score += 5;

  // 3단계: 돌파 에너지 (가중치 40) - 핵심 타점 (20일 신고가 및 시가 재돌파)
  // 현재가가 20일 신고가(high20Day)를 돌파할 때 25점 부여
  const isBreakingHigh = stock.currentPrice >= stock.high20Day;
  const isNearHigh = !isBreakingHigh && (stock.currentPrice >= stock.high20Day * 0.98);

  if (isBreakingHigh) score += 20;
  else if (isNearHigh) score += 10;

  // 당일 시가 재돌파 확인 (전략 가이드 2.2 반영)
  if (stock.entryGrid && stock.currentPrice >= stock.entryGrid.entry) {
    score += 10;
  }

  // 실시간 거래량 증가 순위 반영
  if (stock.volumeGrowthRank > 0 && stock.volumeGrowthRank <= 100) score += 10;
  else if (stock.volumeGrowthRank <= 250) score += 5;

  // 4단계: 수급의 질 및 갭상승 검증 (가중치 10) (전략 가이드 2.1, 2.4 반영)
  // 의도적인 갭상승 (1.5% ~ 10%) 확인
  const gapUp = ((stock.entryGrid?.entry || stock.currentPrice) - (stock.currentPrice / (1 + stock.changeRate / 100))) / (stock.currentPrice / (1 + stock.changeRate / 100)) * 100;
  if (gapUp >= 1.5 && gapUp <= 10.0) score += 5;

  if (stock.marketStrength >= 100) score += 5; // 체결강도 100% 이상
  else if (stock.marketStrength >= 80) score += 2;

  // 최종 점수 산출
  return Math.min(score, 100);
};

/**
 * 종목 추천 사유 생성 및 가이드 단계 시각화 데이터
 */
export const generateAlbbanooReasoning = (stock: Stock) => {
  const steps: any[] = [];
  const isBreakingHigh = stock.currentPrice >= stock.high20Day;

  // 1. 수급 (30점 영역)
  steps.push({
    label: "1. 수급",
    value: stock.hasAccumulation ? "매집 포착" : "보통",
    status: stock.hasAccumulation ? 'success' : 'warning',
    desc: stock.hasAccumulation
      ? "최근 거래대금 동반한 매집봉이 확인되어 수급이 강력합니다."
      : "일반적인 수급 흐름을 보이고 있습니다."
  });

  // 2. 응축 (20점 영역)
  const adjustmentGood = stock.volumeRatio <= 1.2 && stock.maDistance <= 5;
  steps.push({
    label: "2. 응축",
    value: adjustmentGood ? "에너지 응축" : "보통",
    status: adjustmentGood ? 'success' : 'warning',
    desc: adjustmentGood
      ? "거래량 급감과 변동성 축소가 동시에 발생하여 폭발 임박 상태입니다."
      : "충분한 매물 소화 과정이 진행 중입니다."
  });

  // 3. 지지 (지지선 확인)
  const supportGood = stock.maDistance <= 3;
  steps.push({
    label: "3. 지지",
    value: supportGood ? "지지 확인" : "이격 있음",
    status: supportGood ? 'success' : 'warning',
    desc: supportGood
      ? "이평선 및 주요 지지선에 밀착하여 하방 경직성이 확보되었습니다."
      : "단기 급등으로 인한 이격이 존재하나 추세는 살아있습니다."
  });

  // 4. 무주공산 (40점 영역)
  steps.push({
    label: "4. 무주공산",
    value: isBreakingHigh ? "돌파형" : "준비완료",
    status: isBreakingHigh ? 'success' : 'warning',
    desc: isBreakingHigh
      ? "신고가 돌파로 상단 매물이 없어 탄력적인 상승이 기대되는 '무주공산' 영역입니다."
      : "저항대 돌파 시 상단 매물 공백이 확인되는 구간입니다."
  });

  // 프리미엄 전용 승률 데이터 (부가 정보)
  if (stock.albbanooScore >= 90 && stock.hitRate) {
    steps.push({
      label: "📈 프리미엄 확률",
      value: `${stock.hitRate}%`,
      status: 'success',
      desc: `과거 동일 패턴 분석 결과, 3일 내 익절 확률이 매우 높습니다.`
    });
  }

  const totalScore = stock.albbanooScore;
  return {
    title: `${stock.name} ${totalScore}점 맥점 정밀 분석`,
    content: totalScore >= 95
      ? "[S급] 돌파와 매집이 완벽한 프리미엄 종목입니다. 기계적 진입 권장."
      : totalScore >= 90
        ? "[A급] 상단 매물이 적고 돌파 에너지가 강력한 우량 맥점 종목입니다."
        : totalScore >= 80
          ? "[B급] 기본기가 탄탄한 종목으로, 지수 반등 시 탄력이 기대됩니다."
          : "알빠누 필터를 통과한 유효 종목입니다. 지지선 대응에 유의하세요.",
    steps
  };
};

/**
 * 종합 추천 필터링 (시간대 및 점수 기반)
 */
export const filterRecommendedStocks = (stocks: Stock[], indexChange: number = 0): Stock[] => {
  // 시장 상황이 불안정하면 추천 리스트 비우기 (방어적 매매)
  const market = checkMarketCondition(indexChange);
  if (!market.isSafe) return [];

  return stocks
    .map(stock => {
      const score = calculateAlbbanooScore(stock);
      const updatedStock = {
        ...stock,
        albbanooScore: score
      };
      return {
        ...updatedStock,
        reasoning: generateAlbbanooReasoning(updatedStock)
      };
    })
    .filter(stock => stock.albbanooScore >= 75) // 최소 75점 이상만 노출
    .sort((a, b) => b.albbanooScore - a.albbanooScore);
};

/**
 * 현재 시간이 추천 가능한 시간대인지 확인
 * - 오전: 10:00 ~ 11:30
 * - 오후: 13:30 ~ 15:00
 */
export const isRecommendationTime = (date: Date): { canRecommend: boolean; session: 'AM' | 'PM' | 'NONE' } => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeVal = hours * 100 + minutes;

  // 오전 10:00 ~ 11:30 (스윙 1차 타점)
  if (timeVal >= 1000 && timeVal <= 1130) return { canRecommend: true, session: 'AM' };

  // 오후 13:30 ~ 15:00 (스윙 2차 타점)
  if (timeVal >= 1330 && timeVal <= 1500) return { canRecommend: true, session: 'PM' };

  return { canRecommend: false, session: 'NONE' };
};
