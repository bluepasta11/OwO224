/* =====================================================================
   OWO GUILD - 공통 UI 유틸리티
   =====================================================================
   - showToast(): alert() 대신 쓰는 부드러운 알림 토스트
   - getGuildMemberNames(): index.html에 저장된 길드원 명단(Firebase
     main/sidebar)을 파싱해서 이름 배열로 돌려줌 (map.html 드롭다운 등에서 사용)
   ===================================================================== */

function ensureToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:100%;padding:0 16px;box-sizing:border-box;";
    document.body.appendChild(container);
}

// type: 'success' | 'error'
function showToast(message, type) {
    ensureToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.style.cssText = `
        background:${isError ? '#c0392b' : '#1e1e1e'};
        color:#fff;
        border:1px solid ${isError ? '#e74c3c' : '#f1c40f'};
        padding:12px 20px;
        border-radius:8px;
        font-size:0.9rem;
        font-weight:bold;
        box-shadow:0 4px 14px rgba(0,0,0,0.5);
        opacity:0;
        transform:translateY(10px);
        transition:opacity 0.25s ease, transform 0.25s ease;
        max-width:90vw;
        text-align:center;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

// index.html의 길드원 명단(main/sidebar)을 읽어서 이름 배열을 돌려줍니다.
function getGuildMemberNames() {
    return db.ref('main/sidebar').once('value').then((snapshot) => {
        const html = snapshot.val();
        if (!html) return [];
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const names = [];
        temp.querySelectorAll('.member-item .editable-field').forEach((el) => {
            const name = el.textContent.trim();
            if (name) names.push(name);
        });
        temp.querySelectorAll('.officer-card .officer-name').forEach((el) => {
            const name = el.textContent.trim();
            if (name && !names.includes(name)) names.push(name);
        });
        return names;
    }).catch(() => []);
}

/* 데이터 로딩 스켈레톤: Firebase에서 첫 데이터가 올 때까지 살짝 흐리게 보여줌 */
function markLoading(el) {
    if (!el) return;
    el.style.transition = 'opacity 0.3s ease';
    el.style.opacity = '0.35';
}

function markLoaded(el) {
    if (!el) return;
    el.style.opacity = '1';
}

// Firebase가 응답하지 않는 경우를 대비한 안전장치: 일정 시간 후 강제로 보이게 함
function revealAfterTimeout(el, ms) {
    setTimeout(() => markLoaded(el), ms || 3000);
}
