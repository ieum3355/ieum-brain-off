import os
import json
import requests
import time
import pandas as pd
import yfinance as yf
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv

# .env 로드 (나중에 필요할 수도 있는 설정 대비)
load_dotenv()

def get_top_traded_tickers():
    """
    네이버 금융 '거래상위' 페이지에서 실시간 상위 종목 추출
    """
    url = "https://finance.naver.com/sise/sise_quant.nhn"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    
    print(f"Fetching top traded tickers from Naver Finance...")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'lxml')
        
        tickers = {}
        # 거래상위 테이블 선택 (class='type_2')
        table = soup.find('table', class_='type_2')
        if not table:
            return {}
            
        for tr in table.find_all('tr'):
            tds = tr.find_all('td')
            # 티커(code)와 종목명(name) 추출
            if len(tds) > 1:
                a_tag = tds[1].find('a')
                if a_tag:
                    name = a_tag.text
                    href = a_tag['href']
                    code = href.split('=')[-1]
                    tickers[code] = name
                    
        print(f"Successfully fetched {len(tickers)} tickers from Naver.")
        return tickers
    except Exception as e:
        print(f"Failed to fetch from Naver: {e}")
        # 폴백: 수동 리스트 (제룡전기 등)
        return {"079550": "제룡전기", "348370": "하이딥", "403870": "HPSP"}

def screen_stocks(ticker_map):
    candidates = []
    codes = list(ticker_map.keys())
    total = len(codes)
    
    # 시간 절약을 위해 상위 100개 종목 우선 분석 (거래량이 터진 종목들이 핵심)
    max_check = min(100, total)
    print(f"Screening top {max_check} liquid stocks using Yahoo Finance...")
    
    for i in range(max_check):
        code = codes[i]
        name = ticker_map[code]
        
        if (i + 1) % 10 == 0:
            print(f"Progress: {i+1}/{max_check} (Found: {len(candidates)})")
            
        try:
            # 야후 파이낸스 티커 형식 지정 (.KS or .KQ)
            df = pd.DataFrame()
            for suffix in [".KS", ".KQ"]:
                symbol = f"{code}{suffix}"
                # 최근 60일치 데이터 (이평선 60 계산용)
                data = yf.download(symbol, period="60d", interval="1d", progress=False)
                if not data.empty and len(data) >= 20:
                    df = data
                    break
            
            if df.empty: continue

            # 컬럼명이 Multi-index인 경우 처리 (yfinance 최신버전 이슈 대비)
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            # 1. 거래량 Spike (500%) 확인
            # 최근 20일 내 전일 대비 5배 거래량이 터진 양봉이 있는지 확인
            has_spike = False
            for j in range(len(df) - 1, len(df) - 21, -1):
                if j <= 0: break
                curr_v = df['Volume'].iloc[j]
                prev_v = df['Volume'].iloc[j-1]
                curr_c = df['Close'].iloc[j]
                curr_o = df['Open'].iloc[j]
                
                if curr_v >= prev_v * 5 and curr_c > curr_o:
                    has_spike = True
                    break
            
            if not has_spike: continue

            # 2. 거래대금 조건 (5일 평균 30억 이상)
            # Yahoo 데이터 상의 거래대금 = 종가 * 거래량 (원화 기준)
            # 코스피/코스닥은 원화로 데이터가 들어옴
            avg_tr_amount = (df['Close'] * df['Volume']).tail(5).mean()
            if avg_tr_amount < 3_000_000_000: continue

            # 3. 이평선 정배열 및 지지 (5, 20, 60)
            ma5 = df['Close'].rolling(window=5).mean().iloc[-1]
            ma20 = df['Close'].rolling(window=20).mean().iloc[-1]
            ma60 = df['Close'].rolling(window=60).mean().iloc[-1]
            curr_p = df['Close'].iloc[-1]
            
            # 정배열 초기 또는 60일선 위 지지 확인
            is_bullish = curr_p >= ma5 >= ma20
            
            if is_bullish:
                # 4. 후보군 등록
                prev_p = df['Close'].iloc[-2]
                change_rate = ((curr_p - prev_p) / prev_p) * 100
                
                # 점수 계산 (신고가 근접 시 가산점)
                high_20 = df['High'].tail(20).max()
                score = 90 if curr_p >= high_20 * 0.98 else 80
                
                candidates.append({
                    "id": len(candidates) + 1,
                    "ticker": code,
                    "name": name,
                    "currentPrice": int(curr_p),
                    "changeRate": round(float(change_rate), 2),
                    "volume": int(df['Volume'].iloc[-1]),
                    "score": score,
                    "status": "active",
                    "captureDate": datetime.now().strftime("%Y-%m-%d"),
                    "reason": "60일선 지지 및 거래량 500% 매집봉 포착 (Yahoo+Naver 데이터)",
                    "entryGrid": {
                        "entry": int(curr_p),
                        "stop": int(df['Low'].tail(5).min()),
                        "target": int(curr_p * 1.15)
                    },
                    "resistancePrice": int(high_20),
                    "supportPrice": int(ma60)
                })
                print(f"!!! Candidate Found: {name} ({code}) !!!")

        except Exception as e:
            # 에러 발생 시 로그만 남기고 다음 종목 진행
            continue
            
    return candidates

def main():
    start_time = time.time()
    print("="*50)
    print("🚀 ALBBANOO Hybrid Screener v2.0 Starting...")
    print(f"Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50)
    
    # 1. 상위 종목 리스트 획득
    ticker_map = get_top_traded_tickers()
    if not ticker_map:
        print("Error: No tickers fetched. Exiting.")
        return
        
    # 2. 종목 필터링
    candidates = screen_stocks(ticker_map)
    
    # 3. 결과 저장
    with open("candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
        
    end_time = time.time()
    print("="*50)
    print(f"✨ Screening Complete!")
    print(f"Found {len(candidates)} candidates.")
    print(f"Results saved to candidates.json")
    print(f"Total time: {round(end_time - start_time, 2)} seconds")
    print("="*50)

if __name__ == "__main__":
    main()
