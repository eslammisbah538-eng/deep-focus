/* -- إخفاء الـ bottom nav لما الكيبورد يفتح (موبايل) -- */
        (function () {
            const isMobile = () => window.matchMedia('(max-width:768px)').matches;
            const html = document.documentElement;
            let kbOpen = false;

            function setKb(open) {
                if (open === kbOpen) return;
                kbOpen = open;
                html.classList.toggle('kb-open', open);
                document.getElementById('bottom-nav')?.classList.toggle('kb-hidden', open);
            }

            /* Primary detection: visualViewport shrinks reliably when the
               keyboard opens/closes, regardless of how the keyboard was
               dismissed (blur, back button, "Done" button, swipe, etc). */
            if (window.visualViewport) {
                const vv = window.visualViewport;
                const baseHeight = vv.height;

                /* Keep the fixed body glued to the ACTUAL visible area.
                   On Chrome/Android the layout viewport already resizes
                   (thanks to interactive-widget=resizes-content), so this
                   is a no-op there. On iOS Safari (which ignores that meta
                   tag) this is what stops the AI chat input / bottom nav
                   from being hidden behind the keyboard. */
                function syncVisualViewport() {
                    html.style.setProperty('--vv-height', vv.height + 'px');
                    html.style.setProperty('--vv-top', vv.offsetTop + 'px');
                }
                vv.addEventListener('resize', syncVisualViewport);
                vv.addEventListener('scroll', syncVisualViewport);
                syncVisualViewport();

                vv.addEventListener('resize', function () {
                    if (!isMobile()) { setKb(false); return; }
                    const shrink = baseHeight - vv.height;
                    setKb(shrink > 120);
                });
            }

            /* Fallback: focus/blur, in case visualViewport isn't supported */
            document.addEventListener('focusin', function (e) {
                if (!isMobile() || window.visualViewport) return;
                if (e.target.matches && e.target.matches('input, textarea, select')) setKb(true);
            });
            document.addEventListener('focusout', function (e) {
                if (!isMobile() || window.visualViewport) return;
                if (e.target.matches && e.target.matches('input, textarea, select')) {
                    setTimeout(function () { setKb(false); }, 100);
                }
            });

            /* Safety net: force #ai-input into view on focus, regardless of
               whether the visualViewport resize event fired or not. */
            const aiInputEl = document.getElementById('ai-input');
            if (aiInputEl) {
                aiInputEl.addEventListener('focus', function () {
                    setTimeout(function () {
                        aiInputEl.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    }, 300); // بعد ما أنيميشن الكيبورد يخلص تقريباً
                });
            }
        })();

/* -- إظهار زرار إرسال شات الـ AI بس لما فيه نص مكتوب -- */
        (function () {
            const aiInput = document.getElementById('ai-input');
            const aiSend = document.getElementById('ai-send');
            if (aiInput && aiSend) {
                aiInput.addEventListener('input', function () {
                    const hasText = aiInput.value.trim().length > 0;
                    aiSend.disabled = !hasText;
                });
            }
        })();

/* -- المنطق الرئيسي للموقع كامل -- */
lucide.createIcons();

// ---- Inline safety stub ----
window.onboardingInstance = window.onboardingInstance || {
    hasShown: false,
    shouldShow: function () { return false; },
    init: function () {}
};

// Priority-based color system — color = urgency, not identity
const PRIORITY_COLORS = {
    critical: '#ef4444',   // أحمر — أقل من 3 أيام
    high: '#f97316',   // برتقالي — أسبوع (3-7 أيام)
    medium: '#eab308',   // أصفر — أسبوعين (8-14 يوم)
    low: '#22c55e',   // أخضر — بعيد / مش محدد
    done: 'transparent', // بلا لون — انتهى
};
function getSubjectColor(subject) {
    const p = getPriority(subject);
    if (p === 'done') return 'transparent';
    return PRIORITY_COLORS[p] || PRIORITY_COLORS.low;
}
const SUBJECT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
const ARABIC_QUOTES = [
    { t: 'العلم نور يُضيء عقلك وطريقك في الحياة.', a: 'مثل عربي' },
    { t: 'مَن سارَ على الدَّرب وصل، ومَن جدَّ وجَد.', a: 'مثل عربي' },
    { t: 'اطلب العلم من المهد إلى اللحد.', a: 'حديث شريف' },
    { t: 'القراءة للعقل كالتمرين للجسد.', a: 'جوزيف أديسون' },
    { t: 'من لم يذق مرَّ التعلم ساعةً، تجرّع ذلَّ الجهل طولَ حياته.', a: 'الشافعي' },
    { t: 'الوقت كالسيف إن لم تقطعه قطعك.', a: 'مثل عربي' },
    { t: 'أعظم المكاسب العلم، وأعظم المصائب الجهل.', a: 'علي بن أبي طالب' },
    { t: 'النجاح حليف من يصبر ويجتهد، فلا تستسلم.', a: 'فكرة' },
];
const SOUND_DEFS = [
    { id: 'rain', name: 'مطر', desc: 'مطر خفيف على النافذة', color: 'var(--p)', vol: 70, icon: 'cloud-rain' },
    { id: 'ocean', name: 'أمواج البحر', desc: 'أمواج بحرية مهدئة', color: 'var(--p)', vol: 60, icon: 'waves' },
    { id: 'nature', name: 'طبيعة', desc: 'أصوات الغابة والطيور', color: 'var(--p)', vol: 65, icon: 'leaf' },
    { id: 'cafe', name: 'كافيه', desc: 'أجواء المقهى', color: 'var(--p)', vol: 55, icon: 'coffee' },
    { id: 'fire', name: 'مدفأة', desc: 'نار متقدة دافئة', color: 'var(--p)', vol: 60, icon: 'flame' },
    { id: 'lofi', name: 'لو-فاي', desc: 'موسيقى دراسة هادئة', color: 'var(--p)', vol: 50, icon: 'music' },
    { id: 'night', name: 'أصوات الليل', desc: 'صراصير وهدوء الليل', color: 'var(--p)', vol: 55, icon: 'moon' },
];
const PRESETS = { focus: { rain: 60, lofi: 40 }, relax: { ocean: 70, nature: 50 }, cafe: { cafe: 75, lofi: 35 }, nature: { nature: 70, rain: 40 }, night: { night: 70, fire: 50 } };
const AVATAR_TYPES = {
    boy: {
        label: 'ولد',
        color: '#3b82f6',
        icon: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M29 33c0-11.6 9.4-21 21-21s21 9.4 21 21c0 1.8-.2 3.5-.6 5.1-2.9-3.2-7-5.3-11.6-5.7-2.7 2.1-6.1 3.4-9.8 3.4s-7.1-1.3-9.8-3.4c-4.6.4-8.7 2.5-11.6 5.7-.4-1.6-.6-3.3-.6-5.1z"/><circle cx="50" cy="38" r="19"/><path d="M50 79c-18.8 0-34 8.5-34 19v2h68v-2c0-10.5-15.2-19-34-19z"/></svg>`
    },
    girl: {
        label: 'بنت',
        color: '#c084fc',
        icon: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M68 21C74 26,78 36,76 49C74.5 60,69 68,62 73C60.5 74.3,58.4 73.3,58.8 71.4C62 63,63.5 51,61.5 40C60.3 33,57.5 27,53 22C57 19,64 18.5,68 21Z M32 21C26 26,22 36,24 49C25.5 60,31 68,38 73C39.5 74.3,41.6 73.3,41.2 71.4C38 63,36.5 51,38.5 40C39.7 33,42.5 27,47 22C43 19,36 18.5,32 21Z"/><circle cx="50" cy="38" r="17.5"/><path d="M50 79c-16.6 0-30 8.5-30 19v2h60v-2c0-10.5-13.4-19-30-19z"/></svg>`
    }
};
let selectedAvatarType = 'boy';
let G = {
    data: null, section: 'dashboard', theme: 'dark',
    pomo: { timer: null, running: false, mode: 'focus', timeLeft: 25 * 60, sessions: 0, fullDuration: 25 * 60, _nextMode: null, _lastTick: null },
    fc: { deckId: null, reviewQ: [], reviewIdx: 0, flipped: false },
    selectedSubjectColor: SUBJECT_COLORS[5],
    chatHistory: [], navHistory: []
};

// ── KEYBOARD / FOCUS HELPERS ──
// المشكلة الأصلية: أي input/textarea كان متركّز (focused) وقت الضغط على الناف بار
// (سواء الشريط السفلي في الموبايل أو قائمة "المزيد") كان بيسيب الكيبورد شغال في الخلفية،
// وبما إن #bottom-nav و #bnav-more-sheet كلاهما position:fixed، المتصفح/الـ WebView
// كان بيحرّكهم مع الـ viewport اللي بيتقصّر بسبب الكيبورد — فيبان وكأن الكيبورد "بيطلع مع الناف بار".
// الحل: نعمل blur لأي عنصر متركّز قبل أي عملية تنقل أو فتح قائمة، عشان الكيبورد يقفل فورًا
// ومايكونش ليه أي علاقة بحركة عناصر التنقل.
function dismissKeyboard() {
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) {
        ae.blur();
    }
}

// ── UTILS
function saveData() { if (!G.data) return; localStorage.setItem('df_local', JSON.stringify(G.data)); }
function loadLocal() { const r = localStorage.getItem('df_local'); return r ? JSON.parse(r) : null; }
function makeDefault(name, avatarType) { return { name, avatarType, subjects: [], sessions: [], flashDecks: [], streak: { count: 0, lastDate: '' }, totalCardReviews: 0 }; }
function uid() { return '_' + (Date.now() + Math.random()).toString(36).replace('.', '_'); }
// لف الرقم + الوحدة في LTR حتى لا يتفرق في النصوص العربية
function ltrD(n) { return `<bdi>${n}d</bdi>`; }
function ltrDt(n) { return n + 'd'; } // نسخة نص فقط (للـ toast والـ system prompt)
function today() { return new Date().toISOString().slice(0, 10); }
function formatStudyDuration(minutes) {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    if (total < 60) return `${total}m`;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}
// نسخة عربية بحتة من نفس التنسيق (بدون حروف إنجليزية d/h/m) — تمنع تشتت اتجاه النص
// عند تضمينها داخل جملة عربية طويلة (مثل رسالة الترحيب في الشات بوت)
function formatStudyDurationAr(minutes) {
    const total = Math.max(0, Math.round(Number(minutes) || 0));
    if (total < 60) return arCount(total, 'دقيقة', 'دقيقتين', 'دقائق');
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (mins === 0) return arCount(hours, 'ساعة', 'ساعتين', 'ساعات');
    return `${arCount(hours, 'ساعة', 'ساعتين', 'ساعات')} و${arCount(mins, 'دقيقة', 'دقيقتين', 'دقائق')}`;
}

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000); }
// مصدر واحد لتحديد الأولوية/اللون: بيستخدم نفس حساب getExamMsLeft بدقة الساعة (مش فرق تاريخ بس)
// عشان يتطابق مع العداد التنازلي والأرشفة وتقرير الأداء، بدل ما يديك رقم مختلف بيوم في الحالات الحدّية.
function getPriority(subject) {
    if (!subject || !subject.examDate) return 'low';
    const ms = getExamMsLeft(subject);
    if (ms === null) return 'low';
    if (ms < 0) return 'done';
    const n = Math.floor(ms / 86400000);
    if (n <= 3) return 'critical';
    if (n <= 7) return 'high';
    if (n <= 14) return 'medium';
    return 'low';
}

// ── AVATAR PICKER
function buildAvatarPicker() {
    const el = document.getElementById('avatar-picker');
    if (!el) return;
    el.innerHTML = Object.entries(AVATAR_TYPES).map(([type, cfg]) => `
        <button
            type="button"
            class="av-opt${type === selectedAvatarType ? ' selected' : ''}"
            style="--av-color:${cfg.color}"
            data-type="${type}"
            aria-label="اختيار أفاتار ${cfg.label}"
            aria-pressed="${type === selectedAvatarType ? 'true' : 'false'}"
            onclick="selectAvatar('${type}', this)"
        ><span class="av-opt-icon" style="background:${cfg.color}">${cfg.icon}</span><span class="av-opt-label">${cfg.label}</span></button>
    `).join('');
}
function selectAvatar(type, el) {
    selectedAvatarType = type;
    document.querySelectorAll('.av-opt').forEach(x => {
        x.classList.remove('selected');
        x.setAttribute('aria-pressed', 'false');
    });
    if (el) {
        el.classList.add('selected');
        el.setAttribute('aria-pressed', 'true');
    }
}

// ── AUTO-LOGIN: if name exists in storage, skip auth
function tryAutoLogin() {
    const saved = getSavedUserData();
    if (saved) {
        startApp(saved, false);
        return true;
    }
    return false;
}

function handleEntry() {
    const nameInput = document.getElementById('entry-name');
    const er = document.getElementById('auth-error');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        if (er) {
            er.textContent = 'من فضلك أدخل اسمك';
            er.style.display = 'block';
        }
        nameInput?.focus();
        return;
    }
    if (name.length < 2) {
        if (er) {
            er.textContent = 'الاسم يجب أن يكون على الأقل حرفين';
            er.style.display = 'block';
        }
        nameInput?.focus();
        return;
    }
    if (name.length > 40) {
        if (er) {
            er.textContent = 'الاسم طويل جداً';
            er.style.display = 'block';
        }
        nameInput?.focus();
        return;
    }
    if (er) er.style.display = 'none';

    const existing = loadLocal();
    const sameAccount = !!(existing && existing.name && existing.name.trim().toLowerCase() === name.toLowerCase());

    // فيه حساب محفوظ على هذا المتصفح باسم مختلف — اسأل المستخدم: حساب جديد؟ ولو موافق، احذف القديم
    if (existing && !sameAccount) {
        const wantsNew = confirm(`يوجد حساب محفوظ على هذا المتصفح باسم "${existing.name}".\nهل تريد حذف بياناته نهائياً والبدء بحساب جديد باسم "${name}"؟`);
        if (!wantsNew) return; // المستخدم رجع عن الفكرة — نسيب الحساب القديم سليم
        deleteAccount(false); // تم التأكيد فوق، مفيش حاجة لتأكيد تاني
    }

    const isNewAccount = !existing || !sameAccount;
    let saved = (existing && sameAccount) ? existing : makeDefault(name, selectedAvatarType);
    saved.name = name;
    if (!saved.avatarType) saved.avatarType = selectedAvatarType;
    try {
        localStorage.setItem('df_local', JSON.stringify(saved));
    } catch (e) { console.warn('localStorage error:', e); }
    startApp(saved, isNewAccount);
}

function showInitialScreen(showApp) {
    const authScreen = document.getElementById('auth-screen');
    const app = document.getElementById('app');
    if (!authScreen || !app) return;

    document.documentElement.setAttribute('data-boot-state', showApp ? 'app' : 'auth');

    if (showApp) {
        authScreen.classList.add('hidden');
        app.classList.remove('hidden');
    } else {
        app.classList.add('hidden');
        authScreen.classList.remove('hidden');
    }
}

function getSavedUserData() {
    try {
        const saved = loadLocal();
        if (saved && saved.name && saved.name !== 'User' && Array.isArray(saved.subjects) && Array.isArray(saved.sessions)) {
            return saved;
        }
    } catch (e) { console.warn('Saved-user read error:', e); }
    return null;
}

function startApp(data, isNewAccount) {
    // Ensure all required arrays exist (defensive merge)
    if (!Array.isArray(data.subjects)) data.subjects = [];
    if (!Array.isArray(data.sessions)) data.sessions = [];
    if (!Array.isArray(data.flashDecks)) data.flashDecks = [];
    if (!data.streak) data.streak = { count: 0, lastDate: '' };
    if (!data.totalCardReviews) data.totalCardReviews = 0;

    G.data = data; G.chatHistory = []; G.navHistory = [];
    showInitialScreen(true);

    const av = document.getElementById('user-av');
    if (av) {
        const at = AVATAR_TYPES[G.data.avatarType] || AVATAR_TYPES.boy;
        av.style.background = at.color;
        av.style.color = '#fff';
        av.innerHTML = at.icon;
    }
    const userName = document.getElementById('user-nm');
    if (userName) userName.textContent = G.data.name || 'User';
    applyTheme(G.theme); updateTopbar(); updateStreak(); navigate('dashboard'); updateFCBadge();
    checkAutoShowWrapped();
    // أرشفة تلقائية صامتة عند الدخول (silent=true لتفادي تعدد التوست مع navigate)
    setTimeout(() => autoArchivePastExams(true), 600);
    // تشغيل الـ onboarding فقط عند تسجيل حساب جديد فعلاً — لا يظهر مع تسجيل الدخول التلقائي للعائدين
    if (isNewAccount && onboardingInstance && onboardingInstance.shouldShow()) {
        setTimeout(() => onboardingInstance.init(), 800);
    }
}

function logout() {
    if (!confirm('تسجيل الخروج؟')) return;
    clearInterval(G.pomo.timer); stopAllSounds();
    G.data = null; G.chatHistory = []; G.navHistory = [];
    showInitialScreen(false);
    buildAvatarPicker();
}

// ── حذف الحساب نهائياً: يمسح كل البيانات المحفوظة من هذا المتصفح (المواد، الجلسات، البطاقات...)
// showConfirmDialog=false تُستخدم لما يكون التأكيد قد تم بالفعل في مكان آخر (مثلاً عند تسجيل اسم مختلف)
function deleteAccount(showConfirmDialog = true) {
    if (showConfirmDialog && !confirm('سيتم حذف الحساب المحفوظ على هذا المتصفح وكل بياناته (المواد، الجلسات، البطاقات، الملاحظات...) نهائياً. لا يمكن التراجع عن هذا الإجراء. متابعة؟')) {
        return false;
    }
    try {
        localStorage.removeItem('df_local');
        localStorage.removeItem('df_onboarding_shown');
    } catch (e) { console.warn('Delete account error:', e); }
    // إعادة ضبط حالة الـ onboarding في الذاكرة كمان حتى يظهر تاني مع الحساب الجديد
    if (onboardingInstance) onboardingInstance.hasShown = false;
    return true;
}

// يُستخدم من داخل التطبيق (زرار "حذف الحساب" جنب تسجيل الخروج)
function deleteAccountAndLogout() {
    if (!deleteAccount(true)) return; // المستخدم لغى التأكيد
    clearInterval(G.pomo.timer); stopAllSounds();
    G.data = null; G.chatHistory = []; G.navHistory = [];
    showInitialScreen(false);
    const ni = document.getElementById('entry-name'); if (ni) ni.value = '';
    const er = document.getElementById('auth-error'); if (er) er.style.display = 'none';
    buildAvatarPicker();
    showToast('تم حذف الحساب — سجّل حساباً جديداً', 'success');
}

// إضافة زرار "حذف الحساب" بجانب زرار تسجيل الخروج (بدون الحاجة لتعديل ملف HTML)
// بيستنسخ شكل زرار اللوج آوت نفسه حتى يطابق التصميم، وبيغيّر الأيقونة والنص والحدث فقط
function injectDeleteAccountButton(referenceBtnId, newId) {
    const ref = document.getElementById(referenceBtnId);
    if (!ref || document.getElementById(newId)) return;
    const clone = ref.cloneNode(true);
    clone.id = newId;
    clone.innerHTML = '<i data-lucide="trash-2"></i><span>حذف الحساب</span>';
    clone.title = 'حذف الحساب نهائياً من هذا المتصفح';
    clone.addEventListener('click', deleteAccountAndLogout);
    ref.insertAdjacentElement('afterend', clone);
}

// ── TOPBAR & STREAK
function updateTopbar() {
    const totalMin = (G.data.sessions || []).filter(s => s.type === 'pomo').reduce((a, s) => a + (s.duration || 0), 0);
    const el = document.getElementById('total-hours-val');
    if (el) el.textContent = formatStudyDuration(totalMin);
}
function updateStreak() {
    const t = today();
    // الـ streak يزيد بس لو ذاكر فعلاً (في جلسة pomo اليوم)
    const studiedToday = (G.data.sessions || []).some(s => s.date === t && s.type === 'pomo');
    if (!studiedToday) return; // فتح التطبيق بدون مذاكرة ما يعدش streak
    if (G.data.streak.lastDate === t) return; // نفس اليوم، مزودش تاني
    const y = new Date(); y.setDate(y.getDate() - 1); const ys = y.toISOString().slice(0, 10);
    if (G.data.streak.lastDate === ys) G.data.streak.count++; else G.data.streak.count = 1;
    G.data.streak.lastDate = t; saveData();
}
let toastTimer;
function showToast(msg, type = '') { const el = document.getElementById('toast'); el.textContent = msg; el.className = 'toast show ' + (type || ''); clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = 'toast'; }, 3400); }
function openModal(title, html, footer = '') { document.getElementById('modal-title').textContent = title; document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-footer').innerHTML = footer; document.getElementById('modal-overlay').classList.remove('hidden'); lucide.createIcons(); }
function closeModal() { dismissKeyboard(); document.getElementById('modal-overlay').classList.add('hidden'); }

// ── BOTTOM NAV MORE
function openBnavMore() { dismissKeyboard(); document.getElementById('bnav-more-sheet').style.display = 'block'; }
function closeBnavMore() { document.getElementById('bnav-more-sheet').style.display = 'none'; }

// ── NAVIGATION
function navigate(section) {
    // اقفل الكيبورد فورًا لو كان فيه input متركّز — قبل أي تغيير في الـ DOM
    // ده اللي بيمنع الناف بار (position:fixed) من "التفاعل" مع الكيبورد وهو بيقفل
    dismissKeyboard();
    if (G.section && G.section !== section) { G.navHistory.push(G.section); if (G.navHistory.length > 20) G.navHistory.shift(); }
    if (G.section === 'subjects' && section !== 'subjects') stopCountdownInterval();
    if (G.section === 'insights' && section !== 'insights') { stopInsightsLiveUpdate(); }
    if (G.section === 'dashboard' && section !== 'dashboard') stopECCInterval();
    G.section = section;
    closeBnavMore();
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.bnav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.bnav-more-item').forEach(n => n.classList.remove('active'));
    document.getElementById('sec-' + section)?.classList.add('active');
    document.querySelector('.nav-item[data-section="' + section + '"]')?.classList.add('active');
    document.querySelector('.bnav-item[data-section="' + section + '"]')?.classList.add('active');
    document.querySelector('.bnav-more-item[data-section="' + section + '"]')?.classList.add('active');
    const titles = { dashboard: 'الرئيسية', subjects: 'المواد', pomodoro: 'بومودورو', flashcards: 'البطاقات', ambient: 'الأصوات', 'ai-help': 'مساعد AI', about: 'المطور', insights: 'تقرير الأداء' };
    document.getElementById('section-title').textContent = titles[section] || section;
    if (section === 'dashboard') { renderDashboard(); startECCInterval(); }
    else if (section === 'subjects') renderSubjects();
    else if (section === 'pomodoro') renderPomodoro();
    else if (section === 'flashcards') renderFlashcards();
    else if (section === 'ambient') renderAmbientSection();
    else if (section === 'ai-help') renderAIHelp();
    else if (section === 'insights') renderInsights();
    // Scroll to top AFTER render — setTimeout ensures DOM is painted first
    setTimeout(() => {
        const contentEl = document.getElementById('content');
        if (contentEl) { contentEl.scrollTop = 0; }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
    }, 0);
    lucide.createIcons();
}
function goBack() { dismissKeyboard(); if (G.navHistory.length > 0) navigate(G.navHistory.pop()); else navigate('dashboard'); }

// Navigate to Pomodoro and pre-select a specific subject
function navigatePomodoro(subjectId) {
    navigate('pomodoro');
    if (subjectId) {
        // Small delay to let populateSubjectSelects() finish rendering the <select>
        setTimeout(() => {
            const sel = document.getElementById('pomo-subject-sel');
            if (sel) {
                sel.value = subjectId;
                // Also update Focus Mode label if it's open
                syncFocusMode();
            }
        }, 80);
    }
}

// ── DASHBOARD
let quoteIdx = Math.floor(Math.random() * ARABIC_QUOTES.length);
function renderDashboard() {
    refreshSubjectColors(); // colors reflect current urgency
    const now = new Date();
    const todayMin = G.data.sessions.filter(s => s.date === today() && s.type === 'pomo').reduce((a, s) => a + s.duration, 0);
    const dueCards = getDueCards().length;
    const todayHtml = todayMin < 60
        ? `<div class="stat-val"><span>${todayMin}</span><span class="stat-val-unit">دقيقة</span></div>`
        : `<div class="stat-val">${formatStudyDuration(todayMin)}</div>`;
    document.getElementById('dash-stats').innerHTML =
        `<div class="stat-card"><span class="stat-icon"><i data-lucide="flame"></i></span><div class="stat-val">${G.data.streak.count}</div><div class="stat-label">يوم متتالي</div></div>` +
        `<div class="stat-card"><span class="stat-icon"><i data-lucide="book-open"></i></span><div class="stat-val">${G.data.subjects.filter(s => !s.archived).length}</div><div class="stat-label">مادة نشطة</div></div>` +
        `<div class="stat-card"><span class="stat-icon"><i data-lucide="timer"></i></span>${todayHtml}<div class="stat-label">اليوم</div></div>` +
        `<div class="stat-card"><span class="stat-icon"><i data-lucide="layers"></i></span><div class="stat-val">${dueCards}</div><div class="stat-label">بطاقات للمراجعة</div></div>`;
    lucide.createIcons();
    renderExamCountdownWidget();
    const q = ARABIC_QUOTES[quoteIdx % ARABIC_QUOTES.length];
    document.getElementById('daily-quote').innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:.7rem;color:var(--tm)">اقتباس اليوم</span><button onclick="quoteIdx++;renderDashboard()" style="background:none;border:1px solid var(--bo);color:var(--p);font-size:.7rem;cursor:pointer;padding:2px 6px;border-radius:4px">تغيير</button></div><div class="quote-text">"${q.t}"</div><div class="quote-author">— ${q.a}</div>`;
    document.getElementById('due-count-display').innerHTML = `<div class="due-count-big">${dueCards}</div><div class="due-count-label">بطاقات للمراجعة</div>${dueCards > 0 ? `<span class="due-link" onclick="navigate('flashcards')">ابدأ المراجعة <i data-lucide="arrow-right"></i></span>` : '<div class="due-empty" style="font-size:.74rem;color:var(--ok);margin-top:3px"><i data-lucide="check-circle"></i> كل البطاقات تمت</div>'}`;
    lucide.createIcons();
}

// ── BIG EXAM COUNTDOWN WIDGET
let eccState = { idx: 0, interval: null, alertsShown: new Set() };

function getUpcomingExamSubjects() {
    return G.data.subjects
        // ملحوظة: هنا عمدًا مش بنفلتر !s.archived — المادة الوحيدة اللي بتتأرشف هي اللي فات
        // معاد امتحانها (عبر autoArchivePastExams)، وده بيحصل فورًا لحظة انتهاء الوقت.
        // لو فلترنا s.archived هنا، حالة "✓ انتهى الامتحان" (3 أيام سماح) مستحيل تتشاف
        // لأن المادة بتتأرشف قبل ما الودجت يعمل render تاني. الفلتر التاني تحت (ms > -3 أيام)
        // كافي وحده عشان يخفيها بعد فترة السماح.
        .filter(s => s.examDate)
        .map(s => ({ ...s, ms: getExamMsLeft(s) }))
        .filter(s => s.ms !== null && s.ms > -86400000 * 3) // include up to 3 days past
        .sort((a, b) => a.ms - b.ms);
}

function renderExamCountdownWidget() {
    const el = document.getElementById('exam-countdown-widget');
    if (!el) return;
    const subs = getUpcomingExamSubjects();
    if (!subs.length) { el.innerHTML = ''; return; }
    // Clamp index
    if (eccState.idx >= subs.length) eccState.idx = 0;
    const s = subs[eccState.idx];
    const ms = getExamMsLeft(s);
    el.innerHTML = buildECCHtml(s, ms, subs);
    lucide.createIcons();
}

function buildECCHtml(s, ms, allSubs) {
    const isDone = ms !== null && ms <= 0;
    const dLeft = daysUntil(s.examDate) || 0;

    // Urgency color — transparent = done, fall back to neutral
    let color = (!s.color || s.color === 'transparent') ? 'var(--td)' : s.color;


    let unitsHtml = '';
    if (isDone) {
        unitsHtml = `<div class="ecc-done">✓ انتهى الامتحان — أحسنت!</div>`;
    } else if (ms !== null) {
        const totalSecs = Math.max(0, Math.floor(ms / 1000));
        const d = Math.floor(totalSecs / 86400);
        const h = Math.floor((totalSecs % 86400) / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const sec = totalSecs % 60;
        const dStr = String(d).padStart(2, '0');
        const hStr = String(h).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        const secStr = String(sec).padStart(2, '0');
        const isToday = d === 0;
        unitsHtml = `
                    <div class="ecc-units">
                        <div class="ecc-unit" id="ecc-d"><span class="ecc-unit-val${isToday ? ' ecc-today-flash' : ''}" id="ecc-val-d">${dStr}</span><span class="ecc-unit-lbl">d</span></div>
                        <div class="ecc-sep">:</div>
                        <div class="ecc-unit" id="ecc-h"><span class="ecc-unit-val${isToday ? ' ecc-today-flash' : ''}" id="ecc-val-h">${hStr}</span><span class="ecc-unit-lbl">h</span></div>
                        <div class="ecc-sep">:</div>
                        <div class="ecc-unit" id="ecc-m"><span class="ecc-unit-val${isToday ? ' ecc-today-flash' : ''}" id="ecc-val-m">${mStr}</span><span class="ecc-unit-lbl">m</span></div>
                        <div class="ecc-sep">:</div>
                        <div class="ecc-unit" id="ecc-s"><span class="ecc-unit-val${isToday ? ' ecc-today-flash' : ''}" id="ecc-val-s">${secStr}</span><span class="ecc-unit-lbl">s</span></div>
                    </div>`;
    }

    const dotsHtml = allSubs.length > 1 ? `<div class="ecc-nav-dots">${allSubs.map((_, i) => `<div class="ecc-nav-dot${i === eccState.idx ? ' active' : ''}" style="${i === eccState.idx ? `--ecc-color:${s.color || 'var(--p)'}` : ''}" onclick="eccGoTo(${i})"></div>`).join('')}</div>` : '';

    const examDateLabel = s.examDate ? new Date(s.examDate).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' }) + (s.examTime ? ' — ' + formatTimeArabic(s.examTime) : '') : '';

    return `<div class="exam-countdown-card" style="--ecc-color:${color};margin-bottom:14px">
                <div class="ecc-label"><i data-lucide="calendar-clock"></i> أقرب امتحان</div>
                <div class="ecc-subject">
                    <div class="ecc-dot" style="background:${color}"></div>
                    ${s.name}
                    ${examDateLabel ? `<span style="font-size:.72rem;color:var(--tm);font-weight:600;margin-right:auto">${examDateLabel}</span>` : ''}
                </div>
                ${unitsHtml}
                <div class="ecc-footer">
                    ${dotsHtml}
                    <button onclick="navigate('subjects')" style="background:none;border:1px solid var(--bo);color:var(--tm);font-size:.68rem;font-weight:700;padding:3px 9px;border-radius:6px;cursor:pointer">كل المواد</button>
                </div>
            </div>`;
}

function eccGoTo(idx) {
    eccState.idx = idx;
    renderExamCountdownWidget();
    startECCInterval();
}

// Tick: updates seconds in place (no full re-render every second = smooth)
function eccTick() {
    if (G.section !== 'dashboard') return;
    const subs = getUpcomingExamSubjects();
    if (!subs.length) { document.getElementById('exam-countdown-widget').innerHTML = ''; return; }
    if (eccState.idx >= subs.length) { eccState.idx = 0; renderExamCountdownWidget(); return; }
    const s = subs[eccState.idx];
    const ms = getExamMsLeft(s);

    // Auto-advance: if current subject's exam is done AND there's a next one
    if (ms !== null && ms <= 0) {
        // After 3 days past, move to next
        if (ms < -86400000 * 3 || subs.filter(x => getExamMsLeft(x) > 0).length > 0) {
            const nextIdx = subs.findIndex(x => getExamMsLeft(x) > 0);
            if (nextIdx >= 0 && nextIdx !== eccState.idx) {
                eccState.idx = nextIdx;
                renderExamCountdownWidget();
                return;
            }
        }
        // Stay on done state — re-render once per minute
        return;
    }

    if (ms === null) return;
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const sec = totalSecs % 60;

    // Update only the number spans (no DOM rebuild = no flicker)
    const dEl = document.getElementById('ecc-val-d');
    const hEl = document.getElementById('ecc-val-h');
    const mEl = document.getElementById('ecc-val-m');
    const sEl = document.getElementById('ecc-val-s');
    if (dEl) dEl.textContent = String(d).padStart(2, '0');
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(sec).padStart(2, '0');

}

function startECCInterval() {
    stopECCInterval();
    eccState.interval = setInterval(() => {
        if (G.section === 'dashboard') eccTick();
    }, 1000);
}

function stopECCInterval() {
    if (eccState.interval) { clearInterval(eccState.interval); eccState.interval = null; }
}

// ── تنسيق الوقت بالعربي (صباحاً / مساءً)
function formatTimeArabic(timeStr) {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const period = h < 12 ? 'صباحاً' : 'مساءً';
    if (h === 0) h = 12;
    else if (h > 12) h = h - 12;
    const mm = String(m).padStart(2, '0');
    return `${h}:${mm} ${period}`;
}

// ── COUNTDOWN UTILITIES
function getExamMsLeft(subject) {
    if (!subject.examDate) return null;
    const timeStr = subject.examTime || '09:00';
    const [h, m] = timeStr.split(':').map(Number);
    const examDt = new Date(subject.examDate);
    examDt.setHours(h, m, 0, 0);
    return examDt.getTime() - Date.now();
}
// ── مصدر واحد لعدد الأيام المتبقية للامتحان (بدقة الساعة عبر getExamMsLeft)
// تستخدمه كل الأماكن التي تعرض "الأيام المتبقية" (كارت المادة، الشات بوت، وقسم الأداء)
// حتى لا يختلف الرقم المعروض من مكان لآخر
function getExamDaysLeft(subject) {
    const ms = getExamMsLeft(subject);
    if (ms === null) return null;
    if (ms <= 0) return -1; // الامتحان انتهى
    return Math.floor(ms / 86400000);
}
// ── صياغة عدد عربي صحيح نحويًا: مفرد (1) / مثنى (2) / جمع (3-10) / تمييز مفرد منصوب (11+)
// مثال: arCount(1,'يوم','يومين','أيام') → 'يوم' | arCount(2,...) → 'يومين' | arCount(9,...) → '9 أيام' | arCount(19,...) → '19 يوم'
function arCount(n, singular, dual, plural) {
    const v = Math.abs(Math.round(n));
    if (v === 0) return `0 ${singular}`;
    if (v === 1) return singular;
    if (v === 2) return dual;
    if (v >= 3 && v <= 10) return `${v} ${plural}`;
    return `${v} ${singular}`;
}
// ── تنسيق الوقت المتبقي بالعربي الفصيح
function formatCountdown(ms) {
    if (ms === null) return null;
    if (ms <= 0) return { text: 'انتهى الامتحان', done: true, isToday: false };
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const isToday = days === 0;

    const formatHours = (value) => arCount(value, 'ساعة', 'ساعتين', 'ساعات');
    const formatMinutes = (value) => arCount(value, 'دقيقة', 'دقيقتين', 'دقائق');
    const formatDays = (value) => arCount(value, 'يوم', 'يومين', 'أيام');

    let text = '';

    if (days === 0 && hours === 0) {
        text = mins <= 1 ? 'أقل من دقيقة' : formatMinutes(mins);
    } else if (days === 0) {
        text = formatHours(hours);
        if (hours < 3 && mins > 0) text += ` و${formatMinutes(mins)}`;
    } else if (days === 1) {
        text = hours > 0 ? `${formatDays(1)} و${formatHours(hours)}` : formatDays(1);
    } else if (days === 2) {
        text = hours > 0 ? `${formatDays(2)} و${formatHours(hours)}` : formatDays(2);
    } else {
        if (days <= 7 && hours > 0) {
            text = `${formatDays(days)} و${formatHours(hours)}`;
        } else {
            text = formatDays(days);
        }
    }

    return { text, done: false, isToday };
}

// Live countdown interval (updates every minute when on subjects page)
let countdownInterval = null;
function refreshSubjectColors() {
    // Re-derive colors for all subjects based on current priority
    let changed = false;
    G.data.subjects.forEach(s => {
        const newColor = getSubjectColor(s);
        if (s.color !== newColor) { s.color = newColor; changed = true; }
    });
    if (changed) saveData();
}
function startCountdownInterval() {
    stopCountdownInterval();
    countdownInterval = setInterval(() => {
        if (G.section === 'subjects') {
            refreshSubjectColors(); // update colors as time passes
            document.querySelectorAll('[data-countdown-id]').forEach(el => {
                const subId = el.dataset.countdownId;
                const sub = G.data.subjects.find(s => s.id === subId);
                if (!sub) return;
                const ms = getExamMsLeft(sub);
                if (ms === null) return;
                if (ms <= 0) {
                    el.textContent = 'انتهى الامتحان';
                    el.style.color = 'var(--ok)';
                    el.parentElement.classList.remove('countdown-today');
                    return;
                }
                const _d = Math.floor(ms / 86400000);
                const fc = formatCountdown(ms);
                el.textContent = fc ? fc.text : '';
                el.setAttribute('dir', 'ltr');
                if (_d === 0) { el.style.color = 'var(--er)'; el.parentElement.classList.add('countdown-today'); }
                else if (_d <= 3) { el.style.color = 'var(--er)'; el.parentElement.classList.remove('countdown-today'); }
                else if (_d <= 7) { el.style.color = 'var(--wa)'; el.parentElement.classList.remove('countdown-today'); }
                else { el.style.color = ''; el.parentElement.classList.remove('countdown-today'); }
            });
        }
    }, 60000); // every 60 seconds (no need for seconds on subjects page)
}
function stopCountdownInterval() { if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; } }

// ── SUBJECTS

function renderSubjects() {
    autoArchivePastExams(false); // تحقق وأرشف أي مادة انتهى امتحانها
    refreshSubjectColors(); // always up-to-date colors before render
    const sort = document.getElementById('subject-sort').value;
    const allSubs = [...G.data.subjects];
    const activeSubs = allSubs.filter(s => !s.archived);
    const archivedSubs = allSubs.filter(s => s.archived);
    const pO = { critical: 0, high: 1, medium: 2, low: 3, done: 4 };
    const sortFn = (a, b) => {
        if (sort === 'priority') return pO[getPriority(a)] - pO[getPriority(b)];
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (!a.examDate) return 1; if (!b.examDate) return -1; return a.examDate.localeCompare(b.examDate);
    };
    activeSubs.sort(sortFn);

    // Find nearest upcoming exam subject (for special text countdown)
    const upcomingWithDate = activeSubs.filter(s => s.examDate && daysUntil(s.examDate) !== null && daysUntil(s.examDate) >= 0);
    upcomingWithDate.sort((a, b) => (daysUntil(a.examDate) || 9999) - (daysUntil(b.examDate) || 9999));
    const nearestSubId = upcomingWithDate.length > 0 ? upcomingWithDate[0].id : null;

    const grid = document.getElementById('subjects-grid');
    if (!activeSubs.length && !archivedSubs.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon"><i data-lucide="book-open"></i></div><p>لا مواد بعد</p></div>`;
        lucide.createIcons(); return;
    }
    grid.innerHTML = activeSubs.length ? activeSubs.map(s => buildSubjectCard(s, false, s.id === nearestSubId)).join('') :
        `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--td);font-size:.84rem">كل المواد في الأرشيف</div>`;

    // Archive section
    const archSec = document.getElementById('archive-section');
    const archGrid = document.getElementById('archived-grid');
    const archLabel = document.getElementById('archive-count-label');
    if (archivedSubs.length > 0) {
        archSec.classList.remove('hidden');
        archLabel.textContent = `الأرشيف (${archivedSubs.length})`;
        archGrid.innerHTML = archivedSubs.map(s => buildSubjectCard(s, true, false)).join('');
    } else {
        archSec.classList.add('hidden');
    }
    startCountdownInterval();
    lucide.createIcons();
}

function buildSubjectCard(s, isArchived, isNearest) {
    const pL = { critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض', done: 'تم' };
    const p = getPriority(s);
    const ms = getExamMsLeft(s);
    const cd = formatCountdown(ms);
    let examHtml = '';
    if (!s.examDate) {
        examHtml = `<div class="sc-exam"><i data-lucide="calendar"></i> لا امتحان</div>`;
    } else if (cd && cd.done) {
        examHtml = `<div class="sc-exam"><i data-lucide="calendar"></i> <span style="color:var(--ok);font-weight:700">انتهى الامتحان</span></div>`;
    } else if (isNearest && ms !== null && ms > 0) {
        // Nearest subject: rich text countdown via formatCountdown
        const fc = formatCountdown(ms);
        const totalSecs = Math.floor(ms / 1000);
        const d = Math.floor(totalSecs / 86400);
        const cdText = fc ? fc.text : '';
        const isToday = d === 0;
        const nearestColor = isToday ? 'var(--er)' : d <= 3 ? 'var(--er)' : d <= 7 ? 'var(--wa)' : 'var(--p)';
        examHtml = `<div class="sc-exam${isToday ? ' countdown-today' : ''}">
                    <i data-lucide="calendar-clock"></i>
                    <span dir="rtl" data-countdown-id="${s.id}" style="color:${nearestColor};font-weight:800">${cdText}</span>
                    <span style="font-size:.63rem;background:${isToday ? 'rgba(255,92,92,.12)' : d <= 3 ? 'rgba(255,92,92,.1)' : d <= 7 ? 'rgba(255,179,71,.1)' : 'var(--pg)'};color:${nearestColor};padding:1px 6px;border-radius:8px;font-weight:800;border:1px solid ${isToday ? 'rgba(255,92,92,.3)' : d <= 7 ? 'rgba(255,179,71,.25)' : 'rgba(91,138,255,.25)'}">أقرب</span>
                    ${p !== 'done' && p !== 'low' ? `<span class="ts-priority priority-${p}" style="font-size:.65rem">${pL[p]}</span>` : ''}
                </div>`;
    } else if (cd && cd.isToday) {
        examHtml = `<div class="sc-exam countdown-today"><i data-lucide="calendar"></i> <span dir="rtl" class="countdown-text" data-countdown-id="${s.id}" style="color:var(--er);font-weight:800">${cd.text}</span></div>`;
    } else {
        examHtml = `<div class="sc-exam"><i data-lucide="calendar"></i> <span dir="rtl" data-countdown-id="${s.id}">${cd ? cd.text : ''}</span>${p !== 'done' && p !== 'low' ? `<span class="ts-priority priority-${p}" style="font-size:.68rem;margin-right:5px">${pL[p]}</span>` : ''}</div>`;
    }
    const studied = G.data.sessions.filter(ss => ss.subjectId === s.id && ss.type === 'pomo').reduce((a, ss) => a + ss.duration, 0);
    const estMin = (s.hours || 0) * 60;
    const pct = estMin > 0 ? Math.min(100, Math.round((studied / estMin) * 100)) : 0;
    const archiveBadge = isArchived ? `<div class="archive-badge"><i data-lucide="check-circle"></i> مؤرشفة</div>` : '';
    // Nearest badge on card border
    const isDoneColor = !s.color || s.color === 'transparent';
    const displayColor = isDoneColor ? 'var(--bo2)' : s.color;
    const nearestBorder = isNearest && !isArchived && !isDoneColor ? `border-color:${s.color};box-shadow:0 0 0 1px ${s.color}33,var(--sh)` : '';
    // Status indicator based on today's study time
    const studiedTodaySc = G.data.sessions.filter(ss => ss.type === 'pomo' && ss.date === today() && ss.subjectId === s.id).reduce((a, ss) => a + ss.duration, 0);
    const footerActions = isArchived
        ? `<button class="btn-restore" onclick="restoreSubject('${s.id}')"><i data-lucide="rotate-ccw"></i> استعادة</button>`
        : `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
                    ${studiedTodaySc > 0 ? `<span style="font-size:.7rem;font-weight:700;color:var(--ok);background:rgba(16,212,138,.1);padding:3px 8px;border-radius:6px;border:1px solid rgba(16,212,138,.25)">✓ ${formatStudyDuration(studiedTodaySc)}</span>` : ''}
                    <button style="background:var(--p);color:#fff;border:none;padding:4px 11px;border-radius:6px;font-size:.72rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .2s;font-family:var(--f-b)" onmouseover="this.style.background='var(--pd)'" onmouseout="this.style.background='var(--p)'" onclick="navigatePomodoro('${s.id}')"><i data-lucide="play" style="width:11px;height:11px"></i> ذاكر</button>
                   </div>`;

    return `<div class="subject-card${isArchived ? ' archived' : ''}" style="${nearestBorder}">
                <div class="sc-top" style="background:${isDoneColor ? 'var(--bo)' : s.color}${isDoneColor ? ';height:2px;opacity:.5' : ''}"></div>
                <div class="sc-body">
                    ${archiveBadge}
                    <div class="sc-header">
                        <span class="sc-name">${s.name}</span>
                        <div class="sc-actions">
                            ${!isArchived ? `<button class="sc-action" onclick="editSubject('${s.id}')"><i data-lucide="settings"></i></button>` : ''}
                            <button class="sc-action" onclick="deleteSubject('${s.id}')"><i data-lucide="x-circle"></i></button>
                        </div>
                    </div>
                    ${examHtml}
                    ${estMin > 0 ? `<div><div class="sc-prog-bar"><div class="sc-prog-fill" style="width:${pct}%;background:${isDoneColor ? 'var(--td)' : s.color}"></div></div><div class="sc-prog-label"><span>${formatStudyDuration(studied)}</span><span>${pct}%</span></div></div>` : ''}
                    <div class="sc-footer">
                        <span class="sc-hours">${s.hours ? s.hours + 'h' : ''}</span>
                        <div style="display:flex;align-items:center;gap:5px">
                        ${footerActions}
                        </div>
                    </div>
                </div>
            </div>`;
}

// ── أرشفة تلقائية بعد انتهاء موعد الامتحان (بالساعة والدقيقة، مش بس اليوم)
function autoArchivePastExams(silent) {
    if (!G.data) return;
    const autoArchived = [];
    G.data.subjects.forEach(s => {
        if (!s.archived && s.examDate) {
            const ms = getExamMsLeft(s); // يحسب بالوقت الفعلي للامتحان
            if (ms !== null && ms < 0) {
                s.archived = true;
                s.archivedAt = Date.now();
                s.autoArchived = true;
                autoArchived.push(s.name);
            }
        }
    });
    if (autoArchived.length > 0) {
        saveData();
        if (!silent) {
            if (autoArchived.length === 1) {
                showToast('تم أرشفة "' + autoArchived[0] + '" تلقائياً بعد الامتحان ✓', 'success');
            } else {
                showToast('تم أرشفة ' + autoArchived.length + ' مواد تلقائياً بعد امتحاناتها ✓', 'success');
            }
        }
    }
    return autoArchived.length > 0;
}

function restoreSubject(id) {
    const s = G.data.subjects.find(x => x.id === id);
    if (!s) return;
    s.archived = false;
    delete s.archivedAt;
    delete s.autoArchived;
    saveData();
    renderSubjects();
    // الاستعادة مالهاش لازمة غير عشان تصحّح تاريخ امتحان غلط —
    // فبمجرد ما نشيل الأرشفة، نفتح مودال التعديل على طول عشان المستخدم يحدّث التاريخ.
    // لو سابه زي ما هو وقفل المودال، هيرجع يتأرشف تلقائي تاني في أول render (autoArchivePastExams).
    editSubject(id);
}

let archiveOpen = false;
function toggleArchiveView() {
    archiveOpen = !archiveOpen;
    const toggle = document.getElementById('archive-toggle');
    const grid = document.getElementById('archived-grid');
    toggle.classList.toggle('open', archiveOpen);
    grid.classList.toggle('open', archiveOpen);
    lucide.createIcons();
}
function saveSubject() {
    const name = document.getElementById('sub-name').value.trim(); if (!name) { showToast('أدخل اسم المادة', 'error'); return; }
    const examDate = document.getElementById('sub-date').value || null;
    const examTime = document.getElementById('sub-time').value || '09:00';
    const hours = parseInt(document.getElementById('sub-hours').value) || 0;
    const sub = { id: uid(), name, examDate, examTime, hours };
    sub.color = getSubjectColor(sub); // color from priority, not picker
    G.data.subjects.push(sub); saveData(); document.getElementById('add-subject-form').classList.add('hidden');
    document.getElementById('sub-name').value = ''; document.getElementById('sub-date').value = ''; document.getElementById('sub-hours').value = ''; document.getElementById('sub-time').value = '09:00';
    renderSubjects();
}
function deleteSubject(id) { if (!confirm('حذف المادة؟')) return; G.data.subjects = G.data.subjects.filter(s => s.id !== id); saveData(); renderSubjects(); showToast('تم الحذف'); }
function editSubject(id) {
    const s = G.data.subjects.find(x => x.id === id); if (!s) return;
    openModal('تعديل المادة', `<div style="display:flex;flex-direction:column;gap:10px"><input type="text" id="edit-sub-name" value="${s.name}"><div style="display:flex;gap:8px"><div style="flex:1;display:flex;flex-direction:column;gap:4px"><label for="edit-sub-date" style="font-size:.72rem;color:var(--tm);padding:0 2px">التاريخ</label><input type="date" id="edit-sub-date" value="${s.examDate || ''}"></div><div style="flex:1;display:flex;flex-direction:column;gap:4px"><label for="edit-sub-time" style="font-size:.72rem;color:var(--tm);padding:0 2px">الوقت</label><input type="time" id="edit-sub-time" value="${s.examTime || '09:00'}"></div></div><input type="number" id="edit-sub-hours" value="${s.hours || ''}" placeholder="ساعات تقديرية"></div><div style="margin-top:10px;padding:8px 12px;background:var(--s2);border-radius:var(--rs);font-size:.78rem;color:var(--tm);display:flex;align-items:center;gap:8px"><i data-lucide="info" style="width:13px;height:13px"></i> اللون يتحدد تلقائياً حسب قرب الامتحان</div>`,
        `<button class="btn-primary" onclick="saveEditSubject('${id}')">حفظ</button><button class="btn-ghost" onclick="closeModal()">إلغاء</button>`);
}
function saveEditSubject(id) {
    dismissKeyboard();
    const s = G.data.subjects.find(x => x.id === id); if (!s) return;
    s.name = document.getElementById('edit-sub-name').value.trim() || s.name; s.examDate = document.getElementById('edit-sub-date').value || null; s.examTime = document.getElementById('edit-sub-time').value || '09:00'; s.hours = parseInt(document.getElementById('edit-sub-hours').value) || 0;
    s.color = getSubjectColor(s); // always re-derive from priority
    saveData(); closeModal(); renderSubjects(); showToast('تم التحديث', 'success');
}

// ── PLANNER (FIXED smart suggestion)
function populateSubjectSelects() {
    const subs = G.data.subjects.filter(s => !s.archived);
    ['pomo-subject-sel', 'fc-deck-subject'].forEach(id => {
        const sel = document.getElementById(id); if (!sel) return; const cur = sel.value;
        const extra = id === 'pomo-subject-sel' ? '<option value="">دراسة عامة</option>' : '<option value="">اختر مادة</option>';
        sel.innerHTML = extra + subs.map(s => `<option value="${s.id}">${s.name}</option>`).join(''); if (cur) sel.value = cur;
    });
}

// ── POMODORO
function renderPomodoro() {
    populateSubjectSelects();
    updatePomoUI();
    renderPomoLog();
    // Initialize current subject tracking if not set
    const curSel = document.getElementById('pomo-subject-sel')?.value || '';
    if (G.pomo._currentSubjectId === undefined) {
        G.pomo._currentSubjectId = curSel;
        G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;
    }
}
function renderPomoLog() {
    const log = G.data.sessions.filter(s => s.date === today()).slice(-8).reverse(); const el = document.getElementById('pomo-log');
    if (!log.length) { el.innerHTML = `<div style="font-size:.76rem;color:var(--td);text-align:center;padding:14px">لا جلسات اليوم</div>`; return; }
    el.innerHTML = log.map(s => { const sub = G.data.subjects.find(x => x.id === s.subjectId); const t = new Date(s.ts || Date.now()).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }); return `<div class="pomo-log-item"><div class="pomo-log-dot ${s.type === 'break' ? 'break' : ''}"></div><div class="pomo-log-info"><div>${s.type === 'pomo' ? 'تركيز' : 'راحة'} — ${formatStudyDuration(s.duration)}${sub ? ' · ' + sub.name : ''}</div><div class="pomo-log-time">${t}</div></div></div>`; }).join('');
}
function getDurations() { return { focus: parseInt(document.getElementById('pomo-focus-dur')?.value || 25), short: parseInt(document.getElementById('pomo-short-dur')?.value || 5), long: parseInt(document.getElementById('pomo-long-dur')?.value || 15) }; }
// ── تحديث لحظي لمدة البومودورو عند تعديل حقل المدة، بدون الحاجة للتنقل بين الأوضاع
// لو الوضع الحالي (تركيز/استراحة قصيرة/طويلة) هو نفسه اللي بيتعدل مدته والمؤقت مش شغال، يتحدث العداد فورًا
function handlePomoDurInput(fieldId) {
    const fieldToMode = { 'pomo-focus-dur': 'focus', 'pomo-short-dur': 'short', 'pomo-long-dur': 'long' };
    const mode = fieldToMode[fieldId];
    if (!mode || G.pomo.mode !== mode || G.pomo.running) return;
    const d = getDurations();
    const mins = Math.max(1, d[mode] || 1);
    G.pomo.timeLeft = mins * 60;
    G.pomo.fullDuration = G.pomo.timeLeft;
    G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;
    updatePomoUI();
    syncFocusMode();
}
function updatePomoUI() {
    const m = Math.floor(G.pomo.timeLeft / 60), s = G.pomo.timeLeft % 60;
    const pt = document.getElementById('pomo-time'); if (pt) pt.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    const dur = G.pomo.fullDuration || 60; const colors = { focus: 'var(--p)', short: 'var(--ac)', long: 'var(--ok)' }; const labels = { focus: 'وقت التركيز', short: 'استراحة قصيرة', long: 'استراحة طويلة' };
    const ring = document.getElementById('pomo-ring'); if (ring) { ring.style.strokeDashoffset = 552.9 * (1 - G.pomo.timeLeft / dur); ring.style.stroke = colors[G.pomo.mode]; }
    const ml = document.getElementById('pomo-mode-label'); if (ml) ml.textContent = labels[G.pomo.mode];
    const toms = document.getElementById('pomo-toms'); if (toms) { toms.innerHTML = ''; for (let i = 0; i < 4; i++) { const t = document.createElement('div'); t.className = 'pomo-tom' + (i < G.pomo.sessions % 4 ? ' done' : ''); t.innerHTML = '<i data-lucide="zap"></i>'; toms.appendChild(t); } lucide.createIcons(); }
    const sc = document.getElementById('pomo-session-count'); if (sc) sc.textContent = `جلسة ${G.pomo.sessions % 4 + 1} من 4`;
    syncFocusMode();
}
function startPomo() {
    if (G.pomo.running) {
        // PAUSE: أوقف العداد فقط، لا يُحفظ شيء
        clearInterval(G.pomo.timer);
        G.pomo.running = false;
        const ps = document.getElementById('pomo-start');
        if (ps) { ps.innerHTML = '<i data-lucide="play"></i> استكمال'; lucide.createIcons(); }
        syncFocusMode();
        return;
    }
    // Initialize subject tracking on fresh start
    const curSubId = document.getElementById('pomo-subject-sel')?.value || '';
    G.pomo._currentSubjectId = curSubId;
    G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;

    G.pomo.running = true;
    const ps = document.getElementById('pomo-start');
    if (ps) { ps.innerHTML = '<i data-lucide="pause"></i> إيقاف'; lucide.createIcons(); }
    G.pomo.timer = setInterval(() => {
        G.pomo.timeLeft--;
        updatePomoUI();
        if (G.pomo.timeLeft <= 0) { clearInterval(G.pomo.timer); G.pomo.running = false; pomoDone(); }
    }, 1000);
}


function resetPomo() {
    // حفظ الوقت المنجز فعلاً لو كانت جلسة تركيز وفيها >= دقيقة
    if (G.pomo.mode === 'focus') {
        // Use subject-switch-aware elapsed: only count since last subject switch
        const elapsedSecs = G.pomo._subjectStartTimeLeft !== undefined
            ? (G.pomo._subjectStartTimeLeft - G.pomo.timeLeft)
            : (G.pomo.fullDuration - G.pomo.timeLeft);
        const elapsedMins = Math.floor(elapsedSecs / 60);
        if (elapsedMins >= 1) {
            const subId = document.getElementById('pomo-subject-sel')?.value;
            const session = { id: uid(), subjectId: subId || '', date: today(), duration: elapsedMins, type: 'pomo', ts: Date.now() };
            G.data.sessions.push(session);
            saveData(); updateStreak(); updateTopbar(); renderPomoLog();
            showToast('تم حفظ ' + formatStudyDuration(elapsedMins) + ' ✓');
        }
    }
    clearInterval(G.pomo.timer);
    G.pomo.running = false;
    const ps = document.getElementById('pomo-start');
    if (ps) { ps.innerHTML = '<i data-lucide="play"></i> ابدأ'; lucide.createIcons(); }
    const d = getDurations();
    G.pomo.timeLeft = d[G.pomo.mode] * 60;
    G.pomo.fullDuration = G.pomo.timeLeft;
    // Reset subject tracking
    G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;
    G.pomo._currentSubjectId = document.getElementById('pomo-subject-sel')?.value || '';
    updatePomoUI();
}
function setPomoMode(mode) { if (G.pomo.running) { G.pomo._nextMode = mode; document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode)); return; } clearInterval(G.pomo.timer); G.pomo.running = false; const ps = document.getElementById('pomo-start'); if (ps) { ps.innerHTML = '<i data-lucide="play"></i> ابدأ'; lucide.createIcons(); } G.pomo.mode = mode; const d = getDurations(); G.pomo.timeLeft = d[mode] * 60; G.pomo.fullDuration = G.pomo.timeLeft; document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode)); updatePomoUI(); }
function pomoDone() {
    const mode = G.pomo.mode; const subId = document.getElementById('pomo-subject-sel')?.value; const d = getDurations(); const dur = d[mode];
    const snd = document.getElementById('pomo-sound'); if (snd?.checked) playBeep();

    if (mode === 'focus') {
        // الوقت المنقضي منذ آخر تبديل مادة (أو من بداية الجلسة لو معملش تبديل) — مش مدة الجلسة كاملة
        // عشان لو المستخدم بدّل المادة في النص، الوقت اللي قبل التبديل يكون اتسجل بالفعل
        // عن طريق handlePomoSubjectChange() ومايتكررش هنا مرة ثانية للمادة الحالية
        const elapsedSecs = G.pomo._subjectStartTimeLeft !== undefined
            ? (G.pomo._subjectStartTimeLeft - G.pomo.timeLeft)
            : (G.pomo.fullDuration - G.pomo.timeLeft);
        const sessionDur = Math.max(0, Math.floor(elapsedSecs / 60));
        if (sessionDur >= 1) {
            const session = { id: uid(), subjectId: subId, date: today(), duration: sessionDur, type: 'pomo', ts: Date.now() };
            G.data.sessions.push(session);
        }
        G.pomo.sessions++;
    } else {
        const session = { id: uid(), subjectId: subId, date: today(), duration: dur, type: 'break', ts: Date.now() };
        G.data.sessions.push(session);
    }

    saveData(); if (mode === 'focus') { updateStreak(); updateTopbar(); } renderPomoLog(); showToast(mode === 'focus' ? 'ممتاز! خذ استراحة.' : 'انتهت الاستراحة!');

    // Reset subject tracking for next session
    const nextMode = G.pomo._nextMode || (mode === 'focus' ? (G.pomo.sessions % 4 === 0 ? 'long' : 'short') : 'focus'); G.pomo._nextMode = null; G.pomo.mode = nextMode; G.pomo.timeLeft = d[nextMode] * 60; G.pomo.fullDuration = G.pomo.timeLeft;
    G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;
    // Keep _currentSubjectId as the current selection for next session
    document.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === nextMode)); updatePomoUI();
    const pa = document.getElementById('pomo-auto'); if (pa?.checked) setTimeout(() => startPomo(), 1000);
}
function playBeep() { try { const ctx = new (window.AudioContext || window.webkitAudioContext)();[440, 554, 659].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0, ctx.currentTime + i * .18); g.gain.linearRampToValueAtTime(.4, ctx.currentTime + i * .18 + .05); g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * .18 + .3); o.start(ctx.currentTime + i * .18); o.stop(ctx.currentTime + i * .18 + .35); }); } catch (e) { } }

// ── FOCUS MODE
let focusModeActive = false;
function enterFocusMode() { dismissKeyboard(); focusModeActive = true; document.getElementById('focus-mode-overlay').classList.remove('hidden'); syncFocusMode(); }
function exitFocusMode() { focusModeActive = false; document.getElementById('focus-mode-overlay').classList.add('hidden'); }
function syncFocusMode() {
    if (!focusModeActive) return;
    const m = Math.floor(G.pomo.timeLeft / 60), s = G.pomo.timeLeft % 60;
    const fd = document.getElementById('fm-time-display'); if (fd) fd.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    const subId = document.getElementById('pomo-subject-sel')?.value; const sub = G.data?.subjects.find(x => x.id === subId);
    const fl = document.getElementById('fm-subject-label'); if (fl) fl.textContent = sub ? sub.name : 'دراسة عامة';
    const labels = { focus: 'وقت التركيز', short: 'استراحة قصيرة', long: 'استراحة طويلة' };
    const fml = document.getElementById('fm-mode-label'); if (fml) fml.textContent = labels[G.pomo.mode] || '';
    const fsb = document.getElementById('fm-start-btn'); if (fsb) { fsb.innerHTML = G.pomo.running ? '<i data-lucide="pause"></i> إيقاف' : '<i data-lucide="play"></i> ابدأ'; lucide.createIcons(); }
}
function fmToggle() { startPomo(); syncFocusMode(); }
function fmReset() { resetPomo(); syncFocusMode(); }

// ── FLASHCARDS
function getDueCards() { const now = Date.now(); const due = []; G.data.flashDecks.forEach(dk => { dk.cards.forEach(c => { if (!c.nextReview || c.nextReview <= now) due.push({ ...c, deckId: dk.id }); }); }); return due; }
function updateFCBadge() { const due = getDueCards().length; const badge = document.getElementById('fc-badge'); if (due > 0) { badge.textContent = due > 99 ? '99+' : due; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); } }
function renderFlashcards() { populateSubjectSelects(); renderFCDecks(); if (G.fc.deckId) selectDeck(G.fc.deckId); else showFCEmpty(); }
function renderFCDecks() {
    const el = document.getElementById('fc-decks-list');
    if (!G.data.flashDecks.length) { el.innerHTML = '<div style="font-size:.74rem;color:var(--td);padding:7px;text-align:center">لا مجموعات بعد</div>'; return; }
    el.innerHTML = G.data.flashDecks.map(dk => { const sub = G.data.subjects.find(s => s.id === dk.subjectId); const color = sub ? sub.color : '#3b82f6'; const due = dk.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length; return `<div class="fc-deck-item${dk.id === G.fc.deckId ? ' active' : ''}" onclick="selectDeck('${dk.id}')"><div class="fc-deck-color" style="background:${color}"></div><div class="fc-deck-info"><div class="fc-deck-item-name">${sub ? sub.name : 'عام'}</div><div class="fc-deck-item-count">${dk.cards.length} بطاقة${due > 0 ? ' · ' + due + ' للمراجعة' : ''}</div></div><button class="sc-action" onclick="event.stopPropagation();deleteDeck('${dk.id}')" style="font-size:.7rem;opacity:.5"><i data-lucide="x-circle"></i></button></div>`; }).join('');
    lucide.createIcons();
}
function selectDeck(id) {
    G.fc.deckId = id; exitReview(); document.getElementById('fc-add-form').classList.add('hidden'); document.getElementById('fc-ai-form').classList.add('hidden'); document.getElementById('fc-empty').classList.add('hidden');
    const dk = G.data.flashDecks.find(d => d.id === id); if (!dk) return;
    const sub = G.data.subjects.find(s => s.id === dk.subjectId); const due = dk.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length; const mastered = dk.cards.filter(c => c.interval >= 21).length;
    document.getElementById('fc-deck-header').classList.remove('hidden'); document.getElementById('fc-deck-name').textContent = sub ? sub.name : 'مجموعة عامة';
    document.getElementById('fc-deck-stats').innerHTML = `<span class="fc-stat-pill total"><i data-lucide="layers"></i> ${dk.cards.length}</span><span class="fc-stat-pill due"><i data-lucide="timer"></i> ${due} للمراجعة</span><span class="fc-stat-pill mastered"><i data-lucide="star"></i> ${mastered}</span>`;
    renderFCCards(dk); renderFCDecks(); lucide.createIcons();
}
function renderFCCards(dk) {
    document.getElementById('fc-review-mode').classList.add('hidden'); const grid = document.getElementById('fc-cards-grid');
    if (!dk.cards.length) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon"><i data-lucide="layers"></i></div><p>لا بطاقات بعد</p></div>`; lucide.createIcons(); return; }
    grid.innerHTML = dk.cards.map(c => `<div class="fc-card-mini"><button class="fc-card-mini-del" onclick="deleteCard('${dk.id}','${c.id}')"><i data-lucide="x-circle"></i></button><div class="fc-card-mini-front">${c.front}</div><div class="fc-card-mini-back">${c.back}</div><div class="fc-card-interval">${c.interval >= 21 ? '★ محفوظة' : c.nextReview && c.nextReview > Date.now() ? '<bdi>' + Math.ceil((c.nextReview - Date.now()) / 86400000) + 'd</bdi>' : 'للمراجعة'}</div></div>`).join('');
    lucide.createIcons();
}
function deleteDeck(id) { if (!confirm('حذف المجموعة؟')) return; G.data.flashDecks = G.data.flashDecks.filter(d => d.id !== id); if (G.fc.deckId === id) { G.fc.deckId = null; showFCEmpty(); } saveData(); renderFCDecks(); }
function deleteCard(deckId, cardId) { const dk = G.data.flashDecks.find(d => d.id === deckId); if (!dk) return; dk.cards = dk.cards.filter(c => c.id !== cardId); saveData(); selectDeck(deckId); }
function showFCEmpty() { document.getElementById('fc-deck-header').classList.add('hidden'); document.getElementById('fc-cards-grid').innerHTML = '';['fc-add-form', 'fc-ai-form', 'fc-review-mode'].forEach(id => document.getElementById(id)?.classList.add('hidden')); document.getElementById('fc-empty').classList.remove('hidden'); lucide.createIcons(); }
function addDeckFromForm() { const subId = document.getElementById('fc-deck-subject').value; const dk = { id: uid(), subjectId: subId, cards: [] }; G.data.flashDecks.push(dk); saveData(); document.getElementById('fc-add-deck-form').classList.add('hidden'); renderFCDecks(); selectDeck(dk.id); showToast('تم إنشاء المجموعة', 'success'); }
function saveCard() {
    const front = document.getElementById('fc-front').value.trim(); const back = document.getElementById('fc-back').value.trim(); if (!front || !back) { showToast('اكمل الوجهين', 'error'); return; }
    const dk = G.data.flashDecks.find(d => d.id === G.fc.deckId); if (!dk) return;
    const card = { id: uid(), front, back, interval: 1, reps: 0, ease: 2.5, nextReview: null }; dk.cards.push(card); saveData(); selectDeck(dk.id);
    document.getElementById('fc-front').value = ''; document.getElementById('fc-back').value = ''; document.getElementById('fc-add-form').classList.add('hidden');
    updateFCBadge();
}
async function generateAICards() {
    const text = document.getElementById('fc-ai-text').value.trim(); const count = parseInt(document.getElementById('fc-ai-count').value) || 6;
    if (!text) { showToast('الصق محتوى أولاً', 'error'); return; } if (!G.fc.deckId) { showToast('اختر مجموعة أولاً', 'error'); return; }
    document.getElementById('fc-ai-loading').classList.remove('hidden'); document.getElementById('fc-ai-generate').disabled = true;
    try {
        const r = await fetch('https://deep-focus-v2.eslammisbah538.workers.dev/api/ai/generate-cards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, count }) });
        const d = await r.json(); const cards = d.cards;
        const dk = G.data.flashDecks.find(d => d.id === G.fc.deckId);
        const newCards = cards.map(c => ({ id: uid(), front: c.front, back: c.back, interval: 1, reps: 0, ease: 2.5, nextReview: null }));
        dk.cards.push(...newCards); G.data.aiCardsGenerated = true; saveData(); selectDeck(dk.id);
        document.getElementById('fc-ai-form').classList.add('hidden'); document.getElementById('fc-ai-text').value = '';
        updateFCBadge(); showToast('تم توليد ' + cards.length + ' بطاقة!', 'success');
    } catch (e) { showToast('فشل التوليد', 'error'); }
    finally { document.getElementById('fc-ai-loading').classList.add('hidden'); document.getElementById('fc-ai-generate').disabled = false; }
}
function startReview() {
    const dk = G.data.flashDecks.find(d => d.id === G.fc.deckId); if (!dk || !dk.cards.length) { showToast('لا بطاقات', 'error'); return; }
    G.fc.reviewQ = dk.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()); if (!G.fc.reviewQ.length) { showToast('لا بطاقات للمراجعة الآن!', 'success'); return; }
    G.fc.reviewIdx = 0; G.fc.flipped = false; document.getElementById('fc-cards-grid').innerHTML = ''; document.getElementById('fc-deck-header').classList.add('hidden'); document.getElementById('fc-review-mode').classList.remove('hidden'); showReviewCard();
}
function showReviewCard() {
    const card = G.fc.reviewQ[G.fc.reviewIdx]; if (!card) { reviewDone(); return; }
    G.fc.flipped = false; document.getElementById('fc-card').classList.remove('flipped'); document.getElementById('fc-card-front').textContent = card.front; document.getElementById('fc-card-back').textContent = card.back;
    document.getElementById('fc-rev-progress').textContent = `البطاقة ${G.fc.reviewIdx + 1} من ${G.fc.reviewQ.length}`; document.getElementById('fc-flip-hint').classList.remove('hidden'); document.getElementById('fc-review-actions').classList.add('hidden');
}
function flipCard() { if (G.fc.flipped) return; G.fc.flipped = true; document.getElementById('fc-card').classList.add('flipped'); document.getElementById('fc-flip-hint').classList.add('hidden'); document.getElementById('fc-review-actions').classList.remove('hidden'); }
function rateCard(knew) {
    const card = G.fc.reviewQ[G.fc.reviewIdx]; if (!card) return; const dk = G.data.flashDecks.find(d => d.id === G.fc.deckId); const realCard = dk.cards.find(c => c.id === card.id); if (!realCard) return;
    if (!knew) {
        realCard.interval = 1; realCard.reps = 0; realCard.ease = Math.max(1.3, (realCard.ease || 2.5) - .2);
        // البطاقة لسه محتاجة مراجعة — رجّعها آخر طابور المراجعة الحالية عشان تظهر تاني
        // قبل ما الجلسة تخلص، مش تتأجل ليوم كامل وتختفي من الجلسة الحالية
        G.fc.reviewQ.push(realCard);
    } else {
        if (!realCard.reps) realCard.interval = 1; else if (realCard.reps === 1) realCard.interval = 3; else realCard.interval = Math.round((realCard.interval || 1) * (realCard.ease || 2.5));
        realCard.reps = (realCard.reps || 0) + 1; realCard.ease = Math.min(2.5, (realCard.ease || 2.5) + .05);
    }
    realCard.nextReview = Date.now() + realCard.interval * 86400000; G.data.totalCardReviews = (G.data.totalCardReviews || 0) + 1; saveData(); G.fc.reviewIdx++; showReviewCard(); updateFCBadge();
}
function reviewDone() {
    document.getElementById('fc-review-mode').innerHTML = `<div class="fc-review-done"><div class="review-done-icon"><i data-lucide="trophy"></i></div><h3 style="font-size:1.05rem;margin-bottom:5px">مراجعة مكتملة!</h3><p style="color:var(--tm);font-size:.84rem">${G.fc.reviewQ.length} بطاقات تمت.</p><button class="btn-primary" style="margin-top:14px" onclick="selectDeck('${G.fc.deckId}')">رجوع</button></div>`;
    updateFCBadge();
    lucide.createIcons();
}
function exitReview() {
    const rm = document.getElementById('fc-review-mode'); if (!rm) return; rm.classList.add('hidden');
    rm.innerHTML = `<div class="fc-review-progress"><span id="fc-rev-progress">البطاقة 1</span><button class="btn-ghost btn-sm" id="fc-rev-exit"><i data-lucide="x"></i> خروج</button></div><div class="fc-card-wrap"><div class="fc-card" id="fc-card" onclick="flipCard()"><div class="fc-front"><div id="fc-card-front"></div></div><div class="fc-back"><div id="fc-card-back"></div></div></div></div><p id="fc-flip-hint" class="fc-hint"><i data-lucide="pointer"></i> اضغط لرؤية الإجابة</p><div id="fc-review-actions" class="fc-review-actions hidden"><button class="btn-missed" id="fc-missed"><i data-lucide="x-circle"></i> لم أعرف</button><button class="btn-got-it" id="fc-got-it"><i data-lucide="check-circle"></i> عرفتها!</button></div>`;
    // ملاحظة: مفيش حاجة لإضافة addEventListener هنا — الـ click delegated listener
    // على #sec-flashcards (في DOMContentLoaded) بيغطي fc-rev-exit / fc-missed / fc-got-it
    // تلقائياً مهما اتعمل rebuild للـ DOM. إضافتها هنا كانت بتسبب استدعاء rateCard() مرتين لكل ضغطة.
    lucide.createIcons();
}

// ── AMBIENT SOUNDS
let audioCtx = null, soundNodes = {}, masterGain = null, masterVolPct = 80, ambTimerInterval = null, ambTimerLeft = 0;
function getAudioCtx() { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.connect(audioCtx.destination); masterGain.gain.value = masterVolPct / 100; } if (audioCtx.state === 'suspended') audioCtx.resume(); return audioCtx; }
function createSoundNode(id) {
    const ctx = getAudioCtx();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(masterGain);

    let sources = [];

    if (id === 'rain') {
        // ── مطر هادئ وعميق: طبقتين، تركيز على الترددات المنخفضة ──

        // طبقة 1: صوت المطر الأساسي — pink noise بتركيز منخفض وناعم
        const bufLen = ctx.sampleRate * 8;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
                b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
                d[i] = (b0 + b1 + b2 + b3 + b4 + b5) * 0.12;
            }
        }
        const rainSrc = ctx.createBufferSource(); rainSrc.buffer = buf; rainSrc.loop = true;
        // bandpass أخفض (700Hz) يعطي عمق أكثر وحدة أقل
        const fR1 = ctx.createBiquadFilter(); fR1.type = 'bandpass'; fR1.frequency.value = 700; fR1.Q.value = 0.35;
        const fR2 = ctx.createBiquadFilter(); fR2.type = 'lowpass'; fR2.frequency.value = 2200;
        const fR3 = ctx.createBiquadFilter(); fR3.type = 'highpass'; fR3.frequency.value = 80;
        const gRain = ctx.createGain(); gRain.gain.value = 0.55;
        rainSrc.connect(fR1); fR1.connect(fR2); fR2.connect(fR3); fR3.connect(gRain); gRain.connect(gainNode);
        rainSrc.start(0); sources.push(rainSrc);

        // طبقة 2: رياح خفيفة مع المطر — أهدأ وأثقل
        const windBufLen = ctx.sampleRate * 6;
        const windBuf = ctx.createBuffer(2, windBufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = windBuf.getChannelData(c);
            let last = 0;
            for (let i = 0; i < windBufLen; i++) {
                last = last * 0.996 + (Math.random() * 2 - 1) * 0.004;
                const t = i / ctx.sampleRate;
                const swell = (Math.sin(t * 0.06 * Math.PI * 2) + Math.sin(t * 0.10 * Math.PI * 2 + 1)) * 0.4 + 1;
                d[i] = last * swell * 2.8;
            }
        }
        const windSrc = ctx.createBufferSource(); windSrc.buffer = windBuf; windSrc.loop = true;
        const fWind = ctx.createBiquadFilter(); fWind.type = 'lowpass'; fWind.frequency.value = 220;
        const gWind = ctx.createGain(); gWind.gain.value = 0.14;
        windSrc.connect(fWind); fWind.connect(gWind); gWind.connect(gainNode);
        windSrc.start(0); sources.push(windSrc);

        // ── رعد وبرق في الخلفية ──
        function scheduleThunder() {
            if (!soundNodes[id]) return;
            // البرق يجي كل 20-50 ثانية (في الخلفية، مش متكرر)
            const nextDelay = Math.random() * 30000 + 20000;

            setTimeout(() => {
                if (!soundNodes[id]) return;
                const now2 = ctx.currentTime;

                // ── فلاش البرق: burst حاد قصير جداً (crack) ──
                const crackLen = Math.floor(ctx.sampleRate * 0.08);
                const crackBuf = ctx.createBuffer(1, crackLen, ctx.sampleRate);
                const cd = crackBuf.getChannelData(0);
                for (let i = 0; i < crackLen; i++) {
                    const env = Math.pow(1 - i / crackLen, 0.5);
                    cd[i] = (Math.random() * 2 - 1) * env;
                }
                const crackSrc = ctx.createBufferSource(); crackSrc.buffer = crackBuf;
                const fCr = ctx.createBiquadFilter(); fCr.type = 'highpass'; fCr.frequency.value = 600;
                const gCr = ctx.createGain(); gCr.gain.value = 0.30;
                crackSrc.connect(fCr); fCr.connect(gCr); gCr.connect(gainNode);
                crackSrc.start(now2);
                crackSrc.onended = () => { try { crackSrc.disconnect(); fCr.disconnect(); gCr.disconnect(); } catch (e) { } };

                // ── دوي الرعد: rumble منخفض طويل يتلاشى ──
                const rumbleLen = Math.floor(ctx.sampleRate * (3 + Math.random() * 2.5));
                const rumbleBuf = ctx.createBuffer(2, rumbleLen, ctx.sampleRate);
                for (let c = 0; c < 2; c++) {
                    const d = rumbleBuf.getChannelData(c);
                    let last = 0;
                    for (let i = 0; i < rumbleLen; i++) {
                        last = last * 0.992 + (Math.random() * 2 - 1) * 0.008;
                        // envelope: ابدأ بسرعة ثم تلاشي بطيء مع اهتزاز
                        const t = i / ctx.sampleRate;
                        const attack = Math.min(1, t / 0.15);
                        const decay = Math.pow(1 - i / rumbleLen, 1.4);
                        const wobble = 1 + Math.sin(t * 18) * 0.12 + Math.sin(t * 7.3) * 0.08;
                        d[i] = last * attack * decay * wobble * 12;
                    }
                }
                const rumbleSrc = ctx.createBufferSource(); rumbleSrc.buffer = rumbleBuf;
                const fRum1 = ctx.createBiquadFilter(); fRum1.type = 'lowpass'; fRum1.frequency.value = 180;
                const fRum2 = ctx.createBiquadFilter(); fRum2.type = 'highpass'; fRum2.frequency.value = 20;
                // الرعد يبدأ بعد البرق بـ 0.5-2 ثانية (المسافة)
                const thunderDelay = 0.5 + Math.random() * 1.5;
                const gRum = ctx.createGain(); gRum.gain.value = 0;
                gRum.gain.setValueAtTime(0, now2 + thunderDelay);
                gRum.gain.linearRampToValueAtTime(0.38, now2 + thunderDelay + 0.12);
                gRum.gain.linearRampToValueAtTime(0, now2 + thunderDelay + rumbleLen / ctx.sampleRate);
                rumbleSrc.connect(fRum1); fRum1.connect(fRum2); fRum2.connect(gRum); gRum.connect(gainNode);
                rumbleSrc.start(now2 + thunderDelay);
                rumbleSrc.onended = () => { try { rumbleSrc.disconnect(); fRum1.disconnect(); fRum2.disconnect(); gRum.disconnect(); } catch (e) { } };

                scheduleThunder();
            }, nextDelay);
        }
        // أول رعد بعد 15-35 ثانية من بدء الصوت
        setTimeout(scheduleThunder, Math.random() * 20000 + 15000);

    } else if (id === 'ocean') {
        // أمواج البحر: ضجيج يتنفس ببطء — مريح وهادئ
        const bufLen = ctx.sampleRate * 10;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = b0 * 0.998 + w * 0.002;
                b1 = b1 * 0.992 + w * 0.008;
                b2 = b2 * 0.970 + w * 0.030;
                const t = i / ctx.sampleRate;
                // موجات بطيئة ومتعددة (بعدد حقيقي)
                const wave = (Math.sin(t * 0.10 * Math.PI * 2) * 0.5 +
                    Math.sin(t * 0.065 * Math.PI * 2 + 1.1) * 0.3 +
                    Math.sin(t * 0.155 * Math.PI * 2 + 2.4) * 0.2);
                const envelope = (wave + 1) * 0.5; // 0..1
                d[i] = (b0 * 0.3 + b1 * 0.4 + b2 * 0.3) * (0.15 + 0.85 * envelope) * 3.5;
            }
        }
        const oceanSrc = ctx.createBufferSource(); oceanSrc.buffer = buf; oceanSrc.loop = true;
        const fLp = ctx.createBiquadFilter(); fLp.type = 'lowpass'; fLp.frequency.value = 800;
        const fHp = ctx.createBiquadFilter(); fHp.type = 'highpass'; fHp.frequency.value = 40;
        const gOcean = ctx.createGain(); gOcean.gain.value = 0.5;
        oceanSrc.connect(fLp); fLp.connect(fHp); fHp.connect(gOcean); gOcean.connect(gainNode);
        oceanSrc.start(0); sources.push(oceanSrc);

    } else if (id === 'nature') {
        // طبيعة: ريح خفيفة (pink noise) + زقزقة طيور هادئة
        const bufLen = ctx.sampleRate * 5;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
                b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
                d[i] = (b0 + b1 + b2 + b3 + b4 + b5) * 0.08;
            }
        }
        const windSrc = ctx.createBufferSource(); windSrc.buffer = buf; windSrc.loop = true;
        const fWind = ctx.createBiquadFilter(); fWind.type = 'lowpass'; fWind.frequency.value = 1200;
        const gWind = ctx.createGain(); gWind.gain.value = 0.45;
        windSrc.connect(fWind); fWind.connect(gWind); gWind.connect(gainNode);
        windSrc.start(0); sources.push(windSrc);

        // ── عصافير في الخلفية: chorus كامل من أنواع مختلفة ──
        // 5 أنواع عصافير بترددات مختلفة تعمل في نفس الوقت
        const birdTypes = [
            { freqBase: 2800, freqRange: 400, chirps: [1, 2], interval: [2.5, 5.0], vol: 0.11 }, // عصفور صغير قريب
            { freqBase: 1900, freqRange: 300, chirps: [2, 4], interval: [3.0, 6.0], vol: 0.09 }, // عصفور متوسط
            { freqBase: 3500, freqRange: 600, chirps: [1, 3], interval: [4.0, 8.0], vol: 0.07 }, // عصفور حاد في البعد
            { freqBase: 1400, freqRange: 200, chirps: [1, 2], interval: [6.0, 12.0], vol: 0.06 }, // طائر أعمق (حمام بعيد)
            { freqBase: 4200, freqRange: 500, chirps: [3, 6], interval: [1.5, 3.5], vol: 0.05 }, // عصفور سريع خلفية
        ];

        // LPF مشترك للعصافير — يخليهم يبانوا بعيدين في الخلفية
        const birdBusLPF = ctx.createBiquadFilter(); birdBusLPF.type = 'lowpass'; birdBusLPF.frequency.value = 2200;
        const birdBusGain = ctx.createGain(); birdBusGain.gain.value = 0.42; // أخفت من الأصل
        birdBusLPF.connect(birdBusGain); birdBusGain.connect(gainNode);

        birdTypes.forEach((bird, bIdx) => {
            function scheduleBirdType() {
                if (!soundNodes[id]) return;
                const delay = bird.interval[0] + Math.random() * (bird.interval[1] - bird.interval[0]);
                const baseFreq = bird.freqBase + Math.random() * bird.freqRange;
                const now2 = ctx.currentTime + delay;
                const numChirps = bird.chirps[0] + Math.floor(Math.random() * (bird.chirps[1] - bird.chirps[0] + 1));
                for (let ch = 0; ch < numChirps; ch++) {
                    const t0 = now2 + ch * (0.08 + Math.random() * 0.06);
                    const dur = 0.06 + Math.random() * 0.10;
                    const pitchVar = 0.92 + Math.random() * 0.18; // تنويع في الطبقة لكل نغمة
                    const freq = baseFreq * pitchVar;
                    const osc = ctx.createOscillator(); osc.type = 'sine';
                    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 1.5; // harmonic خفيف
                    const env = ctx.createGain(); env.gain.value = 0;
                    // شكل الزقزقة: صعود سريع ثم هبوط
                    osc.frequency.setValueAtTime(freq * 0.88, t0);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, t0 + dur * 0.38);
                    osc.frequency.exponentialRampToValueAtTime(freq * 0.94, t0 + dur);
                    env.gain.setValueAtTime(0, t0);
                    env.gain.linearRampToValueAtTime(bird.vol, t0 + dur * 0.20);
                    env.gain.linearRampToValueAtTime(bird.vol * 0.7, t0 + dur * 0.65);
                    env.gain.linearRampToValueAtTime(0, t0 + dur);
                    // توصيل للـ bus LPF بدل gainNode مباشرة — يعطي طابع البُعد
                    osc.connect(env); osc2.connect(env); env.connect(birdBusLPF);
                    osc.start(t0); osc.stop(t0 + dur + 0.02);
                    osc2.start(t0); osc2.stop(t0 + dur + 0.02);
                }
                setTimeout(scheduleBirdType, delay * 1000 + numChirps * 90);
            }
            // كل نوع يبدأ في وقت مختلف عشان ميتضاربوش
            setTimeout(scheduleBirdType, bIdx * 600 + Math.random() * 800);
        });

    } else if (id === 'cafe') {
        // مقهى: همهمة خلفية ناعمة + قرع فناجين خفيف
        const bufLen = ctx.sampleRate * 6;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = b0 * 0.994 + w * 0.006;
                b1 = b1 * 0.980 + w * 0.020;
                b2 = b2 * 0.950 + w * 0.050;
                d[i] = (b0 * 0.4 + b1 * 0.35 + b2 * 0.25) * 2.2;
            }
        }
        const crowdSrc = ctx.createBufferSource(); crowdSrc.buffer = buf; crowdSrc.loop = true;
        const fC = ctx.createBiquadFilter(); fC.type = 'bandpass'; fC.frequency.value = 500; fC.Q.value = 0.5;
        const fCHp = ctx.createBiquadFilter(); fCHp.type = 'highpass'; fCHp.frequency.value = 150;
        const gCrowd = ctx.createGain(); gCrowd.gain.value = 0.42;
        crowdSrc.connect(fC); fC.connect(fCHp); fCHp.connect(gCrowd); gCrowd.connect(gainNode);
        crowdSrc.start(0); sources.push(crowdSrc);

        // قرع فنجان — واضح وخفيف
        function scheduleClink() {
            if (!soundNodes[id]) return;
            const delay = Math.random() * 10 + 4;
            const now2 = ctx.currentTime + delay;
            const freq = 2000 + Math.random() * 800;
            const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
            const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 1.6;
            const env = ctx.createGain(); env.gain.value = 0;
            env.gain.setValueAtTime(0.10, now2);
            env.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.55);
            osc.connect(env); osc2.connect(env); env.connect(gainNode);
            osc.start(now2); osc.stop(now2 + 0.6);
            osc2.start(now2); osc2.stop(now2 + 0.6);
            osc.onended = () => { try { osc.disconnect(); osc2.disconnect(); env.disconnect(); } catch (e) { } scheduleClink(); };
        }
        setTimeout(scheduleClink, 2000);

    } else if (id === 'fire') {
        // ── مدفأة: طبقة noise عضوية واحدة + LFO حي على الـ filter + طقطقة خشب فقط ──

        // النار الحقيقية = noise منخفض مُشكَّل، مع filter frequency يتحرك بشكل حي وغير منتظم
        // هكذا نحصل على الهيجان والتجاج والجرجرة كلها من مصدر واحد

        // ── Buffer: pink noise هادئ جداً (خام، التشكيل يجي من الفلتر) ──
        const bufLen = ctx.sampleRate * 9;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                // pink noise ثقيل — أكثر حضوراً في الترددات المنخفضة
                b0 = 0.99886 * b0 + w * 0.0555179;
                b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520;
                b3 = 0.86650 * b3 + w * 0.3104856;
                d[i] = (b0 + b1 + b2 + b3) * 0.11;
            }
        }
        const fireSrc = ctx.createBufferSource(); fireSrc.buffer = buf; fireSrc.loop = true;

        // ── فلتر مزدوج: lowpass يتحرك + highpass ثابت يقطع الترددات الدنيا جداً ──
        const fLive = ctx.createBiquadFilter(); fLive.type = 'lowpass'; fLive.frequency.value = 380; fLive.Q.value = 0.8;
        const fHp = ctx.createBiquadFilter(); fHp.type = 'highpass'; fHp.frequency.value = 22;
        const gFire = ctx.createGain(); gFire.gain.value = 0.48;

        fireSrc.connect(fLive); fLive.connect(fHp); fHp.connect(gFire); gFire.connect(gainNode);
        fireSrc.start(0); sources.push(fireSrc);

        // ── LFO حي: يحرّك fLive.frequency بشكل غير منتظم تماماً ──
        // هذا هو سر الهيجان والتجاج — مش gain يتأرجح، بل الـ filter نفسه يهيج
        (function animateFireFilter() {
            if (!soundNodes[id]) return;
            const now2 = ctx.currentTime;
            // 3 موجات بترددات أولية (لا تتكرر معاً أبداً)
            const base = 340; // مركز الطيف الدافئ للنار
            const swing = 160; // مدى التأرجح — لو كبّرناه تهيج أكثر
            const t = now2;
            const val = base
                + Math.sin(t * 0.41) * swing * 0.55   // هيجان بطيء أساسي
                + Math.sin(t * 1.13 + 1.7) * swing * 0.28   // تجاج متوسط
                + Math.sin(t * 2.97 + 0.4) * swing * 0.17   // جرجرة سريعة خفيفة
                + (Math.random() - 0.5) * 35;            // عشوائية صغيرة تكسر التكرار
            fLive.frequency.setTargetAtTime(Math.max(60, val), now2, 0.08);
            setTimeout(animateFireFilter, 40); // 25fps يكفي وما يكلّفش
        })();

        // ── طقطقة خشب فقط: بسيطة، نادرة، منخفضة — لا شرر ولا فرقعات ──
        (function scheduleCrackle() {
            if (!soundNodes[id]) return;
            const delay = 3 + Math.random() * 7; // كل 3–10 ثوانٍ
            const now2 = ctx.currentTime + delay;
            // الطقطقة: noise burst قصير جداً بـ envelope حاد
            const len = Math.floor(ctx.sampleRate * (0.018 + Math.random() * 0.022));
            const cbuf = ctx.createBuffer(1, len, ctx.sampleRate);
            const cd = cbuf.getChannelData(0);
            let cl = 0;
            for (let i = 0; i < len; i++) {
                cl = cl * 0.82 + (Math.random() * 2 - 1) * 0.18;
                cd[i] = cl * Math.pow(1 - i / len, 2.2);
            }
            const cSrc = ctx.createBufferSource(); cSrc.buffer = cbuf;
            // LPF عند 600–900Hz — يبقيها دافئة خشبية، مش حادة بلاستيكية
            const fC = ctx.createBiquadFilter(); fC.type = 'lowpass'; fC.frequency.value = 600 + Math.random() * 300;
            const gC = ctx.createGain(); gC.gain.value = 0.09 + Math.random() * 0.08;
            cSrc.connect(fC); fC.connect(gC); gC.connect(gainNode);
            cSrc.start(now2);
            cSrc.onended = () => { try { cSrc.disconnect(); fC.disconnect(); gC.disconnect(); } catch (e) { } scheduleCrackle(); };
        })();

    } else if (id === 'lofi') {
        // لو-فاي: drone ثابت + pad ناعم + melody بطيئة + vinyl crackle

        // ── Drone: نغمة واحدة ثابتة مستمرة (C2) مع LFO هادئ جداً ──
        const droneFreq = 65.41; // C2
        const droneOsc = ctx.createOscillator(); droneOsc.type = 'sine'; droneOsc.frequency.value = droneFreq;
        const droneOsc2 = ctx.createOscillator(); droneOsc2.type = 'sine'; droneOsc2.frequency.value = droneFreq * 2;
        const droneOsc3 = ctx.createOscillator(); droneOsc3.type = 'triangle'; droneOsc3.frequency.value = droneFreq * 3;
        // LFO بطيء جداً يحرك volume بلطف (تنفس)
        const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.06;
        const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.012;
        lfo.connect(lfoGain);
        const droneGain = ctx.createGain(); droneGain.gain.value = 0.055;
        lfoGain.connect(droneGain.gain);
        const droneLPF = ctx.createBiquadFilter(); droneLPF.type = 'lowpass'; droneLPF.frequency.value = 600;
        droneOsc.connect(droneLPF); droneOsc2.connect(droneLPF); droneOsc3.connect(droneLPF);
        droneLPF.connect(droneGain); droneGain.connect(gainNode);
        droneOsc.start(0); droneOsc2.start(0); droneOsc3.start(0); lfo.start(0);
        sources.push(droneOsc, droneOsc2, droneOsc3, lfo);

        // ── Pad: طبقة هارمونية ناعمة (Cm: C+Eb+G) تتراكب ببطء ──
        const padNotes = [65.41, 77.78, 98.00, 130.81, 155.56]; // C2 Eb2 G2 C3 G3
        const padLPF = ctx.createBiquadFilter(); padLPF.type = 'lowpass'; padLPF.frequency.value = 900;
        const padGain = ctx.createGain(); padGain.gain.value = 0.0;
        padLPF.connect(padGain); padGain.connect(gainNode);
        // Pad يفيد ببطء شديد (4 ثوانٍ attack)
        padGain.gain.setValueAtTime(0, ctx.currentTime);
        padGain.gain.linearRampToValueAtTime(0.038, ctx.currentTime + 4.0);
        padNotes.forEach((freq, i) => {
            const po = ctx.createOscillator(); po.type = 'sine'; po.frequency.value = freq;
            const po2 = ctx.createOscillator(); po2.type = 'sine'; po2.frequency.value = freq * 2;
            po.connect(padLPF); po2.connect(padLPF);
            po.start(0); po2.start(0);
            sources.push(po, po2);
        });

        // ── Melody بطيئة: نغمات pentatonic منفردة متباعدة (Cm penta) ──
        const melodyNotes = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 311.13, 349.23]; // C4 Eb4 F4 G4 Bb4 C5 ...
        let melIdx = 0;
        function playMelNote() {
            if (!soundNodes[id]) return;
            const freq = melodyNotes[melIdx % melodyNotes.length];
            // قفز عشوائي أحياناً لعدم الرتابة
            melIdx += (Math.random() < 0.3) ? 2 : 1;
            const melLPF = ctx.createBiquadFilter(); melLPF.type = 'lowpass'; melLPF.frequency.value = 1400;
            const melGain = ctx.createGain(); melGain.gain.value = 0;
            melLPF.connect(melGain); melGain.connect(gainNode);
            const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
            const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2;
            osc.connect(melLPF); osc2.connect(melLPF);
            const now2 = ctx.currentTime + 0.01;
            const vel = 0.04 + Math.random() * 0.02;
            const dur = 1.8 + Math.random() * 0.8;
            melGain.gain.setValueAtTime(0, now2);
            melGain.gain.linearRampToValueAtTime(vel, now2 + 0.12);
            melGain.gain.exponentialRampToValueAtTime(vel * 0.3, now2 + 1.0);
            melGain.gain.linearRampToValueAtTime(0, now2 + dur);
            osc.start(now2); osc.stop(now2 + dur + 0.05);
            osc2.start(now2); osc2.stop(now2 + dur + 0.05);
            osc.onended = () => { try { osc.disconnect(); osc2.disconnect(); melLPF.disconnect(); melGain.disconnect(); } catch (e) { } };
            // فترة صمت بين النغمات: 2.5 إلى 5 ثوانٍ (بطيء وتأملي)
            const nextGap = 2500 + Math.random() * 2500;
            setTimeout(playMelNote, nextGap);
        }
        setTimeout(playMelNote, 1200);

        // Vinyl crackle خفيف جداً في الخلفية
        const vBufLen = ctx.sampleRate * 5;
        const vBuf = ctx.createBuffer(1, vBufLen, ctx.sampleRate);
        const vd = vBuf.getChannelData(0);
        for (let i = 0; i < vBufLen; i++) {
            vd[i] = Math.random() < 0.0010 ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.002;
        }
        const vinylSrc = ctx.createBufferSource(); vinylSrc.buffer = vBuf; vinylSrc.loop = true;
        const fVin = ctx.createBiquadFilter(); fVin.type = 'bandpass'; fVin.frequency.value = 3500; fVin.Q.value = 0.5;
        const gVin = ctx.createGain(); gVin.gain.value = 0.10;
        vinylSrc.connect(fVin); fVin.connect(gVin); gVin.connect(gainNode);
        vinylSrc.start(0); sources.push(vinylSrc);

    } else if (id === 'night') {
        // أصوات الليل: ريح ليلية هادئة + صراصير بإيقاع طبيعي
        const bufLen = ctx.sampleRate * 5;
        const buf = ctx.createBuffer(2, bufLen, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = buf.getChannelData(c);
            let b0 = 0, b1 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = b0 * 0.992 + w * 0.008;
                b1 = b1 * 0.975 + w * 0.025;
                d[i] = (b0 * 0.5 + b1 * 0.5) * 1.2;
            }
        }
        const nightWind = ctx.createBufferSource(); nightWind.buffer = buf; nightWind.loop = true;
        const fNw = ctx.createBiquadFilter(); fNw.type = 'lowpass'; fNw.frequency.value = 600;
        const gNw = ctx.createGain(); gNw.gain.value = 0.28;
        nightWind.connect(fNw); fNw.connect(gNw); gNw.connect(gainNode);
        nightWind.start(0); sources.push(nightWind);

        // صراصير بإيقاع منتظم وطبيعي (مش عشوائي جداً)
        let cricketPhase = 0;
        function scheduleCricket() {
            if (!soundNodes[id]) return;
            const chirpInterval = 0.38 + Math.random() * 0.08; // ~2.5 chirps/sec
            const now2 = ctx.currentTime + 0.05;
            const freq = 3800 + Math.sin(cricketPhase) * 200; // تردد يتأرجح قليلاً
            cricketPhase += 0.3;
            // 3 نبضات سريعة لكل دورة
            for (let ch = 0; ch < 3; ch++) {
                const t0 = now2 + ch * 0.038;
                const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
                const env = ctx.createGain(); env.gain.value = 0;
                env.gain.setValueAtTime(0, t0);
                env.gain.linearRampToValueAtTime(0.045, t0 + 0.008);
                env.gain.linearRampToValueAtTime(0, t0 + 0.032);
                osc.connect(env); env.connect(gainNode);
                osc.start(t0); osc.stop(t0 + 0.04);
            }
            setTimeout(scheduleCricket, chirpInterval * 1000);
        }
        scheduleCricket();
    }

    const firstSrc = sources[0];
    return { source: firstSrc || { stop: () => { } }, gain: gainNode, _allSources: sources };
}
function playSound(id, volumePct) { if (soundNodes[id]) return; const node = createSoundNode(id); soundNodes[id] = node; node.gain.gain.setTargetAtTime((volumePct / 100) * .8, audioCtx.currentTime, .3); updateAmbientUI(); }
function stopSound(id) { if (!soundNodes[id]) return; const node = soundNodes[id]; node.gain.gain.setTargetAtTime(0, audioCtx.currentTime, .5); setTimeout(() => { try { if (node._allSources) { node._allSources.forEach(s => { try { s.stop(); } catch (e) { } }); } else { node.source.stop(); } } catch (e) { } delete soundNodes[id]; updateAmbientUI(); }, 800); }
function stopAllSounds() { Object.keys(soundNodes).forEach(id => stopSound(id)); if (ambTimerInterval) { clearInterval(ambTimerInterval); ambTimerInterval = null; } document.getElementById('amb-timer-display')?.classList.add('hidden'); updateAmbientUI(); }
function setSoundVolume(id, pct) { if (!soundNodes[id]) return; soundNodes[id].gain.gain.setTargetAtTime((pct / 100) * .8, audioCtx.currentTime, .1); }
function setMasterVolume(pct) { masterVolPct = parseInt(pct); const ml = document.getElementById('master-vol-label'); if (ml) ml.textContent = pct + '%'; if (masterGain) masterGain.gain.setTargetAtTime(masterVolPct / 100, audioCtx.currentTime, .1); }
function toggleSound(id, volPct) { if (soundNodes[id]) stopSound(id); else playSound(id, parseInt(volPct) || 60); }
function applyPreset(name, btn) { stopAllSounds(); const preset = PRESETS[name]; if (!preset) return; document.querySelectorAll('.amb-preset').forEach(b => b.classList.remove('active')); if (btn) btn.classList.add('active'); setTimeout(() => { Object.entries(preset).forEach(([id, vol]) => { playSound(id, vol); const s = document.querySelector('[data-vol="' + id + '"]'); if (s) s.value = vol; }); updateAmbientUI(); }, 100); }
function updateAmbientUI() {
    const playing = Object.keys(soundNodes), np = document.getElementById('ambient-now-playing'), anp = document.getElementById('anp-names'); if (!np) return;
    if (playing.length > 0) { np.classList.remove('hidden'); if (anp) anp.textContent = playing.map(id => { const d = SOUND_DEFS.find(x => x.id === id); return d ? d.name : id; }).join(' · '); } else { np.classList.add('hidden'); document.querySelectorAll('.amb-preset').forEach(b => b.classList.remove('active')); }
    SOUND_DEFS.forEach(def => { const card = document.querySelector('[data-sound="' + def.id + '"]'); if (!card) return; const isP = !!soundNodes[def.id]; card.classList.toggle('playing', isP); const btn = card.querySelector('.sc-play-btn'); if (btn) btn.innerHTML = isP ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>'; const st = card.querySelector('.sc-status'); if (st) st.textContent = isP ? 'يعزف' : 'متوقف'; lucide.createIcons(); });
}
function startAmbTimer() { const mins = parseInt(document.getElementById('amb-timer-sel')?.value); if (!mins) return; if (ambTimerInterval) clearInterval(ambTimerInterval); ambTimerLeft = mins * 60; const display = document.getElementById('amb-timer-display'); if (display) display.classList.remove('hidden'); ambTimerInterval = setInterval(() => { ambTimerLeft--; const m = Math.floor(ambTimerLeft / 60), s = ambTimerLeft % 60; if (display) display.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); if (ambTimerLeft <= 0) { clearInterval(ambTimerInterval); ambTimerInterval = null; stopAllSounds(); if (display) display.classList.add('hidden'); showToast('انتهى التايمر', 'success'); } }, 1000); showToast('تايمر: ' + mins + 'm', 'success'); }
function renderAmbientSection() {
    const grid = document.getElementById('sounds-grid'); if (!grid) return;
    grid.innerHTML = SOUND_DEFS.map(def => { const isP = !!soundNodes[def.id]; const vol = def.vol; return `<div class="sound-card ${isP ? 'playing' : ''}" data-sound="${def.id}" style="--sc-color:${def.color}"><div class="sc-emoji"><i data-lucide="${def.icon}"></i></div><div class="sc-sound-name">${def.name}</div><div class="sc-sound-desc">${def.desc}</div><div class="sc-controls"><button class="sc-play-btn" onclick="toggleSound('${def.id}',document.querySelector('[data-vol=\\'${def.id}\\']')?.value||${vol})">${isP ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>'}</button><div class="sc-vol-wrap"><div class="sc-vol-label"><span>الصوت</span><span id="vol-label-${def.id}">${vol}%</span></div><input type="range" class="sc-vol-slider" data-vol="${def.id}" min="0" max="100" value="${vol}" style="background:linear-gradient(to right,${def.color} 0%,${def.color} ${vol}%,var(--s3) ${vol}%,var(--s3) 100%)" oninput="this.style.background='linear-gradient(to right,${def.color} 0%,${def.color} '+this.value+'%,var(--s3) '+this.value+'%,var(--s3) 100%)';var l=document.getElementById('vol-label-${def.id}');if(l)l.textContent=this.value+'%';setSoundVolume('${def.id}',this.value);"></div></div><div class="sc-status">${isP ? 'يعزف' : 'متوقف'}</div></div>`; }).join('');
    lucide.createIcons();
}

// ── WEEKLY STATS (التعديل 5 و 6 و 7)
function getWeeklyStats() {
    const now = new Date();
    const weekDates = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); weekDates.push(d.toISOString().slice(0, 10)); }
    const sessions = G.data.sessions.filter(s => s.type === 'pomo' && weekDates.includes(s.date));
    const totalMin = sessions.reduce((a, s) => a + s.duration, 0);
    const totalHours = Math.round(totalMin / 60 * 10) / 10;
    const activeDays = new Set(sessions.map(s => s.date)).size;
    const pomodoroCount = sessions.length;
    const avgSession = pomodoroCount > 0 ? Math.round(totalMin / pomodoroCount) : 0;
    const byDate = {}; weekDates.forEach(d => { byDate[d] = 0; }); sessions.forEach(s => { byDate[s.date] = (byDate[s.date] || 0) + s.duration; });
    const bestDayMin = Math.max(0, ...Object.values(byDate));
    const bestDayDate = Object.entries(byDate).find(([, v]) => v === bestDayMin)?.[0];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const bestDayName = bestDayDate ? dayNames[new Date(bestDayDate).getDay()] : '—';
    const bySub = {}; sessions.forEach(s => { bySub[s.subjectId || ''] = (bySub[s.subjectId || ''] || 0) + s.duration; });
    const topSubId = Object.entries(bySub).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topSub = G.data.subjects.find(s => s.id === topSubId);
    const topSubName = topSub ? topSub.name : (sessions.length > 0 ? 'دراسة عامة' : '—');
    let rating, ratingLabel;
    if (totalHours >= 15) { rating = 'أسطورة'; ratingLabel = '15+ h'; }
    else if (totalHours >= 10) { rating = 'متفوق'; ratingLabel = '10+ h'; }
    else if (totalHours >= 5) { rating = 'منتظم'; ratingLabel = '5+ h'; }
    else { rating = 'مبتدئ'; ratingLabel = 'أقل من 5h'; }
    return { totalHours, activeDays, pomodoroCount, avgSession, bestDayMin: Math.round(bestDayMin / 60 * 10) / 10, bestDayName, topSubName, rating, ratingLabel, weekDates, byDate };
}

function showWeeklyWrapped() {
    const s = getWeeklyStats();
    const ratingColors = { 'أسطورة': '#5b8aff', 'متفوق': '#00e5c5', 'منتظم': '#ffb347', 'مبتدئ': '#8b5cf6' };
    const ratingIcons = { 'أسطورة': 'trophy', 'متفوق': 'star', 'منتظم': 'check-circle', 'مبتدئ': 'sunrise' };
    const ratingColor = ratingColors[s.rating] || '#5b8aff';
    const ratingIcon = ratingIcons[s.rating] || 'star';
    // Bar sparkline
    const maxH = Math.max(...Object.values(s.byDate), 1);
    const bars = s.weekDates.map((d, i) => {
        const val = s.byDate[d] || 0; const pct = Math.round((val / maxH) * 100);
        const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(d).getDay()];
        const isToday = d === today();
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1"><div style="width:100%;background:var(--s3);border-radius:4px;height:50px;display:flex;align-items:flex-end;overflow:hidden"><div style="width:100%;background:${isToday ? ratingColor : ratingColor + '88'};border-radius:3px 3px 0 0;height:${pct}%;transition:height .5s ease ${i * .05}s"></div></div><div style="font-size:.6rem;color:var(--tm);font-weight:700">${dayAbbr}</div></div>`;
    }).join('');
    openModal('ملخص الأسبوع',
        `<div style="text-align:center;padding:8px 0">
                    <div style="display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:16px;background:linear-gradient(135deg,${ratingColor}22,${ratingColor}44);border:2px solid ${ratingColor};margin-bottom:10px"><i data-lucide="${ratingIcon}" style="width:26px;height:26px;color:${ratingColor}"></i></div>
                    <div style="font-size:3.2rem;font-weight:900;color:${ratingColor};line-height:1;font-family:var(--f-h)">${s.totalHours}<span style="font-size:1.2rem;font-weight:700;color:var(--tm)"> h</span></div>
                    <div style="font-size:.76rem;color:var(--tm);margin-bottom:4px">إجمالي التركيز هذا الأسبوع</div>
                    <div style="display:inline-block;background:${ratingColor}22;border:1px solid ${ratingColor}66;color:${ratingColor};padding:4px 16px;border-radius:20px;font-size:.8rem;font-weight:800;margin-bottom:18px">${s.rating}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
                        <div style="background:var(--s2);border-radius:12px;padding:13px;text-align:center"><div style="display:flex;justify-content:center;margin-bottom:6px;color:var(--p)"><i data-lucide="calendar-check" style="width:18px;height:18px"></i></div><div style="font-size:1.4rem;font-weight:900;color:var(--tx)">${s.activeDays}</div><div style="font-size:.68rem;color:var(--tm)">أيام نشطة</div></div>
                        <div style="background:var(--s2);border-radius:12px;padding:13px;text-align:center"><div style="display:flex;justify-content:center;margin-bottom:6px;color:var(--ac)"><i data-lucide="timer" style="width:18px;height:18px"></i></div><div style="font-size:1.4rem;font-weight:900;color:var(--tx)">${s.pomodoroCount}</div><div style="font-size:.68rem;color:var(--tm)">جلسة بومودورو</div></div>
                        <div style="background:var(--s2);border-radius:12px;padding:13px;text-align:center"><div style="display:flex;justify-content:center;margin-bottom:6px;color:var(--wa)"><i data-lucide="trending-up" style="width:18px;height:18px"></i></div><div style="font-size:1.4rem;font-weight:900;color:var(--tx)">${s.avgSession}<span style="font-size:.75rem;color:var(--tm)">m</span></div><div style="font-size:.68rem;color:var(--tm)">متوسط الجلسة</div></div>
                        <div style="background:var(--s2);border-radius:12px;padding:13px;text-align:center"><div style="display:flex;justify-content:center;margin-bottom:6px;color:var(--ok)"><i data-lucide="zap" style="width:18px;height:18px"></i></div><div style="font-size:1.4rem;font-weight:900;color:var(--tx)">${s.bestDayMin}<span style="font-size:.75rem;color:var(--tm)">h</span></div><div style="font-size:.68rem;color:var(--tm)">أفضل يوم · ${s.bestDayName}</div></div>
                    </div>
                    <div style="background:var(--s2);border-radius:12px;padding:12px;margin-bottom:14px;text-align:right"><div style="font-size:.7rem;color:var(--tm);margin-bottom:8px;display:flex;align-items:center;gap:5px"><i data-lucide="book-open" style="width:13px;height:13px"></i> المادة الأكثر دراسة</div><div style="font-weight:800;font-size:.92rem;color:var(--tx)">${s.topSubName}</div></div>
                    <div style="display:flex;gap:5px;align-items:flex-end;padding:8px 0;direction:ltr">${bars}</div>
                </div>`,
        `<button class="btn-primary" onclick="closeModal()">رائع!</button>`
    );
    lucide.createIcons();
    // Save that we showed this week's summary
    const weekKey = today().slice(0, 7) + '-W' + getWeekNumber();
    localStorage.setItem('df_wrapped_shown', weekKey);
}

function getWeekNumber() {
    const d = new Date(); const startOfYear = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
}

function checkAutoShowWrapped() {
    const now = new Date();
    if (now.getDay() !== 0) return; // Only on Sunday
    const weekKey = today().slice(0, 7) + '-W' + getWeekNumber();
    const shown = localStorage.getItem('df_wrapped_shown');
    if (shown === weekKey) return;
    const s = getWeeklyStats();
    if (s.pomodoroCount === 0) return; // No sessions this week, skip
    setTimeout(() => showWeeklyWrapped(), 2000);
}

// ── STATS
// ── AI CHAT
function renderAIHelp() {
    const name = G.data.name || 'يا صديق';
    const now = new Date();
    const hour = now.getHours();
    const todayMin = G.data.sessions.filter(s => s.date === today() && s.type === 'pomo').reduce((a, s) => a + s.duration, 0);
    const dueCards = getDueCards().length;
    const weekly = getWeeklyStats();
    const activeSubs = G.data.subjects.filter(s => !s.archived);
    // نفس منطق اختيار "أخطر مادة" المستخدم في buildSystemPrompt (بدقة الساعة عبر getExamMsLeft)
    // عشان رسالة الترحيب هنا والـ AI نفسه يتفقوا دايمًا على نفس المادة، مش يختاروا مادتين مختلفتين في الحالات الحدّية
    const urgentSub = activeSubs.filter(s => s.examDate && getExamMsLeft(s) !== null && getExamMsLeft(s) > 0).sort((a, b) => getExamMsLeft(a) - getExamMsLeft(b))[0];
    const allSess = G.data.sessions.filter(s => s.type === 'pomo');
    const totalHours = Math.round(allSess.reduce((a, s) => a + s.duration, 0) / 60 * 10) / 10;

    // ── تحية ديناميكية حسب الوقت والحالة
    let greet = '';
    if (hour < 5) greet = `${name}، ليلة عمل جاد`;
    else if (hour < 12) greet = `صباح التفوق يا ${name}`;
    else if (hour < 17) greet = `مساء الإنجاز يا ${name}`;
    else greet = `مساء الخير يا ${name}`;
    document.getElementById('ai-greet').innerHTML = greet;

    // ── رسالة سياقية ذكية
    let contextMsg = '';
    if (urgentSub && daysUntil(urgentSub.examDate) === 0) {
        contextMsg = `امتحان <strong>${urgentSub.name}</strong> اليوم! خبرني كيف أقدر أساعدك.`;
    } else if (urgentSub && daysUntil(urgentSub.examDate) <= 3) {
        const studiedSub = allSess.filter(s => s.subjectId === urgentSub.id).reduce((a, s) => a + s.duration, 0);
        contextMsg = `<strong>${urgentSub.name}</strong> بعد ${arCount(daysUntil(urgentSub.examDate), 'يوم', 'يومين', 'أيام')} — ذاكرت ${formatStudyDurationAr(studiedSub)}. اسألني أي حاجة.`;
    } else if (todayMin === 0 && hour >= 9) {
        contextMsg = `لسه ما بدأتش النهارده. إيه اللي بيمنعك؟ أقدر أساعدك تبدأ دلوقتي.`;
    } else if (todayMin >= 120) {
        contextMsg = `${formatStudyDurationAr(todayMin)} النهارده شغال تمام — خبرني تحتاج إيه.`;
    } else if (dueCards > 5) {
        contextMsg = `عندك <strong>${dueCards} بطاقة</strong> للمراجعة. تراجعها دلوقتي ولا تبدأ بموضوع تاني؟`;
    } else if (weekly.activeDays < 2 && weekly.pomodoroCount === 0) {
        contextMsg = `الأسبوع ده مش فيه جلسات بعد. نرسم خطة بسيطة نبدأ بيها؟`;
    } else {
        contextMsg = `أعرف كل حاجة عن موادك وتقدمك. اسألني وأنا هجاوبك بالأرقام الفعلية.`;
    }
    document.getElementById('ai-context-msg').innerHTML = contextMsg;
    lucide.createIcons();

    // ── سؤالان بس — الأول ثابت (جدول اليوم)، الثاني بيتغير حسب حالة الشخص وله هدف واضح
    const sugs = [];

    // سؤال 1: بناء جدول اليوم (ثابت)
    sugs.push(`ابني لي جدول اليوم`);

    // سؤال 2: ديناميكي — بيختار أهم حاجة تخص الشخص دلوقتي (أولوية حسب الإلحاح)
    let sug2;
    if (urgentSub && daysUntil(urgentSub.examDate) === 0) {
        // امتحان النهارده — الهدف: تنظيم آخر لحظة
        sug2 = `عندي امتحان ${urgentSub.name} النهارده، أذاكر إيه دلوقتي؟`;
    } else if (urgentSub && daysUntil(urgentSub.examDate) <= 3) {
        // امتحان قريب جدًا — الهدف: معرفة الوقت المتبقي المطلوب فعليًا
        sug2 = `كام دقيقة المفروض أذاكر ${urgentSub.name} النهارده؟`;
    } else if (dueCards > 5) {
        // بطاقات مراجعة متراكمة — الهدف: تفريغ الاستحقاق المتراكم
        sug2 = `عندي ${dueCards} بطاقة للمراجعة، أبدأ بيها ولا بمذاكرة جديدة؟`;
    } else if (todayMin === 0 && hour >= 9) {
        // لسه مبدأش النهارده — الهدف: كسر التسويف والبدء
        sug2 = `لسه مبدأتش النهارده، تساعدني أبدأ إزاي؟`;
    } else if (weekly.activeDays < 2 && weekly.pomodoroCount === 0) {
        // أسبوع فاضي من المذاكرة — الهدف: خطة تعويض
        sug2 = `الأسبوع ده مفيهوش مذاكرة تقريبًا، أعمل إيه أعوّض؟`;
    } else if (weekly.totalHours > 0) {
        // في تقدم فعلي — الهدف: تقييم صريح ومتابعة الأداء
        sug2 = `قيّم أداء الأسبوع ده بصراحة`;
    } else if (activeSubs.length > 0) {
        // مفيش بيانات كفاية للتقييم — الهدف: اختبار نفسه في مادة نشطة
        sug2 = `اختبرني في ${activeSubs[0].name}`;
    } else {
        // مفيش مواد أو بيانات خالص — الهدف: نقطة بداية
        sug2 = `مش عارف أبدأ منين، وجّهني`;
    }
    sugs.push(sug2);

    document.getElementById('ai-suggestions').innerHTML = sugs.map(s =>
        `<button class="ai-sug-btn" onclick="sendAIMessage('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join('');

    if (G.chatHistory.length === 0) {
        document.getElementById('ai-welcome').classList.remove('hidden');
        document.getElementById('ai-messages').innerHTML = '';
    }
}
function scrollChat() { const area = document.getElementById('ai-chat-area'); if (area) area.scrollTop = area.scrollHeight; }
function clearAIChat() {
    if (!confirm('مسح المحادثة؟')) return;
    G.chatHistory = [];
    document.getElementById('ai-messages').innerHTML = '';
    document.getElementById('ai-welcome').classList.remove('hidden');
    renderAIHelp();
    showToast('تم مسح المحادثة', 'success');
}
function buildSystemPrompt() {
    const now = new Date();
    const currentDateTime = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' — ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    const allSess = G.data.sessions.filter(s => s.type === 'pomo');
    const todayMin = allSess.filter(s => s.date === today()).reduce((a, s) => a + s.duration, 0);
    const totalMin = allSess.reduce((a, s) => a + s.duration, 0);
    const weekly = getWeeklyStats();
    const dueCards = getDueCards().length;
    const totalCards = G.data.flashDecks.reduce((a, dk) => a + dk.cards.length, 0);
    const masteredCards = G.data.flashDecks.reduce((a, dk) => a + dk.cards.filter(c => c.interval >= 21).length, 0);

    // ── تحليل عميق للمواد (بدقة الساعة — حتى لا يظن النموذج أن امتحان اليوم لسه قائم بعد ما وقته يفوت)
    const subsDetail = G.data.subjects.filter(s => !s.archived).map(s => {
        const ms = getExamMsLeft(s);
        const cd = ms !== null ? formatCountdown(ms) : null; // يعتمد على examDate + examTime معاً
        const examEnded = cd ? cd.done : false;
        const studied = allSess.filter(ss => ss.subjectId === s.id).reduce((a, ss) => a + ss.duration, 0);
        const studiedToday = allSess.filter(ss => ss.subjectId === s.id && ss.date === today()).reduce((a, ss) => a + ss.duration, 0);
        const last7 = allSess.filter(ss => ss.subjectId === s.id && ss.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).reduce((a, ss) => a + ss.duration, 0);
        const target = (s.hours || 0) * 60;
        const progress = target > 0 ? Math.round(studied / target * 100) : null;
        const goal = getAutoGoal(s);
        // ماده ممكن يكون ليها أكتر من مجموعة بطاقات — نجمعهم كلهم بدل ما ناخد أول واحدة بس
        const subDecks = G.data.flashDecks.filter(d => d.subjectId === s.id);
        const subCardsAll = subDecks.flatMap(d => d.cards);
        const subDue = subCardsAll.filter(c => !c.nextReview || c.nextReview <= Date.now()).length;
        const subMastered = subCardsAll.filter(c => c.interval >= 21).length;
        const subCards = subCardsAll.length;
        let urgency = 'عادي';
        if (examEnded) urgency = 'انتهى الامتحان';
        else if (ms !== null) {
            const hLeft = ms / 3600000;
            if (hLeft <= 24) urgency = 'حرج جداً — باقي ' + cd.text + ' فقط!';
            else if (hLeft <= 72) urgency = 'حرج — باقي ' + cd.text;
            else if (hLeft <= 168) urgency = 'عاجل — 7d';
            else if (hLeft <= 336) urgency = 'قريب — 14d';
        }
        let hint = '';
        if (examEnded) hint = '✓ الامتحان انتهى — لا داعي لأي متابعة لهذه المادة';
        else if (!examEnded && ms !== null && ms <= 14 * 86400000 && progress !== null && progress < 50) hint = '⚠ تحتاج تسرع في هذه المادة';
        else if (progress !== null && progress >= 80) hint = '✓ اقتربت من الهدف';
        else if (studiedToday === 0 && !examEnded && ms !== null && ms <= 7 * 86400000) hint = '🔴 لم تذاكرها اليوم رغم قرب الامتحان';
        return `▸ ${s.name}
   الامتحان: ${cd === null ? 'غير محدد' : examEnded ? 'انتهى' : 'متبقي ' + cd.text}
   الأولوية: ${urgency}
   إجمالي الدراسة: ${Math.round(studied / 60 * 10) / 10}h${target > 0 ? ' من ' + Math.round(target / 60) + 'h هدف (' + (progress || 0) + '%)' : ''}
   هذا الأسبوع: ${Math.round(last7 / 60 * 10) / 10}h | اليوم: ${formatStudyDuration(studiedToday)} | هدف اليوم: ${goal === null ? 'غير محدد (لسه ناقص تاريخ امتحان أو ساعات هدف)' : formatStudyDuration(goal) + ' (= الباقي ÷ الأيام المتبقية)'}
   البطاقات: ${subCards > 0 ? subCards + ' بطاقة (' + subDue + ' للمراجعة، ' + subMastered + ' محفوظة)' : 'لا بطاقات'}
   ${hint}`;
    }).join('\n\n') || '▸ لا مواد مسجلة بعد';

    // ── تحليل أنماط الدراسة
    const hourBuckets = Array(24).fill(0);
    allSess.forEach(s => { if (s.ts) { const h = new Date(s.ts).getHours(); hourBuckets[h] += s.duration; } });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakLabel = peakHour < 6 ? 'الفجر/ليلاً' : peakHour < 12 ? 'الصباح' : peakHour < 17 ? 'الظهر/العصر' : 'المساء/الليل';
    const dayBuckets = Array(7).fill(0);
    allSess.forEach(s => { if (s.date) dayBuckets[new Date(s.date).getDay()] += s.duration; });
    const bestDayIdx = dayBuckets.indexOf(Math.max(...dayBuckets));
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // ── آخر 7 أيام تفصيلي
    const last7dates = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7dates.push(d.toISOString().slice(0, 10)); }
    const dailyBreakdown = last7dates.map(d => {
        const dayMin = allSess.filter(s => s.date === d).reduce((a, s) => a + s.duration, 0);
        const isToday = d === today();
        return `${isToday ? '• اليوم' : '• ' + new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' })}: ${formatStudyDuration(dayMin)}${dayMin >= 60 ? ' ✓' : dayMin === 0 ? ' —' : ''}`;
    }).join('\n');

    // ── حالة فورية (context للمحادثة)
    const subsWithExamMs = G.data.subjects.filter(s => !s.archived && s.examDate).map(s => ({ s, ms: getExamMsLeft(s) })).filter(x => x.ms !== null && x.ms > 0).sort((a, b) => a.ms - b.ms);
    const urgentSub = subsWithExamMs[0] ? subsWithExamMs[0].s : null;
    const urgentMs = subsWithExamMs[0] ? subsWithExamMs[0].ms : null;
    const currentStatus = todayMin === 0 ? 'لم يبدأ المذاكرة بعد اليوم' :
        todayMin < 30 ? `بدأ للتو (${formatStudyDuration(todayMin)})` :
            todayMin >= 120 ? `يوم ممتاز (${Math.round(todayMin / 60 * 10) / 10}h النهارده)` :
                `${formatStudyDuration(todayMin)} اليوم`;

    return `أنت مساعد دراسي شخصي ذكي اسمك "فوكس". أسلوبك: مباشر، صادق، عملي، تشجيعي لكن واقعي. لا تعطي كلاماً عاماً أبداً — كل رد يجب أن يتضمن أرقاماً وتفاصيل حقيقية. تحدث بثقة كأنك تعرف الطالب شخصياً — لا تقل أبداً "مذكور في بياناتك" أو "وفقاً لسجلاتك" أو أي عبارة تكشف أنك تقرأ من داتا. قل المعلومة مباشرة كأنك تعرفها.

━━━ هوية الطالب ━━━
الاسم: ${G.data.name || 'الطالب'}
الوقت الحالي: ${currentDateTime}
إجمالي ساعات الدراسة: ${Math.round(totalMin / 60 * 10) / 10}h
أيام متتالية: ${G.data.streak.count}d
الحالة الآن: ${currentStatus}

━━━ الوضع الراهن (مهم جداً) ━━━
اليوم: ${formatStudyDuration(todayMin)} مذاكرة
الأسبوع: ${weekly.totalHours}h في ${weekly.activeDays}d نشطة (تقييم: ${weekly.rating})
${urgentSub ? 'أخطر مادة الآن: ' + urgentSub.name + ' — امتحانها بعد ' + formatCountdown(urgentMs).text : 'لا مواد عاجلة حالياً'}
بطاقات تنتظر المراجعة: ${dueCards} من أصل ${totalCards} (محفوظة: ${masteredCards})

━━━ تفصيل آخر 7 أيام ━━━
${dailyBreakdown}
متوسط الجلسة: ${formatStudyDuration(weekly.avgSession)} | أفضل يوم تاريخياً: ${dayNames[bestDayIdx]} | أفضل وقت: ${peakLabel}

━━━ المواد بالتفصيل ━━━
${subsDetail}
${G.data.subjects.filter(s => s.archived).length > 0 ? '\n━━━ مواد انتهى امتحانها ━━━\n' + G.data.subjects.filter(s => s.archived).map(s => '✓ ' + s.name).join(', ') : ''}

━━━ قواعد الرد ━━━
1. الردود مختصرة وحادة — لا خطابات طويلة ممله
2. استخدم الأرقام الحقيقية من البيانات في كل جملة ممكنة
3. لما تقترح خطة — اذكر المادة والساعات والأيام تحديداً
4. لما تحفّز — اربطه بإنجاز حقيقي عنده (مثال: "ذاكرت 8h الأسبوع ده، يعني أنت قادر تعمل 12h")
5. لو حاجة سلبية — قولها بصراحة مع حل مباشر
6. اختبارات: اسأل 3-5 أسئلة حقيقية في المادة المطلوبة
7. أجب دائماً بالعربية
8. مادة امتحانها "انتهى" = انتهت تماماً — لا تذكر ساعاتها المتبقية ولا تطلب منه يكملها أبداً. ركّز فقط على المواد اللي امتحاناتها لسه قادمة
9. لما تحسب هدف اليوم لأي مادة — استخدم حقل "هدف اليوم" المذكور في بيانات المادة مباشرة (= الباقي ÷ أيام المتبقية). لا تحسبه بنفسك ولا توزعه على أسبوع فقط
10. لما يُسألك "ابني جدول اليوم" أو أي سؤال عن خطة النهارده — الرد يكون قائمة مواد مع عدد الدقائق/الساعات بس: "▸ C++: 57 دقيقة، ▸ رياضيات: 45 دقيقة" — لا جداول زمنية، لا "من ساعة لساعة"، لا أوقات بالساعة خالص. سطر التوصية الأول لا يذكر أسماء المواد — يسيبها للقائمة فقط. المواد اللي هدفها اليومي "غير محدد" استبعدها من القائمة، ولو كل المواد كذلك قول له يحدد تاريخ امتحان وساعات هدف الأول
11. الأرقام في خطة اليوم مصدرها حقل "هدف اليوم" لكل مادة — استخدمه مباشرةً ولا تحسب بنفسك
12. الرد على سؤال الجدول = سطر واحد للتوصية + قائمة المواد + جملة ختام — ٣ عناصر بس، لا أكتر
13. "كام دقيقة المفروض أذاكر [مادة] النهارده؟" → جواب مباشر: الرقم من حقل "هدف اليوم" + جملة تشجيع واحدة. لا شرح، لا حسابات ظاهرة. لو القيمة "غير محدد" — قول له يحدد تاريخ الامتحان وساعات الهدف للمادة الأول، ولا تخترع رقم بنفسك أبداً
14. "قيّم أداء الأسبوع ده بصراحة" → ٣ سطور بس: الحكم (جيد/متوسط/ضعيف) + رقم واحد دليل + نصيحة واحدة. لا قوائم طويلة
15. "ازاي أبدأ وأنا مش عارف من فين؟" → خطوة واحدة فقط محددة وعملية، لا خطابات تحفيزية
16. "اختبرني في [مادة]" → اسأل ٣ أسئلة مرقمة مباشرةً، بدون مقدمة
17. "فين نقاط ضعفي الحقيقية؟" أو "ليه بقيت مش منتظم؟" → رقم واحد يكشف المشكلة + سبب محتمل + حل واحد مباشر
18. "وزّع لي مذاكرة كل مادة على الأيام الجاية" → جدول مختصر: اسم المادة + الدقائق اليومية المقترحة، بدون أوقات أو تفاصيل زيادة
19. "هل المذاكرة وقت متأخر مفيدة؟" → إجابة علمية في سطرين + نصيحة عملية واحدة
20. "إيه أولويتي دلوقتي؟" → مادة واحدة فقط + سبب رقمي واحد (مثال: "باقي ٣ أيام وعندك ٥٧ دقيقة هدف")
21. لو سُئلت عن صاحب الموقع / مبرمج التطبيق / مين اللي عمل الموقع ده (بأي صياغة) — رد بالمعلومات دي بالظبط ولا تخترع تفاصيل زيادة:
   الموقع من تصميم وتطوير إسلام مصباح، طالب بكلية العلوم جامعة سوهاج قسم حاسب. إسلام مبرمج Frontend Developer شغوف ببناء أدوات تجعل التعلم أذكى وأكثر متعة، وهو اللي صمم وبنى تطبيق Deep Focus بالكامل من الصفر بهدف مساعدة الطلاب على التنظيم والتركيز والمذاكرة بكفاءة، من خلال أدوات زي البومودورو تايمر، الفلاش كاردز بالذكاء الاصطناعي، الأصوات المحيطة، وتقارير الأداء. من مهاراته: HTML/CSS/JS، React، UI/UX، CSS Animations، AI Integration. للتواصل معاه واتساب: 01103023916. لو حد عايز يطلب حاجة أو يتواصل معاه، اديله الرقم وقوله يتواصل مباشرة معاه
22. لو سُئلت "منين جبت المعلومات دي؟" أو "إزاي عارف كده؟" أو أي سؤال عن مصدر معلومة (سواء عن صاحب الموقع أو عن أي موضوع تاني) — ممنوع تقول "من البيانات المتاحة" أو "من بيانات الموقع" أو أي عبارة تخلي الرد يبان وكأنك بتقرأ من مصدر خارجي. رد بثقة مباشرة إنك عارف المعلومة دي زي ما تعرف أي حاجة تانية، مثال: "أنا عارف كل التفاصيل دي، اتفضل اسأل أي سؤال تاني" أو أعد ذكر المعلومة بثقة من غير ما تشرح مصدرها خالص`;
}

function formatAIReply(raw) {
    // Escape HTML first
    let t = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Wrap time expressions (e.g. 1:30 AM / 9:00 PM) in a single <bdi> BEFORE splitting individual numbers
    t = t.replace(/(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/g, '<bdi>$1</bdi>');
    // Wrap remaining standalone numbers + latin units in <bdi> so they don't flip in RTL context
    t = t.replace(/(?<!<bdi>)(\d+(?:\.\d+)?(?:h|m|d|%|s)?)(?!<\/bdi>)/g, '<bdi>$1</bdi>');
    // Bold **text**
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    // Inline code `code`
    t = t.replace(/`([^`]+)`/g, '<code style="background:var(--s3);padding:1px 6px;border-radius:4px;font-size:.82em">$1</code>');
    // Lines starting with - or • or ▸ → styled list items
    t = t.replace(/^([\-•▸►✓✗⚠🔴🟡🟢⚡🎯📚🔥💪]) (.+)$/gm, (_, bullet, content) =>
        `<div style="display:flex;gap:7px;margin:3px 0;align-items:flex-start"><span style="flex-shrink:0;margin-top:1px">${bullet}</span><span>${content}</span></div>`
    );
    // Lines starting with number. → numbered steps
    t = t.replace(/^(\d+)\. (.+)$/gm, (_, n, content) =>
        `<div style="display:flex;gap:8px;margin:4px 0;align-items:flex-start"><span style="min-width:20px;height:20px;background:var(--p);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;flex-shrink:0">${n}</span><span>${content}</span></div>`
    );
    // Lines starting with === or ━━ → section headers
    t = t.replace(/^[=━]{3,}\s*(.+?)\s*[=━]*$/gm, (_, title) =>
        `<div style="font-size:.75rem;font-weight:800;color:var(--tm);text-transform:uppercase;letter-spacing:.06em;margin:10px 0 4px;padding-bottom:3px;border-bottom:1px solid var(--bo)">${title}</div>`
    );
    // Newlines → <br>
    t = t.replace(/\n/g, '<br>');
    // Clean up double <br>
    t = t.replace(/(<br>){3,}/g, '<br><br>');
    return t;
}

async function sendAIMessage(text) {
    if (!text) text = (document.getElementById('ai-input')?.value || '').trim(); if (!text) return;
    const inp = document.getElementById('ai-input'); if (inp) inp.value = '';
    document.getElementById('ai-welcome').classList.add('hidden');
    const msgs = document.getElementById('ai-messages');
    G.chatHistory.push({ role: 'user', content: text });
    const userAt = AVATAR_TYPES[G.data.avatarType] || AVATAR_TYPES.boy;
    msgs.innerHTML += `<div class="ai-msg user"><div class="ai-msg-av" style="background:${userAt.color};color:#fff">${userAt.icon}</div><div class="ai-msg-bubble" style="direction:rtl;unicode-bidi:plaintext;text-align:right">${text.replace(/</g, '&lt;')}</div></div>`;
    requestAnimationFrame(scrollChat);
    const tid = 't' + Date.now();
    msgs.innerHTML += `<div class="ai-msg" id="${tid}"><div class="ai-msg-av" style="background:linear-gradient(135deg,var(--p),var(--ac))"><i data-lucide="bot" style="color:#fff"></i></div><div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div></div>`;
    lucide.createIcons(); requestAnimationFrame(scrollChat);
    const sendBtn = document.getElementById('ai-send'); if (sendBtn) sendBtn.disabled = true;
    try {
        const r = await fetch('https://deep-focus-v2.eslammisbah538.workers.dev/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt: buildSystemPrompt(), messages: G.chatHistory })
        });
        const d = await r.json(); const reply = d.reply;
        G.chatHistory.push({ role: 'assistant', content: reply });
        document.getElementById(tid)?.remove();
        const formatted = formatAIReply(reply);
        msgs.innerHTML += `<div class="ai-msg" style="animation:msgIn .25s ease"><div class="ai-msg-av" style="background:linear-gradient(135deg,var(--p),var(--ac))"><i data-lucide="bot" style="color:#fff"></i></div><div class="ai-msg-bubble" style="max-width:80%;direction:rtl;unicode-bidi:plaintext;text-align:right">${formatted}</div></div>`;
        lucide.createIcons();
    } catch (e) {
        document.getElementById(tid)?.remove();
        msgs.innerHTML += `<div class="ai-msg"><div class="ai-msg-av"><i data-lucide="bot"></i></div><div class="ai-msg-bubble" style="color:var(--er)">⚠ تأكد من الاتصال وحاول مرة تانية</div></div>`;
    }
    if (sendBtn) sendBtn.disabled = false; requestAnimationFrame(scrollChat);
}

// ── INSIGHTS — تقرير الأداء
// صف واحد من تقدم مادة (نشطة أو مؤرشفة) — تم فصلها في دالة لإعادة استخدامها مع المواد المؤرشفة
function buildSubjectProgressRow(s) {
    const dLeft = s.dLeft;
    const urgColor = s.archived ? 'var(--ok)' : dLeft === null ? 'var(--tm)' : dLeft < 0 ? 'var(--ok)' : dLeft <= 3 ? 'var(--er)' : dLeft <= 7 ? 'var(--wa)' : 'var(--p)';
    const examTxt = s.archived ? '✓' : dLeft === null ? '—' : dLeft < 0 ? 'انتهى' : dLeft === 0 ? 'اليوم!' : ltrD(dLeft);
    const studiedH = (s.studied / 60).toFixed(1);
    const targetH = s.target > 0 ? (s.target / 60).toFixed(0) : null;
    const subColor = (!s.color || s.color === 'transparent') ? 'var(--td)' : s.color;
    const hint = s.archived ? `<span style="color:var(--ok);font-size:.67rem">✓ منتهي</span>` :
        s.pct !== null && s.pct < 50 && dLeft !== null && dLeft >= 0 && dLeft <= 14 ? `<span style="color:var(--wa);font-size:.67rem">⚠ سرّع</span>` :
            s.pct !== null && s.pct >= 80 ? `<span style="color:var(--ok);font-size:.67rem">✓ قريب</span>` : '';

    // سطر البطاقات + اليوم
    // badge اليوم الواضح
    const todayBadge = (() => {
        if (s.archived) return '';
        const goal = getAutoGoal(s);
        if (goal === null) return ''; // مفيش تاريخ امتحان و/أو ساعات هدف محددة — لا أساس لعرض هدف يومي
        if (s.studiedToday >= goal) {
            return `<span style="font-size:.67rem;font-weight:700;color:var(--ok);background:rgba(16,212,138,.12);padding:2px 8px;border-radius:8px;border:1px solid rgba(16,212,138,.3)">✓ ${formatStudyDuration(s.studiedToday)} <span style="opacity:.6;font-weight:500">من ${formatStudyDuration(goal)}</span></span>`;
        } else if (s.studiedToday > 0) {
            return `<span style="font-size:.67rem;font-weight:700;color:var(--wa);background:rgba(255,179,71,.1);padding:2px 8px;border-radius:8px;border:1px solid rgba(255,179,71,.25)">⏱ ${formatStudyDuration(s.studiedToday)} <span style="opacity:.6;font-weight:500">من ${formatStudyDuration(goal)}</span></span>`;
        } else {
            return `<span style="font-size:.67rem;font-weight:600;color:var(--td);background:var(--s3);padding:2px 8px;border-radius:8px">○ 0 <span style="opacity:.6">من ${formatStudyDuration(goal)}</span></span>`;
        }
    })();
    const cardsBadge = s.subCards > 0
        ? `<span style="font-size:.67rem;color:${s.subDue > 0 ? 'var(--wa)' : 'var(--ok)'}">${s.subDue > 0 ? `⏰ ${s.subDue} للمراجعة` : `★ ${s.subMastered}/${s.subCards} محفوظة`}</span>`
        : '';

    return `<div style="margin-bottom:13px;padding-bottom:13px;border-bottom:1px solid var(--bo);${s.archived ? 'opacity:.6' : ''}">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap">
                    <div style="width:10px;height:10px;border-radius:50%;background:${subColor};flex-shrink:0"></div>
                    <span style="font-weight:800;font-size:.87rem;flex:1">${s.name}</span>
                    <span style="font-size:.69rem;font-weight:700;color:${urgColor};background:${urgColor}22;padding:2px 7px;border-radius:10px">${examTxt}</span>
                    <span style="font-size:.69rem;color:var(--tm)"><span style="color:${subColor};font-weight:800">${studiedH}h</span>${targetH ? ` <span style="opacity:.6">من</span> ${targetH}h` : ''}</span>
                    ${hint}
                </div>
                ${s.pct !== null ? `
                <div style="position:relative;height:4px;background:var(--s3);border-radius:3px;overflow:visible;margin-bottom:5px">
                    <div style="height:100%;width:${s.pct}%;background:${subColor};border-radius:3px;transition:width .5s"></div>
                    ${(() => {
                if (!s.archived && s.target > 0 && s.studiedToday > 0) {
                    // نقطة التقدم قبل مذاكرة اليوم (محسوبة بشكل مستقل، مش طرح نسبتين متقطّعتين)
                    // عشان العلامة تبان فعلياً فين كنت قبل النهاردة وتوضح مساهمة اليوم
                    const studiedBeforeToday = Math.max(0, s.studied - s.studiedToday);
                    const markerPct = Math.max(0, Math.min(s.pct, Math.round((studiedBeforeToday / s.target) * 100)));
                    return `<div title="وصلت لهنا قبل اليوم" style="position:absolute;top:-3px;right:${markerPct}%;transform:translateX(50%);width:2px;height:10px;background:${subColor};border-radius:2px;box-shadow:0 0 4px ${subColor}88"></div>`;
                }
                return '';
            })()}
                </div>` : ''}
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    ${todayBadge}${cardsBadge}
                    ${s.pct !== null ? `<span style="font-size:.67rem;color:var(--td);margin-right:auto">${s.pct}% من الهدف الكلي</span>` : ''}
                </div>
            </div>`;
}
// فتح/قفل قسم المواد المؤرشفة داخل تقرير الأداء (نفس فكرة الأرشيف في قسم المواد)
let insightsArchiveOpen = false;
function toggleInsightsArchive() {
    insightsArchiveOpen = !insightsArchiveOpen;
    const list = document.getElementById('insights-arch-list');
    const chevron = document.getElementById('insights-arch-chevron');
    if (list) list.classList.toggle('hidden', !insightsArchiveOpen);
    if (chevron) chevron.style.transform = insightsArchiveOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}
function getRemainingStudyDays(subject, now = new Date()) {
    if (!subject?.examDate) return null;
    const examDate = new Date(subject.examDate);
    const today = new Date(now);
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((examDate - today) / 86400000);
    return Math.max(1, diffDays);
}

function getSubjectStudiedMinutes(subjectId) {
    if (!G.data?.sessions) return 0;
    return G.data.sessions
        .filter(ss => ss.type === 'pomo' && ss.subjectId === subjectId)
        .reduce((a, ss) => a + (ss.duration || 0), 0);
}

function getAutoGoal(s, now = new Date()) {
    // الهدف اليومي يُحسب من جديد كل مرة بناءً على الزمن المتبقي والأيام المتبقية.
    const dLeft = getRemainingStudyDays(s, now);
    const hasTarget = (s.hours || 0) > 0;
    if (dLeft === null || !hasTarget) return null;
    if (dLeft <= 0) return null; // الامتحان انتهى أو اليوم — مفيش "هدف يومي" مستقبلي يُحسب
    const targetMin = Number(s.hours || 0) * 60;
    const studied = getSubjectStudiedMinutes(s.id);
    const remaining = Math.max(0, targetMin - studied);
    const dailyNeeded = Math.round(remaining / dLeft);
    
    // ✅ حدود ذكية ديناميكية حسب عدد الأيام المتبقية
    // السبب: الضغط يختلف بين الأيام القليلة والأيام الكثيرة
    if (dLeft <= 7) {
        // وقت قليل جداً (أسبوع أو أقل): اسمح برقم أكبر
        return Math.max(30, Math.min(dailyNeeded, 600));
    } else if (dLeft <= 30) {
        // وقت متوسط (أسبوع إلى شهر): توازن
        return Math.max(15, Math.min(dailyNeeded, 300));
    } else {
        // وقت طويل (أكثر من شهر): توزيع مريح
        return Math.max(10, Math.min(dailyNeeded, 120));
    }
}

function getTodayStudied(subjectId) {
    return G.data.sessions
        .filter(s => s.type === 'pomo' && s.date === today() && s.subjectId === subjectId)
        .reduce((a, s) => a + s.duration, 0);
}

function renderInsights() {
    const el = document.getElementById('insights-content');
    if (!el) return;

    stopInsightsLiveUpdate();

    const allSess = G.data.sessions.filter(s => s.type === 'pomo');
    const now = new Date();

    // نطاقات زمنية
    const last7dates = [], last30dates = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); last7dates.push(d.toISOString().slice(0, 10)); }
    for (let i = 29; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); last30dates.push(d.toISOString().slice(0, 10)); }
    const sess7 = allSess.filter(s => last7dates.includes(s.date));
    const sess30 = allSess.filter(s => last30dates.includes(s.date));

    const totalMin7 = sess7.reduce((a, s) => a + s.duration, 0);
    const totalMin30 = sess30.reduce((a, s) => a + s.duration, 0);
    const totalMinAll = allSess.reduce((a, s) => a + s.duration, 0);
    // يوم نشط = ذاكر ≥ 15 دقيقة
    const byDate7full = {}; sess7.forEach(s => { byDate7full[s.date] = (byDate7full[s.date] || 0) + s.duration; });
    const byDate30full = {}; sess30.forEach(s => { byDate30full[s.date] = (byDate30full[s.date] || 0) + s.duration; });
    const activeDays7 = Object.values(byDate7full).filter(v => v >= 15).length;
    const activeDays30 = Object.values(byDate30full).filter(v => v >= 15).length;
    const avgSession = allSess.length > 0 ? Math.round(totalMinAll / allSess.length) : 0;
    const totalCards = G.data.flashDecks.reduce((a, dk) => a + dk.cards.length, 0);
    const masteredCards = G.data.flashDecks.reduce((a, dk) => a + dk.cards.filter(c => c.interval >= 21).length, 0);
    const dueCards = getDueCards().length;

    // أفضل وقت ويوم
    const hourBuckets = Array(24).fill(0);
    allSess.forEach(s => { if (s.ts) { const h = new Date(s.ts).getHours(); hourBuckets[h] += s.duration; } });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakLabel = peakHour === 0 ? 'منتصف الليل' : peakHour < 6 ? 'فجراً' : peakHour < 12 ? `${peakHour}:00 ص` : peakHour === 12 ? '12:00 ظ' : `${peakHour - 12}:00 م`;
    const dayBuckets = Array(7).fill(0);
    allSess.forEach(s => { if (s.date) dayBuckets[new Date(s.date).getDay()] += s.duration; });
    const bestDayIdx = dayBuckets.indexOf(Math.max(...dayBuckets));
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    // نافذة الانتظام: 30 يوم كحد أقصى، أو عدد الأيام الفعلي من أول جلسة مذاكرة لو المستخدم جديد (تفادي ظلمه بالقسمة على 30 وهو لسه بادئ)
    const firstSessDate = allSess.reduce((min, s) => (s.date && (!min || s.date < min)) ? s.date : min, null);
    const daysSinceFirst = firstSessDate ? Math.floor((new Date(today()) - new Date(firstSessDate)) / 86400000) + 1 : 30;
    const consistencyWindow = Math.min(30, Math.max(1, daysSinceFirst));
    const consistency30 = Math.round((activeDays30 / consistencyWindow) * 100);
    const consistencyLabel = consistency30 >= 80 ? 'منتظم جداً' : consistency30 >= 50 ? 'منتظم' : consistency30 >= 30 ? 'متقطع' : 'غير منتظم';
    const consistencyColor = consistency30 >= 80 ? 'var(--ok)' : consistency30 >= 50 ? 'var(--p)' : consistency30 >= 30 ? 'var(--wa)' : 'var(--er)';

    // شارت 7 أيام
    const byDate7 = {};
    last7dates.forEach(d => { byDate7[d] = 0; });
    sess7.forEach(s => { byDate7[s.date] = (byDate7[s.date] || 0) + s.duration; });
    const maxBar = Math.max(...Object.values(byDate7), 1);

    // تقدم المواد + بطاقاتها
    const subProgress = G.data.subjects.map(s => {
        const studied = allSess.filter(ss => ss.subjectId === s.id).reduce((a, ss) => a + ss.duration, 0);
        const studiedToday = getTodayStudied(s.id);
        const target = (s.hours || 0) * 60;
        const pct = target > 0 ? Math.min(100, Math.round((studied / target) * 100)) : null;
        const dLeft = getExamDaysLeft(s);
        // ماده ممكن يكون ليها أكتر من مجموعة بطاقات — نجمعهم كلهم بدل ما ناخد أول واحدة بس
        const subDecks = G.data.flashDecks.filter(d => d.subjectId === s.id);
        const subCardsAll = subDecks.flatMap(d => d.cards);
        const subDue = subCardsAll.filter(c => !c.nextReview || c.nextReview <= Date.now()).length;
        const subMastered = subCardsAll.filter(c => c.interval >= 21).length;
        const subCards = subCardsAll.length;
        const dailyGoal = getAutoGoal(s);
        return { ...s, studied, studiedToday, target, pct, dLeft, subDue, subMastered, subCards, dailyGoal };
    });
    const activeSubProg = subProgress.filter(s => !s.archived);
    const archivedSubProg = subProgress.filter(s => s.archived);

    // تنبيهات ذكية
    const alerts = [];
    G.data.subjects.filter(s => !s.archived && s.examDate && getExamDaysLeft(s) !== null && getExamDaysLeft(s) >= 0 && getExamDaysLeft(s) <= 3)
        .forEach(s => alerts.push({ type: 'er', icon: 'alert-triangle', msg: `امتحان <strong>${s.name}</strong> ${getExamDaysLeft(s) === 0 ? 'اليوم!' : 'بعد ' + ltrD(getExamDaysLeft(s)) + ' فقط!'}` }));
    subProgress.filter(s => !s.archived && s.dLeft !== null && s.dLeft >= 0 && s.dLeft <= 14 && s.studied === 0)
        .forEach(s => alerts.push({ type: 'er', icon: 'book-open', msg: `لم تذاكر <strong>${s.name}</strong> بعد والامتحان بعد ${ltrD(s.dLeft)}` }));
    if (dueCards > 10) alerts.push({ type: 'wa', icon: 'layers', msg: `<strong>${dueCards}</strong> بطاقة للمراجعة — ${formatStudyDuration(10)} الآن تمنع التراكم` });
    if (activeDays7 < 3) alerts.push({ type: 'wa', icon: 'calendar', msg: `ذاكرت <bdi>${activeDays7}d</bdi> فقط هذا الأسبوع — الانتظام أهم من الكم` });
    if (avgSession > 0 && avgSession < 20) alerts.push({ type: 'wa', icon: 'timer', msg: `متوسط جلساتك ${formatStudyDuration(avgSession)} — جرّب ${formatStudyDuration(25)} إلى ${formatStudyDuration(45)} للتركيز العميق` });
    if (G.data.streak.count >= 7) alerts.push({ type: 'ok', icon: 'flame', msg: `<bdi><strong>${G.data.streak.count}d</strong></bdi> متتالية! حافظ على هذه السلسلة 🔥` });
    if (allSess.some(s => s.ts) && hourBuckets[peakHour] > 0) alerts.push({ type: 'ok', icon: 'sun', msg: `أفضل أوقاتك هي <strong>${peakLabel}</strong> — خصصها للمواد الصعبة` });

    el.innerHTML = `
            <!-- تنبيهات ذكية -->
            ${alerts.length ? `<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:18px">${alerts.map(w => {
        const bgMap = { er: '255,92,92', wa: '255,179,71', ok: '16,212,138' };
        const bg = bgMap[w.type] || '91,138,255';
        const colorVar = w.type === 'ok' ? 'var(--ok)' : `var(--${w.type})`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;background:rgba(${bg},.08);border:1px solid rgba(${bg},.3);border-radius:var(--rs)"><i data-lucide="${w.icon}" style="width:15px;height:15px;color:${colorVar};flex-shrink:0"></i><span dir="rtl" style="font-size:.81rem;line-height:1.5;flex:1">${w.msg}</span></div>`;
    }).join('')}</div>` : ''}

            <!-- ٤ أرقام رئيسية -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:18px">
                <div class="stat-card"><span class="stat-icon"><i data-lucide="timer"></i></span><div class="stat-val">${formatStudyDuration(totalMinAll)}</div><div class="stat-label">إجمالي الدراسة</div></div>
                <div class="stat-card"><span class="stat-icon"><i data-lucide="flame"></i></span><div class="stat-val">${G.data.streak.count}</div><div class="stat-label">d متتالية</div></div>
                <div class="stat-card"><span class="stat-icon"><i data-lucide="zap"></i></span><div class="stat-val">${formatStudyDuration(avgSession)}</div><div class="stat-label">متوسط الجلسة</div></div>
                <div class="stat-card"><span class="stat-icon"><i data-lucide="star"></i></span><div class="stat-val">${masteredCards}/${totalCards}</div><div class="stat-label">بطاقات محفوظة</div></div>
            </div>

            <!-- شارت 7 أيام + انتظام -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:18px;align-items:stretch">
                <div class="card wide-card">
                    <h3 class="card-title"><i data-lucide="bar-chart-2"></i> دراسة الأسبوع</h3>
                    <div class="week-chart" style="direction:ltr">
                        ${last7dates.map((d, i) => {
        const v = byDate7[d] || 0; const pct2 = Math.round((v / maxBar) * 100);
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(d).getDay()];
        const isToday2 = d === today(); const h = Math.round(v / 60 * 10) / 10;
        return `<div class="week-chart-day">
                                <div class="week-chart-value">${v > 0 ? h + 'h' : ''}</div>
                                <div class="week-chart-bar" style="height:${Math.max(pct2, 0) * .7}px;min-height:${v > 0 ? 4 : 0}px;background:${isToday2 ? 'var(--p)' : 'rgba(91,138,255,.55)'};transition:height .4s ease ${i * .05}s"></div>
                                <div class="week-chart-day-label">${day}</div>
                            </div>`;
    }).join('')}
                    </div>
                    <div class="week-summary" style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--tm);padding-top:8px;border-top:1px solid var(--bo)">
                        <span>الأسبوع: <strong style="color:var(--tx)"><bdi>${(totalMin7 / 60).toFixed(1)}h</bdi></strong></span>
                        <span>أيام نشطة: <strong style="color:var(--tx)"><bdi>${activeDays7}d/7</bdi></strong></span>
                    </div>
                </div>
                <div class="card" style="text-align:center">
                    <h3 class="card-title" style="justify-content:center"><i data-lucide="activity"></i> الانتظام</h3>
                    <div style="position:relative;width:96px;height:96px;margin:0 auto 10px">
                        <svg viewBox="0 0 100 100" style="width:100%;height:100%;transform:rotate(-90deg)">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--s3)" stroke-width="10"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="${consistencyColor}" stroke-width="10" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="${251.2 * (1 - consistency30 / 100)}"/>
                        </svg>
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
                            <div style="font-size:1.3rem;font-weight:900;color:${consistencyColor}">${consistency30}%</div>
                        </div>
                    </div>
                    <div style="font-size:.76rem;font-weight:800;color:${consistencyColor}">${consistencyLabel}</div>
                    <div style="font-size:.66rem;color:var(--tm);margin-top:2px"><bdi>${activeDays30}d</bdi> من <bdi>${consistencyWindow}</bdi></div>
                    <div style="margin-top:8px;padding-top:7px;border-top:1px solid var(--bo);display:flex;flex-direction:column;gap:3px">
                        <div style="font-size:.66rem;color:var(--tm)"> أفضل وقت: <strong style="color:var(--p)">${allSess.some(s => s.ts) ? peakLabel : '—'}</strong></div>
                        <div style="font-size:.66rem;color:var(--tm)"> أفضل يوم: <strong style="color:var(--p)">${allSess.length > 0 ? dayNames[bestDayIdx] : '—'}</strong></div>
                    </div>
                </div>
            </div>

            <!-- تقدم المواد (مدمج مع البطاقات واليوم) -->
            <div class="card">
                <h3 class="card-title"><i data-lucide="book-open"></i> تقدم المواد</h3>
                ${subProgress.length === 0 ? `<div style="text-align:center;padding:20px;color:var(--td)">لا مواد مضافة بعد</div>` :
            activeSubProg.length === 0 ? `<div style="text-align:center;padding:14px;color:var(--td);font-size:.8rem">كل المواد في الأرشيف</div>` :
                activeSubProg.slice().sort((a, b) => {
                    const dA = a.dLeft !== null && a.dLeft >= 0 ? a.dLeft : 99999;
                    const dB = b.dLeft !== null && b.dLeft >= 0 ? b.dLeft : 99999;
                    return dA - dB;
                }).map(buildSubjectProgressRow).join('')}
            </div>
            ${archivedSubProg.length > 0 ? `
            <div class="card" style="margin-top:14px">
                <div onclick="toggleInsightsArchive()" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
                    <h3 class="card-title" style="margin:0"><i data-lucide="archive"></i> المواد المؤرشفة (${archivedSubProg.length})</h3>
                    <i data-lucide="chevron-down" id="insights-arch-chevron" style="width:16px;height:16px;color:var(--tm);transition:transform .25s${insightsArchiveOpen ? ';transform:rotate(180deg)' : ''}"></i>
                </div>
                <div id="insights-arch-list" class="${insightsArchiveOpen ? '' : 'hidden'}" style="margin-top:12px">
                    ${archivedSubProg.map(buildSubjectProgressRow).join('')}
                </div>
            </div>` : ''}
            `;
    lucide.createIcons();
    startInsightsLiveUpdate();
}

// Live update: refresh insights every 30s
let insightsUpdateInterval = null;
function startInsightsLiveUpdate() {
    stopInsightsLiveUpdate();
    insightsUpdateInterval = setInterval(() => {
        if (G.section !== 'insights') { stopInsightsLiveUpdate(); return; }
        renderInsights();
    }, 30000);
}
function stopInsightsLiveUpdate() {
    if (insightsUpdateInterval) { clearInterval(insightsUpdateInterval); insightsUpdateInterval = null; }
}

// ── THEME
function toggleTheme() { G.theme = G.theme === 'dark' ? 'light' : 'dark'; applyTheme(G.theme); localStorage.setItem('df_theme', G.theme); }
function applyTheme(t) { document.body.className = t; const tb = document.getElementById('theme-toggle'); if (tb) tb.innerHTML = t === 'dark' ? '<i data-lucide="sun"></i><span>فاتح</span>' : '<i data-lucide="moon"></i><span>داكن</span>'; lucide.createIcons(); }

// ── POMO SUBJECT SWITCH: save elapsed time for old subject, restart tracking for new one
function handlePomoSubjectChange(newSubId) {
    const oldSubId = G.pomo._currentSubjectId !== undefined ? G.pomo._currentSubjectId : (document.getElementById('pomo-subject-sel')?.value || '');
    if (oldSubId === newSubId) return;

    if (G.pomo.running && G.pomo.mode === 'focus') {
        const elapsedSecs = G.pomo._subjectStartTimeLeft !== undefined
            ? (G.pomo._subjectStartTimeLeft - G.pomo.timeLeft)
            : (G.pomo.fullDuration - G.pomo.timeLeft);
        const elapsedMins = Math.floor(elapsedSecs / 60);
        if (elapsedMins >= 1) {
            G.data.sessions.push({
                id: uid(), subjectId: oldSubId, date: today(),
                duration: elapsedMins, type: 'pomo', ts: Date.now(), source: 'subject_switch'
            });
            saveData();
            updateStreak();
            updateTopbar();
            renderPomoLog();
            const oldName = G.data.subjects.find(s => s.id === oldSubId)?.name || 'دراسة عامة';
            showToast('✓ حُفظ ' + formatStudyDuration(elapsedMins) + ' لـ' + oldName);
        }
    }
    // Reset tracking for new subject
    G.pomo._subjectStartTimeLeft = G.pomo.timeLeft;
    G.pomo._currentSubjectId = newSubId;
}

// ── VISIBILITY (handle backgrounded timer)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (G.pomo.running && G.pomo._lastTick) {
            const elapsed = Math.floor((Date.now() - G.pomo._lastTick) / 1000);
            G.pomo.timeLeft = Math.max(0, G.pomo.timeLeft - elapsed);
            if (G.pomo.timeLeft === 0) {
                clearInterval(G.pomo.timer);
                G.pomo.running = false;
                pomoDone();
            } else {
                updatePomoUI();
            }
        }
        G.pomo._lastTick = null;
    } else {
        G.pomo._lastTick = Date.now();
    }
});

// ── AUTO-SAVE on tab close / app close
window.addEventListener('beforeunload', () => {
    if (!G.data || !G.pomo.running) return;
    if (G.pomo.mode === 'focus') {
        const elapsedSecs = G.pomo._subjectStartTimeLeft !== undefined
            ? (G.pomo._subjectStartTimeLeft - G.pomo.timeLeft)
            : (G.pomo.fullDuration - G.pomo.timeLeft);
        const elapsedMins = Math.floor(elapsedSecs / 60);
        if (elapsedMins >= 1) {
            const subId = G.pomo._currentSubjectId || document.getElementById('pomo-subject-sel')?.value || '';
            G.data.sessions.push({
                id: uid(), subjectId: subId, date: today(),
                duration: elapsedMins, type: 'pomo', ts: Date.now(), source: 'autosave'
            });
            saveData();
        }
    }
});

// ── INIT
function initAppBootstrap() {
    const savedTheme = localStorage.getItem('df_theme') || 'dark'; G.theme = savedTheme; applyTheme(savedTheme);
    buildAvatarPicker();

    const saved = getSavedUserData();
    if (saved) {
        showInitialScreen(true);
        startApp(saved, false);
        return;
    }

    showInitialScreen(false);
    if (saved && saved.name && saved.name !== 'User') {
        const nameInput = document.getElementById('entry-name');
        if (nameInput) nameInput.value = saved.name;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAppBootstrap();

    // Auth: Enter key on name input
    document.getElementById('entry-name')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); handleEntry(); }
    });

    // Desktop sidebar nav
    document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => navigate(n.dataset.section)));
    document.getElementById('sb-collapse')?.addEventListener('click', () => document.getElementById('app').classList.toggle('collapsed'));
    document.getElementById('menu-btn')?.addEventListener('click', () => document.getElementById('app').classList.toggle('collapsed'));
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    injectDeleteAccountButton('logout-btn', 'delete-account-btn');

    // Bottom nav
    // dismissKeyboard() هنا مهم جداً: لو المستخدم كان بيكتب في textarea (شات AI مثلاً)
    // وضغط زرار في الشريط السفلي مباشرة، لازم نقفل الكيبورد فورًا قبل استدعاء navigate()
    // عشان الـ position:fixed بتاع الناف بار ميتحركش مع الـ viewport وقت قفل الكيبورد
    document.querySelectorAll('.bnav-item[data-section]').forEach(btn => btn.addEventListener('click', () => { dismissKeyboard(); navigate(btn.dataset.section); }));
    document.getElementById('bnav-more-btn')?.addEventListener('click', openBnavMore);
    document.getElementById('bnav-more-backdrop')?.addEventListener('click', closeBnavMore);
    document.querySelectorAll('.bnav-more-item[data-section]').forEach(btn => btn.addEventListener('click', () => { dismissKeyboard(); navigate(btn.dataset.section); }));
    document.getElementById('bnav-theme-btn')?.addEventListener('click', () => { toggleTheme(); });
    document.getElementById('bnav-logout-btn')?.addEventListener('click', logout);
    injectDeleteAccountButton('bnav-logout-btn', 'bnav-delete-account-btn');

    // Subjects
    document.getElementById('add-subject-btn')?.addEventListener('click', () => { document.getElementById('add-subject-form').classList.toggle('hidden'); lucide.createIcons(); });
    document.getElementById('sub-save')?.addEventListener('click', saveSubject);
    document.getElementById('sub-cancel')?.addEventListener('click', () => document.getElementById('add-subject-form').classList.add('hidden'));


    // Pomodoro
    document.getElementById('pomo-start')?.addEventListener('click', startPomo);
    document.getElementById('pomo-reset')?.addEventListener('click', resetPomo);
    document.querySelectorAll('.pomo-mode-btn').forEach(b => b.addEventListener('click', () => setPomoMode(b.dataset.mode)));

    // Auto-sync pomodoro subject change → save elapsed for old, start fresh for new
    document.getElementById('sec-pomodoro')?.addEventListener('change', e => {
        if (e.target.id === 'pomo-subject-sel') {
            const newSubId = e.target.value;
            handlePomoSubjectChange(newSubId);
        }
    });

    // تحديث لحظي عند تعديل مدة البومودورو (بدون الحاجة للتنقل بين الأوضاع)
    document.getElementById('sec-pomodoro')?.addEventListener('input', e => {
        if (['pomo-focus-dur', 'pomo-short-dur', 'pomo-long-dur'].includes(e.target.id)) {
            handlePomoDurInput(e.target.id);
        }
    });

    // Flashcards
    document.getElementById('fc-add-deck-btn')?.addEventListener('click', () => { document.getElementById('fc-add-deck-form').classList.toggle('hidden'); populateSubjectSelects(); });
    document.getElementById('fc-deck-save')?.addEventListener('click', addDeckFromForm);
    document.getElementById('fc-save-card')?.addEventListener('click', saveCard);
    document.getElementById('fc-cancel-card')?.addEventListener('click', () => document.getElementById('fc-add-form').classList.add('hidden'));
    document.getElementById('fc-ai-generate')?.addEventListener('click', generateAICards);
    document.getElementById('fc-ai-cancel')?.addEventListener('click', () => document.getElementById('fc-ai-form').classList.add('hidden'));
    document.getElementById('sec-flashcards')?.addEventListener('click', e => { const btn = e.target.closest('button'); if (!btn) return; if (btn.id === 'fc-add-card-btn') { document.getElementById('fc-add-form').classList.toggle('hidden'); document.getElementById('fc-ai-form').classList.add('hidden'); } if (btn.id === 'fc-ai-btn') { document.getElementById('fc-ai-form').classList.toggle('hidden'); document.getElementById('fc-add-form').classList.add('hidden'); } if (btn.id === 'fc-review-btn') startReview(); if (btn.id === 'fc-rev-exit') { exitReview(); if (G.fc.deckId) selectDeck(G.fc.deckId); } if (btn.id === 'fc-missed') rateCard(false); if (btn.id === 'fc-got-it') rateCard(true); });



    // AI
    document.getElementById('ai-send')?.addEventListener('click', () => sendAIMessage(''));
    document.getElementById('ai-input')?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIMessage(''); } });

    updatePomoUI(); exitReview();
    lucide.createIcons();
});
