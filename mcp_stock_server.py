import json
import sys
import os
import threading
import requests
import subprocess
import time
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 전역 프로세스 추적용
screener_process = None
INDEX_CACHE_FILE = "market_index_cache.json"

def fetch_market_indices():
    """
    지능형 실시간 동기화: 네이버 금융 실시간 API를 우선 사용하여 한국 시장 지수를 정밀하게 가져옵니다.
    실패 시 야후 파이낸스 및 로컬 캐시를 폴백으로 사용합니다.
    """
    results = []
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    # 1. 네이버 금융 실시간 API (가장 정확)
    try:
        naver_url = "https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX:KOSPI,KOSDAQ"
        res = requests.get(naver_url, headers=headers, timeout=5)
        if res.ok:
            data = res.json()
            for item in data['result']['areas'][0]['datas']:
                raw_name = item['nm']
                # 프론트엔드 매칭을 위한 한글->영어 이름 변환
                name = "KOSPI" if "코스피" in raw_name else "KOSDAQ" if "코스닥" in raw_name else raw_name
                
                val = item['nv'] / 100.0 if item['nv'] > 100000 else item['nv']
                results.append({
                    "name": name,
                    "value": f"{val:,.2f}",
                    "changeRate": float(item['cr']),
                    "status": "up" if float(item['cr']) >= 0 else "down"
                })
            
            # 성공 시 로컬 캐시 저장
            if results:
                with open(INDEX_CACHE_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f)
                return results
    except Exception as e:
        print(f"Naver Index Fetch failed: {e}")

    # 2. 야후 파이낸스 폴백 (네이버 실패 시)
    try:
        import yfinance as yf
        for symbol, name in [("^KS11", "KOSPI"), ("^KQ11", "KOSDAQ")]:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="2d")
            if not hist.empty:
                val = hist['Close'].iloc[-1]
                prev_val = hist['Close'].iloc[-2] if len(hist) > 1 else val
                change = ((val - prev_val) / prev_val) * 100
                results.append({
                    "name": name,
                    "value": f"{val:,.2f}",
                    "changeRate": round(float(change), 2),
                    "status": "up" if change >= 0 else "down"
                })
        if results:
            return results
    except Exception as e:
        print(f"Yahoo Index Fetch failed: {e}")

    # 3. 로컬 캐시 폴백 (어제 혹은 직전 성공 데이터)
    if os.path.exists(INDEX_CACHE_FILE):
        try:
            with open(INDEX_CACHE_FILE, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
                if cached_data:
                    return cached_data
        except: pass

    # 4. 최후의 폴백 (최소한의 로딩 데이터)
    return [
        {"name": "KOSPI", "value": "---", "changeRate": 0.0, "status": "stable"},
        {"name": "KOSDAQ", "value": "---", "changeRate": 0.0, "status": "stable"}
    ]

@app.route('/api/market-indices')
def get_market_indices():
    return jsonify(fetch_market_indices())

@app.route('/api/live-stocks')
def get_live_stocks():
    """
    모든 후보 종목의 실시간 시세를 맵(Map) 형식으로 제공합니다.
    kis_bridge.py 없이도 캐시(candidates.json) 또는 실시간 조회를 통해 데이터를 구성합니다.
    """
    if not os.path.exists("candidates.json"): return jsonify({})
    
    try:
        with open("candidates.json", "r", encoding="utf-8") as f:
            candidates = json.load(f)
        
        # Dashboard.tsx가 기대하는 형식: { [ticker]: { price, change_rate, etc } }
        live_data = {}
        for c in candidates:
            ticker = c["ticker"]
            live_data[ticker] = {
                "price": c["currentPrice"],
                "open_price": c["entryGrid"]["entry"],
                "change_rate": c["changeRate"],
                "time": datetime.now().strftime("%H:%M:%S"),
                "timestamp": datetime.now().isoformat(),
                "status": "normal"
            }
        return jsonify(live_data)
    except Exception as e:
        print(f"Error serving live stocks: {e}")
        return jsonify({})

@app.route('/api/stock-price/<ticker>')
def get_stock_price(ticker):
    """
    특정 종목의 실시간 가격을 야후 파이낸스를 통해 조회하여 반환합니다. (KIS API 대체용)
    """
    try:
        symbol = f"{ticker}.KS" if ticker.startswith(('0', '1', '2')) else f"{ticker}.KQ"
        # yfinance 대신 간단한 실시간 가격이 필요하면 Naver 등 사용 가능하지만 안정성을 위해 candidates 참조 우선
        if os.path.exists("candidates.json"):
             with open("candidates.json", "r", encoding="utf-8") as f:
                candidates = json.load(f)
                for c in candidates:
                    if c["ticker"] == ticker:
                        return jsonify({
                            "itmsNm": c["name"],
                            "srtnCd": ticker,
                            "clpr": str(c["currentPrice"]),
                            "fltRt": str(c["changeRate"]),
                            "trqu": str(c["volume"]),
                            "lastUpdated": datetime.now().strftime("%H:%M:%S")
                        })
        
        return jsonify({"error": "Stock not found in candidates"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/run-screener', methods=['POST'])
def run_screener():
    global screener_process
    try:
        if screener_process and screener_process.poll() is None:
            return jsonify({"status": "running", "message": "이미 발굴이 진행 중입니다."})
        
        print("Starting hybrid screener engine (Background)...")
        screener_process = subprocess.Popen([sys.executable, "screener_engine.py"], 
                                         stdout=subprocess.DEVNULL, 
                                         stderr=subprocess.DEVNULL)
        return jsonify({
            "status": "success", 
            "message": "하이브리드 2.0 발굴을 시작했습니다. 약 1분 후 확인하세요."
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/screener-status')
def get_screener_status():
    global screener_process
    is_running = screener_process is not None and screener_process.poll() is None
    count = 0
    if os.path.exists("candidates.json"):
        try:
            with open("candidates.json", "r", encoding="utf-8") as f:
                count = len(json.load(f))
        except: pass
    return jsonify({"status": "running" if is_running else "idle", "count": count})

@app.route('/api/candidates')
def get_candidates():
    if not os.path.exists("candidates.json"): return jsonify([])
    with open("candidates.json", "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

def main():
    print("BRAIN-OFF MCP Server starting (Dynamic Index Engine)...")
    app.run(port=5000, host='0.0.0.0')

if __name__ == "__main__":
    main()
