/**
 * [BRAIN-OFF 2.0] 통합 엔진 v2.1 연동 모듈
 */

export interface MarketIndex {
  name: string;
  value: string;
  changeRate: number;
  status: 'up' | 'down' | 'stable';
  is_outlier?: boolean;
  message?: string;
}

export interface Recommendation {
  id: string;
  tier: 'Premium' | 'Standard';
  is_locked: boolean;
  display_name: string;
  name: string;
  ticker: string;
  sector: string;
  mvp_score: number;
  analysis: {
    summary: string;
    detail: string;
  };
  live_tracking: {
    status: string;
    entry_date: string;
    entry_price: number;
    current_price: number;
    profit_pct: string;
    target_price: number;
    stop_loss: number;
  };
  history_hit_rate: string;
}

export interface UnifiedMasterData {
  system_integrity: {
    version: string;
    last_updated_kst: string;
    data_validation: {
      is_verified: boolean;
      method: string;
      status: string;
      active_source: string;
    };
  };
  market_dashboard: {
    indices: MarketIndex[];
    protection_mode: {
      status: string;
      logic: string;
    };
  };
  risk_filters: string[];
  recommendations: Recommendation[];
  portfolio_performance: {
    total_win_rate: string;
    active_holdings_count: number;
    last_closed_return: string;
    monthly_accumulated: string;
  };
}

/**
 * [v2.1] 통합 마스터 JSON 데이터를 가져오는 함수
 * 직접적인 API 서버 없이 public/dashboard_data.json 정적 파일을 읽습니다.
 */
export const fetchUnifiedMasterData = async (): Promise<UnifiedMasterData | null> => {
  try {
    // 1. 우선적으로 public 폴더의 정적 JSON을 읽음 (Zero-CORS, 고성능)
    const response = await fetch('/dashboard_data.json?v=' + Date.now());
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("통합 데이터 정적 파일 로드 실패:", error);
  }
  return null;
};

/**
 * [v2.1] 백그라운드 엔진 실행 트리거 함수
 * 초경량 서버(brain_off_server.py)의 API를 호출합니다.
 */
export const triggerBrainOffEngine = async (): Promise<{ status: string, message: string } | null> => {
  try {
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("엔진 실행 트리거 실패:", error);
    throw new Error("백엔드 서버(brain_off_server.py)가 실행 중인지 확인하세요.");
  }
  return null;
};

// 하위 호환성을 위한 기존 인터페이스 유지 (필요시)
export interface StockData {
  itmsNm: string;
  srtnCd: string;
  clpr: string;
  fltRt: string;
  trqu: string;
  mrktTotAmt: string;
  lastUpdated: string;
}
