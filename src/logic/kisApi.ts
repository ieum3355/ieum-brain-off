/**
 * 한국투자증권(KIS) Open API 연동 모듈
 */

const APP_KEY = (import.meta.env.VITE_KIS_APP_KEY || "").trim();
const APP_SECRET = (import.meta.env.VITE_KIS_APP_SECRET || "").trim();
const API_URL = (import.meta.env.VITE_KIS_API_URL || "https://openapi.koreainvestment.com:9443").trim();

interface KisTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * KIS Access Token 발급 함수
 */
export const getKisAccessToken = async (): Promise<string | null> => {
  // 캐시된 토큰이 있고 유효하면 반환
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${API_URL}/oauth2/tokenP`, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: APP_KEY,
        appsecret: APP_SECRET
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("KIS 토큰 발급 실패:", errorData);
      return null;
    }

    const data: KisTokenResponse = await response.json();
    cachedToken = data.access_token;
    // 만료 시간 설정 (보통 24시간이지만 안전하게 23시간으로 설정)
    tokenExpiry = Date.now() + (data.expires_in - 3600) * 1000;
    
    return cachedToken;
  } catch (error) {
    console.error("KIS 토큰 요청 중 오류 발생:", error);
    return null;
  }
};

/**
 * 실시간 주식 현재가 조회 (국내주식)
 */
export const fetchKisStockPrice = async (ticker: string): Promise<any | null> => {
  const token = await getKisAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${ticker}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`,
        'appkey': APP_KEY,
        'appsecret': APP_SECRET,
        'tr_id': 'FHKST01010100' // 주식현재가 시세 조회
      }
    });

    if (!response.ok) {
      throw new Error(`KIS API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    if (data.rt_cd !== '0') {
      console.warn(`KIS API 응답 오류 (${ticker}):`, data.msg1);
      return null;
    }

    return data.output;
  } catch (error) {
    console.error("KIS 주가 조회 중 오류 발생:", error);
    return null;
  }
};

/**
 * 실시간 시장 지수 조회 (코스피/코스닥)
 */
export const fetchKisMarketIndex = async (indexCode: string): Promise<any | null> => {
  const token = await getKisAccessToken();
  if (!token) return null;

  // indexCode: '0001' (KOSPI), '1001' (KOSDAQ)
  const isKOSPI = indexCode === '0001';
  
  try {
    const response = await fetch(`${API_URL}/uapi/domestic-stock/v1/quotations/inquire-index-price?fid_cond_mrkt_div_code=U&fid_input_iscd=${indexCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`,
        'appkey': APP_KEY,
        'appsecret': APP_SECRET,
        'tr_id': 'FHKST03010100' // 국내지수 현재가 조회
      }
    });

    if (!response.ok) {
      throw new Error(`KIS Index API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    return {
      name: isKOSPI ? 'KOSPI' : 'KOSDAQ',
      value: data.output.bstp_nmix_prpr,
      changeRate: parseFloat(data.output.bstp_nmix_prdy_ctrt),
      status: parseFloat(data.output.bstp_nmix_prdy_ctrt) >= 0 ? 'up' : 'down'
    };
  } catch (error) {
    console.error("KIS 지수 조회 중 오류 발생:", error);
    return null;
  }
};
