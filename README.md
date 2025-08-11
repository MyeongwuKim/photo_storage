## **Photo Storage**
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 5 55 24" src="https://github.com/user-attachments/assets/03720509-9520-43e6-8f20-8efb5d0397da" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 5 55 58 (1)" src="https://github.com/user-attachments/assets/d346dd1a-535e-4157-b4e2-a8e2f0d59196" />

## 프로젝트 개요

사진, 동영상, 글을 저장하기 위해 만든 블로그형 웹 사이트(풀스택,반응형)

**사진 저장소** | 개인 프로젝트

**사용 기술** | Next.js, React, Typescript, Tailwind.css, Prisma, React-query, Redux, MongoDB

## 프로젝트 상세기능

<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 04 35" src="https://github.com/user-attachments/assets/1dd5394d-c6e0-4bcd-8e74-19dd98726f87" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 04 22" src="https://github.com/user-attachments/assets/7c0b86e9-f5a5-4a59-8f5e-0f4c4e3b229b" />

### **로그인**

- Next-auth를 활용한 oAuth
- 간단하게 카카오톡 아이디로 로그인 할 수 있는 기능을 제공함
  
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 12 26" src="https://github.com/user-attachments/assets/dde6fdb7-a858-4a13-bdc5-516094242b48" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 23 58" src="https://github.com/user-attachments/assets/24e009b6-2525-4a6f-8784-1d1c25bde3d6" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 18 26" src="https://github.com/user-attachments/assets/61dc1aef-4066-463e-b588-d52df9220d7a" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 18 04" src="https://github.com/user-attachments/assets/68f3261e-0c9a-4a18-98d4-481c96bf4b2d" />

### **업로드**

- 드래그 앤 드롭으로 이미지와 동영상을 쉽게 업로드할 수 있도록 구현함(Cloudflare에 업로드)
- React 기반(Flowbite) 슬라이더 컴포넌트를 활용해 업로드한 파일을 미리 볼 수 있으며 순서 변경이 가능함
- Google Maps API를 연동해 사진이나 동영상 촬영 위치 정보를 검색하고 입력할 수 있음
- 이미지, 동영상에 대한 촬영 날짜, 태그, 코멘트, 별점을 기록할수 있게 함
  
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 6 47 47" src="https://github.com/user-attachments/assets/09b4f215-956d-4464-a83b-eed508f94618" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 7 08 53" src="https://github.com/user-attachments/assets/5fdc0113-1e94-4c53-b752-ea0b12668965" />

### 피드

- 전체,사진,동영상,태그,좋아요 순으로 탭버튼을 눌러 필터링 된 리스트를 볼수 있게 함(무한 스크롤)
- prefetchInfiniteQuery를 활용해 무한 스크롤 데이터를 사전에 캐싱하고, 페이지를 넘길 때 끊김 없이 빠르고 부드러운 데이터 로딩 경험을 제공하도록 구현함
- 생성,촬영 순으로 날짜를 필터링 할 수 있음
  
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 7 42 11" src="https://github.com/user-attachments/assets/f17b23d2-2bc4-4ee9-9cae-5f4efe2b3224" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 7 42 21" src="https://github.com/user-attachments/assets/a5e337a3-86df-4d57-9985-7a90f805ee8b" />
 
### **피드 디테일**

- 업로드한 파일들을 좋아요 및 게시물 삭제를 할수 있고 슬라이더 뷰로 감상이 가능
- react-query의 캐시 조작(cache manipulation) 기능을 활용해, 하트 클릭 시 서버에 성공적으로 반영된 후에는 전체 데이터를 다시 불러오는 대신, 해당 아이템에 대한 캐시 데이터를 직접 업데이트 하여 UI를 즉시 반영하도록 구현함
- 입력한 정보를 뷰의 바텀에서 확인이 가능(날짜,코멘트,태그,점수,구글맵)
  
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 14 20" src="https://github.com/user-attachments/assets/9f01560b-c8a2-4031-8e23-083508b220ee" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 13 59" src="https://github.com/user-attachments/assets/215f960e-7d24-4cc8-a802-04939d272945" />

### **피드 검색**

- 업로드 된 게시물을 태그,코멘트,위치 키워드로 필터링하여 검색할수 있음
  
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 23 52" src="https://github.com/user-attachments/assets/46776415-d62b-4678-8c6b-0f3d14c0d719" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 18 37" src="https://github.com/user-attachments/assets/fead9b4c-06e7-4bbf-8458-6c4be2cbf946" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 18 57" src="https://github.com/user-attachments/assets/8d578120-39d8-46ca-aa35-391389523771" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 20 37" src="https://github.com/user-attachments/assets/c580e0cd-a916-4585-915e-c78f178bb369" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 18 30" src="https://github.com/user-attachments/assets/95d0a0ff-6de6-48dc-adbc-6224d690fd0f" />
<img width="240" height="240" alt="스크린샷 2025-08-10 오후 9 19 14" src="https://github.com/user-attachments/assets/f51e9467-6a5c-472c-a666-3d16fd7ebb67" />

### **화면 구성 및 테마**

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
