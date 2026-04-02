@echo off
setlocal
cd /d "%~dp0"

echo [1/4] 알빠누 전략 스크리너 실행 중 (Stage 1: 종목 발굴)...
python screener_engine.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] 스크리너 실행 중 오류가 발생했습니다. 네트워크 또는 KIS API 설정을 확인하세요.
    pause
    exit /b %ERRORLEVEL%
)
echo [*] 종목 발굴 완료! (candidates.json 생성됨)

echo.
echo [2/4] 로컬 MCP/API 서버 시작...
start "MCP/API Server" /min cmd /k "python mcp_stock_server.py"

echo.
echo [3/4] 알빠누 웹 대시보드 실행...
start "Albbanoo Dashboard" /min cmd /k "npm run dev"

echo.
echo [*] 대시보드 접속 중 (잠시만 기다려주세요)...
timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo ======================================================
echo  알빠누 MVP 2.0 시스템이 성공적으로 시작되었습니다.
echo  브라우저에서 대시보드가 자동으로 열립니다.
echo  실시간 시세 감시를 위해 실행된 터미널 창들을 끄지 마세요.
echo ======================================================
pause
