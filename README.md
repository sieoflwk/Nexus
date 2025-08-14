# Nexus - Applicant Tracking System

React로 구축된 현대적인 지원자 추적 시스템입니다.

## 🚀 주요 기능

- **대시보드**: Chart.js 기반 인터랙티브 차트 및 성과 지표
- **지원자 관리**: 지원자 추가, 조회, 상태 업데이트
- **필터링 및 검색**: 상태별 필터링 및 이름/이메일/직책 검색
- **실시간 통계**: 지원자 추세, 파이프라인 분포, 직책별 분포
- **최근 활동**: 실시간 활동 피드 및 빠른 액션
- **반응형 디자인**: 모바일 및 데스크톱 최적화
- **로컬 스토리지**: 데이터 영속성 보장

## 🛠️ 기술 스택

- **Frontend**: React 18
- **Styling**: CSS3 (Apple 스타일 디자인)
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: React Hooks
- **Build Tool**: Create React App
- **Deployment**: Vercel

## 📦 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 또는 GitHub 연동 후 자동 배포
```

## 🏗️ 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Header.js       # 네비게이션 헤더
│   ├── DashboardView.js # 대시보드 뷰
│   ├── CandidatesView.js # 지원자 목록 뷰
│   ├── UploadView.js   # 파일 업로드 뷰
│   ├── AddCandidateModal.js # 지원자 추가 모달
│   ├── UploadModal.js  # 업로드 모달
│   └── ViewCandidateModal.js # 지원자 상세 모달
├── App.js              # 메인 앱 컴포넌트
├── index.js            # 앱 진입점
└── index.css           # 전역 스타일
```

## 🎨 디자인 특징

- **Apple 스타일**: 깔끔하고 직관적인 UI/UX
- **반응형**: 모든 디바이스에서 최적화된 경험
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **성능**: 최적화된 렌더링 및 상태 관리

## 📱 지원 기능

- 지원자 추가/수정/삭제
- 상태별 필터링 (Applied, Reviewing, Interview, Rejected, Hired)
- 실시간 검색
- 데이터 내보내기 준비
- 파일 업로드 (CSV, Excel, PDF)

## 🔧 환경 설정

### 환경 변수

```bash
# .env 파일 생성 (필요시)
REACT_APP_API_URL=your_api_url
REACT_APP_ENV=development
```

### 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 데이터 구조

```javascript
const candidate = {
  id: number,
  name: string,
  email: string,
  phone: string,
  position: string,
  experience: string,
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'hired',
  appliedDate: string, // ISO date string
  source: string
};
```

## 🚀 배포

### Vercel 자동 배포

1. GitHub 저장소를 Vercel에 연결
2. 빌드 설정 확인 (`npm run build`)
3. 자동 배포 활성화

### 수동 배포

```bash
npm run build
vercel --prod
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
