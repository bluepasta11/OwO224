/* =====================================================================
   OWO GUILD - Firebase 공유 저장소 설정
   =====================================================================
   이 파일에 여러분의 Firebase 프로젝트 설정 값을 붙여넣어야 사이트가
   정상 동작합니다. (설정 방법은 함께 전달드린 안내를 참고하세요)

   Firebase 콘솔(https://console.firebase.google.com) >
   프로젝트 설정(⚙️) > 일반 탭 > "내 앱" > 웹앱(</>) 에서 나오는
   firebaseConfig 값을 아래에 그대로 붙여넣으면 됩니다.
   ===================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyByDPI-JInWA4_aBDmNqGksgatWk1Xf3IM",
  authDomain: "owo224-9f77e.firebaseapp.com",
  databaseURL: "https://owo224-9f77e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "owo224-9f77e",
  storageBucket: "owo224-9f77e.firebasestorage.app",
  messagingSenderId: "69386904568",
  appId: "1:69386904568:web:257840fc7fe8530bd5ec0d",
  measurementId: "G-D5YNKTGN9M"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* =====================================================================
   관리자 비밀번호 (모든 기기/브라우저에 동일하게 공유됩니다)
   기본값은 "1234" 이며, index.html의 "비번 변경" 버튼으로 바꿀 수 있습니다.
   ===================================================================== */
const DEFAULT_ADMIN_PW = "1234";

function getSharedAdminPassword() {
    return db.ref('admin/password').once('value')
        .then(snap => snap.val() || DEFAULT_ADMIN_PW)
        .catch(() => DEFAULT_ADMIN_PW);
}

function setSharedAdminPassword(newPw) {
    return db.ref('admin/password').set(newPw);
}
