// ── ONBOARDING SYSTEM
const ONBOARDING_STEPS = [
    {
        id: 'dashboard',
        target: '[data-section="dashboard"]',
        icon: 'home',
        title: 'الرئيسية',
        desc: 'هنا تشوف ملخص يومك:\n• تذكيرات المواد القادمة\n• جلسات الدراسة اللي عملتها\n• نشاطك اليومي',
        position: 'right'
    },
    {
        id: 'subjects',
        target: '[data-section="subjects"]',
        icon: 'book-open',
        title: 'المواد',
        desc: 'أضف المواد اللي بتدرسها:\n• تحديد تاريخ الامتحان\n• ترتيب حسب الأولوية\n• متابعة تقدمك في كل مادة',
        position: 'right'
    },
    {
        id: 'pomodoro',
        target: '[data-section="pomodoro"]',
        icon: 'timer',
        title: 'تقنية بومودورو',
        desc: 'تركيز منظم لمدة 25 دقيقة:\n• جلسات متتالية للتركيز الأعمق\n• فترات راحة منتظمة\n• تتبع عدد جلساتك',
        position: 'right'
    },
    {
        id: 'flashcards',
        target: '[data-section="flashcards"]',
        icon: 'layers',
        title: 'بطاقات المراجعة',
        desc: 'راجع الحقائق والمعادلات:\n• إنشاء مجموعات بطاقات\n• مراجعة ذكية وسهلة\n• تتبع تقدمك',
        position: 'right'
    },
    {
        id: 'ambient',
        target: '[data-section="ambient"]',
        icon: 'music',
        title: 'أصوات محيطة',
        desc: 'أضف أصواتاً تساعدك على التركيز:\n• مطر، محيط، طبيعة\n• كافيه، نار، موسيقى لو-فاي\n• خلط الأصوات الخاصة بك',
        position: 'right'
    },
    {
        id: 'insights',
        target: '[data-section="insights"]',
        icon: 'trending-up',
        title: 'تقرير الأداء',
        desc: 'تابع إنجازاتك:\n• إحصائيات دراستك\n• رسوم بيانية للتقدم\n• توصيات لتحسين التركيز',
        position: 'right'
    },
    {
        id: 'ai-help',
        target: '[data-section="ai-help"]',
        icon: 'bot',
        title: 'مساعد AI',
        desc: 'اسأل مساعدك الذكي:\n• شرح المفاهيم الصعبة\n• حل المشاكل\n• نصائح للدراسة الفعالة',
        position: 'right'
    },
    {
        id: 'end',
        target: null,
        icon: 'sparkles',
        title: 'أنت جاهز!',
        desc: 'مبروك\nأنت جاهز لبدء رحلتك مع Deep Focus!\n\nالآن يمكنك:',
        position: 'center',
        isEnd: true
    }
];

// ترتيب الخطوات على الموبايل لازم يتبع نفس ترتيب أيقونات الشريط السفلي (الرئيسية، بومودورو، المواد، AI، ثم المزيد)
// بدل ترتيب سايد بار اللاب (الرئيسية، المواد، بومودورو...)، عشان الجولة متقفزش وترجع تاني وتلخبط المستخدم
const ONBOARDING_MOBILE_ORDER = ['dashboard', 'pomodoro', 'subjects', 'ai-help', 'flashcards', 'ambient', 'insights', 'end'];

class Onboarding {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.hasShown = localStorage.getItem('df_onboarding_shown') === 'true';
        this.steps = ONBOARDING_STEPS;
    }

    shouldShow() {
        return !this.hasShown;
    }

    // ── الشاشات الصغيرة: التنقل شريط سفلي مش سايد بار (نفس البريك بوينت المستخدم في باقي الموقع)
    isMobile() {
        return window.matchMedia('(max-width:768px)').matches;
    }

    // بيرجع قائمة الخطوات بالترتيب الصح حسب نوع الشاشة: ترتيب سايد بار اللاب، أو ترتيب الشريط السفلي في الموبايل
    getSteps() {
        if (!this.isMobile()) return ONBOARDING_STEPS;
        const byId = Object.fromEntries(ONBOARDING_STEPS.map(s => [s.id, s]));
        return ONBOARDING_MOBILE_ORDER.map(id => byId[id]).filter(Boolean);
    }

    // بيرجع اسم الـ data-section من نص الـ selector بتاع الخطوة، زي '[data-section="dashboard"]' → 'dashboard'
    getSectionFromTarget(target) {
        if (!target) return null;
        const m = target.match(/data-section="([^"]+)"/);
        return m ? m[1] : null;
    }

    // بيرجع العنصر الظاهر فعليًا للخطوة الحالية: سايد بار في اللاب، أو شريط سفلي/شيت "المزيد" في الموبايل
    // (المشكلة الأصلية: querySelector كان بياخد أول عنصر مطابق للـ data-section في الـ DOM، وده دايمًا
    // كان عنصر السايد بار بتاع اللاب حتى لو الشاشة موبايل ومخفي، فالهايلايت كان بيحسب مكان غلط)
    getTargetElement(step) {
        const section = this.getSectionFromTarget(step.target);
        if (!section) return step.target ? document.querySelector(step.target) : null;

        if (this.isMobile()) {
            return document.querySelector(`.bnav-item[data-section="${section}"]`)
                || document.querySelector(`.bnav-more-item[data-section="${section}"]`)
                || null;
        }
        return document.querySelector(`.nav-item[data-section="${section}"]`) || document.querySelector(step.target);
    }

    // هل عنصر الخطوة دي في الموبايل موجود بس جوه شيت "المزيد" المطوي؟
    isInMoreSheet(step) {
        if (!this.isMobile()) return false;
        const section = this.getSectionFromTarget(step.target);
        if (!section) return false;
        return !document.querySelector(`.bnav-item[data-section="${section}"]`) && !!document.querySelector(`.bnav-more-item[data-section="${section}"]`);
    }

    init() {
        if (this.hasShown) return;
        this.isActive = true;
        this.currentStep = 0;
        this.steps = this.getSteps();
        this.createOverlay();
        this.showStep(0);
    }

    createOverlay() {
        // Container رئيسي
        const container = document.createElement('div');
        container.id = 'onboarding-overlay';
        container.className = 'onboarding-overlay';
        container.innerHTML = `
            <div class="onboarding-spotlight"></div>
            <div class="onboarding-card">
                <div class="onboarding-card-header">
                    <h3 id="onboarding-title"></h3>
                    <button class="onboarding-close" onclick="onboardingInstance.end()"><i data-lucide="x"></i></button>
                </div>
                <p id="onboarding-desc"></p>
                <div class="onboarding-controls">
                    <div class="onboarding-progress">
                        <span id="onboarding-step-num"></span>
                    </div>
                    <div class="onboarding-buttons">
                        <button class="btn-ghost" id="onboarding-prev" onclick="onboardingInstance.prev()">السابق</button>
                        <button class="btn-primary" id="onboarding-next" onclick="onboardingInstance.next()">التالي</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        lucide.createIcons();
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;

        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        const overlay = document.getElementById('onboarding-overlay');
        if (!overlay) return;

        // في الموبايل: افتح شيت "المزيد" لو العنصر المستهدف جواه، وقفله لو مش محتاجينه
        // عشان يبقى ظاهر وممكن نحسب مكانه صح قبل ما نعرض الهايلايت والكارد
        if (this.isMobile()) {
            if (this.isInMoreSheet(step)) {
                if (typeof openBnavMore === 'function') openBnavMore();
            } else if (typeof closeBnavMore === 'function') {
                closeBnavMore();
            }
        }

        // تحديث النصوص
        document.getElementById('onboarding-title').innerHTML = `<span class="onboarding-title-with-icon"><i data-lucide="${step.icon}"></i><span>${step.title}</span></span>`;
        document.getElementById('onboarding-desc').textContent = step.desc;
        document.getElementById('onboarding-step-num').textContent = `${stepIndex + 1}/${this.steps.length}`;

        // تحديث أزرار التنقل
        document.getElementById('onboarding-prev').style.display = stepIndex === 0 ? 'none' : 'block';
        const nextBtn = document.getElementById('onboarding-next');
        nextBtn.innerHTML = step.isEnd ? '<i data-lucide="check-circle"></i> انتهاء' : 'التالي <i data-lucide="arrow-right"></i>';
        lucide.createIcons();

        // تحديث الـ spotlight
        this.updateSpotlight(step);

        // تحديث موضع الـ card
        this.positionCard(step);

        overlay.classList.remove('end-mode');
        if (step.isEnd) {
            overlay.classList.add('end-mode');
        }
    }

    updateSpotlight(step) {
        const spotlight = document.querySelector('.onboarding-spotlight');
        if (!spotlight) return;

        if (!step.target) {
            spotlight.style.display = 'none';
            return;
        }

        const targetEl = this.getTargetElement(step);
        if (!targetEl) {
            spotlight.style.display = 'none';
            return;
        }

        spotlight.style.display = 'block';
        const rect = targetEl.getBoundingClientRect();
        const padding = 12;

        spotlight.style.left = (rect.left - padding + window.scrollX) + 'px';
        spotlight.style.top = (rect.top - padding + window.scrollY) + 'px';
        spotlight.style.width = (rect.width + padding * 2) + 'px';
        spotlight.style.height = (rect.height + padding * 2) + 'px';
    }

    positionCard(step) {
        const card = document.querySelector('.onboarding-card');
        if (!card) return;

        if (step.isEnd) {
            card.style.position = 'fixed';
            card.style.left = '50%';
            card.style.top = '50%';
            card.style.transform = 'translate(-50%, -50%)';
            card.style.maxWidth = '420px';
            return;
        }

        const targetEl = this.getTargetElement(step);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const cardWidth = 280;
        const gap = 16;
        const minMargin = 12;

        card.style.position = 'fixed';
        card.style.maxWidth = cardWidth + 'px';
        card.style.transform = 'none';

        // الموبايل: التنقل شريط سفلي (أو شيت "المزيد")، فمفيش مساحة جنب العنصر —
        // نعرض الكارد فوقه ومتمركز عليه بدل ما نحاول نحطه يمين/شمال زي اللاب
        if (this.isMobile()) {
            let mLeft = rect.left + rect.width / 2 - cardWidth / 2 + window.scrollX;
            mLeft = Math.max(minMargin + window.scrollX, Math.min(mLeft, window.innerWidth - cardWidth - minMargin + window.scrollX));
            card.style.left = mLeft + 'px';

            let mTop = rect.top + window.scrollY - card.offsetHeight - gap;
            if (mTop < minMargin + window.scrollY) {
                mTop = rect.bottom + gap + window.scrollY;
            }
            card.style.top = mTop + 'px';
            return;
        }

        let left = rect.right + gap + window.scrollX;
        if (step.position === 'right' && left + cardWidth > window.innerWidth) {
            left = rect.left - cardWidth - gap + window.scrollX;
        }
        if (left < minMargin + window.scrollX) {
            left = minMargin + window.scrollX;
        }
        if (left + cardWidth > window.innerWidth - minMargin) {
            left = window.innerWidth - cardWidth - minMargin;
        }

        let top = rect.top + window.scrollY;
        const maxTop = window.scrollY + window.innerHeight - card.offsetHeight - minMargin;
        if (top > maxTop) {
            top = Math.max(minMargin + window.scrollY, rect.bottom + gap + window.scrollY);
        }
        if (top + card.offsetHeight > window.scrollY + window.innerHeight - minMargin) {
            top = window.scrollY + window.innerHeight - card.offsetHeight - minMargin;
        }
        if (top < minMargin + window.scrollY) {
            top = minMargin + window.scrollY;
        }

        card.style.left = left + 'px';
        card.style.top = top + 'px';
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.end();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    end() {
        if (typeof closeBnavMore === 'function') closeBnavMore();
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.add('confetti-mode');
            this.fireConfetti();
            setTimeout(() => {
                overlay.remove();
                this.isActive = false;
                localStorage.setItem('df_onboarding_shown', 'true');
            }, 1500);
        }
    }

    fireConfetti() {
        const colors = ['#5b8aff', '#00e5c5', '#10d48a', '#ffb347', '#ff5c5c'];

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.width = (Math.random() * 10 + 8) + 'px';
            particle.style.height = (Math.random() * 10 + 8) + 'px';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = '-20px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.opacity = 1;
            particle.style.animationDelay = (Math.random() * 0.3) + 's';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '12%';

            document.getElementById('onboarding-overlay')?.appendChild(particle);
        }
    }

    reset() {
        localStorage.removeItem('df_onboarding_shown');
        this.hasShown = false;
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.remove();
    }
}

let onboardingInstance = new Onboarding();
