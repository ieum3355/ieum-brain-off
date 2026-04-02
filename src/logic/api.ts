/**
 * 공공데이터포털(data.go.kr) 및 오픈 API 연동 모듈
 */

// Vite 환경 변수에서 서비스 키를 가져옵니다. (.env 파일에 VITE_DATA_GO_KR_SERVICE_KEY 항목 필요)
const API_KEY = import.meta.env.VITE_DATA_GO_KR_SERVICE_KEY || "";

export interface StockData {
  itmsNm: string; // 종목명
  srtnCd: string; // 단축코드
  clpr: string;   // 종가
  fltRt: string;  // 등락률
  trqu: string;   // 거래량
  mrktTotAmt: string; // 시가총액
  lastUpdated: string; // 최종 업데이트 시각 (실시간성 보장)
}

export interface MarketIndex {
  name: string;
  value: string;
  changeRate: number;
  status: 'up' | 'down' | 'stable';
}

/**
 * 시장 지수(KOSPI/KOSDAQ) 정보를 가져오는 함수
 */
export const fetchMarketIndex = async (): Promise<MarketIndex[]> => {
  try {
    // 로컬 MCP 서버(브릿지)를 통해 지수 정보 가져오기 (CORS 우회)
    const response = await fetch('http://localhost:5000/api/market-indices');
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn("로컬 서버 지수 호출 실패, 시뮬레이션 데이터 반환:", error);
  }

  // fallback (서버 데이터 로딩 전 혹은 장애 시)
  return [
    { name: 'KOSPI', value: '---', changeRate: 0, status: 'stable' },
    { name: 'KOSDAQ', value: '---', changeRate: 0, status: 'stable' }
  ];
};

/**
 * 주식 시세 정보를 가져오는 함수 (로컬 프록시 우선)
 */
export const fetchPublicStockData = async (ticker: string): Promise<StockData | null> => {
  try {
    // 로컬 MCP 서버(프록시)를 통해 시세 가져오기 (CORS 우회 및 KIS 의존성 제거)
    const response = await fetch(`http://localhost:5000/api/stock-price/${ticker}`);
    if (response.ok) {
      const data = await response.json();
      return {
        itmsNm: data.itmsNm,
        srtnCd: data.srtnCd,
        clpr: data.clpr,
        fltRt: data.fltRt,
        trqu: data.trqu,
        mrktTotAmt: "0",
        lastUpdated: data.lastUpdated
      };
    }
  } catch (error) {
    console.warn("로컬 프록시 시세 호출 실패, 폴백 시도:", error);
  }

  // 폴백: 공공데이터포털 (필요한 경우에만)
  try {
    if (!API_KEY) return null;
    const url = `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${API_KEY}&resultType=json&likeItmsNm=${ticker}&numOfRows=1&pageNo=1`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const item = data?.response?.body?.items?.item?.[0];
      if (item) {
        return {
          itmsNm: item.itmsNm,
          srtnCd: item.srtnCd,
          clpr: item.clpr,
          fltRt: item.fltRt,
          trqu: item.trqu,
          mrktTotAmt: item.mrktTotAmt,
          lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour12: false })
        };
      }
    }
  } catch (e) {
    console.error("최후 폴백 실패:", e);
  }
  return null;
};
