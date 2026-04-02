import os
import json
import asyncio
import websockets
import requests
from datetime import datetime
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

APP_KEY = os.getenv("VITE_KIS_APP_KEY")
APP_SECRET = os.getenv("VITE_KIS_APP_SECRET")
# 모의투자 여부에 따른 URL 설정 (VITE_KIS_API_URL 참조)
BASE_URL = os.getenv("VITE_KIS_API_URL", "https://openapi.koreainvestment.com:9443")
WS_URL = "ws://ops.koreainvestment.com:21000" if "openapi" in BASE_URL else "ws://ops.koreainvestment.com:31000"

# 실시간 접속키(approval_key) 발급
def get_approval_key():
    url = f"{BASE_URL}/oauth2/Approval"
    headers = {"Content-Type": "application/json"}
    body = {
        "grant_type": "client_credentials",
        "appkey": APP_KEY,
        "secretkey": APP_SECRET
    }
    res = requests.post(url, headers=headers, data=json.dumps(body))
    return res.json()["approval_key"]

# 실시간 시세 저장소 (메모리)
live_data = {}

async def kis_websocket_handler(approval_key):
    # candidates.json에서 티커 동적 로드
    candidates = []
    if os.path.exists("candidates.json"):
        with open("candidates.json", "r", encoding="utf-8") as f:
            candidates = json.load(f)
    
    tickers = [c["ticker"] for c in candidates]
    if not tickers:
        print("No candidates found in candidates.json. Using default fallback.")
        tickers = ["079550", "348370", "403870", "399720"]

    async with websockets.connect(WS_URL) as websocket:
        for ticker in tickers:
            # 주식 실시간 체결가 구독 (H0STCNT0)
            subscribe_data = {
                "header": {
                    "approval_key": approval_key,
                    "custtype": "P",
                    "tr_type": "1",
                    "content-type": "utf-8"
                },
                "body": {
                    "input": {
                        "tr_id": "H0STCNT0",
                        "tr_key": ticker
                    }
                }
            }
            await websocket.send(json.dumps(subscribe_data))
            print(f"Subscribed to {ticker}")

        while True:
            data = await websocket.recv()
            if data[0] in ['0', '1']: # 실시간 데이터
                parts = data.split('|')
                tr_id = parts[1]
                content = parts[3]
                
                if tr_id == "H0STCNT0":
                    items = content.split('^')
                    ticker = items[0]
                    current_price = int(items[2])
                    
                    # 시가(Opening Price)는 당일 첫 데이터나 KIS API로 별도 확보 필요
                    # 여기서는 items[7] (시가) 사용 (KIS 가이드 확인 필요)
                    open_price = int(items[7]) if len(items) > 7 else current_price
                    
                    live_data[ticker] = {
                        "price": current_price,
                        "open_price": open_price,
                        "change_rate": float(items[5]),
                        "time": items[1],
                        "timestamp": datetime.now().isoformat(),
                        "status": "normal"
                    }
                    
                    # 손절 라인 체크 (전략 가이드 3.3: 당일 시가 이탈 시 손절)
                    if current_price < open_price:
                        live_data[ticker]["status"] = "caution"
                    
                    with open("live_stock_data.json", "w") as f:
                        json.dump(live_data, f)
            else:
                res = json.loads(data)
                if res.get("header", {}).get("tr_id") == "PINGPONG":
                    await websocket.send(data)

async def main():
    approval_key = get_approval_key()
    await kis_websocket_handler(approval_key)

if __name__ == "__main__":
    asyncio.run(main())
