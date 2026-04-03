from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os
import sys

app = Flask(__name__)
CORS(app) # 프론트엔드 통신 허용

@app.route('/api/run', methods=['POST'])
def run_brain_off():
    """통합 엔진(brain_off_main.py)을 백그라운드에서 실행"""
    print("🚀 [API] Triggering Brain-Off v2.1 Engine...")
    
    try:
        # OS에 맞는 파이썬 실행 파일 확인
        python_exe = sys.executable or "python"
        
        # 백그라운드 프로세스로 실행 (Popen 사용)
        # Windows에서는 보이지 않는 창으로 실행되도록 설정 가능
        process = subprocess.Popen(
            [python_exe, "brain_off_main.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        return jsonify({
            "status": "success",
            "message": "통합 엔진이 백그라운드에서 실행되었습니다. 잠시 후 데이터가 갱신됩니다.",
            "pid": process.pid
        }), 200
        
    except Exception as e:
        print(f"❌ Error triggering engine: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """시스템 상태 간단 확인"""
    return jsonify({
        "system": "BRAIN-OFF 2.0",
        "version": "v2.1",
        "server_status": "Running"
    }), 200

if __name__ == "__main__":
    # 포트 5000에서 실행 (기존 mcp 서버 포트 유지하여 프론트엔드 호환성 확보)
    print("✨ BRAIN-OFF 2.0 Backend UI Trigger Server Active on Port 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
