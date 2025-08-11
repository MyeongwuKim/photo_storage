## **Photo Storage**
<img width="480" height="480" alt="스크린샷 2025-08-10 오후 5 55 24" src="https://github.com/user-attachments/assets/03720509-9520-43e6-8f20-8efb5d0397da" />
<img width="480" height="480" alt="스크린샷 2025-08-10 오후 5 55 58 (1)" src="https://github.com/user-attachments/assets/d346dd1a-535e-4157-b4e2-a8e2f0d59196" />

## 프로젝트 개요

사진, 동영상, 글을 저장하기 위해 만든 블로그형 웹 사이트(풀스택,반응형)

**사진 저장소** | 개인 프로젝트

**사용 기술** | Next.js, React, Typescript, Tailwind.css, Prisma, React-query, Redux, MongoDB

## 프로젝트 상세기능

### **로그인**

- Next-auth를 활용한 oAuth
- 간단하게 카카오톡 아이디로 로그인 할 수 있는 기능을 제공함

### **업로드**

- 드래그 앤 드롭으로 이미지와 동영상을 쉽게 업로드할 수 있도록 구현함(Cloudflare에 업로드)
- React 기반(Flowbite) 슬라이더 컴포넌트를 활용해 업로드한 파일을 미리 볼 수 있으며 순서 변경이 가능함
- Google Maps API를 연동해 사진이나 동영상 촬영 위치 정보를 검색하고 입력할 수 있음
- 이미지, 동영상에 대한 촬영 날짜, 태그, 코멘트, 별점을 기록할수 있게 함

### 피드

- 전체,사진,동영상,태그,좋아요 순으로 탭버튼을 눌러 필터링 된 리스트를 볼수 있게 함(무한 스크롤)
- prefetchInfiniteQuery를 활용해 무한 스크롤 데이터를 사전에 캐싱하고, 페이지를 넘길 때 끊김 없이 빠르고 부드러운 데이터 로딩 경험을 제공하도록 구현함
- 생성,촬영 순으로 날짜를 필터링 할 수 있음

### **피드 디테일**

- 업로드한 파일들을 좋아요 및 게시물 삭제를 할수 있고 슬라이더 뷰로 감상이 가능
- react-query의 캐시 조작(cache manipulation) 기능을 활용해, 하트 클릭 시 서버에 성공적으로 반영된 후에는 전체 데이터를 다시 불러오는 대신, 해당 아이템에 대한 캐시 데이터를 직접 업데이트 하여 UI를 즉시 반영하도록 구현함
- 입력한 정보를 뷰의 바텀에서 확인이 가능(날짜,코멘트,태그,점수,구글맵)

### **피드 검색**

- 업로드 된 게시물을 태그,코멘트,위치 키워드로 필터링하여 검색할수 있음

### 화면 구성 및 테마

- Tailwind를 통해 핸드폰과 웹 모두에서 최적화된 반응형 웹 디자인 제공
- 다크 모드와 라이트 모드 지원으로 사용자 환경 맞춤 설정 가능

### **기타**

- Modal,Toast,Loading을 Redux로 관리하여 직관적으로 사용하기 쉽게 만듬
- 존재하지 않는 페이지로 접근시 커스텀한 404페이지로 이동할수 있게 처리
- React의 ErrorBoundary를 활용해 예기치 않은 컴포넌트 에러를 포착하고, 사용자에게 친절한 에러 UI를 제공하여 앱 안정성을 높임
- Middleware를 활용해 인증되지 않은 사용자의 API 요청을 사전에 차단하여 보안성을 강화함

### **링크**

[시연 영상](https://customer-mgkas9o5mlq4q3on.cloudflarestream.com/0f00c0712a17e5723b6e23d3793e7123/watch)

[깃허브 주소](https://github.com/MyeongwuKim/photo_storage)
