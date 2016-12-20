1. Python, JDK를 다운로드합니다.
2. Python, JDK의 경로를 환경변수 Path에 설정합니다.
	- 파이썬 설치시 PATH에 추가 옵션을 선택하면 편리합니다.
3. Python 라이브러리 다운로드
	실행창을 켜 cmd상에서 입력합니다.
	> pip install --upgrade pip
	> pip install numpy
	> pip install npm
4. JPype1 다운로드
	url : http://www.lfd.uci.edu/~gohlke/pythonlibs/#jpype
	해당하는 파이썬 버전(cpxx)과 운영체제 시스템(32/64비트)에 맞는 JPype1 파일을 다운받으신 후
	실행창에서 다음 명령어를 실행합니다.
	> pip install 경로\JPype1~.whl
	ex) 파이썬 3.5버전,64비트 사용 시
		> pip install C:\user\desktop\JPype1‑0.6.1‑cp35‑cp35m‑win_amd64.whl
5. konlpy 라이브러리 다운로드
	> pip install konlpy

6. 서버 실행
	> node server.js
	http://localhost:52273에서 접속가능합니다.