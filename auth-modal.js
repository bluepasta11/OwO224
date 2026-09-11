/* =====================================================================
   OWO GUILD - 관리자 로그인 / 비번 변경 커스텀 모달
   =====================================================================
   브라우저 기본 prompt() 대신, 사이트 톤에 맞는 팝업창으로 로그인/비번
   변경을 처리합니다. firebase-config.js가 먼저 로드되어 있어야 합니다.
   ===================================================================== */

function ensureLoginModal() {
    if (document.getElementById('login-modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'login-modal-overlay';
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;z-index:1002;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1e1e1e;border:1px solid #f1c40f;border-radius:10px;max-width:340px;width:100%;padding:24px;color:#e0e0e0;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
            <h2 style="color:#f1c40f;margin-bottom:14px;font-size:1.15rem;">🔐 관리자 로그인</h2>
            <input id="login-pw-input" type="password" placeholder="비밀번호 입력" style="width:100%;padding:10px;margin-bottom:6px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;box-sizing:border-box;">
            <p id="login-error-msg" style="color:#e74c3c;font-size:0.8rem;min-height:1.2em;margin-bottom:8px;"></p>
            <div style="display:flex; gap:10px;">
                <button id="login-submit-btn" style="flex:1;padding:10px;background:#f1c40f;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">로그인</button>
                <button id="login-cancel-btn" style="flex:0 0 80px;padding:10px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer;">취소</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const submit = async () => {
        const pwInput = document.getElementById('login-pw-input');
        const errorMsg = document.getElementById('login-error-msg');
        const pw = pwInput.value;
        const current = await getSharedAdminPassword();
        if (pw === current) {
            errorMsg.textContent = '';
            overlay.style.display = 'none';
            const cb = window.__loginSuccessCallback;
            window.__loginSuccessCallback = null;
            if (cb) cb();
        } else {
            errorMsg.textContent = '비밀번호가 틀렸습니다.';
        }
    };

    overlay.querySelector('#login-submit-btn').addEventListener('click', submit);
    overlay.querySelector('#login-pw-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
    });
    overlay.querySelector('#login-cancel-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
        window.__loginSuccessCallback = null;
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            window.__loginSuccessCallback = null;
        }
    });
}

// onSuccess: 로그인 성공 시 실행할 콜백 (각 페이지의 관리자 모드 진입 로직)
function openLoginModal(onSuccess) {
    ensureLoginModal();
    document.getElementById('login-pw-input').value = '';
    document.getElementById('login-error-msg').textContent = '';
    window.__loginSuccessCallback = onSuccess;
    const overlay = document.getElementById('login-modal-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('login-pw-input').focus(), 50);
}

/* ===================== 비밀번호 변경 모달 ===================== */

function ensureChangePwModal() {
    if (document.getElementById('change-pw-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'change-pw-overlay';
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;z-index:1002;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1e1e1e;border:1px solid #f1c40f;border-radius:10px;max-width:340px;width:100%;padding:24px;color:#e0e0e0;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
            <h2 style="color:#f1c40f;margin-bottom:14px;font-size:1.15rem;">🔒 관리자 비번 변경</h2>
            <label style="font-size:0.8rem;color:#aaa;">현재 비밀번호</label>
            <input id="cpw-current" type="password" style="width:100%;padding:9px;margin:6px 0 12px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;box-sizing:border-box;">
            <label style="font-size:0.8rem;color:#aaa;">새 비밀번호</label>
            <input id="cpw-new" type="password" style="width:100%;padding:9px;margin:6px 0 12px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;box-sizing:border-box;">
            <label style="font-size:0.8rem;color:#aaa;">새 비밀번호 확인</label>
            <input id="cpw-confirm" type="password" style="width:100%;padding:9px;margin:6px 0 6px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;box-sizing:border-box;">
            <p id="cpw-error-msg" style="color:#e74c3c;font-size:0.8rem;min-height:1.2em;margin-bottom:8px;"></p>
            <div style="display:flex; gap:10px;">
                <button id="cpw-save-btn" style="flex:1;padding:10px;background:#f1c40f;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">변경하기</button>
                <button id="cpw-cancel-btn" style="flex:0 0 80px;padding:10px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer;">취소</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#cpw-cancel-btn').addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
    overlay.querySelector('#cpw-save-btn').addEventListener('click', async () => {
        const errorMsg = document.getElementById('cpw-error-msg');
        const currentPw = document.getElementById('cpw-current').value;
        const newPw = document.getElementById('cpw-new').value;
        const confirmPw = document.getElementById('cpw-confirm').value;

        const actual = await getSharedAdminPassword();
        if (currentPw !== actual) {
            errorMsg.textContent = '현재 비밀번호가 일치하지 않습니다.';
            return;
        }
        if (!newPw || newPw.trim() === '') {
            errorMsg.textContent = '올바른 비밀번호를 입력해주세요.';
            return;
        }
        if (newPw !== confirmPw) {
            errorMsg.textContent = '새 비밀번호가 서로 일치하지 않습니다.';
            return;
        }

        await setSharedAdminPassword(newPw.trim());
        overlay.style.display = 'none';
        alert('관리자 비밀번호가 성공적으로 변경되었습니다! (모든 길드원 기기에 적용됩니다)');
    });
}

function openChangePwModal() {
    ensureChangePwModal();
    document.getElementById('cpw-current').value = '';
    document.getElementById('cpw-new').value = '';
    document.getElementById('cpw-confirm').value = '';
    document.getElementById('cpw-error-msg').textContent = '';
    document.getElementById('change-pw-overlay').style.display = 'flex';
}
