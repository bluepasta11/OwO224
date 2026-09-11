/* =====================================================================
   OWO GUILD - 업데이트 내역(공지사항) 팝업
   =====================================================================
   - 사이트(index.html) 접속 시, 등록된 공지가 있고 아직 안 본 내용이면
     자동으로 팝업이 뜹니다.
   - 한번 확인하면 같은 내용은 다시 안 뜨고, 관리자가 새로 저장하면
     그때 다시 모든 길드원에게 뜹니다.
   - 관리자 로그인 상태에서 "📢 공지 편집" 버튼으로 내용을 수정합니다.
   ===================================================================== */

function ensureNoticeViewModal() {
    if (document.getElementById('notice-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'notice-overlay';
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;z-index:1000;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1e1e1e;border:1px solid #f1c40f;border-radius:10px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;padding:24px;color:#e0e0e0;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
            <h2 id="notice-title" style="color:#f1c40f;margin-bottom:14px;font-size:1.3rem;">📢 업데이트 내역</h2>
            <div id="notice-body" style="font-size:0.95rem;line-height:1.7;white-space:pre-wrap;"></div>
            <button id="notice-close-btn" style="margin-top:20px;width:100%;padding:10px;background:#f1c40f;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">확인</button>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeNoticeModal(); });
    overlay.querySelector('#notice-close-btn').addEventListener('click', closeNoticeModal);
}

function closeNoticeModal() {
    const overlay = document.getElementById('notice-overlay');
    if (overlay) {
        localStorage.setItem('owo_notice_last_seen_id', overlay.dataset.noticeId || '');
        overlay.style.display = 'none';
    }
}

function showNoticePopupIfNeeded() {
    db.ref('notice').once('value').then((snapshot) => {
        const notice = snapshot.val();
        if (!notice || !notice.content || notice.content.trim() === '') return;

        const noticeId = String(notice.updatedAt || '');
        if (localStorage.getItem('owo_notice_last_seen_id') === noticeId) return;

        ensureNoticeViewModal();
        const overlay = document.getElementById('notice-overlay');
        document.getElementById('notice-title').innerText = notice.title || '📢 업데이트 내역';
        document.getElementById('notice-body').innerHTML = (notice.content || '').replace(/\n/g, '<br>');
        overlay.dataset.noticeId = noticeId;
        overlay.style.display = 'flex';
    });
}

/* ===================== 관리자 편집 모달 ===================== */

function ensureNoticeEditModal() {
    if (document.getElementById('notice-edit-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'notice-edit-overlay';
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;z-index:1001;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1e1e1e;border:1px solid #f1c40f;border-radius:10px;max-width:480px;width:100%;padding:24px;color:#e0e0e0;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
            <h2 style="color:#f1c40f;margin-bottom:14px;font-size:1.2rem;">📢 업데이트 내역 편집</h2>
            <label style="font-size:0.85rem;color:#aaa;">제목</label>
            <input id="notice-edit-title" type="text" style="width:100%;padding:8px;margin:6px 0 14px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;box-sizing:border-box;">
            <label style="font-size:0.85rem;color:#aaa;">내용 (여러 줄 입력 가능)</label>
            <textarea id="notice-edit-content" rows="8" style="width:100%;padding:8px;margin:6px 0 16px;background:#111;border:1px solid #444;border-radius:5px;color:#fff;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
            <div style="display:flex;gap:10px;">
                <button id="notice-edit-save" style="flex:1;padding:10px;background:#f1c40f;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">저장 (모든 길드원에게 팝업)</button>
                <button id="notice-edit-cancel" style="flex:0 0 80px;padding:10px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer;">취소</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
    overlay.querySelector('#notice-edit-cancel').addEventListener('click', () => { overlay.style.display = 'none'; });
    overlay.querySelector('#notice-edit-save').addEventListener('click', () => {
        const title = document.getElementById('notice-edit-title').value.trim() || '📢 업데이트 내역';
        const content = document.getElementById('notice-edit-content').value;
        db.ref('notice').set({ title, content, updatedAt: Date.now() }).then(() => {
            alert("공지사항이 저장되었습니다! 이제 사이트 접속 시 모든 길드원에게 팝업으로 표시됩니다.");
            overlay.style.display = 'none';
        }).catch((err) => {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.");
        });
    });
}

function editNotice() {
    if (typeof isAdmin === 'undefined' || !isAdmin) {
        alert("관리자 로그인 후 이용할 수 있습니다.");
        return;
    }
    ensureNoticeEditModal();
    db.ref('notice').once('value').then((snapshot) => {
        const notice = snapshot.val() || {};
        document.getElementById('notice-edit-title').value = notice.title || '📢 업데이트 내역';
        document.getElementById('notice-edit-content').value = notice.content || '';
        document.getElementById('notice-edit-overlay').style.display = 'flex';
    });
}

window.addEventListener('load', showNoticePopupIfNeeded);
