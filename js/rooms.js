// ============================================================
// js/rooms.js — غرف المذاكرة الجماعية (Study Rooms / Focus Rooms)
// يعتمد على: firebase-app-compat.js + firebase-database-compat.js + firebase-config.js
// لازم يتحمّل بعد app.js (محتاج G, uid, showToast, AVATAR_TYPES, today)
// ============================================================

(function () {
    const ROOM_CODE_LEN = 6;
    const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // من غير 0/O/1/I عشان مايتلخبطش
    const CAPACITY = 6;
    const GRACE_MS = 45000;      // فترة السماح قبل ما نعتبر حد "خرج فعلاً" بعد قفل التاب
    const HEARTBEAT_MS = 15000;  // كل قد ايه أبعت "لسه موجود + بذاكر ولا لأ"
    const JANITOR_MS = 20000;    // كل قد ايه نفحص وننضف الأعضاء المنقطعين

    let db = null;
    let fbReady = false;
    try {
        if (window.firebase && window.firebaseConfig && !String(window.firebaseConfig.apiKey || '').includes('PASTE')) {
            if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
            db = firebase.database();
            fbReady = true;
            console.log('[Room] Firebase initialized OK, databaseURL=', window.firebaseConfig.databaseURL);
        } else {
            console.warn('[Room] Firebase NOT ready. window.firebase=', !!window.firebase, 'window.firebaseConfig=', window.firebaseConfig);
        }
    } catch (e) { console.error('Room Firebase init failed:', e); }

    const St = {
        code: null,
        memberId: null,
        membersRef: null,
        heartbeatTimer: null,
        janitorTimer: null,
        period: 'today',
        lastMembers: {}
    };

    // ── Helpers ──
    function todayKey() { return new Date().toISOString().slice(0, 10); }
    function last7Days() {
        const arr = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            arr.push(d.toISOString().slice(0, 10));
        }
        return arr;
    }
    function genCode() {
        let c = '';
        for (let i = 0; i < ROOM_CODE_LEN; i++) c += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
        return c;
    }
    function fmtMins(m) {
        m = Math.max(0, Math.round(m || 0));
        if (m < 60) return m + ' د';
        const h = Math.floor(m / 60), mm = m % 60;
        return h + 'س' + (mm ? ' ' + mm + 'د' : '');
    }
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function currentStudyStatus() {
        try { return (G && G.pomo && G.pomo.running && G.pomo.mode === 'focus') ? 'studying' : 'online'; }
        catch (e) { return 'online'; }
    }
    function ensureReady() {
        if (!fbReady) {
            showToast('غرف المذاكرة محتاجة إعداد Firebase الأول (راجع js/firebase-config.js)');
            return false;
        }
        return true;
    }

    // ── Create ──
    async function createRoom() {
        if (!ensureReady()) return;
        const btn = document.getElementById('room-create-btn');
        if (btn) btn.disabled = true;
        try {
            let code, exists = true, tries = 0;
            do {
                code = genCode();
                const snap = await db.ref('rooms/' + code).get();
                exists = snap.exists();
                tries++;
            } while (exists && tries < 8);
            if (exists) { showToast('حصل خطأ بسيط، جرب تاني'); return; }

            const memberId = uid();
            await db.ref('rooms/' + code).set({
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                members: {
                    [memberId]: {
                        name: (G.data && G.data.name) || 'مستخدم',
                        avatarType: (G.data && G.data.avatarType) || 'boy',
                        status: 'online',
                        lastSeen: firebase.database.ServerValue.TIMESTAMP,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    }
                }
            });
            enterRoom(code, memberId);
        } catch (e) {
            console.error(e); showToast('مقدرناش ننشئ الغرفة، جرب تاني');
        } finally { if (btn) btn.disabled = false; }
    }

    // ── Join ──
    async function joinRoom(rawCode) {
        console.log('[Room] joinRoom called, fbReady=', fbReady);
        if (!ensureReady()) return;
        // بنشيل أي حاجة مش حرف/رقم إنجليزي (مسافات، حروف اتجاه مخفية بسبب الصفحة العربية، إلخ)
        const code = (rawCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        console.log('[Room] cleaned code =', JSON.stringify(code), 'length=', code.length);
        if (code.length !== ROOM_CODE_LEN) { showToast('الكود لازم يكون 6 خانات بالظبط — تأكد إنك ناسخه بزرار النسخ 📋'); return; }
        const btn = document.getElementById('room-join-btn');
        if (btn) btn.disabled = true;
        try {
            const memberId = uid();
            console.log('[Room] attempting transaction on rooms/' + code + '/members, memberId=', memberId);
            const membersRef = db.ref('rooms/' + code + '/members');
            const result = await membersRef.transaction(current => {
                console.log('[Room] transaction fn called with current=', current);
                if (current === null) return; // الغرفة مش موجودة -> نلغي المعاملة
                const keys = Object.keys(current);
                if (keys.length >= CAPACITY) return; // الغرفة كاملة -> نلغي المعاملة
                current[memberId] = {
                    name: (G.data && G.data.name) || 'مستخدم',
                    avatarType: (G.data && G.data.avatarType) || 'boy',
                    status: 'online',
                    lastSeen: firebase.database.ServerValue.TIMESTAMP,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP
                };
                return current;
            });

            console.log('[Room] transaction result: committed=', result.committed, 'snapshot=', result.snapshot.val());

            if (!result.committed) {
                const existing = result.snapshot.val();
                showToast(existing === null ? 'الغرفة مش موجودة، اتأكد من الكود' : 'الغرفة مكتملة العدد (6 أشخاص)');
                return;
            }
            enterRoom(code, memberId);
        } catch (e) {
            console.error('[Room] joinRoom ERROR:', e, 'code:', e.code, 'message:', e.message);
            showToast('مقدرناش ندخلك الغرفة، جرب تاني');
        } finally { if (btn) btn.disabled = false; }
    }

    // ── Enter / Subscribe ──
    function enterRoom(code, memberId) {
        St.code = code; St.memberId = memberId;
        localStorage.setItem('df_room', JSON.stringify({ code, memberId }));
        subscribeRoom();
        showRoomView();
        showToast('دخلت غرفة ' + code + ' ✓');
    }

    function subscribeRoom() {
        if (!St.code || !db) return;
        const myRef = db.ref('rooms/' + St.code + '/members/' + St.memberId);
        myRef.onDisconnect().update({ status: 'offline', lastSeen: firebase.database.ServerValue.TIMESTAMP });
        myRef.update({ status: currentStudyStatus(), lastSeen: firebase.database.ServerValue.TIMESTAMP });

        if (St.membersRef) St.membersRef.off();
        St.membersRef = db.ref('rooms/' + St.code + '/members');
        St.membersRef.on('value', snap => {
            St.lastMembers = snap.val() || {};
            if (St.code && St.memberId && !St.lastMembers[St.memberId]) {
                // اتشلنا من الغرفة (مثلاً اتعتبرنا خارجين) -> نرجع للوبي بهدوء
                leaveRoomLocal();
                showToast('طلعت من الغرفة');
                return;
            }
            renderRoomMembers();
        });

        clearInterval(St.heartbeatTimer);
        St.heartbeatTimer = setInterval(() => {
            if (!St.code || !db) return;
            db.ref('rooms/' + St.code + '/members/' + St.memberId).update({
                status: currentStudyStatus(),
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }, HEARTBEAT_MS);

        clearInterval(St.janitorTimer);
        St.janitorTimer = setInterval(janitorSweep, JANITOR_MS);
    }

    // أي عضو متصل بينضف الأعضاء المنقطعين لوحده (مفيش سيرفر مركزي في الخطة المجانية)
    async function janitorSweep() {
        if (!St.code || !db) return;
        try {
            const snap = await db.ref('rooms/' + St.code + '/members').get();
            const members = snap.val() || {};
            const now = Date.now();
            const updates = {};
            Object.entries(members).forEach(([id, m]) => {
                if (id === St.memberId) return;
                if (m.status === 'offline' && m.lastSeen && (now - m.lastSeen) > GRACE_MS) updates[id] = null;
            });
            if (Object.keys(updates).length === 0) return;
            await db.ref('rooms/' + St.code + '/members').update(updates);
            const remaining = Object.keys(members).filter(id => !(id in updates));
            if (remaining.length === 0) await db.ref('rooms/' + St.code).remove();
        } catch (e) { /* مش critical، هنحاول تاني بعد شوية */ }
    }

    // ── Leave ──
    async function leaveRoom() {
        if (!St.code || !St.memberId || !db) { leaveRoomLocal(); return; }
        const code = St.code, memberId = St.memberId;
        try {
            await db.ref('rooms/' + code + '/members/' + memberId).onDisconnect().cancel();
            await db.ref('rooms/' + code + '/members/' + memberId).remove();
            const snap = await db.ref('rooms/' + code + '/members').get();
            const remaining = snap.val();
            if (!remaining || Object.keys(remaining).length === 0) await db.ref('rooms/' + code).remove();
        } catch (e) { console.error(e); }
        leaveRoomLocal();
        showToast('خرجت من الغرفة');
    }

    function leaveRoomLocal() {
        if (St.membersRef) { St.membersRef.off(); St.membersRef = null; }
        clearInterval(St.heartbeatTimer); clearInterval(St.janitorTimer);
        St.code = null; St.memberId = null; St.lastMembers = {};
        localStorage.removeItem('df_room');
        showLobbyView();
    }

    // ── Sync study minutes (بيتنادى من app.js لما جلسة مذاكرة تتسجل) ──
    function addMinutes(minutes) {
        if (!St.code || !St.memberId || !db || !minutes || minutes <= 0) return;
        db.ref('rooms/' + St.code + '/members/' + St.memberId + '/days/' + todayKey())
            .transaction(cur => (cur || 0) + minutes);
    }

    // ── Rendering ──
    function renderRoomMembers() {
        const grid = document.getElementById('room-members-grid');
        if (!grid) return;
        const members = St.lastMembers || {};
        const days = St.period === 'today' ? [todayKey()] : last7Days();

        const list = Object.entries(members).map(([id, m]) => {
            const dayMap = m.days || {};
            const mins = days.reduce((s, d) => s + (dayMap[d] || 0), 0);
            return { id, m, mins };
        });
        list.sort((a, b) => b.mins - a.mins);

        if (list.length === 0) {
            grid.innerHTML = '<p style="color:var(--tm)">مفيش حد جوه الغرفة دلوقتي</p>';
            return;
        }

        grid.innerHTML = list.map((item, idx) => {
            const m = item.m;
            const isMe = item.id === St.memberId;
            const at = (window.AVATAR_TYPES && AVATAR_TYPES[m.avatarType]) || (window.AVATAR_TYPES && AVATAR_TYPES.boy) || { color: '#3b82f6', icon: '' };
            const statusClass = m.status === 'studying' ? 'studying' : (m.status === 'offline' ? 'offline' : 'online');
            const statusLabel = m.status === 'studying' ? 'بيذاكر دلوقتي' : (m.status === 'offline' ? 'مش متصل' : 'أونلاين');
            const rankBadge = item.mins > 0 ? `<div class="room-member-rank ${idx === 0 ? 'rank-1' : ''}">#${idx + 1}</div>` : '';
            return `
            <div class="room-member-card ${isMe ? 'me' : ''}">
                ${rankBadge}
                <div class="room-member-top">
                    <div class="room-member-avatar" style="color:${at.color}">${at.icon}</div>
                    <span class="room-status-dot ${statusClass}" title="${statusLabel}"></span>
                </div>
                <div class="room-member-name">${escapeHtml(m.name)}${isMe ? ' (انت)' : ''}</div>
                <div class="room-member-status-label">${statusLabel}</div>
                <div class="room-member-mins"><i data-lucide="flame"></i> ${fmtMins(item.mins)}</div>
            </div>`;
        }).join('');

        if (window.lucide) lucide.createIcons();
    }

    function showLobbyView() {
        document.getElementById('rooms-lobby')?.classList.remove('hidden');
        document.getElementById('rooms-active')?.classList.add('hidden');
    }
    function showRoomView() {
        document.getElementById('rooms-lobby')?.classList.add('hidden');
        document.getElementById('rooms-active')?.classList.remove('hidden');
        const disp = document.getElementById('room-code-display');
        if (disp) disp.textContent = St.code;
    }

    // ── Rejoin after refresh ──
    function tryRejoin() {
        if (!fbReady) return;
        const raw = localStorage.getItem('df_room');
        if (!raw) return;
        try {
            const { code, memberId } = JSON.parse(raw);
            if (!code || !memberId) { localStorage.removeItem('df_room'); return; }
            db.ref('rooms/' + code + '/members/' + memberId).get().then(snap => {
                if (snap.exists()) {
                    St.code = code; St.memberId = memberId;
                    subscribeRoom();
                    showRoomView();
                } else {
                    localStorage.removeItem('df_room');
                }
            }).catch(() => { });
        } catch (e) { localStorage.removeItem('df_room'); }
    }

    // ── Wire up UI ──
    function initRoomsUI() {
        document.getElementById('room-create-btn')?.addEventListener('click', createRoom);
        const codeInput = document.getElementById('room-code-input');
        // تنضيف حي وقت الكتابة/اللصق: حروف وأرقام إنجليزي بس، وتحويل تلقائي لحروف كبيرة
        codeInput?.addEventListener('input', () => {
            const clean = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LEN);
            if (clean !== codeInput.value) codeInput.value = clean;
        });
        document.getElementById('room-join-btn')?.addEventListener('click', () => joinRoom(codeInput ? codeInput.value : ''));
        codeInput?.addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(codeInput.value); });
        document.getElementById('room-leave-btn')?.addEventListener('click', () => {
            if (confirm('متأكد عايز تخرج من الغرفة؟')) leaveRoom();
        });
        document.getElementById('room-copy-btn')?.addEventListener('click', () => {
            if (!St.code) return;
            navigator.clipboard?.writeText(St.code).then(() => showToast('اتنسخ الكود ✓')).catch(() => { });
        });
        document.querySelectorAll('.room-period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.room-period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                St.period = btn.dataset.period;
                renderRoomMembers();
            });
        });
        tryRejoin();
    }

    document.addEventListener('DOMContentLoaded', initRoomsUI);

    window.RoomModule = { addMinutes, createRoom, joinRoom, leaveRoom };
})();