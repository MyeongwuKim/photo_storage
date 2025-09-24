# PhotoStorage(1인개발)
> Next.js + Prisma + MongoDB 기반 블로그형 사진,영상 저장소

🔗 **Deployment URL**  
👉 [https://mw-simpleblog.vercel.app](https://mw-simpleblog.vercel.app)  

---

## 📌 Summary
- Next.js와 React, React-query 학습 겸 제작한 1인으로 진행한 사이드 프로젝트 
- **Prisma + MongoDB**를 사용해 게시글, 좋아요, 태그 모델링 및 데이터 관리  
- **주요 기능**
  - 클라우드 플레어에 영상 및 사진 업로드
  - GoogleMap API를 활용하여 촬영한 장소 마킹
  - 포스팅한 사진 및 영상을 슬라이드 뷰어로 감상
  - 사진 및 영상을 하트를 클릭하여 관심 포스트로 분류가능
  - 태그, 장소, 코멘트로 피드 서칭 기능
  - next-auth를 통한 oAuth 인증,인가 처리
  - 무한 스크롤 제공
 
---

## 📖 Background
전에 노마드 코더(https://nomadcoders.co)의 당근마켓 클론 코딩 강의를 수강하며 배운 경험을 바탕으로, 
Next.js와 React를 공부할 겸 사이드 프로젝트를 시작하게 되었습니다. 무엇을 만들지 고민하던 중, 
와이프가 여행을 다니며 사진을 찍는것을 좋아하기에  ‘누군가에게 서비스를 제공한다’는 동기부여가 맞물려 자연스럽게 프로젝트를 시작하게 되었습니다

---

## 💡 What I Learned
Next.js 13에서 14로 넘어오면서 **getStaticProps/getServerSideProps/getStaticPaths 대신 컴포넌트 안에서 직접 fetch할 수 있는 구조**가 인상적이었고, 결과적으로 **코드가 더 간결하고 직관적**이라는 점을 느꼈습니다.
이전 프로젝트에서는 SWR을 사용했지만 이번에는 **React Query**를 도입했습니다. SWR은 직관적이고 가벼워서 간단한 장점이 있었지만 React Query는 **Mutation, 에러 처리, 다양한 캐싱옵션, 낙관적 업데이트, 디버깅에 적합한 DevTools등** 개발자가 활용할 수 있는 기능이 훨씬 풍부했습니다**.** 덕분에 서버 상태 관리가 SWR보다 훨씬 세밀하고 안정적으로 느껴졌습니다.
CSS 측면에서는 Tailwind로 반응형 UI를 구현하면서 단순히 클래스를 붙이는 수준을 넘어 **화면 크기에 따라 자연스럽게 변하는 레이아웃 설계**를 경험했습니다.
Redux로 전역 UI(Loading, Modal, Alert)를 관리하며 **props drilling을 줄이고 구조를 단순화**하는 방법을 익혔습니다. `useContext`와 `useReducer`를 함께 활용해 **코드 가독성과 유지보수성**을 높일 수 있었습니다.

---

## 🛠 Technology Stack
- **Frontend:** Next.js 14, React, TypeScript, React Query v5, TailwindCSS, Flowbite-React  
- **Backend:** Prisma, MongoDB  
- **Testing:** MongoMemoryServer  
- **Deployment:** Vercel  

---

## ⚙️ Setup & Usage

### 1. 데모버전 체험하기
```bash
# 🚀 실행 방법
npm run demo
