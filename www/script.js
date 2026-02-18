document.addEventListener('DOMContentLoaded', () => {

    const isNativePlatform = () => {
        return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    };

    const getLocalNotifications = () => {
        return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.LocalNotifications : null;
    };

    const getWidgetBridge = () => {
        return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.WidgetBridge : null;
    };

        // --- AOS Init ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 500,
            offset: 100,
            mirror: true,
            once: false
        });
    }

    // --- تعريف المتغيرات والعناصر (DOM Elements) ---
    const header = document.getElementById('main-header');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null; 
    const loginBtn = document.getElementById('login-btn');
    const profileIcon = document.getElementById('profile-icon');

    const dateToggleBtn = document.getElementById('date-toggle-btn');
    const dateDropdown = document.getElementById('date-dropdown');
    const currentDateDisplay = document.getElementById('current-date-display');

    const ibadatGrid = document.getElementById('ibadat-grid');
    const addWorshipBtn = document.getElementById('add-worship-btn');
    const addWorshipModal = document.getElementById('add-worship-modal');
    const closeWorshipModalBtn = document.getElementById('close-worship-modal');
    const saveWorshipBtn = document.getElementById('save-worship-btn');
    const worshipNameInput = document.getElementById('worship-name');
    const worshipTimeInput = document.getElementById('worship-time');
    const worshipPointsInput = document.getElementById('worship-points');

    const totalScoreDisplay = document.getElementById('total-score');
    const globalProgressBar = document.getElementById('global-progress-bar');

    const adhkarModal = document.getElementById('adhkar-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const completeAdhkarBtn = document.getElementById('complete-adhkar-btn');
    const adhkarListContainer = document.getElementById('adhkar-list');
    const modalTitle = document.getElementById('modal-title');

    const extraPrayerModal = document.getElementById('extra-prayer-modal');
    const closeExtraModalBtn = document.getElementById('close-extra-modal');
    const extraWorshipList = document.getElementById('extra-worship-list');

    // عناصر مودال الإعدادات الجديد
    const setupModal = document.getElementById('setup-modal');
    const saveSetupBtn = document.getElementById('save-setup-btn');
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationStatus = document.getElementById('location-status');

    const settingsBtn = document.getElementById('settings-btn');

    // --- إصلاح زر الإعدادات (ضعه في البداية ليعمل فوراً) ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 1. ملء البيانات
            document.getElementById('setup-name').value = userProfile.name || '';
            document.getElementById('setup-gender').value = userProfile.gender || 'male';
            document.getElementById('setup-quran-goal').value = userProfile.quranGoal || '';
            
            // 2. تفعيل زر الحفظ
            const saveBtn = document.getElementById('save-setup-btn');
            if(saveBtn) saveBtn.disabled = false;

            // 3. إظهار المودال
            const modal = document.getElementById('setup-modal');
            if(modal) modal.classList.remove('hidden');
        });
    }

    // متغيرات البروفايل والمواقيت
    let userProfile = {
        name: '',
        gender: 'male',
        quranGoal: '',
        latitude: null,
        longitude: null
    };

    let prayerTimesData = null;
    let prayerInterval = null;

    // متغير لحفظ العبادات الثابتة (التي تتكرر يومياً)
    let globalHabits = {
        prayerExtras: [], // {id, prayer, name, points}
        generalIbadat: [] // {id, name, time, points}
    };

//===========================================================
        // --- دوال مساعدة للتحويل بين الهجري والميلادي ---
function gMod(n, m) { return ((n % m) + m) % m; }

function kuwaitiCalendar(date) {
    var today = date ? new Date(date) : new Date();
    var day = today.getDate();
    var month = today.getMonth();
    var year = today.getFullYear();
    var m = month + 1;
    var y = year;
    if (m < 3) { y -= 1; m += 12; }
    var a = Math.floor(y / 100);
    var b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;
    if (y == 1582) {
        if (m > 10) b = -10;
        if (m == 10) { b = 0; if (day > 4) b = -10; }
    }
    var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    var b = 0;
    if (jd > 2299160) {
        var a = Math.floor((jd - 1867216.25) / 36524.25);
        b = 1 + a - Math.floor(a / 4);
    }
    var bb = jd + b + 1524;
    var cc = Math.floor((bb - 122.1) / 365.25);
    var dd = Math.floor(365.25 * cc);
    var ee = Math.floor((bb - dd) / 30.6001);
    var day = (bb - dd) - Math.floor(30.6001 * ee);
    var month = ee - 1;
    if (ee > 13) { cc += 1; month = ee - 13; }
    var year = cc - 4716;
    var iyear = 10631.0 / 30.0;
    var epochastro = 1948084;
    var epochcivil = 1948085;
    var shift1 = 8.01 / 60.0;
    var z = jd - epochastro;
    var cyc = Math.floor(z / 10631.0);
    var z = z - 10631 * cyc;
    var j = Math.floor((z - shift1) / iyear);
    var iy = 30 * cyc + j;
    var z = z - Math.floor(j * iyear + shift1);
    var im = Math.floor((z + 28.5001) / 29.5);
    if (im == 13) im = 12;
    var id = z - Math.floor(29.5001 * im - 29);
    
    const islamicMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    
    return {
        day: id,
        month: im - 1, // 0-indexed
        year: iy,
        monthName: islamicMonths[im - 1]
    };
}




    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // --- Scroll Logic (تحديث الهيدر والبار) ---
// متغير لضمان عدم تكرار التنفيذ
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            updateHeaderOnScroll();
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true }); // passive: true مهمة جداً للموبايل

function updateHeaderOnScroll() {
    // 1. تأثير الهيدر
    if (window.scrollY > 50) {
        header.classList.add('liquid-glass');
    } else {
        header.classList.remove('liquid-glass');
    }

    // 2. منطق ظهور بار الإنجاز
    const mainProgressContainer = document.querySelector('.global-progress-container');
    if (mainProgressContainer) {
        const rect = mainProgressContainer.getBoundingClientRect();
        if (rect.bottom < 0) {
            header.classList.add('show-progress');
        } else {
            header.classList.remove('show-progress');
        }
    }
}

    // --- 1. إعدادات Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyD8ltXQrl8XhRbjLlOfr5QiTGx_IQMan3U",
        authDomain: "mohasba-app.firebaseapp.com",
        projectId: "mohasba-app",
        storageBucket: "mohasba-app.firebasestorage.app",
        messagingSenderId: "24957282420",
        appId: "1:24957282420:web:982d83e0e0b1f7d6da8921"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- 2. دالة تسجيل الدخول (معدلة للفحص) ---
    loginBtn.addEventListener('click', () => {
        if (isNativePlatform()) {
            auth.signInWithRedirect(provider).catch((error) => {
                console.error("Error:", error.message);
                alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
            });
        } else {
            auth.signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    // لا نحدث الواجهة مباشرة، بل نفحص البروفايل أولاً
                    checkUserProfile(user);
                }).catch((error) => {
                    console.error("Error:", error.message);
                    alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
                });
        }
    });

    if (isNativePlatform()) {
        auth.getRedirectResult().then((result) => {
            if (result && result.user) {
                checkUserProfile(result.user);
            }
        }).catch((error) => {
            console.error("Redirect error:", error.message);
        });
    }

    // --- 3. دالة تسجيل الخروج ---
    profileIcon.addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            auth.signOut().then(() => {
                updateUI(null);
                // تصفير الإعدادات عند الخروج
                userProfile = { name: '', gender: 'male', quranGoal: '', latitude: null, longitude: null };
                applyUserProfileSettings(); // لإعادة الأزرار لوضعها الطبيعي
            }).catch((error) => {
                console.error("Sign out error", error);
            });
        }
    });

    // --- 4. مراقبة حالة المستخدم (معدلة) ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            // لو مسجل دخول، افحص البروفايل وطبق الإعدادات
            checkUserProfile(user);
        } else {
            updateUI(null);
        }
    });

function updateUI(user) {
    const defaultProfileImage = 'logo.png';

    if (user) {
        loginBtn.classList.add('hidden');
        profileIcon.classList.remove('hidden');
        
        // إظهار زر الإعدادات
        if(settingsBtn) settingsBtn.classList.remove('hidden');

        const img = profileIcon.querySelector('img');
        if (img) {
            img.src = user.photoURL || defaultProfileImage;
        }
    } else {
        profileIcon.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        
        // إخفاء زر الإعدادات
        if(settingsBtn) settingsBtn.classList.add('hidden');

        const img = profileIcon.querySelector('img');
        if (img) {
            img.src = defaultProfileImage;
        }
    }
}

// --- آيات محاسبة النفس المتغيرة ---
    const quranVerses = [
        "يَوْمَئِذٍ تُعْرَضُونَ لَا تَخْفَىٰ مِنكُمْ خَافِيَةٌ",
        "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ",
        "وَكَفَىٰ بِنَا حَاسِبِينَ",
        "اقْرَأْ كِتَابَكَ كَفَىٰ بِنَفْسِكَ الْيَوْمَ عَلَيْكَ حَسِيبًا",
        "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ * وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ",
        "إِنَّ اللّهَ كَانَ عَلَيْكُمْ رَقِيبًا",
        "يَوْمَ تَجِدُ كُلُّ نَفْسٍ مَّا عَمِلَتْ مِنْ خَيْرٍ مُّحْضَرًا",
        "وَاتَّقُوا يَوْمًا تُرْجَعُونَ فِيهِ إِلَى اللَّهِ ۖ ثُمَّ تُوَفَّىٰ كُلُّ نَفْسٍ مَّا كَسَبَتْ",
        "بَلِ الْإِنسَانُ عَلَىٰ نَفْسِهِ بَصِيرَةٌ * وَلَوْ أَلْقَىٰ مَعَاذِيرَهُ",
        "وَأَمَّا مَنْ خَافَ مَقَامَ رَبِّهِ وَنَهَى النَّفْسَ عَنِ الْهَوَىٰ * فَإِنَّ الْجَنَّةَ هِيَ الْمَأْوَىٰ"
    ];

    function setRandomVerse() {
        const verseElement = document.getElementById('daily-verse');
        if (verseElement) {
            const randomIndex = Math.floor(Math.random() * quranVerses.length);
            verseElement.textContent = quranVerses[randomIndex];
        }
    }

    // استدعاء الدالة لتغيير الآية عند فتح الصفحة
    setRandomVerse();

    // --- منطق البروفايل الجديد والمواقيت ---

    // 1. زر تحديد الموقع في المودال
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', () => {
            locationStatus.textContent = 'جاري تحديد الموقع...';
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userProfile.latitude = position.coords.latitude;
                        userProfile.longitude = position.coords.longitude;
                        locationStatus.textContent = 'تم تحديد الموقع بنجاح ✓';
                        locationStatus.style.color = '#22c55e';
                        checkSetupValidity();
                    },
                    (error) => {
                        console.error(error);
                        locationStatus.textContent = 'تعذر تحديد الموقع. تأكد من تفعيل GPS.';
                        locationStatus.style.color = '#ef4444';
                    }
                );
            } else {
                locationStatus.textContent = 'المتصفح لا يدعم تحديد الموقع.';
            }
        });
    }

    // 2. التحقق من صحة المدخلات لتفعيل زر الحفظ
    function checkSetupValidity() {
        const name = document.getElementById('setup-name').value;
        const goal = document.getElementById('setup-quran-goal').value;

        if (name && goal && userProfile.latitude) {
            saveSetupBtn.disabled = false;
        } else {
            saveSetupBtn.disabled = true;
        }
    }

    if (document.getElementById('setup-name')) {
        ['setup-name', 'setup-quran-goal', 'setup-gender'].forEach(id => {
            document.getElementById(id).addEventListener('input', checkSetupValidity);
        });
    }

    // 3. حفظ بيانات الإعدادات في Firebase
// --- 3. حفظ بيانات الإعدادات والتنبيهات في Firebase ---
if (saveSetupBtn) {
    saveSetupBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. تجهيز بيانات البروفايل
        userProfile.name = document.getElementById('setup-name').value;
        userProfile.gender = document.getElementById('setup-gender').value;
        userProfile.quranGoal = document.getElementById('setup-quran-goal').value;

        userProfile.level = document.getElementById('setup-level').value || '3';

        // 2. تجهيز بيانات التنبيهات
        notificationSettings.morningTime = document.getElementById('setup-morning-time').value || '06:00';
        notificationSettings.eveningTime = document.getElementById('setup-evening-time').value || '17:00';
        notificationSettings.wirdTime = document.getElementById('setup-wird-time').value || '21:00';
        // (حالة التفعيل enabled تظل محلية لأنها تعتمد على إذن المتصفح)

        // 3. الحفظ الموحد في Firebase (بروفايل + تنبيهات)
        const batch = db.batch();
        const profileRef = db.collection('users').doc(user.uid).collection('settings').doc('profile');
        const notifRef = db.collection('users').doc(user.uid).collection('settings').doc('notifications');

        batch.set(profileRef, userProfile);
        batch.set(notifRef, notificationSettings);

        batch.commit()
            .then(() => {
                // حفظ محلي أيضاً للسرعة
                localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
                refreshNotificationSchedules();
                
                setupModal.classList.add('hidden');
                applyUserProfileSettings(); 
                updateUI(user);
                alert('تم حفظ الإعدادات ومزامنتها مع حسابك بنجاح!');
            })
            .catch((err) => console.error("Error saving settings:", err));
    });
}

    // 4. دالة فحص وجود البروفايل
    // --- 4. دالة فحص وتحميل البروفايل والتنبيهات ---
function checkUserProfile(user) {
    const settingsRef = db.collection('users').doc(user.uid).collection('settings');

    // جلب البروفايل والتنبيهات معاً
    Promise.all([
        settingsRef.doc('profile').get(),
        settingsRef.doc('notifications').get()
    ]).then(([profileDoc, notifDoc]) => {
        
        // 1. معالجة البروفايل
        if (profileDoc.exists) {
            userProfile = profileDoc.data();
            applyUserProfileSettings();
            updateUI(user);
            loadGlobalHabits();
            syncFromCloud();
        } else {
            // مستخدم جديد
            updateUI(user);
            if (setupModal) setupModal.classList.remove('hidden');
        }

        // 2. معالجة التنبيهات (استرجاعها من السحابة)
        if (notifDoc.exists) {
            const savedNotifs = notifDoc.data();
            // تحديث المتغير العام
            notificationSettings.morningTime = savedNotifs.morningTime;
            notificationSettings.eveningTime = savedNotifs.eveningTime;
            notificationSettings.wirdTime = savedNotifs.wirdTime;
            
            // تحديث الحقول في المودال (عشان لو فتح الإعدادات يلاقيها موجودة)
            if(document.getElementById('setup-morning-time')) {
                document.getElementById('setup-morning-time').value = savedNotifs.morningTime;
                document.getElementById('setup-evening-time').value = savedNotifs.eveningTime;
                document.getElementById('setup-wird-time').value = savedNotifs.wirdTime;
            }
            
            // تحديث التخزين المحلي
            localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
        }

        refreshNotificationSchedules();

    }).catch(err => console.error("Error fetching user data:", err));
}

// 5. تطبيق الإعدادات (إخفاء المسجد + تشغيل التايمر + تحديث الورد)
function applyUserProfileSettings() {
    // أ) منطق الجنس
    const mosqueBtns = document.querySelectorAll('[data-type="mosque"]');
    if (userProfile.gender === 'female') {
        mosqueBtns.forEach(btn => {
            btn.style.display = 'none'; // إخفاء الزر
            btn.setAttribute('data-points', '0'); // تصفير النقاط
        });
    } else {
        mosqueBtns.forEach(btn => {
            btn.style.display = 'inline-block'; // إظهار الزر
            btn.setAttribute('data-points', '3'); // إرجاع النقاط
        });
    }

    // ب) تحديث نص الورد القرآني (الحل هنا)
    const quranBox = document.querySelector('.ibada-box[data-id="quran"]');
    if (quranBox) {
        const quranTitle = quranBox.querySelector('.ibada-title');
        // إذا كان المستخدم حدد ورداً في الإعدادات، نستخدمه، وإلا نستخدم النص الافتراضي
        const goalText = userProfile.quranGoal ? userProfile.quranGoal : 'ريعين';
        quranTitle.textContent = `ورد القرآن - ${goalText} (4 نقاط)`;
    }

    // ج) تشغيل المواقيت
    if (userProfile.latitude && userProfile.longitude) {
        initPrayerTimes(userProfile.latitude, userProfile.longitude);
    }

    // د) إعادة حساب النقاط
    updateGlobalScore();
}

    // 6. جلب المواقيت وتشغيل العداد
function initPrayerTimes(lat, long) {
    // نستخدم التاريخ الحالي أو المختار من التقويم لضمان التحديث
    const date = currentDate || new Date(); 
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${long}&method=5`)
        .then(response => response.json())
        .then(data => {
            // 1. الكود القديم (حساب المواقيت والعد التنازلي) - لم نلمسه
            prayerTimesData = data.data.timings;
            startCountdown();
            schedulePrayerNotifications();

            // ---------------------------------------------------
            // 2. الإضافة الجديدة (استخراج التاريخ وتشغيل البونص)
            // ---------------------------------------------------
            if (data.data.date) {
                const hijri = data.data.date.hijri;      // التاريخ الهجري
                const gregorian = data.data.date.gregorian; // التاريخ الميلادي (لأيام الأسبوع)
                
                // استدعاء دالة إدارة البونص والتنبيهات
                handleSunnahSystem(hijri, gregorian);
            }
            // ---------------------------------------------------
        })
        .catch(err => console.error("Error fetching prayer times:", err));
}

    function startCountdown() {
        if (prayerInterval) clearInterval(prayerInterval);

        prayerInterval = setInterval(() => {
            if (!prayerTimesData) return;
            const now = new Date();
            const times = {
                fajr: parseTime(prayerTimesData.Fajr),
                dhuhr: parseTime(prayerTimesData.Dhuhr),
                asr: parseTime(prayerTimesData.Asr),
                maghrib: parseTime(prayerTimesData.Maghrib),
                isha: parseTime(prayerTimesData.Isha)
            };

            updateSingleTimer('fajr', times.fajr, now);
            updateSingleTimer('dhuhr', times.dhuhr, now);
            updateSingleTimer('asr', times.asr, now);
            updateSingleTimer('maghrib', times.maghrib, now);
            updateSingleTimer('isha', times.isha, now);
        }, 1000);
    }

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function updateSingleTimer(prayerId, prayerDate, now) {
        const timerElement = document.getElementById(`timer-${prayerId}`);
        if (!timerElement) return;

        // --- المنطق الذكي لتعديل التاريخ (خاص بالفجر) ---
        // إذا كانت الصلاة هي الفجر، والساعة الآن تعدت 12 ظهراً، إذن نحن ننتظر فجر الغد
        if (prayerId === 'fajr' && now.getHours() > 12) {
            prayerDate = new Date(prayerDate.getTime() + (24 * 60 * 60 * 1000));
        }

        const diff = prayerDate - now;

        if (diff > 0) {
            // --- الحالة الأولى: الصلاة لسه مجاتش (متبقي) ---
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // الصيغة: متبقي: 02:30:15
            timerElement.textContent = `متبقي: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timerElement.style.color = 'var(--accent-color)'; // لون عادي (أزرق/بنفسجي)
            timerElement.style.borderColor = 'var(--glass-border)'; // إطار عادي
            
        } else {
            // --- الحالة الثانية: الصلاة وقتها دخل (مضى) ---
            const passed = Math.abs(diff);
            const hours = Math.floor(passed / (1000 * 60 * 60));
            const minutes = Math.floor((passed % (1000 * 60 * 60)) / (1000 * 60));

            // الصيغة: مضى: 00:45
            timerElement.textContent = `مضى: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            // تغيير اللون للأحمر للتنبيه
            timerElement.style.color = '#ef4444'; 
            timerElement.style.borderColor = '#ef4444';
        }
    }


    // --- Date Logic ---
    // --- Dual Calendar Variables ---
    let currentViewDateG = new Date();
    let currentViewDateH = new Date(); 
    let currentDate = new Date(); 

    // --- تحديث النص في الزر الرئيسي ---
    function updateDateDisplay() {
        // إذا كان المتغير currentDate غير معرف، نستخدم تاريخ اليوم
        if (typeof currentDate === 'undefined') currentDate = new Date();
        
        const gregStr = currentDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
        const hijriObj = kuwaitiCalendar(currentDate);
        const hijriStr = `${hijriObj.day} ${hijriObj.monthName} ${hijriObj.year}`;
        
        if(currentDateDisplay) {
            currentDateDisplay.innerHTML = `<span>${gregStr}</span> <span style="margin: 0 10px; opacity: 0.6;">|</span> <span style="color: var(--accent-color);">${hijriStr}</span>`;
        }
    }

    // --- الدالة الرئيسية لرسم التقويمين ---
    function renderDualCalendar() {
        renderGregorianGrid();
        renderHijriGrid();
    }

    function renderGregorianGrid() {
        const grid = document.getElementById('days-grid-g');
        const monthLabel = document.getElementById('current-month-display-g');
        if(!grid || !monthLabel) return; // حماية من الأخطاء

        const year = currentViewDateG.getFullYear();
        const month = currentViewDateG.getMonth();
        monthLabel.textContent = new Date(year, month).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        grid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startDayIndex = (firstDayOfMonth + 1) % 7; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('date-day', 'empty');
            grid.appendChild(empty);
        }
        
        const todayRef = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('date-day');
            dayEl.textContent = i;
            
            if (i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayEl.classList.add('active');
            }
            if (i === todayRef.getDate() && month === todayRef.getMonth() && year === todayRef.getFullYear()) {
                dayEl.classList.add('today');
            }
            
            dayEl.addEventListener('click', () => {
                currentDate = new Date(year, month, i);
                currentViewDateH = new Date(currentDate); 
                onDateSelected();
            });
            grid.appendChild(dayEl);
        }
    }

    function renderHijriGrid() {
        const grid = document.getElementById('days-grid-h');
        const monthLabel = document.getElementById('current-month-display-h');
        if(!grid || !monthLabel) return;

        const hObj = kuwaitiCalendar(currentViewDateH);
        const hMonth = hObj.month;
        const hYear = hObj.year;
        monthLabel.textContent = `${hObj.monthName} ${hObj.year}`;
        grid.innerHTML = '';

        let tempDate = new Date(currentViewDateH);
        tempDate.setDate(tempDate.getDate() - 35); 
        let firstDayDate = null;
        // البحث عن بداية الشهر الهجري
        for(let i=0; i<70; i++) {
            tempDate.setDate(tempDate.getDate() + 1);
            let check = kuwaitiCalendar(tempDate);
            if (check.month === hMonth && check.year === hYear && check.day === 1) {
                firstDayDate = new Date(tempDate);
                break;
            }
        }
        if (!firstDayDate) firstDayDate = new Date(currentViewDateH); 

        const dayOfWeek = firstDayDate.getDay(); 
        const startDayIndex = (dayOfWeek + 1) % 7;

        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement('div');
            empty.classList.add('date-day', 'empty');
            grid.appendChild(empty);
        }

        let iteratorDate = new Date(firstDayDate);
        for (let i = 1; i <= 30; i++) {
            const currH = kuwaitiCalendar(iteratorDate);
            if (currH.month !== hMonth) break; 
            
            const dayEl = document.createElement('div');
            dayEl.classList.add('date-day');
            dayEl.textContent = i;
            
            const selectedH = kuwaitiCalendar(currentDate);
            if (i === selectedH.day && hMonth === selectedH.month && hYear === selectedH.year) {
                dayEl.classList.add('active');
            }
            
            // حفظ التاريخ الميلادي لهذا اليوم الهجري
            const thisGregorianDate = new Date(iteratorDate); 
            dayEl.addEventListener('click', () => {
                currentDate = thisGregorianDate;
                currentViewDateG = new Date(currentDate); 
                onDateSelected();
            });
            grid.appendChild(dayEl);
            iteratorDate.setDate(iteratorDate.getDate() + 1);
        }
    }

    function onDateSelected() {
        updateDateDisplay();
        renderDualCalendar();
        
        // 1. تصفير العدادات والنقاط مؤقتاً لضمان عدم تداخل بيانات الأيام
        updateGlobalScore(); 

        // 2. تحميل البيانات بناءً على حالة تسجيل الدخول
        if (typeof auth !== 'undefined' && auth.currentUser) {
            syncFromCloud(); // سيقوم بالتحميل من السحابة ثم التخزين المحلي ثم العرض
        } else {
            loadData(); // تحميل من التخزين المحلي مباشرة
        }
        
        // 3. تحديث المواقيت لليوم الجديد
        if (typeof userProfile !== 'undefined' && userProfile.latitude) {
            initPrayerTimes(userProfile.latitude, userProfile.longitude);
        }
    }

    // --- أزرار التنقل (Navigation) ---
    // (تأكد من حذف الـ Listeners القديمة الخاصة بـ prev-month و next-month قبل إضافة هذا)
    const pmg = document.getElementById('prev-month-g'); if(pmg) pmg.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateG.setMonth(currentViewDateG.getMonth() - 1); renderGregorianGrid(); });
    const nmg = document.getElementById('next-month-g'); if(nmg) nmg.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateG.setMonth(currentViewDateG.getMonth() + 1); renderGregorianGrid(); });
    
    const pmh = document.getElementById('prev-month-h'); if(pmh) pmh.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateH.setDate(currentViewDateH.getDate() - 29); renderHijriGrid(); });
    const nmh = document.getElementById('next-month-h'); if(nmh) nmh.addEventListener('click', (e) => { e.stopPropagation(); currentViewDateH.setDate(currentViewDateH.getDate() + 29); renderHijriGrid(); });

    if (dateToggleBtn) {
        dateToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(dateDropdown) {
                dateDropdown.classList.toggle('hidden');
                if (!dateDropdown.classList.contains('hidden')) {
                    currentViewDateG = new Date(currentDate);
                    currentViewDateH = new Date(currentDate);
                    renderDualCalendar();
                }
            }
        });
    }
    // --- Constants ---
    const ADHKAR_TYPES = ['morning', 'wakeup', 'evening', 'post_fajr', 'post_dhuhr', 'post_asr', 'post_maghrib', 'post_isha'];

    // دالة مساعدة لإنشاء كائن الذكر (النص الكامل، العدد، الفضل)
    // d(Text, Count, Fadl)
    const d = (text, count = 1, fadl = null) => ({ text, count, fadl });

    // أذكار ما بعد الصلاة (تم ضبط العدادات لها)
    const postPrayerAdhkar = [
        d('أستغفر الله', 3),
        d('اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام', 1, 'عن ثوبان رضي الله عنه قال: كان رسول الله ﷺ إذا انصرف من صلاته استغفر ثلاثا وقال: اللهم أنت السلام...'),
        d('اللهم أعنا على ذكرك وشكرك وحسن عبادتك', 1),
        d('لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 3),
        d('سبحان الله', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('الحمد لله', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('الله أكبر', 33, 'من سبح دبر كل صلاة 33 وحمد 33 وكبر 33 وقال تمام المائة لا إله إلا الله... غفرت خطاياه وإن كانت مثل زبد البحر.'),
        d('لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير', 1, 'تمام المائة لغفران الذنوب.'),
        d('آية الكرسي', 1, 'من قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.')
    ];

    // بيانات الأذكار كاملة (بنفس نصوصك الأصلية مع إضافة العدادات)
    const adhkarData = {
        'wakeup': [
            d('الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 1, 'رواه البخاري'),
            d('لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَريكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ للَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفرْ لِي', 1, 'من قالها غفرت له ذنوبه ولو كانت مثل زبد البحر'),
            d('الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لي بِذِكْرِهِ', 1),
            d('﴿إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ (190) الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ (191) رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ ۖ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ (192) رَّبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ (193) رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ (194) فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لَا أُضِيعُ عَمَلَ عَامِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَىٰ ۖ بَعْضُكُم مِّن بَعْضٍ ۖ فَالَّذِينَ هَاجَرُوا وَأُخْرِجُوا مِن دِيَارِهِمْ وَأُوذُوا فِي سَبِيلِي وَقَاتَلُوا وَقُتِلُوا لَأُكَفِّرَنَّ عَنْهُمْ سَيِّئَاتِهِمْ وَلَأُدْخِلَنَّهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ثَوَابًا مِّنْ عِندِ اللَّهِ ۗ وَاللَّهُ عِندَهُ حُسْنُ الثَّوَابِ (195) لَا يَغُرَّنَّكَ تَقَلُّبُ الَّذِينَ كَفَرُوا فِي الْبِلَادِ (196) مَتَاعٌ قَلِيلٌ ثُمَّ مَأْوَاهُمْ جَهَنَّمُ ۚ وَبِئْسَ الْمِهَادُ (197) لَٰكِنِ الَّذِينَ اتَّقَوْا رَبَّهُمْ لَهُمْ جَنَّاتٌ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا نُزُلًا مِّنْ عِندِ اللَّهِ ۗ وَمَا عِندَ اللَّهِ خَيْرٌ لِّلْأَبْرَارِ (198) وَإِنَّ مِنْ أَهْلِ الْكِتَابِ لَمَن يُؤْمِنُ بِاللَّهِ وَمَا أُنزِلَ إِلَيْكُمْ وَمَا أُنزِلَ إِلَيْهِمْ خَاشِعِينَ لِلَّهِ لَا يَشْتَرُونَ بِآيَاتِ اللَّهِ ثَمَنًا قَلِيلًا ۗ أُولَٰئِكَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ ۗ إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ (199) يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ (200)﴾', 1, 'كان النبي ﷺ يقرؤها إذا استيقظ من الليل')
        ],
        'morning': [
            d('أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيم اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ۝٢٥٥', 1, 'من قالها حين يصبح أجير من الجن حتى يمسي'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦', 3, 'تكفيك من كل شيء'),
            d('أَصْـبَحْنا وَأَصْـبَحَ المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذا اليوم وَخَـيرَ ما بَعْـدَه ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذا اليوم وَشَرِّ ما بَعْـدَه، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر.', 1),
            d('اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ .', 1, 'من قاله موقناً به حين يصبح فمات من يومه دخل الجنة'),
            d('رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً', 3, 'من قالها حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة'),
            d('اللّهُـمَّ إِنِّـي أَصْبَـحْتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك.', 4, 'من قالها أعتقه الله من النار'),
            d('اللّهُـمَّ ما أَصْبَـَحَ بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.', 1, 'من قالها فقد أدى شكر يومه'),
            d('حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم', 7, 'من قالها كفاه الله ما أهمه من أمر الدنيا والآخرة'),
            d('بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم', 3, 'لم يضره شيء'),
            d('اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشُور', 1),
            d('أَصْبَـحْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.', 1),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه', 3),
            d('اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ.', 3),
            d('اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي.', 1),
            d('يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ', 1),
            d('أَصْبَـحْـنا وَأَصْبَـحْ المُـلكُ للهِ رَبِّ العـالَمـين ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ خَـيْرَ هـذا الـيَوْم ، فَـتْحَهُ ، وَنَصْـرَهُ ، وَنـورَهُ وَبَـرَكَتَـهُ ، وَهُـداهُ ، وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهِ وَشَـرِّ ما بَعْـدَه.', 1),
            d('اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم.', 1),
            d('أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق', 3),
            d('اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا', 1),
            d('لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ', 100, 'كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان'),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ', 100, 'حطت خطاياه وإن كانت مثل زبد البحر'),
            d('أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيْهِ', 100),
            d('اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ', 10, 'أدركته شفاعتي يوم القيامة')
        ],
'evening': [
            d('أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيم اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ', 1, 'من قالها حين يمسي أجير من الجن حتى يصبح'),
            d('آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝٢٨٥ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَّسِينَآ أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ', 1, 'من قرأهما في ليلة كفتاه'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥', 3, 'تكفيك من كل شيء'),
            d('بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦', 3, 'تكفيك من كل شيء'),
            d('أَمْسَيْـنا وَأَمْسـى المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذهِ اللَّـيْلَةِ وَخَـيرَ ما بَعْـدَهـا ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذهِ اللَّـيْلةِ وَشَرِّ ما بَعْـدَهـا ، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر.', 1),
            d('اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ .', 1, 'من قاله موقناً به حين يمسي فمات من ليلته دخل الجنة'),
            d('رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً', 3, 'كان حقاً على الله أن يرضيه يوم القيامة'),
            d('اللّهُـمَّ إِنِّـي أَمسيتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك.', 4, 'من قالها أعتقه الله من النار'),
            d('اللّهُـمَّ ما أَمسى بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.', 1, 'من قالها فقد أدى شكر ليلته'),
            d('حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم', 7, 'من قالها كفاه الله ما أهمه من أمر الدنيا والآخرة'),
            d('بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم', 3, 'لم يضره شيء'),
            d('اللّهُـمَّ بِكَ أَمْسَيْـنا وَبِكَ أَصْـبَحْنا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ الْمَصِيرُ', 1),
            d('أَمْسَيْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.', 1),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه', 3),
            d('اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ.', 3),
            d('اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي.', 1),
            d('يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ', 1),
            d('أَمْسَيْنا وَأَمْسَى الْمُلْكُ للهِ رَبِّ الْعَالَمَيْنِ، اللَّهُمَّ إِنَّي أسْأَلُكَ خَيْرَ هَذَه اللَّيْلَةِ فَتْحَهَا ونَصْرَهَا، ونُوْرَهَا وبَرَكَتهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فيهِا وَشَرَّ مَا بَعْدَهَا.', 1),
            d('اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم.', 1),
            d('أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق', 3),
            d('لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ', 100, 'كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة، وكانت له حرزاً من الشيطان'),
            d('سُبْحـانَ اللهِ وَبِحَمْـدِهِ', 100, 'حطت خطاياه وإن كانت مثل زبد البحر'),
            d('أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيهِ', 100),
            d('اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ', 10, 'أدركته شفاعتي يوم القيامة')
        ],
        'post_fajr': postPrayerAdhkar,
        'post_dhuhr': postPrayerAdhkar,
        'post_asr': postPrayerAdhkar,
        'post_maghrib': postPrayerAdhkar,
        'post_isha': postPrayerAdhkar
    };

    const PRAYER_EXTRAS = {
        fajr: [
            { name: 'جلسة الإشراق (الجلوس لذكر الله حتى تطلع الشمس ثم صلاة ركعتين) - أجر حجة وعمرة.', points: 3 },
            { name: 'صلاة الضحى (8 ركعات)', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ],
        dhuhr: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرآن', points: 3 }
        ],
        asr: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 },
            { name: 'كثرة الاستغفار', points: 3 },
            { name: 'جلسة دعاء قبل الغروب', points: 3 }
        ],
        maghrib: [
            { name: 'إطعام طعام / صدقة: (ولو بشق تمرة).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ],
        isha: [
            { name: 'سورة الملك (المنجية من عذاب القبر).', points: 3 },
            { name: 'الوضوء قبل النوم: (من بات طاهراً بات في شعاره ملك).', points: 3 },
            { name: 'قراءة ربع من القرءان', points: 3 }
        ]
    };

    let currentAdhkarType = '';
    let currentSelectedPrayer = null;

    // --- Scoring System (Updated for Gender) ---
    // --- دالة حساب النقاط وتجهيز تفاصيل العبادات ---
function calculateScoreAndSummary() {
    let currentPoints = 0;
    let maxPossiblePoints = 0;
    
    // كائن لتجميع إحصائيات التصنيفات (للرادار شارت)
    // نجمع: [النقاط المحققة, النقاط الكلية]
    let summary = {
        'الصلوات': [0, 0],
        'القرآن': [0, 0],
        'الأذكار': [0, 0],
        'السنن': [0, 0],
        'قيام الليل': [0, 0]
    };

    // 1. الصلوات المفروضة
    document.querySelectorAll('.prayer-item').forEach(card => {
        // البحث عن أزرار الصلاة الأساسية فقط (داخل أول task-box)
        const prayerBox = card.querySelector('.task-box'); 
        if(prayerBox) {
            const prayerBtns = Array.from(prayerBox.querySelectorAll('.prayer-btn')).filter(btn => window.getComputedStyle(btn).display !== 'none');
            
            if (prayerBtns.length > 0) {
                // حساب الماكسيمم
                let maxForPrayer = 0;
                prayerBtns.forEach(btn => {
                    const pts = parseInt(btn.getAttribute('data-points') || 0);
                    if (pts > maxForPrayer) maxForPrayer = pts;
                });
                
                maxPossiblePoints += maxForPrayer;
                summary['الصلوات'][1] += maxForPrayer;

                // حساب المحقق
                const activeBtn = prayerBox.querySelector('.prayer-btn.active');
                if (activeBtn) {
                    const pts = parseInt(activeBtn.getAttribute('data-points') || 0);
                    currentPoints += pts;
                    summary['الصلوات'][0] += pts;
                }
            }
        }
    });

    // 2. الأزرار التبديلية (سنن + نوافل)
    document.querySelectorAll('.task-btn.toggle-btn').forEach(btn => {
        const points = parseInt(btn.getAttribute('data-points') || 0);
        maxPossiblePoints += points;
        summary['السنن'][1] += points; // نفترض مبدئياً أنها سنن

        if (btn.classList.contains('active')) {
            currentPoints += points;
            summary['السنن'][0] += points;
        }
    });

    // 3. الأذكار (التقدم)
    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) {
            maxPossiblePoints += 2;
            summary['الأذكار'][1] += 2;
            
            if (progress.style.width === '100%') {
                currentPoints += 2;
                summary['الأذكار'][0] += 2;
            }
        }
    });

    // 4. ركن العبادات (قرآن، قيام، وتر، وغيرها)
    document.querySelectorAll('.ibada-box').forEach(box => {
        const points = parseInt(box.getAttribute('data-points') || 0);
        const title = box.querySelector('.ibada-title').textContent;
        const isDone = box.classList.contains('done');

        maxPossiblePoints += points;
        
        // تصنيف العبادة
        if (title.includes('قرآن')) {
            summary['القرآن'][1] += points;
            if (isDone) summary['القرآن'][0] += points;
        } else if (title.includes('قيام') || title.includes('وتر')) {
            summary['قيام الليل'][1] += points;
            if (isDone) summary['قيام الليل'][0] += points;
        } else {
            // أي عبادات إضافية تضاف للسنن
            summary['السنن'][1] += points;
            if (isDone) summary['السنن'][0] += points;
        }

        if (isDone) currentPoints += points;
    });

    // 5. البونص
    const bonusSection = document.getElementById('bonus-section');
    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusSection && !bonusSection.classList.contains('hidden') && bonusBtn) {
        const ptr = parseInt(bonusBtn.getAttribute('data-points') || 0);
        maxPossiblePoints += ptr;
        summary['السنن'][1] += ptr; // نعتبر البونص سنة
        if (bonusBtn.classList.contains('active')) {
            currentPoints += ptr;
            summary['السنن'][0] += ptr;
        }
    }

    // النسبة المئوية النهائية
    const percentage = maxPossiblePoints === 0 ? 0 : Math.round((currentPoints / maxPossiblePoints) * 100);

    return {
        percentage,
        summary // هذا هو الكنز الذي سنحفظه للرسم البياني
    };
}

// دالة تحديث الواجهة (تستدعي الدالة السابقة)
function updateGlobalScore() {
    const data = calculateScoreAndSummary();
    const percentage = data.percentage;

    // تحديث النصوص والبار
    const reflectionTitle = document.getElementById('reflection-title');
    if (reflectionTitle) {
        if (percentage >= 50) {
            reflectionTitle.textContent = "أحسنت! ما الذي أعانك على هذا الإنجاز اليوم؟";
            reflectionTitle.style.color = "#22c55e";
        } else {
            reflectionTitle.textContent = "ما الذي منعك وشغلك عن وردك اليوم؟";
            reflectionTitle.style.color = "#ef4444";
        }
    }

    if (totalScoreDisplay) totalScoreDisplay.textContent = `${percentage}%`;
    if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;

    const headerFill = document.getElementById('header-progress-fill');
    const headerText = document.getElementById('header-progress-text');
    if (headerFill) headerFill.style.width = `${percentage}%`;
    if (headerText) headerText.textContent = `${percentage}%`;

    return data; // نرجع البيانات لاستخدامها في الحفظ
}

    // --- Data Persistence Functions ---
    // --- هذه هي الدالة الناقصة، ضفها فوراً ---
// function getStorageKey(date) {
//     if (!date) date = new Date();
//     return `mohasba_data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
// }

// // دالة لتوحيد صيغة التاريخ في كل مكان (هام جداً لفصل الأيام)
// function getDateKey(date) {
//     if (!date) date = new Date();
//     // الصيغة: YYYY-M-D (مثال: 2026-2-8)
//     return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
// }

// // تحديث دالة مفتاح التخزين الرئيسي
// function getStorageKey(date) {
//     return `mohasba_data_${getDateKey(date)}`;
// }

// دالة موحدة لمفتاح التخزين تعتمد على التاريخ الممرر لها
function getStorageKey(date) {
    if (!date) date = new Date();
    // نستخدم دالة getDateKey لضمان توحيد الصيغة YYYY-M-D
    return `mohasba_data_${getDateKey(date)}`;
}

// دالة مساعدة لاستخراج صيغة التاريخ فقط
function getDateKey(date) {
    if (!date) date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getWidgetPendingCount() {
    let pending = 0;

    // الصلوات: الكارت الذي لا يحتوي اختيار صلاة فعّال يعتبر متبقياً.
    document.querySelectorAll('.prayer-item').forEach(card => {
        const prayerBox = card.querySelector('.task-box');
        if (!prayerBox) return;

        const prayerButtons = Array.from(prayerBox.querySelectorAll('.prayer-btn'))
            .filter(btn => window.getComputedStyle(btn).display !== 'none');
        if (prayerButtons.length === 0) return;

        if (!prayerBox.querySelector('.prayer-btn.active')) {
            pending += 1;
        }
    });

    // أذكار: كل نوع لم يكتمل بعد.
    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress && progress.style.width !== '100%') {
            pending += 1;
        }
    });

    // قرآن: أي عبادة قرآنية غير منجزة.
    document.querySelectorAll('.ibada-box').forEach(box => {
        const title = box.querySelector('.ibada-title')?.textContent || '';
        if (title.includes('قرآن') && !box.classList.contains('done')) {
            pending += 1;
        }
    });

    return pending;
}

function syncWidgetStatsToNative() {
    if (!isNativePlatform()) return;

    const widgetBridge = getWidgetBridge();
    if (!widgetBridge || typeof widgetBridge.updateHomeWidget !== 'function') return;

    try {
        const scoreData = calculateScoreAndSummary();
        const pending = getWidgetPendingCount();
        widgetBridge.updateHomeWidget({
            score: scoreData.percentage,
            pending: pending
        }).catch(() => {});
    } catch (e) {
        // تجاهل أخطاء المزامنة حتى لا تؤثر على تجربة الاستخدام.
    }
}

function markNextPrayerAsDoneFromWidget() {
    const prayerCards = Array.from(document.querySelectorAll('.prayer-item'));

    for (const card of prayerCards) {
        const prayerBox = card.querySelector('.task-box');
        if (!prayerBox) continue;
        if (prayerBox.querySelector('.prayer-btn.active')) continue;

        const prayerButtons = Array.from(prayerBox.querySelectorAll('.prayer-btn'))
            .filter(btn => window.getComputedStyle(btn).display !== 'none');

        if (prayerButtons.length === 0) continue;

        const bestButton = prayerButtons.reduce((best, current) => {
            const bestPoints = parseInt(best.getAttribute('data-points') || '0', 10);
            const currentPoints = parseInt(current.getAttribute('data-points') || '0', 10);
            return currentPoints > bestPoints ? current : best;
        }, prayerButtons[0]);

        prayerButtons.forEach(btn => {
            if (btn !== bestButton) btn.classList.remove('active');
        });
        bestButton.classList.add('active');
        return true;
    }

    return false;
}

function markQuranAsDoneFromWidget() {
    const quranBox = Array.from(document.querySelectorAll('.ibada-box')).find(box => {
        const title = box.querySelector('.ibada-title')?.textContent || '';
        return title.includes('قرآن') && !box.classList.contains('done');
    });

    if (!quranBox) return false;

    quranBox.classList.add('done');
    return true;
}

function markAdhkarAsDoneFromWidget() {
    for (const type of ADHKAR_TYPES) {
        const progress = document.getElementById(`progress-${type}`);
        if (!progress || progress.style.width === '100%') continue;

        progress.style.width = '100%';
        const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
        if (btn) btn.classList.add('completed');
        return true;
    }

    return false;
}

function applyWidgetQuickAction(action) {
    let changed = false;

    if (action === 'prayer') {
        changed = markNextPrayerAsDoneFromWidget();
        if (changed) saveData();
    } else if (action === 'quran') {
        changed = markQuranAsDoneFromWidget();
        if (changed) saveIbadatData();
    } else if (action === 'adhkar') {
        changed = markAdhkarAsDoneFromWidget();
        if (changed) saveData();
    }

    if (!changed) {
        syncWidgetStatsToNative();
    }
}

function parseWidgetActionFromEvent(event) {
    if (!event) return '';

    const detail = event.detail;
    if (!detail) return '';

    if (typeof detail === 'object') {
        return detail.action || '';
    }

    if (typeof detail === 'string') {
        try {
            const parsed = JSON.parse(detail);
            return parsed.action || '';
        } catch (_) {
            return '';
        }
    }

    return '';
}

function clearPendingWidgetAction() {
    const widgetBridge = getWidgetBridge();
    if (!widgetBridge || typeof widgetBridge.consumePendingQuickAction !== 'function') return;

    widgetBridge.consumePendingQuickAction().catch(() => {});
}

async function initializeWidgetBridge() {
    if (!isNativePlatform()) return;

    const widgetBridge = getWidgetBridge();
    if (!widgetBridge) return;

    window.addEventListener('widgetQuickAction', (event) => {
        const action = parseWidgetActionFromEvent(event);
        if (!action) return;

        applyWidgetQuickAction(action);
        clearPendingWidgetAction();
    });

    syncWidgetStatsToNative();

    if (typeof widgetBridge.getPendingQuickAction !== 'function') return;

    try {
        const result = await widgetBridge.getPendingQuickAction();
        const action = result && result.action ? String(result.action) : '';

        if (action) {
            applyWidgetQuickAction(action);
            clearPendingWidgetAction();
        }
    } catch (_) {
        // تجاهل أخطاء القراءة للحفاظ على عمل التطبيق بشكل طبيعي.
    }
}


    // --- Mobile Menu Logic ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const actionIcons = document.getElementById('action-icons');

    if (mobileMenuBtn && actionIcons) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            actionIcons.classList.toggle('show-mobile');
        });

        // إغلاق القائمة لو ضغطت بره
        document.addEventListener('click', (e) => {
            if (!actionIcons.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                actionIcons.classList.remove('show-mobile');
            }
        });
    }

function saveData() {
    const key = getStorageKey(currentDate);
    
    // 1. تجهيز حالة الأزرار والأذكار
    const data = { buttons: {}, adhkar: {} };

    document.querySelectorAll('.task-btn:not(.extra-worship-box .task-btn)').forEach((btn, index) => {
        if (btn.classList.contains('active') || btn.classList.contains('completed')) {
            data.buttons[index] = true;
        }
    });

    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) {
            data.adhkar[type] = progress.style.width;
        }
    });

    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusBtn && bonusBtn.classList.contains('active')) {
        data.bonus = {
            id: bonusBtn.getAttribute('data-bonus-id'),
            done: true,
            points: parseInt(bonusBtn.getAttribute('data-points'))
        };
    }

    // 2. تحديث الإحصائيات
    const scoreData = updateGlobalScore(); 
    
    // 3. حفظ الملاحظات (الجديد)
    const reflectionInput = document.getElementById('reflection-input');
    const userNote = reflectionInput ? reflectionInput.value : "";

    data.stats = {
        totalScore: scoreData.percentage,
        breakdown: scoreData.summary
    };
    
    // إضافة الملاحظة للبيانات المحفوظة
    data.note = userNote;

    // 4. الحفظ الفعلي
    localStorage.setItem(key, JSON.stringify(data));
    
    // حفظ سحابي
    try { saveToCloud(key, data); } catch (e) {}

    if (window.radarChartInstance || window.lineChartInstance) {
        updateCharts(document.querySelector('.filter-btn.active')?.textContent === 'شهري' ? 'month' : 'week');
    }

    syncWidgetStatsToNative();
}

    // --- تحديث دالة حفظ عبادات الركن (عشان تسمع في الإحصائيات) ---
function saveIbadatData() {
    // 1. الحفظ الخاص بالعبادات (عشان نحفظ حالتها وتفاصيلها)
    const key = `ibadat_data_${getDateKey(currentDate)}`;
    const data = { static: {}, dynamic: [] };

    // العبادات الثابتة
    document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
        data.static[box.dataset.id] = box.classList.contains('done');
    });

    // العبادات المضافة يدوياً
    document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => {
        const title = box.querySelector('.ibada-title').textContent;
        const time = box.querySelector('.ibada-time').textContent;
        const isDone = box.classList.contains('done');
        const points = box.getAttribute('data-points');
        data.dynamic.push({ name: title, time: time, done: isDone, points: points });
    });

    localStorage.setItem(key, JSON.stringify(data));
    
    // حفظ سحابي
    try { saveToCloud(key, data); } catch (e) {}

    // 2. (هام جداً) استدعاء الدالة الرئيسية لتحديث الإحصائيات العامة والشارتات
    saveData(); 
}

// --- تحديث دالة حفظ النوافل (عشان تسمع في الإحصائيات) ---
function saveExtras() {
    // 1. الحفظ الخاص بالنوافل
    const key = `extras_${getDateKey(currentDate)}`;
    const extrasData = [];

    document.querySelectorAll('.extra-worship-box').forEach(box => {
        const prayerCard = box.closest('.prayer-item');
        // حماية: التأكد من وجود الكارد قبل القراءة
        if (prayerCard) {
            const prayerId = prayerCard.id.replace('-card', '');
            const name = box.querySelector('.task-btn').textContent;
            const points = box.getAttribute('data-points');
            const isDone = box.querySelector('.task-btn').classList.contains('active');

            extrasData.push({
                prayer: prayerId,
                name: name,
                points: points,
                done: isDone
            });
        }
    });

    localStorage.setItem(key, JSON.stringify(extrasData));
    
    // حفظ سحابي
    try { saveToCloud(key, { ...extrasData }); } catch(e) {}

    // 2. (هام جداً) استدعاء الدالة الرئيسية لتحديث الإحصائيات العامة والشارتات
    saveData();
}

    function saveToCloud(key, data) {
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('data').doc(key).set(data)
                .catch((error) => console.error("Cloud Save Error:", error));
        }
    }



    // --- دوال العبادات الثابتة (Global Habits) ---

    function saveGlobalHabits() {
        localStorage.setItem('mohasba_global_habits', JSON.stringify(globalHabits));
        // حفظ في الفايربيس أيضاً
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('settings').doc('custom_habits').set(globalHabits)
                .catch(err => console.error("Error saving habits:", err));
        }
    }

    function loadGlobalHabits() {
        // 1. تحميل من LocalStorage أولاً للسرعة
        const saved = localStorage.getItem('mohasba_global_habits');
        if (saved) {
            globalHabits = JSON.parse(saved);
            renderGlobalHabits(); // رسم العبادات على الشاشة
        }

        // 2. تحميل من Firebase للتحديث
        const user = auth.currentUser;
        if (user) {
            db.collection('users').doc(user.uid).collection('settings').doc('custom_habits').get()
                .then(doc => {
                    if (doc.exists) {
                        globalHabits = doc.data();
                        localStorage.setItem('mohasba_global_habits', JSON.stringify(globalHabits));
                        renderGlobalHabits();
                        // بعد رسم العبادات، يجب إعادة تحميل حالة اليوم (هل تم إنجازها أم لا؟)
                        loadData(); 
                    }
                });
        }
    }

    // دالة رسم العبادات الثابتة على الشاشة
    function renderGlobalHabits() {
        // مسح العبادات الإضافية القديمة لتجنب التكرار
        document.querySelectorAll('.extra-worship-box').forEach(box => box.remove());
        document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => box.remove());

        // 1. رسم نوافل الصلوات
        if (globalHabits.prayerExtras) {
            globalHabits.prayerExtras.forEach(item => {
                renderExtraPrayerBox(item.prayer, item.name, item.points, item.id);
            });
        }

        // 2. رسم العبادات العامة
        if (globalHabits.generalIbadat) {
            globalHabits.generalIbadat.forEach(item => {
                renderGeneralIbadatBox(item.name, item.time, item.points, item.id);
            });
        }
    }


    function syncFromCloud() {
        const user = auth.currentUser;
        if (!user) return;

        // استخدام المفاتيح الموحدة التي تعتمد على currentDate
        const dateKey = getStorageKey(currentDate);
        const ibadatKey = `ibadat_data_${getDateKey(currentDate)}`;
        const extrasKey = `extras_${getDateKey(currentDate)}`;

        const docRef = db.collection('users').doc(user.uid).collection('data');

        // جلب البيانات الرئيسية
        docRef.doc(dateKey).get().then((doc) => {
            if (doc.exists) {
                localStorage.setItem(dateKey, JSON.stringify(doc.data()));
                loadData();
            } else {
                // إذا لم توجد بيانات في السحابة لهذا اليوم، نعتبرها فارغة ونعيد التحميل للتصفير
                loadData(); 
            }
        });

        // جلب بيانات العبادات
        docRef.doc(ibadatKey).get().then((doc) => {
            if (doc.exists) {
                localStorage.setItem(ibadatKey, JSON.stringify(doc.data()));
                loadIbadatData();
            } else {
                loadIbadatData();
            }
        });

        // جلب بيانات النوافل
        docRef.doc(extrasKey).get().then((doc) => {
            if (doc.exists) {
                const dataObj = doc.data();
                const dataArray = Object.values(dataObj);
                localStorage.setItem(extrasKey, JSON.stringify(dataArray));
                loadExtras();
            } else {
                loadExtras();
            }
        });
    }

    // --- Download Report Logic ---
    const downloadBtn = document.getElementById('download-report-btn');
    const reflectionInput = document.getElementById('reflection-input');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const date = currentDateDisplay.textContent;
            const score = totalScoreDisplay.textContent;
            const note = reflectionInput.value;

            const fileContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>تقرير محاسبة النفس</title>
                </head>
                <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
                    <h1 style="color: #4f46e5; text-align: center;">تقرير محاسبة النفس</h1>
                    <h3 style="text-align: center; color: #555;">التاريخ: ${date}</h3>
                    <hr>
                    <h2 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                        نسبة الإنجاز اليوم: <span style="${parseInt(score) >= 50 ? 'color: green' : 'color: red'}">${score}</span>
                    </h2>
                    <br>
                    <h3>خواطرك وملاحظاتك:</h3>
                    <p style="font-size: 14pt; line-height: 1.6; white-space: pre-wrap;">${note ? note : 'لا يوجد ملاحظات مسجلة.'}</p>
                    <br>
                    <hr>
                    <p style="text-align: center; font-size: 10pt; color: #888;"> تم تصدير هذا التقرير من منصة محاسبة النفس، الرجاء الدعاء للمهندس محمد حمدي منفذ الموقع.</p>
                </body>
                </html>
            `;

            const blob = new Blob(['\ufeff', fileContent], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `تقرير_محاسبة_${date.replace(/\//g, '-')}.doc`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }


    function loadData() {
    const key = getStorageKey(currentDate);
    const saved = localStorage.getItem(key);

    // 1. تنظيف الحالة (Reset) قبل التحميل
    document.querySelectorAll('.task-btn').forEach(btn => btn.classList.remove('active', 'completed'));
    ADHKAR_TYPES.forEach(type => {
        const progress = document.getElementById(`progress-${type}`);
        if (progress) progress.style.width = '0%';
        const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
        if (btn) btn.classList.remove('completed');
    });

    let needsMigration = false; // متغير للتحقق هل نحتاج تحديث البيانات أم لا

    // 2. تطبيق البيانات المحفوظة
    if (saved) {
        const data = JSON.parse(saved);
        
        // استعادة الأزرار
        if (data.buttons) {
            Object.keys(data.buttons).forEach(index => {
                // نستخدم التحديد الأدق للأزرار باستثناء النوافل الإضافية
                const btns = document.querySelectorAll('.task-btn:not(.extra-worship-box .task-btn)');
                if (btns[index]) {
                    btns[index].classList.add(btns[index].classList.contains('action-btn') ? 'completed' : 'active');
                }
            });
        }

        // استعادة الأذكار
        if (data.adhkar) {
            Object.keys(data.adhkar).forEach(type => {
                const progress = document.getElementById(`progress-${type}`);
                if (progress) progress.style.width = data.adhkar[type];
                
                const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
                if (btn && data.adhkar[type] === '100%') btn.classList.add('completed');
            });
        }
        
        // استعادة البونص
        if (data.bonus) {
             const bonusBtn = document.getElementById('bonus-action-btn');
             if(bonusBtn && bonusBtn.getAttribute('data-bonus-id') === data.bonus.id && data.bonus.done) {
                 bonusBtn.classList.add('active');
                 bonusBtn.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${data.bonus.points}+)`;
             }
        }

        // --- التصحيح الذاتي (هام جداً) ---
        // إذا كانت البيانات موجودة لكن لا تحتوي على stats، أو إذا كنا نريد تحديث العرض فوراً
        if (!data.stats) {
            needsMigration = true;
        }
    }

    // استدعاء باقي دوال التحميل
    loadExtras();
    loadIbadatData();

    // 3. الخطوة الحاسمة: إذا كان هناك بيانات قديمة بدون إحصائيات، أو لمجرد تحديث الواجهة
    // نقوم بحساب النقاط فوراً بناءً على ما تم تحميله في الـ DOM
    // ثم نحفظ النسخة الجديدة المحدثة
    if (saved || needsMigration) {
        saveData(); // هذا السطر سيقوم بملء الـ Charts فوراً
    } else {
        updateGlobalScore(); // تحديث العرض فقط للأيام الفارغة
    }
    
    // تحديث الشارتات لو القسم مفتوح
    if (document.getElementById('analytics-section')) {
        updateCharts('week'); 
    }

    syncWidgetStatsToNative();
}
    function loadIbadatData() {
        const key = `ibadat_data_${getDateKey(currentDate)}`;
        const saved = localStorage.getItem(key);

        // 1. تنظيف الحالة
        document.querySelectorAll('.ibada-box').forEach(box => box.classList.remove('done'));

        // 2. تطبيق البيانات
        if (saved) {
            const data = JSON.parse(saved);
            
            // الثابتة
            if (data.static) {
                Object.keys(data.static).forEach(id => {
                    const box = document.querySelector(`.ibada-box[data-id="${id}"]`);
                    if (box && data.static[id]) box.classList.add('done');
                });
            }

            // المضافة
            if (data.dynamic) {
                data.dynamic.forEach(item => {
                    const boxes = document.querySelectorAll('.ibada-box:not([data-id])');
                    boxes.forEach(box => {
                        const title = box.querySelector('.ibada-title').textContent;
                        if (title.includes(item.name) && item.done) {
                            box.classList.add('done');
                        }
                    });
                });
            }
        }
        updateGlobalScore();
    }

    function loadExtras() {
        const key = `extras_${getDateKey(currentDate)}`;
        const saved = localStorage.getItem(key);

        // 1. تنظيف الحالة
        document.querySelectorAll('.extra-worship-box').forEach(box => {
            box.classList.remove('done');
            box.querySelector('.task-btn').classList.remove('active');
        });

        // 2. تطبيق البيانات
        if (saved) {
            const extrasData = JSON.parse(saved);
            extrasData.forEach(item => {
                document.querySelectorAll('.extra-worship-box').forEach(box => {
                    const btn = box.querySelector('.task-btn');
                    // نطابق بالاسم والحالة
                    if (btn.textContent === item.name && item.done) {
                        btn.classList.add('active');
                        box.classList.add('done');
                    }
                });
            });
        }
        updateGlobalScore();
    }

    // --- Event Listeners for UI ---

    // 1. Static Prayer Buttons
    document.querySelectorAll('.prayer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.parentElement;
            parent.querySelectorAll('.prayer-btn').forEach(sibling => {
                if (sibling !== btn) sibling.classList.remove('active');
            });
            btn.classList.toggle('active');
            saveData();
        });
    });

    // 2. Static Toggle Buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            saveData();
        });
    });

    // 3. Static Rukn Al-Ibadat
    document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
        box.addEventListener('click', () => {
            box.classList.toggle('done');
            saveIbadatData();
        });
    });

    // 4. Adhkar Modal (تحديث كامل لدعم العداد وأيقونة الفضل مع دعم النصوص القديمة والجديدة)
    // 4. Adhkar Modal (نسخة محسنة تدعم التلميح العائم Global Tooltip)
    window.openAdhkar = function (type) {
    currentAdhkarType = type;
    const titleMap = {
        'wakeup': 'أذكار الاستيقاظ',
        'morning': 'أذكار الصباح',
        'evening': 'أذكار المساء',
        'post_fajr': 'أذكار بعد صلاة الفجر',
        'post_dhuhr': 'أذكار بعد صلاة الظهر',
        'post_asr': 'أذكار بعد صلاة العصر',
        'post_maghrib': 'أذكار بعد صلاة المغرب',
        'post_isha': 'أذكار بعد صلاة العشاء'
    };
    if (modalTitle) modalTitle.textContent = titleMap[type];

    // --- منطق تحديد المستوى (الجديد) ---
    const userLevel = parseInt(userProfile.level || '3'); // الافتراضي 3 (كامل)
    let limit;
    let levelName;

    // تحديد عدد الأذكار بناءً على المستوى
    if (userLevel === 1) {
        limit = 5; // المبتدئ: أول 5 أذكار فقط (الأساسيات)
        levelName = '(مستوى مبتدئ)';
    } else if (userLevel === 2) {
        limit = 12; // المتوسط: أول 12 ذكر
        levelName = '(مستوى متوسط)';
    } else {
        limit = 100; // المجتهد: الكل
        levelName = '';
    }

    // إضافة التلميح العام (Tooltip) إن لم يكن موجوداً
    let globalTooltip = document.getElementById('global-fadl-tooltip');
    if (!globalTooltip) {
        globalTooltip = document.createElement('div');
        globalTooltip.id = 'global-fadl-tooltip';
        globalTooltip.className = 'fadl-tooltip-global';
        document.body.appendChild(globalTooltip);
    }

    if (adhkarListContainer) {
        adhkarListContainer.classList.toggle('hide-scrollbar', type.startsWith('post_'));
        adhkarListContainer.innerHTML = '';
        
        // إضافة عنوان جانبي يوضح المستوى
        if (levelName) {
            const levelHint = document.createElement('div');
            levelHint.style.cssText = "text-align:center; color:#888; font-size:0.8rem; margin-bottom:10px;";
            levelHint.textContent = `يتم عرض أهم الأذكار فقط ${levelName}`;
            adhkarListContainer.appendChild(levelHint);
        }

        const rawItems = adhkarData[type] || [];
        
        // === تطبيق الفلتر هنا ===
        // نأخذ فقط العدد المسموح به بناءً على الـ limit
        const filteredItems = rawItems.slice(0, limit);
        // =======================

        const items = filteredItems.map(item => {
            if (typeof item === 'string') {
                return { text: item, count: 1, fadl: null };
            }
            return item;
        });

        items.forEach((item) => {
            // ... (باقي كود إنشاء العناصر كما هو تماماً بدون تغيير) ...
            const itemDiv = document.createElement('div');
            itemDiv.className = 'adhkar-item';
            
            // تحقق من الـ localStorage إذا كان هذا العنصر مكتمل سابقاً
            // (ملاحظة: نحتاج للتأكد من حالة الاكتمال بناءً على النص أو الفهرس)
            
            let currentCount = 0;
            
            // --- المحتوى ---
            const contentTop = document.createElement('div');
            contentTop.style.display = "flex";
            contentTop.style.alignItems = "center";
            contentTop.style.gap = "10px";
            contentTop.style.width = "100%";
            
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'adhkar-checkbox';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            textSpan.style.flex = "1";

            contentTop.appendChild(checkboxDiv);
            contentTop.appendChild(textSpan);

            // --- أدوات التحكم (العداد والفضل) ---
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'adhkar-controls';

            if (item.count > 1) {
                const counterBtn = document.createElement('button');
                counterBtn.className = 'counter-btn';
                counterBtn.innerHTML = `<i class="fa-solid fa-fingerprint"></i> <span class="count-display">0 / ${item.count}</span>`;
                
                counterBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (currentCount < item.count) {
                        currentCount++;
                        counterBtn.querySelector('.count-display').textContent = `${currentCount} / ${item.count}`;
                        if (currentCount === item.count) {
                            counterBtn.classList.add('completed');
                            counterBtn.innerHTML = `<i class="fa-solid fa-check"></i> تم (${item.count})`;
                            if (!itemDiv.classList.contains('completed')) toggleItemCompletion(itemDiv, type);
                        }
                    }
                };
                controlsDiv.appendChild(counterBtn);
            }

            if (item.fadl) {
                const infoWrapper = document.createElement('div');
                infoWrapper.className = 'info-wrapper';
                infoWrapper.innerHTML = `<i class="fa-solid fa-circle-question info-icon"></i>`;
                
                // منطق التلميح (Tooltip)
                const showTooltip = () => {
                    const rect = infoWrapper.getBoundingClientRect();
                    globalTooltip.textContent = item.fadl;
                    globalTooltip.style.display = 'block';
                    let top = rect.top - globalTooltip.offsetHeight - 10;
                    let left = rect.left + (rect.width / 2) - (globalTooltip.offsetWidth / 2);
                    if (top < 10) top = rect.bottom + 10;
                    if (left < 10) left = 10;
                    if (left + globalTooltip.offsetWidth > window.innerWidth) left = window.innerWidth - globalTooltip.offsetWidth - 10;
                    globalTooltip.style.top = `${top}px`;
                    globalTooltip.style.left = `${left}px`;
                };

                infoWrapper.onmouseenter = showTooltip;
                infoWrapper.onmouseleave = () => { globalTooltip.style.display = 'none'; };
                infoWrapper.onclick = (e) => {
                    e.stopPropagation();
                    showTooltip();
                    setTimeout(() => { globalTooltip.style.display = 'none'; }, 3000);
                };
                controlsDiv.appendChild(infoWrapper);
            }

            itemDiv.appendChild(contentTop);
            if (item.count > 1 || item.fadl) {
                itemDiv.appendChild(controlsDiv);
            }

            itemDiv.addEventListener('click', (e) => {
                if (e.target.closest('.counter-btn') || e.target.closest('.info-wrapper')) return;
                toggleItemCompletion(itemDiv, type);
                 if (itemDiv.classList.contains('completed') && item.count > 1) {
                    const btn = itemDiv.querySelector('.counter-btn');
                    if (btn) {
                        currentCount = item.count;
                        btn.classList.add('completed');
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> تم (${item.count})`;
                    }
                }
            });

            // استعادة حالة العنصر إذا كان مكتملاً في الذاكرة
            // (هذا الجزء يحتاج لمنطق متقدم قليلاً لربط النص بالحفظ، 
            // لكن الكود الحالي يعتمد على حفظ حالة الزر الخارجي، 
            // سنتركه كما هو ليعمل مع نظامك الحالي)

            adhkarListContainer.appendChild(itemDiv);
        });
    }
    if (adhkarModal) adhkarModal.classList.remove('hidden');
};

    // دالة مساعدة لتبديل حالة الإنجاز
    function toggleItemCompletion(element, type) {
        element.classList.toggle('completed');
        updateAdhkarProgress(type);
    }

    function updateAdhkarProgress(type) {
        if (!adhkarListContainer) return;
        const total = adhkarListContainer.children.length;
        const completed = adhkarListContainer.querySelectorAll('.completed').length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;

        const bar = document.getElementById(`progress-${type}`);
        if (bar) bar.style.width = `${percentage}%`;

        const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
        if (btn) {
            if (percentage === 100) btn.classList.add('completed');
            else btn.classList.remove('completed');
        }
        saveData();
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => adhkarModal.classList.add('hidden'));
    if (completeAdhkarBtn) completeAdhkarBtn.addEventListener('click', () => {
        adhkarListContainer.querySelectorAll('.adhkar-item').forEach(item => item.classList.add('completed'));
        updateAdhkarProgress(currentAdhkarType);
        setTimeout(() => adhkarModal.classList.add('hidden'), 300);
    });
    window.addEventListener('click', (e) => { if (e.target === adhkarModal) adhkarModal.classList.add('hidden'); });

    // 5. Extra Worship (Rukn Al-Ibadat)
    if (addWorshipBtn) addWorshipBtn.addEventListener('click', () => addWorshipModal.classList.remove('hidden'));
    if (closeWorshipModalBtn) closeWorshipModalBtn.addEventListener('click', () => addWorshipModal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === addWorshipModal) addWorshipModal.classList.add('hidden'); });

    // داخل الحدث saveWorshipBtn.addEventListener...
    if (saveWorshipBtn) {
        saveWorshipBtn.addEventListener('click', () => {
            const name = worshipNameInput.value.trim();
            const time = worshipTimeInput.value.trim();
            const points = parseInt(worshipPointsInput.value);

            if (name && time) {
                const id = Date.now().toString();
                
                // إضافة للمتغير العام
                if (!globalHabits.generalIbadat) globalHabits.generalIbadat = [];
                globalHabits.generalIbadat.push({
                    id: id,
                    name: name,
                    time: time,
                    points: points
                });

                saveGlobalHabits();
                renderGeneralIbadatBox(name, time, points, id);

                worshipNameInput.value = '';
                worshipTimeInput.value = '';
                worshipPointsInput.value = '1';
                addWorshipModal.classList.add('hidden');
            } else {
                alert('الرجاء إدخال اسم العبادة ووقت التنفيذ');
            }
        });
    }

    // دالة مساعدة لرسم عبادات الركن
    function renderGeneralIbadatBox(name, time, points, id) {
        const box = document.createElement('div');
        box.className = 'ibada-box';
        box.setAttribute('data-habit-id', id);
        box.setAttribute('data-points', points);

        box.innerHTML = `
            <button class="delete-ibada-btn">&times;</button>
            <h3 class="ibada-title">${name} (${points} نقاط)</h3>
            <span class="ibada-time">${time}</span>
        `;

        box.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-ibada-btn')) return;
            box.classList.toggle('done');
            saveIbadatData(); // حفظ حالة اليوم
        });

        box.querySelector('.delete-ibada-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('هل أنت متأكد من حذف هذه العبادة نهائياً؟')) {
                globalHabits.generalIbadat = globalHabits.generalIbadat.filter(h => h.id !== id);
                saveGlobalHabits();
                box.remove();
                saveIbadatData();
            }
        });

        ibadatGrid.insertBefore(box, addWorshipBtn);
    }

    function createNewWorshipBox(name, time, isDone = false, points = 1) {
        const box = document.createElement('div');
        box.className = 'ibada-box';
        box.setAttribute('data-points', points);
        if (isDone) box.classList.add('done');

        box.innerHTML = `
            <button class="delete-ibada-btn">&times;</button>
            <h3 class="ibada-title">${name} (${points} نقاط)</h3>
            <span class="ibada-time">${time}</span>
        `;

        box.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-ibada-btn')) return;
            box.classList.toggle('done');
            saveIbadatData();
        });

        box.querySelector('.delete-ibada-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('هل أنت متأكد من حذف هذه العبادة؟')) {
                box.remove();
                saveIbadatData();
            }
        });

        ibadatGrid.insertBefore(box, addWorshipBtn);
    }

    // 6. Prayer Extras Logic
    document.querySelectorAll('.add-prayer-extra-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedPrayer = btn.dataset.prayer;
            openExtraPrayerModal(currentSelectedPrayer);
        });
    });

    if (closeExtraModalBtn) closeExtraModalBtn.addEventListener('click', () => extraPrayerModal.classList.add('hidden'));

    function openExtraPrayerModal(prayer) {
        extraWorshipList.innerHTML = '';
        const extras = PRAYER_EXTRAS[prayer] || [];
        const prayerCard = document.getElementById(`${prayer}-card`);
        const existingExtras = Array.from(prayerCard.querySelectorAll('.extra-worship-box .task-btn')).map(btn => btn.textContent.trim());

        extras.forEach(extra => {
            if (existingExtras.includes(extra.name)) return;
            const item = document.createElement('div');
            item.className = 'adhkar-item';
            item.innerHTML = `
                <span>${extra.name} (${extra.points} نقاط)</span>
                <button class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;">إضافة</button>
            `;
            item.querySelector('button').addEventListener('click', () => {
                addExtraToPrayer(prayer, extra);
                extraPrayerModal.classList.add('hidden');
            });
            extraWorshipList.appendChild(item);
        });
        extraPrayerModal.classList.remove('hidden');
    }

    function addExtraToPrayer(prayer, extra) {
        // إنشاء ID فريد
        const id = Date.now().toString(); 
        
        // إضافة للمتغير العام
        if (!globalHabits.prayerExtras) globalHabits.prayerExtras = [];
        globalHabits.prayerExtras.push({
            id: id,
            prayer: prayer,
            name: extra.name,
            points: extra.points
        });

        saveGlobalHabits(); // حفظ دائم
        renderExtraPrayerBox(prayer, extra.name, extra.points, id); // رسم
        updateGlobalScore();
    }

    // دالة مساعدة للرسم فقط (مفصولة عن الحفظ)
    function renderExtraPrayerBox(prayer, name, points, id) {
        const prayerCard = document.getElementById(`${prayer}-card`);
        if(!prayerCard) return;
        
        const grid = prayerCard.querySelector('.prayer-content-grid');
        const box = document.createElement('div');
        box.className = 'task-box extra-worship-box';
        box.setAttribute('data-habit-id', id); // نستخدم ID للربط
        box.setAttribute('data-points', points);
        
        box.innerHTML = `
            <h4 class="box-title">نافلة إضافية</h4>
            <button class="task-btn toggle-btn" data-points="${points}">${name}</button>
            <button class="delete-extra-btn">&times;</button>
        `;

        const btn = box.querySelector('.task-btn');
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            box.classList.toggle('done', btn.classList.contains('active'));
            saveData(); // حفظ حالة الإنجاز لليوم الحالي
            saveExtras(); 
            updateGlobalScore();
        });

        box.querySelector('.delete-extra-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('حذف هذه النافلة نهائياً من كل الأيام؟')) {
                // حذف من المتغير العام
                globalHabits.prayerExtras = globalHabits.prayerExtras.filter(h => h.id !== id);
                saveGlobalHabits();
                box.remove();
                updateGlobalScore();
            }
        });

        const addBtn = grid.querySelector('.add-prayer-extra-btn');
        grid.insertBefore(box, addBtn);
    }

    // =========================================
    //  نظام الإشعارات والتنبيهات الذكي
    // =========================================

    const notificationIds = {
        morning: 1001,
        evening: 1002,
        wird: 1003,
        tomorrow: 1004,
        prayerBase: 1100
    };

    // 1. تعريف متغيرات الإعدادات الافتراضية
    let notificationSettings = {
        enabled: false,
        morningTime: '06:00',
        eveningTime: '17:00',
        wirdTime: '21:00'
    };

    async function requestNotificationPermission() {
        if (isNativePlatform()) {
            const localNotifications = getLocalNotifications();
            if (!localNotifications) return false;
            const result = await localNotifications.requestPermissions();
            return result && result.display === 'granted';
        }

        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    function parseTimeToParts(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours, minutes };
    }

    async function scheduleDailyNotifications() {
        if (!isNativePlatform() || !notificationSettings.enabled) return;
        const localNotifications = getLocalNotifications();
        if (!localNotifications) return;

        const morning = parseTimeToParts(notificationSettings.morningTime);
        const evening = parseTimeToParts(notificationSettings.eveningTime);
        const wird = parseTimeToParts(notificationSettings.wirdTime);

        try {
            await localNotifications.cancel({
                notifications: [
                    { id: notificationIds.morning },
                    { id: notificationIds.evening },
                    { id: notificationIds.wird },
                    { id: notificationIds.tomorrow }
                ]
            });
        } catch (err) {
            console.warn('Notification cancel error:', err);
        }

        await localNotifications.schedule({
            notifications: [
                {
                    id: notificationIds.morning,
                    title: 'أذكار الصباح',
                    body: 'بداية يوم مبارك بذكر الله.',
                    schedule: { on: { hour: morning.hours, minute: morning.minutes }, repeats: true }
                },
                {
                    id: notificationIds.evening,
                    title: 'أذكار المساء',
                    body: 'حصّن نفسك قبل الغروب.',
                    schedule: { on: { hour: evening.hours, minute: evening.minutes }, repeats: true }
                },
                {
                    id: notificationIds.wird,
                    title: 'الورد القرآني',
                    body: 'لا تهجر القرآن، ولو صفحة واحدة.',
                    schedule: { on: { hour: wird.hours, minute: wird.minutes }, repeats: true }
                },
                {
                    id: notificationIds.tomorrow,
                    title: 'تذكير عبادات الغد',
                    body: 'افتح التطبيق لمراجعة عبادات الغد.',
                    schedule: { on: { hour: 21, minute: 0 }, repeats: true }
                }
            ]
        });
    }

    async function schedulePrayerNotifications() {
        if (!isNativePlatform() || !notificationSettings.enabled || !prayerTimesData) return;
        const localNotifications = getLocalNotifications();
        if (!localNotifications) return;

        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNamesAr = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };

        const notifications = [];
        const now = new Date();

        prayers.forEach((prayer, index) => {
            const timeStr = prayerTimesData[prayer];
            if (!timeStr) return;
            const prayerTime = parseTime(timeStr);
            const reminderTime = new Date(prayerTime.getTime() - 15 * 60000);
            if (reminderTime <= now) return;

            notifications.push({
                id: notificationIds.prayerBase + index,
                title: 'اقتربت الصلاة',
                body: `باقي 15 دقيقة على صلاة ${prayerNamesAr[prayer]}، استعد للوضوء.`,
                schedule: { at: reminderTime }
            });
        });

        if (!notifications.length) return;

        try {
            await localNotifications.cancel({
                notifications: prayers.map((_, index) => ({ id: notificationIds.prayerBase + index }))
            });
        } catch (err) {
            console.warn('Prayer notification cancel error:', err);
        }

        await localNotifications.schedule({ notifications });
    }

    async function refreshNotificationSchedules() {
        if (!notificationSettings.enabled) return;
        await scheduleDailyNotifications();
        await schedulePrayerNotifications();
    }

    // 2. زر طلب الإذن وتفعيله من المودال
    const enableNotifyBtn = document.getElementById('enable-notify-btn');
    if (enableNotifyBtn) {
        enableNotifyBtn.addEventListener('click', () => {
            requestNotificationPermission().then((granted) => {
                if (granted) {
                    enableNotifyBtn.textContent = "تم التفعيل ✓";
                    enableNotifyBtn.style.backgroundColor = "#22c55e";
                    enableNotifyBtn.disabled = true;
                    notificationSettings.enabled = true;
                    sendNotification("محاسبة النفس", "تم تفعيل التنبيهات بنجاح، سنذكرك بالخير دائماً.");
                    refreshNotificationSchedules();
                } else {
                    alert("يجب السماح بالإشعارات لتذكيرك.");
                }
            });
        });
    }


    // تحميل الإعدادات عند فتح الموقع
    const savedNotifSettings = localStorage.getItem('notification_settings');
    if (savedNotifSettings) {
        notificationSettings = JSON.parse(savedNotifSettings);
        // تحديث الحقول في المودال
        document.getElementById('setup-morning-time').value = notificationSettings.morningTime;
        document.getElementById('setup-evening-time').value = notificationSettings.eveningTime;
        document.getElementById('setup-wird-time').value = notificationSettings.wirdTime;
    }
    refreshNotificationSchedules();

    // 4. الدالة الرئيسية: المراقب الدوري (يعمل كل دقيقة)
    setInterval(() => {
        if (!notificationSettings.enabled) return;
        if (!isNativePlatform() && Notification.permission !== "granted") return;

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        // أ) تنبيهات الأذكار والورد (حسب اختيار المستخدم)
        if (currentTime === notificationSettings.morningTime) {
            sendNotification("أذكار الصباح", "بداية يوم مبارك بذكر الله.");
        }
        if (currentTime === notificationSettings.eveningTime) {
            sendNotification("أذكار المساء", "حصّن نفسك قبل الغروب.");
        }
        if (currentTime === notificationSettings.wirdTime) {
            sendNotification("الورد القرآني", "لا تهجر القرآن، ولو صفحة واحدة.");
        }

        // ب) تنبيهات عبادات الغد (نثبتها مثلاً الساعة 9 مساءً)
        if (currentTime === "21:00") {
            checkTomorrowWorships();
        }

        // ج) تنبيه الصلوات (قبل الصلاة بـ 15 دقيقة)
        if (prayerTimesData) {
            checkPrayerReminders(now);
        }

    }, 60000); // يفحص كل 60 ثانية

    // دالة إرسال الإشعار
    function sendNotification(title, body) {
        if (isNativePlatform()) {
            const localNotifications = getLocalNotifications();
            if (!localNotifications) return;
            localNotifications.schedule({
                notifications: [
                    {
                        id: Math.floor(Date.now() % 1000000),
                        title,
                        body,
                        schedule: { at: new Date(Date.now() + 1000) }
                    }
                ]
            }).catch((err) => console.warn('Notification schedule error:', err));
            return;
        }

        if (Notification.permission !== 'granted') return;
        new Notification(title, {
            body: body,
            icon: 'logo.png',
            dir: 'rtl'
        });
    }

    // منطق فحص عبادات الغد
    function checkTomorrowWorships() {
        // نستخدم مصفوفة sunnahEvents الموجودة في كودك السابق
        // نحتاج لمعرفة التاريخ الهجري لغد
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowHijri = kuwaitiCalendar(tomorrow); 
        
        // البحث في مصفوفة الأحداث
        const event = sunnahEvents.find(e => e.type === 'hijri' && e.day == tomorrowHijri.day);
        
        if (event && event.notifyBefore) {
            sendNotification("تذكير بعبادة غداً", event.notifyMsg);
        }
        
        // فحص يومي الإثنين والخميس
        const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
        if (dayName === 'Monday' || dayName === 'Thursday') {
            sendNotification("صيام غداً", `غداً يوم ${dayName === 'Monday' ? 'الإثنين' : 'الخميس'}، هل نويت الصيام؟`);
        }
    }

    // منطق فحص الصلوات (الأكثر تعقيداً)
    function checkPrayerReminders(now) {
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const prayerNamesAr = {'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء'};
        
        prayers.forEach((prayer, index) => {
            if (!prayerTimesData[prayer]) return;

            const timeStr = prayerTimesData[prayer];
            const pTime = parseTime(timeStr); // دالة موجودة في كودك السابق
            
            // حساب الوقت قبل 15 دقيقة
            const reminderTime = new Date(pTime.getTime() - 15 * 60000);

            // هل الوقت الآن هو وقت التنبيه؟
            if (now.getHours() === reminderTime.getHours() && now.getMinutes() === reminderTime.getMinutes()) {
                
                // هنا الجزء الذكي: هل صليت الصلاة السابقة؟
                if (index > 0) {
                    const prevPrayer = prayers[index - 1].toLowerCase(); // مثلاً dhuhr
                    
                    // البحث عن الزر الخاص بالصلاة السابقة في الصفحة للتحقق من الـ class
                    // نفترض أن أزرار الصلاة لها data-prayer="dhuhr" أو IDs معروفة
                    // حسب كودك السابق، الأزرار داخل كروت. سنبحث عن الكارد ثم الزر النشط
                    
                    const prevCard = document.getElementById(`${prevPrayer}-card`);
                    let isDone = false;
                    
                    if (prevCard) {
                        // هل يوجد أي زر "active" داخل كارد الصلاة السابقة؟
                        // (سواء في المسجد أو في البيت)
                        const activeBtn = prevCard.querySelector('.prayer-btn.active');
                        if (activeBtn) isDone = true;
                    }

                    if (!isDone) {
                        sendNotification(
                            "تنبيه هام!", 
                            `باقي 15 دقيقة على ${prayerNamesAr[prayer]}، ولم تسجل أداء صلاة ${prayerNamesAr[prayers[index-1]]} بعد!`
                        );
                    } else {
                        // لو صلى، ممكن نبعتله تذكير عادي بالاستعداد للصلاة القادمة
                        sendNotification(
                            "اقتربت الصلاة", 
                            `باقي 15 دقيقة على صلاة ${prayerNamesAr[prayer]}، استعد للوضوء.`
                        );
                    }
                }
            }
        });
    }

    // --- Warning Section Logic ---

    const warningModal = document.getElementById('warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-modal');
    const warningTitle = document.getElementById('warning-modal-title');
    const warningQuran = document.getElementById('warning-quran');
    const warningHadith = document.getElementById('warning-hadith');


    // =========================================
//  بيانات المهلكات (التعريفات، الأمثلة اليومية، القصص)
// =========================================
const warningsData = {
    'lying': {
        title: 'الكذب',
        def: 'هو الإخبار بخلاف الواقع، سواء كان جاداً أو مازحاً. وهو من صفات المنافقين التي تهدم الثقة وتسقط المروءة.',
        quran: 'إِنَّمَا يَفْتَرِي الْكَذِبَ الَّذِينَ لَا يُؤْمِنُونَ بِآيَاتِ اللَّهِ ۖ وَأُولَٰئِكَ هُمُ الْكَاذِبُونَ',
        hadith: 'قال ﷺ: "وإياكم والكذب، فإن الكذب يهدي إلى الفجور، وإن الفجور يهدي إلى النار"',
        dailyExamples: [
            "أن تقول 'أنا في الطريق' وأنت لم تخرج من البيت بعد.",
            "المبالغة في وصف حدث بسيط لإضحاك الناس (كذب المزاح).",
            "نقل الأخبار من السوشيال ميديا دون التثبت من صحتها.",
            "الكذب على الأطفال بحجة إسكاتهم (يُكتب كذبة).",
            "شهادة الزور أو التوقيع مكان زميل في العمل."
        ],
        stories: [
            "قصة كعب بن مالك: حين تخلف عن غزوة تبوك، صدق الله ورسوله ولم يختلق عذراً كاذباً كما فعل المنافقون، فكان صدقه سبباً في نجاته وتوبة الله عليه بعد مقاطعة دامت 50 ليلة.",
            "قصة المرأة التي قالت لابنها 'تعال أعطك': سألها النبي ﷺ 'ما أردت أن تعطيه؟' قالت: تمراً. فقال: 'أما إنك لو لم تعطه شيئاً لكتبت عليك كذبة'."
        ]
    },
    'backbiting': {
        title: 'الغيبة',
        def: 'ذكرك أخاك بما يكره في غيبته، وإن كان فيه ما تقول. وهي تأكل الحسنات كما تأكل النار الحطب.',
        quran: 'وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ',
        hadith: 'قيل: يا رسول الله، أفرأيت إن كان في أخي ما أقول؟ قال: "إن كان فيه ما تقول فقد اغتبته، وإن لم يكن فيه فقد بهته"',
        dailyExamples: [
            "الحديث عن ملابس أو شكل شخص ما بسخرية مع الأصدقاء.",
            "تقليد طريقة كلام شخص ما للضحك عليه.",
            "الشكوى من 'مديرك' أو 'زميلك' بذكر عيوبهم الشخصية لا المهنية.",
            "قول 'فلان طيب بس مشكلته إنه...' وذكر عيب يكرهه.",
            "الهمز واللمز بالحركات عند مرور شخص معين."
        ],
        stories: [
            "مر النبي ﷺ بقبرين يعذبان، وكان أحدهما يمشي بالنميمة (وهي فرع من آفات اللسان)، وفي حادثة أخرى مر برجلين يغتابان رجلاً، فلما مروا بجيفة حمار ميت قال لهما: 'كلا من جيفة هذا'، فقالا: يا رسول الله من يأكل هذا؟ قال: 'فما نلتما من عرض أخيكما آنفاً أشد من أكل منه'.",
            "قالت عائشة رضي الله عنها للنبي ﷺ عن صفية: 'حسبك من صفية كذا وكذا' (تعني أنها قصيرة)، فقال لها: 'لقد قلت كلمة لو مزجت بماء البحر لمزجته'."
        ]
    },
    'gazing': {
        title: 'إطلاق البصر',
        def: 'النظر إلى ما حرم الله، سواء كان مباشراً أو عبر الشاشات. وهو سهم مسموم يفسد القلب ويضعف الإيمان.',
        quran: 'قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ',
        hadith: 'قال ﷺ لعلي: "يا علي لا تتبع النظرة النظرة، فإن لك الأولى وليست لك الآخرة"',
        dailyExamples: [
            "التحديق في النساء/الرجال في الشوارع أو المواصلات.",
            "متابعة حسابات على تيك توك أو انستجرام تعرض محتوى غير لائق.",
            "مشاهدة الإعلانات أو المشاهد التي تحتوي على عري في الأفلام.",
            "تتبع عورات الناس وصورهم الشخصية على الإنترنت.",
            "إدامة النظر في 'التريندات' التي تعتمد على الإثارة."
        ],
        stories: [
            "قصة جرير بن عبد الله: سألت رسول الله ﷺ عن نظر الفجأة؟ فأمرني أن أصرف بصري.",
            "دخل رجل على عثمان بن عفان رضي الله عنه، وكان الرجل قد نظر لامرأة في الطريق، فقال له عثمان: 'يدخل أحدكم وعلي عينيه أثر الزنا!' فقال الرجل: أوحيٌ بعد رسول الله؟ قال عثمان: 'لا، ولكن فراسة صادقة'."
        ]
    },
    'cursing': {
        title: 'السب واللعن',
        def: 'التلفظ بالكلام الفاحش، أو الطعن في الأنساب، أو لعن الأشخاص والدواب. ليس المؤمن بالطعان ولا اللعان.',
        quran: 'وَقُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ ۚ إِنَّ الشَّيْطَانَ يَنزَغُ بَيْنَهُمْ',
        hadith: 'قال ﷺ: "ليس المؤمن بالطعان، ولا اللعان، ولا الفاحش، ولا البذيء"',
        dailyExamples: [
            "شتم السائقين أو السيارات في الزحام.",
            "استخدام ألفاظ بذيئة 'على سبيل المزاح' مع الأصدقاء (تعتبر فاحشاً).",
            "لعن 'اليوم' أو 'الساعة' أو 'الظروف' عند الغضب.",
            "التعليق بتعليقات مسيئة وشتائم في السوشيال ميديا.",
            "مناداة الأصدقاء بأسماء قبيحة أو مهينة."
        ],
        stories: [
            "شتم رجلٌ أبا بكر الصديق رضي الله عنه في مجلس النبي ﷺ، فصمت أبو بكر، ثم شتمه الثانية فصمت، ثم شتمه الثالثة فانتصر أبو بكر لنفسه (رد عليه)، فقام النبي ﷺ وترك المجلس. لما سأله أبو بكر قال: 'نزل ملك من السماء يكذب بما قال لك، فلما انتصرت وقع الشيطان، فلم أكن لأجلس إذ وقع الشيطان'.",
            "لعنت امرأة ناقة لها وهي تسير مع النبي ﷺ، فقال النبي: 'خذوا ما عليها ودعوها فإنها ملعونة' (أي لا تصاحبنا ناقة ملعونة في طريقنا)."
        ]
    }
};

// =========================================
//  دوال التحكم في المودال المطور
// =========================================

// دالة لجلب مثال يومي ثابت (يعتمد على تاريخ اليوم)
function getDailyExample(examplesArray) {
    if (!examplesArray || examplesArray.length === 0) return "";
    
    // نستخدم تاريخ اليوم كرقم لضمان ثبات المثال طول اليوم
    const today = new Date();
    // معادلة بسيطة: (يوم + شهر + سنة) % عدد الأمثلة
    const dateCode = today.getDate() + today.getMonth() + today.getFullYear(); 
    const index = dateCode % examplesArray.length;
    
    return examplesArray[index];
}

// دالة فتح المودال وتعبئة البيانات
// دالة فتح المودال وتعبئة البيانات (مع ميزة تقليب القصص)
window.openWarning = function(type) {
    const data = warningsData[type];
    if (!data) return;

    // 1. تعبئة العناوين والنصوص الأساسية
    document.getElementById('warning-modal-title').textContent = data.title;
    document.getElementById('warning-def').textContent = data.def;
    document.getElementById('warning-quran').textContent = data.quran;
    document.getElementById('warning-hadith').textContent = data.hadith;
    
    // 2. تعبئة المثال اليومي (كما هو)
    const dailyEx = getDailyExample(data.dailyExamples);
    document.getElementById('warning-daily-example').textContent = `"${dailyEx}"`;

    // 3. إعداد قسم القصة (Logic الجديد)
    const storyContent = document.getElementById('warning-story-content');
    const storyText = document.getElementById('story-text');
    const btnStory = document.getElementById('btn-show-story');

    // إعادة تعيين الحالة عند فتح المودال
    storyContent.classList.add('hidden'); 
    storyText.textContent = "";
    storyText.style.opacity = "1"; // تأكد أن النص ظاهر
    btnStory.innerHTML = '<i class="fa-solid fa-book-open"></i> اقرأ قصة من السيرة'; // إعادة النص الأصلي للزر

    // متغير لتتبع القصة الحالية (يبدأ من 0)
    let currentStoryIndex = 0;

    // برمجة الزر للتقليب
    btnStory.onclick = function() {
        // الحالة الأولى: لو القصة مخفية، أظهرها واعرض القصة رقم 0
        if (storyContent.classList.contains('hidden')) {
            storyContent.classList.remove('hidden');
            storyText.textContent = data.stories[currentStoryIndex];
            
            // تغيير نص الزر ليشجع على القراءة المزيد
            btnStory.innerHTML = '<i class="fa-solid fa-rotate"></i> قصة أخرى';
        } 
        // الحالة الثانية: القصة معروضة، اقلب على اللي بعدها
        else {
            // زود العداد
            currentStoryIndex++;
            
            // لو العداد عدى عدد القصص، ارجع للأول (Loop)
            if (currentStoryIndex >= data.stories.length) {
                currentStoryIndex = 0;
            }

            // تأثير اختفاء وظهور بسيط (Fade Out/In)
            storyText.style.opacity = "0"; // اخفي النص القديم
            
            setTimeout(() => {
                storyText.textContent = data.stories[currentStoryIndex]; // غير النص
                storyText.style.opacity = "1"; // اظهر النص الجديد
            }, 300); // انتظر 0.3 ثانية (نفس مدة الـ transition في CSS)
        }
    };

    // إظهار المودال
    document.getElementById('warning-modal').classList.remove('hidden');
};

// إغلاق المودال
document.getElementById('close-warning-modal')?.addEventListener('click', () => {
    document.getElementById('warning-modal').classList.add('hidden');
});

    if (closeWarningBtn) {
        closeWarningBtn.addEventListener('click', () => {
            warningModal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === warningModal) {
            warningModal.classList.add('hidden');
        }
    });


    // =========================================
//  نظام التحليلات والرسوم البيانية (Analytics)
// =========================================

let lineChartInstance = null;
let radarChartInstance = null;

// دالة التمرير للقسم
function scrollToAnalytics() {
    const section = document.getElementById('analytics-section');
    if(section) {
        section.scrollIntoView({ behavior: 'smooth' });
        updateCharts('week'); // تشغيل الافتراضي (أسبوعي)
    }
}

// الدالة الرئيسية لتحديث البيانات
// --- تحديث الشارتات والبيانات ---
function updateCharts(period) {
    // 1. تحديث الأزرار
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.filter-btn[onclick="updateCharts('${period}')"]`);
    if(activeBtn) activeBtn.classList.add('active');

    // 2. تحديد النطاق الزمني
    const daysCount = period === 'week' ? 7 : 30;
    
    // 3. جلب البيانات
    const historyData = getHistoryData(daysCount);
    
    // 4. تحديث "نسبة الإنجاز" العلوية لتعكس متوسط الفترة وليس اليوم
    if(document.getElementById('period-score')) {
        // نستخدم المتوسط المحسوب من دالة getHistoryData
        document.getElementById('period-score').textContent = historyData.averageScore + '%';
        
        // تلوين النسبة
        const scoreEl = document.getElementById('period-score');
        if(historyData.averageScore >= 80) scoreEl.style.color = '#10b981';
        else if(historyData.averageScore >= 50) scoreEl.style.color = '#eab308';
        else scoreEl.style.color = '#ef4444';
    }
    
    if(document.getElementById('best-day'))
        document.getElementById('best-day').textContent = historyData.bestDay;
    
    if(document.getElementById('perfect-days'))
        document.getElementById('perfect-days').textContent = historyData.perfectDays;

    // 5. رسم الشارتات
    renderLineChart(historyData.labels, historyData.scores);
    renderRadarChart(historyData.radarData);
    updateHabitsLists(historyData.radarData);

    // 6. رسم جدول التفاصيل اليومي (مع الترتيب الجديد)
    renderAnalyticsTable(historyData.dailyDetails);

    // 7. بناء جداول الأرشيف (جديد)
    buildArchives();
}

// --- تحديث قوائم القوة والضعف (3 عناصر) ---
function updateHabitsLists(stats) {
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    
    const topList = document.getElementById('top-habits-list');
    const lowList = document.getElementById('low-habits-list');
    
    if (topList) topList.innerHTML = '';
    if (lowList) lowList.innerHTML = '';

    const validStats = sorted.filter(item => !isNaN(item[1]));

    if (validStats.length === 0) {
        if(topList) topList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        if(lowList) lowList.innerHTML = '<li>لا توجد بيانات كافية</li>';
        return;
    }

    // تعديل: عرض 3 عناصر بدلاً من 2
    validStats.slice(0, 3).forEach(([name, score]) => {
        if (topList) topList.innerHTML += `<li>${name} <span style="float:left; color:#10b981; font-weight:bold">${score}%</span></li>`;
    });

    // العادات المقصر فيها (أقل 3)
    const weak = validStats.filter(i => i[1] < 100).reverse().slice(0, 3);
    weak.forEach(([name, score]) => {
        if (lowList) lowList.innerHTML += `<li>${name} <span style="float:left; color:#ef4444; font-weight:bold">${score}%</span></li>`;
    });
}

// دالة جلب البيانات من الذاكرة وتحليلها
function getHistoryData(days) {
    let labels = [];
    let scores = [];
    let totalScoreSum = 0;
    let daysWithData = 0;
    let perfectDays = 0;
    let maxScore = -1;
    let bestDayName = '-';

    // مصفوفة جديدة لتخزين تفاصيل كل يوم للجدول
    let dailyDetails = []; 

    let habitsTotals = {
        'الصلوات': [], 'القرآن': [], 'الأذكار': [], 'السنن': [], 'قيام الليل': []
    };

    // التكرار من الماضي لليوم
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const key = getStorageKey(d); 
        const savedJSON = localStorage.getItem(key);
        
        const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
        const dayNum = d.toLocaleDateString('ar-EG', { day: 'numeric' });
        const fullDate = `${dayName} ${dayNum}`;
        labels.push(fullDate);

        // كائن لتخزين تفاصيل اليوم الحالي
        let dayStats = {
            date: fullDate,
            total: 0,
            cats: { 'الصلوات': '-', 'القرآن': '-', 'الأذكار': '-', 'السنن': '-', 'قيام الليل': '-' }
        };

        if (savedJSON) {
            const data = JSON.parse(savedJSON);
            
            if (data.stats) {
                const score = data.stats.totalScore || 0;
                scores.push(score);
                dayStats.total = score; // تخزين المجموع للجدول

                totalScoreSum += score;
                daysWithData++;

                if (score > maxScore) { maxScore = score; bestDayName = dayName; }
                if (score >= 95) perfectDays++;

                // تفاصيل التصنيفات
                const bd = data.stats.breakdown;
                if (bd) {
                    for (const [cat, val] of Object.entries(bd)) {
                        // val = [achieved, total]
                        const perc = val[1] === 0 ? 0 : Math.round((val[0] / val[1]) * 100);
                        if (habitsTotals[cat]) habitsTotals[cat].push(perc);
                        
                        // تخزين النسبة للجدول
                        dayStats.cats[cat] = perc + '%';
                    }
                }
            } else {
                scores.push(0);
            }
        } else {
            scores.push(0);
        }
        // إضافة اليوم لقائمة التفاصيل
        dailyDetails.push(dayStats);
    }

    // حساب متوسط الرادار
    let radarAverages = {};
    for (const [cat, arr] of Object.entries(habitsTotals)) {
        const sum = arr.reduce((a, b) => a + b, 0);
        const count = arr.length || 1;
        radarAverages[cat] = arr.length > 0 ? Math.round(sum / count) : 0;
    }

    const avg = daysWithData > 0 ? Math.round(totalScoreSum / daysWithData) : 0;

    return {
        labels: labels,
        scores: scores,
        averageScore: avg,
        bestDay: bestDayName,
        perfectDays: perfectDays,
        radarData: radarAverages,
        dailyDetails: dailyDetails // <-- ده الجزء الجديد المهم
    };
}

// --- دالة رسم جدول التفاصيل ---
function renderAnalyticsTable(details) {
    const tbody = document.getElementById('analytics-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // ترتيب: الأحدث أولاً
    // (details تأتي جاهزة من getHistoryData، لكن نتأكد من الترتيب)
    // ملاحظة: getHistoryData ترجع 7 أو 30 يوم، هنا نريد الجدول يعرض كل شيء لو في التبويب اليومي
    // لذا سنستخدم getAllHistoryData بدلاً من details القادمة من الشارت إذا أردنا عرض كل الأرشيف
    
    // سنعيد جلب كل البيانات لضمان شمولية الجدول في التبويب الخاص به
    const allData = getAllHistoryData().reverse(); // الأحدث فوق

    if (allData.length === 0) {
         tbody.innerHTML = '<tr><td colspan="8">لا توجد سجلات</td></tr>';
         return;
    }

    allData.forEach(day => {
        // day.breakdown قد تكون undefined في البيانات القديمة
        const cats = day.breakdown || {};
        const getPerc = (arr) => arr ? Math.round((arr[0]/arr[1])*100) + '%' : '-';
        
        // استخراج اسم اليوم
        const dayName = day.dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
        const dateStr = day.dateObj.toLocaleDateString('ar-EG'); // التاريخ فقط

        const row = document.createElement('tr');
        const totalColor = day.score >= 80 ? '#10b981' : day.score >= 50 ? '#eab308' : '#ef4444';

        row.innerHTML = `
            <td>${dateStr}</td>
            <td style="color:var(--text-secondary)">${dayName}</td>
            <td style="color: ${totalColor}; font-weight:bold">${day.score}%</td>
            <td>${getPerc(cats['الصلوات'])}</td>
            <td>${getPerc(cats['القرآن'])}</td>
            <td>${getPerc(cats['الأذكار'])}</td>
            <td>${getPerc(cats['السنن'])}</td>
            <td>${getPerc(cats['قيام الليل'])}</td>
        `;
        tbody.appendChild(row);
    });
}

// رسم الخط البياني (Line Chart)
// رسم الخط البياني (Line Chart) مع إصلاح الحجم
function renderLineChart(labels, data) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    // --- بداية الإصلاح: إنشاء حاوية مرنة للشارت ---
    // نتأكد إننا لم نقم بإضافة الحاوية من قبل
    if (!canvas.parentElement.classList.contains('chart-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('chart-wrapper');
        // نضع الحاوية مكان الكانفاس، ثم نضع الكانفاس داخلها
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }
    // -------------------------------------------

    if (lineChartInstance) lineChartInstance.destroy();

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#4f46e5';

    lineChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'نسبة الإنجاز',
                data: data,
                borderColor: accentColor,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: document.body.classList.contains('dark') ? '#fff' : accentColor,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // مهم: يسمح للشارت بملء الحاوية المرنة الجديدة
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7 // تقليل عدد التواريخ لمنع الزحام
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// رسم الرادار (Radar Chart) مع إصلاح الحجم
function renderRadarChart(stats) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;

    // --- بداية الإصلاح: إنشاء حاوية مرنة للشارت ---
    if (!canvas.parentElement.classList.contains('chart-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('chart-wrapper');
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }
    // -------------------------------------------

    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.keys(stats),
            datasets: [{
                label: 'مستوى الالتزام',
                data: Object.values(stats),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                pointBackgroundColor: '#10b981',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // مهم جداً
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                    pointLabels: {
                        font: { size: 12, family: 'Tajawal' },
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// تحديث القوائم النصية


// تفعيل زر تحميل التقرير
const dlAnalyticsBtn = document.getElementById('download-analytics-btn');
if (dlAnalyticsBtn) {
    dlAnalyticsBtn.addEventListener('click', () => {
        const element = document.getElementById('analytics-section');
        // نحتاج لتغيير حجم الشارت مؤقتاً ليظهر كاملاً في الـ PDF
        
        const opt = {
            margin: [0.5, 0.5],
            filename: `تقرير_أداء_${new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        const originalText = dlAnalyticsBtn.innerHTML;
        dlAnalyticsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المعالجة...';
        
        html2pdf().set(opt).from(element).save().then(() => {
            dlAnalyticsBtn.innerHTML = originalText;
        });
    });
}

// عند تحميل الصفحة، شغل الشارت
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط لضمان تحميل المكتبات
    setTimeout(() => {
        updateCharts('week');
    }, 1000);
});


    // --- إعدادات نظام البونص والسنن ---
const sunnahEvents = [
    // 1. الأيام البيض (صيام)
    {
        id: 'white_day_13',
        type: 'hijri',
        day: '13',
        title: 'صيام الأيام البيض (13)',
        desc: 'صيام اليوم الثالث عشر من الشهر الهجري. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً أول الأيام البيض، هل نويت الصيام؟',
        points: 5
    },
    {
        id: 'white_day_14',
        type: 'hijri',
        day: '14',
        title: 'صيام الأيام البيض (14)',
        desc: 'صيام اليوم الرابع عشر. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً منتصف الأيام البيض، ذكر فإن الذكرى تنفع المؤمنين.',
        points: 5
    },
    {
        id: 'white_day_15',
        type: 'hijri',
        day: '15',
        title: 'صيام الأيام البيض (15)',
        desc: 'صيام اليوم الخامس عشر. (5 نقاط)',
        notifyBefore: true,
        notifyMsg: 'غداً آخر الأيام البيض، لا تفوت الأجر.',
        points: 5
    },
    // 2. سنن أسبوعية (صيام الإثنين والخميس)
    {
        id: 'monday_fast',
        type: 'weekly',
        dayName: 'Monday', // كما يرجع من API
        title: 'صيام الإثنين',
        desc: 'تُعرض الأعمال يوم الإثنين، فاحرص أن يُعرض عملك وأنت صائم.',
        notifyBefore: true, // يظهر التنبيه يوم الأحد
        notifyMsg: 'غداً الإثنين، فرصة لرفع عملك وأنت صائم.',
        points: 5
    },
    {
        id: 'thursday_fast',
        type: 'weekly',
        dayName: 'Thursday',
        title: 'صيام الخميس',
        desc: 'تُعرض الأعمال يوم الخميس، صم لتنال الأجر.',
        notifyBefore: true, // يظهر التنبيه يوم الأربعاء
        notifyMsg: 'غداً الخميس، نية الصيام تجدد الإيمان.',
        points: 5
    },
    // 3. يوم الجمعة
    {
        id: 'friday_kahf',
        type: 'weekly',
        dayName: 'Friday',
        title: 'سنن الجمعة',
        desc: 'قراءة سورة الكهف، الصلاة على النبي، ساعة الاستجابة.',
        notifyBefore: true,
        notifyMsg: 'غداً الجمعة، جهز قلبك لسورة الكهف والصلاة على الحبيب.',
        points: 5
    }
];

// --- الدالة الرئيسية للتحكم (تُستدعى من initPrayerTimes) ---
function handleSunnahSystem(hijriData, gregorianData) {
    const hijriDay = hijriData.day; // رقم اليوم الهجري (مثلاً "13")
    const weekDay = gregorianData.weekday.en; // اسم اليوم (مثلاً "Monday")

    // 1. فحص بونص "اليوم" (لإظهار الكارت)
    const todayBonus = sunnahEvents.find(e => {
        if (e.type === 'hijri' && e.day === hijriDay) return true;
        if (e.type === 'weekly' && e.dayName === weekDay) return true;
        return false;
    });
    
    // رسم كارت البونص
    renderBonusSection(todayBonus);

    // 2. فحص تنبيه "الغد" (لإظهار الجرس)
    // نحسب ما هو الغد؟
    // ملاحظة: للتبسيط سنعتمد على منطق اليوم التالي للأسبوع، واليوم التالي للهجري
    const nextHijriDay = (parseInt(hijriDay) + 1).toString();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = daysOfWeek.indexOf(weekDay);
    const nextDayName = daysOfWeek[(currentDayIndex + 1) % 7];

    const tomorrowNotification = sunnahEvents.find(e => {
        if (!e.notifyBefore) return false;
        if (e.type === 'hijri' && e.day === nextHijriDay) return true;
        if (e.type === 'weekly' && e.dayName === nextDayName) return true;
        return false;
    });

    // تشغيل التنبيه
    renderNotification(tomorrowNotification);
}

// --- رسم قسم البونص ---
function renderBonusSection(bonus) {
    const section = document.getElementById('bonus-section');
    if (!bonus) {
        if(section) section.classList.add('hidden');
        return;
    }

    if(section) {
        section.classList.remove('hidden');
        document.getElementById('bonus-title').textContent = bonus.title;
        document.getElementById('bonus-desc').textContent = bonus.desc;
        
        const btn = document.getElementById('bonus-action-btn');
        btn.setAttribute('data-points', bonus.points);
        btn.setAttribute('data-bonus-id', bonus.id);

        // التحقق من الحفظ السابق
        const key = getStorageKey(currentDate);
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        
        if (savedData.bonus && savedData.bonus.id === bonus.id && savedData.bonus.done) {
            btn.classList.add('active');
            btn.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${bonus.points}+)`;
        } else {
            btn.classList.remove('active');
            btn.innerHTML = `إتمام (${bonus.points} نقاط)`;
        }
    }
}

// --- تشغيل التنبيهات (الجرس) ---
function renderNotification(notif) {
    const notifBtn = document.getElementById('notification-btn');
    const badge = document.getElementById('notif-badge');
    const popupContent = document.getElementById('notif-content');

    if (notif) {
        notifBtn.classList.remove('hidden'); // إظهار الجرس
        badge.classList.remove('hidden');    // إظهار النقطة الحمراء
        popupContent.textContent = notif.notifyMsg;
    } else {
        badge.classList.add('hidden');
        popupContent.textContent = "لا توجد تنبيهات خاصة للغد.";
    }
}

    // --- دوال التحكم في الـ UI الخاص بالبونص والتنبيهات ---

    // 1. تفعيل زر البونص عند الضغط
    const bonusBtn = document.getElementById('bonus-action-btn');
    if (bonusBtn) {
        bonusBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                const pts = this.getAttribute('data-points');
                this.innerHTML = `<i class="fa-solid fa-check"></i> تمت (${pts}+)`;
            } else {
                const pts = this.getAttribute('data-points');
                this.innerHTML = `إتمام (${pts} نقاط)`;
            }
            saveData(); // حفظ البيانات وتحديث النقاط
        });
    }

    // 2. تفعيل فتح/غلق قائمة التنبيهات
    const notifBtn = document.getElementById('notification-btn');
    const notifPopup = document.getElementById('notification-popup');
    const closeNotif = document.getElementById('close-notif'); // تأكدنا من وجود زر الإغلاق

    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifPopup) notifPopup.classList.toggle('hidden');
            
            // إخفاء العلامة الحمراء عند الفتح
            const badge = document.getElementById('notif-badge');
            if (badge) badge.classList.add('hidden'); 
        });
    }

    if (closeNotif) {
        closeNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifPopup) notifPopup.classList.add('hidden');
        });
    }

    // إغلاق القائمة عند الضغط في الخارج
    window.addEventListener('click', (e) => {
        if (notifPopup && !notifPopup.classList.contains('hidden') && notifBtn && !notifBtn.contains(e.target)) {
            notifPopup.classList.add('hidden');
        }
    });

    // --- تحديث دالة renderNotification ---
    // (استبدل الدالة القديمة بهذه الدالة لتضمن ظهور الزر والرسالة الافتراضية)
    function renderNotification(notif) {
        const notifBtn = document.getElementById('notification-btn');
        const badge = document.getElementById('notif-badge');
        const popupContent = document.getElementById('notif-content');

        if (!notifBtn) return;

        // 1. إظهار الزر دائماً (تأكيد)
        notifBtn.classList.remove('hidden');

        if (notif) {
            // حالة وجود تنبيه
            if (badge) badge.classList.remove('hidden'); // إظهار النقطة الحمراء
            if (popupContent) popupContent.innerHTML = `<p style="color: var(--accent-color); font-weight:bold;">${notif.notifyMsg}</p>`;
        } else {
            // حالة عدم وجود تنبيه
            if (badge) badge.classList.add('hidden'); // إخفاء النقطة الحمراء
            if (popupContent) popupContent.innerHTML = '<p style="color: var(--text-secondary);">لا توجد عبادات موسمية خاصة غداً.</p>';
        }
    }

    // --- دالة تحميل التقارير المنفصلة ---
// =========================================
//  Advanced PDF Report Generation
// =========================================

async function downloadReport(period) {
    const originalBtnText = period === 'week' ? 'تحميل التقرير أسبوعي' : 'تحميل التقرير شهري';
    const btn = document.querySelector(`button[onclick="downloadReport('${period}')"]`);
    
    if(btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحضير...';

    const daysCount = period === 'week' ? 7 : 30;
    const historyData = getHistoryData(daysCount);
    
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysCount);
    const dateStr = `${startDate.toLocaleDateString('ar-EG')} - ${today.toLocaleDateString('ar-EG')}`;
    const periodTitle = period === 'week' ? 'التقرير الأسبوعي المفصل' : 'التقرير الشهري الشامل';

    // تعبئة البيانات الأساسية
    document.getElementById('pdf-period-text').textContent = `${periodTitle} | ${dateStr}`;
    document.getElementById('pdf-total-score').textContent = historyData.averageScore + '%';
    
    const scoreCircle = document.getElementById('pdf-total-score');
    scoreCircle.style.background = historyData.averageScore >= 80 ? '#10b981' : historyData.averageScore >= 50 ? '#eab308' : '#ef4444';

    document.getElementById('pdf-perfect-days').textContent = historyData.perfectDays;
    document.getElementById('pdf-best-day').textContent = historyData.bestDay;
    
    // نسب عامة
    const prayerAvg = historyData.radarData['الصلوات'] || 0;
    const quranAvg = historyData.radarData['القرآن'] || 0;
    document.getElementById('pdf-prayer-avg').textContent = prayerAvg + '%';
    document.getElementById('pdf-quran-avg').textContent = quranAvg + '%';
    document.getElementById('pdf-generated-date').textContent = `تاريخ الإصدار: ${new Date().toLocaleString('ar-EG')}`;

    // تحويل الشارتات لصور
    const lineCanvas = document.getElementById('progressChart');
    const radarCanvas = document.getElementById('distributionChart');
    if (lineCanvas) document.getElementById('pdf-chart-line').src = lineCanvas.toDataURL("image/png");
    if (radarCanvas) document.getElementById('pdf-chart-radar').src = radarCanvas.toDataURL("image/png");

    // === بناء الجدول التفصيلي (الجزء المهم) ===
    const tbody = document.getElementById('pdf-daily-rows');
    tbody.innerHTML = ''; 

    // تعديل هيدر الجدول (يجب أن يكون في HTML، لكن يمكننا تعديله هنا برمجياً لضمان التنسيق)
    const tableHead = document.querySelector('.pdf-table thead tr');
    if(tableHead) {
        tableHead.innerHTML = `
            <th width="15%">التاريخ</th>
            <th width="10%">اليوم</th>
            <th width="10%">النسبة</th>
            <th width="40%">تفاصيل العبادات</th>
            <th width="25%">ملاحظاتك</th>
        `;
    }

    for (let i = 0; i < daysCount; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = getStorageKey(d);
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        
        const dayDate = d.toLocaleDateString('ar-EG');
        const dayName = d.toLocaleDateString('ar-EG', { weekday: 'long' });
        const score = savedData.stats ? savedData.stats.totalScore : 0;
        
        // 1. جلب الملاحظات
        const note = savedData.note ? savedData.note : '<span style="color:#ccc">لا توجد ملاحظات</span>';

        // 2. بناء تفاصيل العبادات
        let detailsHTML = '<div style="display:flex; flex-wrap:wrap; gap:5px;">';
        
        if (savedData.stats && savedData.stats.breakdown) {
            const cats = savedData.stats.breakdown;
            // cats = { 'الصلوات': [المنجز, الكلي], 'القرآن': [المنجز, الكلي] ... }

            for (const [category, values] of Object.entries(cats)) {
                // values[0] = النقاط المحققة، values[1] = النقاط الكلية
                const achieved = values[0];
                const total = values[1];
                
                if (total > 0) {
                    const perc = Math.round((achieved / total) * 100);
                    let colorClass = 'missed'; // أحمر افتراضياً
                    if (perc === 100) colorClass = 'full'; // أخضر
                    else if (perc >= 50) colorClass = 'half'; // أصفر
                    
                    // تنسيق الـ HTML لكل عبادة
                    // مثال: الصلوات: 100%
                    detailsHTML += `
                        <span class="detail-tag ${colorClass}">
                            ${category}: ${perc}%
                        </span>
                    `;
                }
            }
            
            // إضافة البونص إذا وجد
            if (savedData.bonus && savedData.bonus.done) {
                detailsHTML += `<span class="detail-tag bonus">بونص (+${savedData.bonus.points})</span>`;
            }

        } else {
            detailsHTML += '<span style="color:#ccc; font-size:10px;">لا توجد بيانات</span>';
        }
        detailsHTML += '</div>';

        // لون النسبة العامة
        const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#eab308' : '#ef4444';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dayDate}</td>
            <td>${dayName}</td>
            <td style="font-weight:bold; color:${scoreColor}; font-size:14px;">${score}%</td>
            <td>${detailsHTML}</td>
            <td style="font-size:11px; color:#555; white-space: pre-wrap;">${note}</td>
        `;
        tbody.appendChild(tr);
    }

    // تجهيز الـ PDF
    const container = document.getElementById('report-template-container');
    const element = document.getElementById('pdf-content');
    container.style.opacity = '1'; 

    const opt = {
        margin: [0.3, 0.3],
        filename: `تقرير_${period}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("PDF Error:", err);
        alert("حدث خطأ أثناء التصدير.");
    } finally {
        container.style.opacity = '0';
        if(btn) btn.innerHTML = originalBtnText;
    }
}

// --- دوال بناء الأرشيف (أسابيع وشهور) ---

function buildArchives() {
    const allData = getAllHistoryData(); // دالة مساعدة لجلب كل شيء
    renderWeeklyArchive(allData);
    renderMonthlyArchive(allData);
}

// جلب كل البيانات من الذاكرة
function getAllHistoryData() {
    let history = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('mohasba_data_')) {
            const dateStr = key.replace('mohasba_data_', ''); // YYYY-M-D
            const rawData = JSON.parse(localStorage.getItem(key));
            
            if (rawData.stats) {
                // تحويل التاريخ لكائن Date صحيح
                const parts = dateStr.split('-');
                const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                
                history.push({
                    dateObj: dateObj,
                    dateStr: dateStr,
                    score: rawData.stats.totalScore || 0,
                    breakdown: rawData.stats.breakdown
                });
            }
        }
    }
    // ترتيب زمني من الأقدم للأحدث
    return history.sort((a, b) => a.dateObj - b.dateObj);
}

function renderWeeklyArchive(allData) {
    const tbody = document.getElementById('weekly-archive-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 1. تجميع البيانات حسب "مفتاح الجمعة"
    let weeksMap = {};

    allData.forEach(entry => {
        const fridayDate = getFridayStart(entry.dateObj);
        // مفتاح فريد للأسبوع (تاريخ الجمعة)
        const weekKey = `${fridayDate.getFullYear()}-${fridayDate.getMonth()}-${fridayDate.getDate()}`;

        if (!weeksMap[weekKey]) {
            weeksMap[weekKey] = {
                startDate: fridayDate,
                scores: [],
                details: []
            };
        }
        weeksMap[weekKey].scores.push(entry.score);
        weeksMap[weekKey].details.push(entry);
    });

    // 2. تحويل الماب لمصفوفة وترتيبها (الأحدث أولاً)
    const sortedWeeks = Object.values(weeksMap).sort((a, b) => b.startDate - a.startDate);

    // 3. الرسم
    if (sortedWeeks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">لا توجد بيانات مسجلة بعد</td></tr>';
        return;
    }

    sortedWeeks.forEach(weekData => {
        // حساب المتوسط الحقيقي لكل الأيام المسجلة في هذا الأسبوع
        const avg = Math.round(weekData.scores.reduce((a, b) => a + b, 0) / weekData.scores.length);
        
        // التواريخ (من الجمعة إلى الخميس)
        const endDate = new Date(weekData.startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const startStr = `${weekData.startDate.getDate()}/${weekData.startDate.getMonth()+1}`;
        const endStr = `${endDate.getDate()}/${endDate.getMonth()+1}`;
        
        // الاسم الجميل (الأسبوع الأول من ...)
        // نأخذ تاريخ الجمعة كمرجع للاسم
        const labelName = getWeekLabelName(weekData.startDate);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:bold; color:var(--text-primary)">${labelName}</td>
            <td style="font-size:0.9rem; color:var(--text-secondary)">${startStr} - ${endStr}</td>
            <td>
                <span style="font-weight:bold; color: ${avg>=80?'#10b981':avg>=50?'#eab308':'#ef4444'}">${avg}%</span>
            </td>
            <td>${avg>=90 ? 'ممتاز 🌟' : avg>=75 ? 'جيد جداً' : avg>=50 ? 'جيد' : 'ضعيف'}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderMonthlyArchive(allData) {
    const tbody = document.getElementById('monthly-archive-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // تجميع بالشهر
    let monthsMap = {};
    allData.forEach(entry => {
        const monthKey = `${entry.dateObj.getFullYear()}-${entry.dateObj.getMonth()}`;
        if (!monthsMap[monthKey]) {
            monthsMap[monthKey] = {
                dateObj: entry.dateObj, // نحفظ أي تاريخ من الشهر لاستخراج الاسم
                scores: []
            };
        }
        monthsMap[monthKey].scores.push(entry.score);
    });

    const sortedMonths = Object.values(monthsMap).sort((a, b) => b.dateObj - a.dateObj);

    if (sortedMonths.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">لا توجد بيانات مسجلة بعد</td></tr>';
        return;
    }

    sortedMonths.forEach(m => {
        const avg = Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length);
        const monthName = m.dateObj.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:bold">${monthName}</td>
            <td style="font-weight:bold; color: ${avg>=80?'#10b981':avg>=50?'#eab308':'#ef4444'}">${avg}%</td>
            <td>${avg>=90 ? 'ممتاز' : avg>=50 ? 'جيد' : 'ضعيف'}</td>
        `;
        tbody.appendChild(row);
    });
}

window.switchTab = function(tabName) {
    // 1. Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // نحتاج لتحديد الزر الذي تم ضغطه (يمكن تمريره أو البحث عنه)
    const clickedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabName));
    if(clickedBtn) clickedBtn.classList.add('active');

    // 2. Show Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // 3. Refresh data if needed (خاصة الجداول)
    if(tabName === 'weekly' || tabName === 'monthly' || tabName === 'daily') {
        buildArchives(); // إعادة بناء الجداول للتأكد من التحديث
    }
}

function getWeekLabelName(dateObj) {
    const day = dateObj.getDate();
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const month = monthNames[dateObj.getMonth()];
    
    // تقسيم تقريبي: 1-7 (أول)، 8-14 (ثاني)، 15-21 (ثالث)، 22+ (رابع)
    let weekNum = Math.ceil(day / 7);
    if (weekNum > 4) weekNum = 4; // ما زاد عن ذلك نضمه للرابع أو نسميه الأخير
    
    const ordinals = ["الأول", "الثاني", "الثالث", "الرابع"];
    return `الأسبوع ${ordinals[weekNum - 1]} من ${month}`;
}

function getFridayStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) ... 5 (Fri) ... 6 (Sat)
    // المعادلة: نريد العودة للوراء حتى نصل ليوم 5 (الجمعة)
    // الجمعة (5) -> الفرق 0
    // السبت (6) -> الفرق 1
    // الأحد (0) -> الفرق 2 (نحتاج (0 + 2) % 7 لضبط الحساب)
    
    let diff = (day + 2) % 7; 
    // تفصيل:
    // Fri(5): (5+2)%7 = 0 (يومنا هذا)
    // Sat(6): (6+2)%7 = 1 (نرجع يوم)
    // Sun(0): (0+2)%7 = 2 (نرجع يومين)
    // ...
    // Thu(4): (4+2)%7 = 6 (نرجع 6 أيام)

    const friday = new Date(d);
    friday.setDate(d.getDate() - diff);
    friday.setHours(0, 0, 0, 0);
    return friday;
}
// --- Init ---
    updateDateDisplay();
    renderDualCalendar(); // <-- ضع هذا السطر
    loadData();
    initializeWidgetBridge();



    // --- تشغيل زر الإعدادات ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 1. ملء الحقول بالبيانات الحالية
            document.getElementById('setup-name').value = userProfile.name || '';
            document.getElementById('setup-gender').value = userProfile.gender || 'male';
            document.getElementById('setup-quran-goal').value = userProfile.quranGoal || '';

            document.getElementById('setup-level').value = userProfile.level || '3';

            // 2. تحديث حالة الموقع
            const locStatus = document.getElementById('location-status');
            if (userProfile.latitude && userProfile.longitude) {
                locStatus.textContent = 'الموقع محدد مسبقاً ✓';
                locStatus.style.color = '#22c55e';
            } else {
                locStatus.textContent = '';
            }

            // 3. تفعيل زر الحفظ فوراً (لأن البيانات موجودة)
            document.getElementById('save-setup-btn').disabled = false;

            // 4. فتح المودال
            document.getElementById('setup-modal').classList.remove('hidden');
        });
    }
// --- حل مشكلة الأزرار (تعريف الدوال لتراها HTML) ---
    window.updateCharts = updateCharts;
    window.downloadReport = downloadReport;
    window.openWarning = openWarning; // بالمرة عشان زرار التحذيرات يشتغل
    window.openAdhkar = openAdhkar;   // وعشان زرار الأذكار يشتغل
    window.scrollToAnalytics = scrollToAnalytics;

}); // <--- دي قفلة الـ DOMContentLoaded اللي في آخر الملف عندك

// =========================================
//  نظام المحلل الذكي والإشعارات المقارنة
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // ننتظر قليلاً بعد تحميل الموقع ثم نفحص
    setTimeout(runDailyAnalysis, 2000);
});

// =========================================
//  دوال مساعدة هامة (أضفها في ملف script.js)
// =========================================

// دالة استخراج مفتاح التخزين الموحد
function getStorageKey(date) {
    if (!date) date = new Date();
    return `mohasba_data_${getDateKey(date)}`;
}

// دالة استخراج التاريخ بصيغة موحدة (YYYY-M-D)
function getDateKey(date) {
    if (!date) date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// =========================================
//  نظام المحلل الذكي (محدث ليعمل دائماً)
// =========================================

function runDailyAnalysis(force = false) {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const lastCheck = localStorage.getItem('last_smart_check_date');
    
    // لو لم يتم الفحص اليوم، أو لو تم إجبار الدالة (للاختبار)
    if (lastCheck !== todayStr || force) {
        
        // 1. تحديد التواريخ
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 2);

        // جلب البيانات
        const dataYest = getStoredStats(yesterday);
        const dataBefore = getStoredStats(dayBefore);

        let title, body, icon, analysis = [];

        // 2. السيناريوهات المختلفة
        if (!dataYest) {
            // السيناريو 1: المستخدم لم يسجل شيئاً بالأمس (البيانات مفقودة)
            icon = "👋";
            title = "افتقدناك بالأمس!";
            body = "لم نجد سجلاً ليوم أمس. لا بأس، المهم أنك هنا اليوم. جدد النية وابدأ صفحة جديدة قوية.";
        } else {
            // السيناريو 2: توجد بيانات للأمس (نقوم بالمقارنة)
            const scoreYest = dataYest.totalScore || 0;
            const scoreBefore = dataBefore ? (dataBefore.totalScore || 0) : 0;
            const diff = scoreYest - scoreBefore;

            // تحليل التفاصيل
            analysis = analyzeBreakdown(dataYest.breakdown, dataBefore ? dataBefore.breakdown : null);

            if (scoreYest === 0) {
                icon = "😔";
                title = "يومك كان فارغاً!";
                body = "سجلت الدخول أمس لكنك لم تنجز شيئاً (0%). الأيام تمضي، فلا تتركها تسرقك.";
            } else if (diff > 0) {
                icon = "🏆";
                title = `أحسنت! تقدمت بنسبة ${diff}%`;
                body = `أداؤك أمس (${scoreYest}%) كان أفضل من اليوم الذي قبله. ${getRandomMotivation('good')}`;
            } else if (diff < 0) {
                icon = "📉";
                title = `تراجع بسيط (${Math.abs(diff)}%-)`;
                body = `أداؤك أمس (${scoreYest}%) كان أقل من قبله. ${getRandomMotivation('bad')}`;
            } else {
                icon = "⚖️";
                title = "مستواك ثابت";
                body = `حافظت على نفس المستوى (${scoreYest}%). الثبات جيد، لكن المؤمن يطمح للزيادة.`;
            }
        }

        // 3. عرض النافذة والإشعار
        showSmartPopup(icon, title, body, analysis);

        if (!force && notificationSettings.enabled) {
            sendNotification(title, body);
        }

        // 4. تسجيل أننا عرضنا التقرير اليوم (عشان ميظهرش تاني لنفس اليوم)
        if (!force) {
            localStorage.setItem('last_smart_check_date', todayStr);
        }
    }
}

// --- دوال مساعدة ---

function getStoredStats(dateObj) {
    const key = getStorageKey(dateObj); // نستخدم دالتك الموجودة مسبقاً
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).stats : null;
}

function analyzeBreakdown(curr, prev) {
    if (!curr) return [];
    if (!prev) prev = { 'الصلوات': [0,0], 'القرآن': [0,0], 'الأذكار': [0,0], 'السنن': [0,0] };

    let details = [];
    
    // الفئات التي نقارنها
    const cats = ['الصلوات', 'القرآن', 'الأذكار', 'السنن', 'قيام الليل'];

    cats.forEach(cat => {
        // نحسب النسبة المئوية لكل فئة
        const getPerc = (obj) => obj && obj[cat] && obj[cat][1] > 0 ? Math.round((obj[cat][0]/obj[cat][1])*100) : 0;
        
        const pCurr = getPerc(curr);
        const pPrev = getPerc(prev);
        const pDiff = pCurr - pPrev;

        if (pDiff > 0) {
            details.push({ cat: cat, change: pDiff, type: 'up' });
        } else if (pDiff < 0) {
            details.push({ cat: cat, change: Math.abs(pDiff), type: 'down' });
        }
    });

    return details;
}

function showSmartPopup(icon, title, body, details) {
    const modal = document.getElementById('smart-report-modal');
    document.getElementById('smart-icon').textContent = icon;
    document.getElementById('smart-title').textContent = title;
    document.getElementById('smart-message').textContent = body;

    const detailsContainer = document.getElementById('smart-details');
    detailsContainer.innerHTML = '';

    if (details.length > 0) {
        detailsContainer.innerHTML = '<div style="margin-bottom:5px; font-weight:bold; color:#555">تفاصيل التغيير:</div>';
        
        details.forEach(item => {
            const row = document.createElement('div');
            row.className = 'trend-item';
            
            let colorClass = item.type === 'up' ? 'trend-up' : 'trend-down';
            let arrow = item.type === 'up' ? '⬆️ تحسن في' : '⬇️ تراجع في';
            
            row.innerHTML = `
                <span style="color:var(--text-primary)">${arrow} ${item.cat}</span>
                <span class="${colorClass}">${item.change}%</span>
            `;
            detailsContainer.appendChild(row);
        });
    } else {
        if (title.includes("ثابت")) {
            detailsContainer.innerHTML = '<p style="text-align:center; color:#888; margin:0;">لا يوجد تغييرات ملحوظة في التفاصيل.</p>';
        } else {
             detailsContainer.style.display = 'none'; // إخفاء لو مفيش تفاصيل
        }
    }

    modal.classList.remove('hidden');
}

function getRandomMotivation(type) {
    const good = [
        "استمر، أحب الأعمال إلى الله أدومها.",
        "من سار على الدرب وصل، زادك الله همة.",
        "اللهم بارك، اجعل يومك هذا خيراً من أمسك.",
        "هذا توفيق من الله، فاشكره يزدك."
    ];
    const bad = [
        "تدارك نفسك، ما زال في الوقت سعة.",
        "لا يغلبنك الشيطان، قم وجدد العهد.",
        "إن الحسنات يذهبن السيئات، استغفر وعوض ما فات.",
        "لكل جواد كبوة، المهم أن تنهض سريعاً."
    ];

    const arr = type === 'good' ? good : bad;
    return arr[Math.floor(Math.random() * arr.length)];
}

// =========================================
//  نظام الجولة التعريفية (Onboarding Tour)
// =========================================

// =========================================
//  نظام الجولة التعريفية الشامل (Driver.js)
// =========================================

// =========================================
//  1. نظام الجولة التعريفية الشامل (Onboarding Tour)
// =========================================

function startAppTour() {
    const driver = window.driver.js.driver;

    // --- تجهيز المسرح للجولة ---
    
    // أ) فتح قائمة الموبايل لكي تظهر الأزرار المخفية
    if (window.innerWidth < 600) {
        const actionIcons = document.getElementById('action-icons');
        if(actionIcons) actionIcons.classList.add('show-mobile');
    }

    // ب) إظهار قسم البونص مؤقتاً للشرح (حتى لو لم يكن هناك بونص اليوم)
    const bonusSection = document.getElementById('bonus-section');
    let wasBonusHidden = false;
    if (bonusSection && bonusSection.classList.contains('hidden')) {
        bonusSection.classList.remove('hidden');
        wasBonusHidden = true;
    }

    // ج) تعريف خطوات الجولة
    const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'ابدأ رحلتك',
        nextBtnText: 'التالي',
        prevBtnText: 'السابق',
        progressText: '{{current}} من {{total}}',
        
        // --- تنظيف المسرح عند الإغلاق ---
        onDestroyed: () => {
            localStorage.setItem('tour_seen_v2', 'true'); // تسجيل أن المستخدم رأى التحديث الجديد
            
            // إغلاق قائمة الموبايل
            if (window.innerWidth < 600) {
                document.getElementById('action-icons')?.classList.remove('show-mobile');
            }
            // إخفاء البونص إذا كان مخفياً أصلاً
            if (wasBonusHidden && bonusSection) {
                bonusSection.classList.add('hidden');
            }
        },

        steps: [
            // 1. التاريخ الهجري والميلادي
            { 
                element: '#date-toggle-btn', 
                popover: { 
                    title: '📅 التقويم الهجري المدمج', 
                    description: 'تمت إضافة التاريخ الهجري. اضغط هنا للتبديل بين التقويمين ومعرفة الأيام البيض والمواسم الفاضلة.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 2. المواقيت الجغرافية
            { 
                element: '.prayer-timer', 
                popover: { 
                    title: '📍 المدة المتبقية بدقة', 
                    description: 'يتم الآن حساب الوقت المتبقي للصلاة بناءً على موقعك الجغرافي الفعلي (GPS) لضمان الدقة التامة.', 
                    side: "left", align: 'start' 
                } 
            },
            // 3. البونص والعبادات الموسمية
            { 
                element: '#bonus-section', 
                popover: { 
                    title: '⭐ عبادات المواسم (بونص)', 
                    description: 'في الأيام الفاضلة (مثل الإثنين، الخميس، عاشوراء) سيظهر لك هذا القسم تلقائياً مع تنبيه لتغتنم الأجر.', 
                    side: "top", align: 'center' 
                } 
            },
            // 4. تحسينات الأذكار (العداد + الثواب)
            { 
                element: '#fajr-card .action-btn', // يشير لزر أذكار الفجر كمثال
                popover: { 
                    title: '📿 العدادات وثواب الأعمال', 
                    description: 'داخل الأذكار، أضفنا <b>عداداً تفاعلياً</b>، وستجد <b>علامة استفهام</b> عند الوقوف عليها يظهر لك ثواب هذا الذكر وفضله.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 5. الإحصائيات
            { 
                element: '#analytics-btn', 
                popover: { 
                    title: '📊 الإحصائيات والتقدم', 
                    description: 'قسم جديد كلياً! تابع أداءك أسبوعياً وشهرياً، واعرف نقاط قوتك وقصورك لتعالجها بالأرقام.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 6. التنبيهات
            { 
                element: '#notification-btn', 
                popover: { 
                    title: '🔔 التنبيهات الذكية', 
                    description: 'وافق على إذن الإشعارات لنذكرك بعبادات الغد (مثل صيام الخميس) والصلوات في وقتها.', 
                    side: "bottom", align: 'center' 
                } 
            },
            // 7. قسم المهلكات والقصص
            { 
                element: '.warning-section', 
                popover: { 
                    title: '⚠️ قصص السيرة والمهلكات', 
                    description: 'تم تطوير هذا القسم ليشمل تعريفاً بالمخاطر (كالغيبة والكذب) مع <b>قصص من السيرة النبوية</b> تتغير يومياً للعظة.', 
                    side: "top", align: 'center' 
                } 
            },
            // 8. الإعدادات (أهم خطوة)
            { 
                element: '#settings-btn', 
                popover: { 
                    title: '⚙️ خصص تجربتك', 
                    description: 'من هنا حدد:<br>1. <b>جنسك</b> (لأحكام الصلاة).<br>2. <b>مستواك</b> (مبتدئ/مجتهد) لضبط كمية الأذكار.<br>3. <b>مواعيد التنبيه</b> التي تفضلها.', 
                    side: "bottom", align: 'start' 
                } 
            }
        ]
    });

    driverObj.drive();
}

// =========================================
//  2. نظام المحلل الذكي (Daily Smart Analysis)
// =========================================

function runDailyAnalysis(force = false) {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const lastCheck = localStorage.getItem('last_smart_check_date');
    
    // لو لم يتم الفحص اليوم، أو لو تم إجبار الدالة (للاختبار)
    if (lastCheck !== todayStr || force) {
        
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const dayBefore = new Date(); dayBefore.setDate(dayBefore.getDate() - 2);

        // (دالة getStoredStats و analyzeBreakdown يجب أن تكون معرفة في الجزء العلوي من ملفك)
        // إذا لم تكن معرفة، تأكد من نسخها من الردود السابقة
        if(typeof getStoredStats !== 'function') return; 

        const dataYest = getStoredStats(yesterday);
        const dataBefore = getStoredStats(dayBefore);

        let title, body, icon, analysis = [];

        if (!dataYest) {
            icon = "👋";
            title = "افتقدناك بالأمس!";
            body = "لم نجد سجلاً ليوم أمس. لا بأس، المهم أنك هنا اليوم. جدد النية وابدأ صفحة جديدة.";
        } else {
            const scoreYest = dataYest.totalScore || 0;
            const scoreBefore = dataBefore ? (dataBefore.totalScore || 0) : 0;
            const diff = scoreYest - scoreBefore;

            analysis = typeof analyzeBreakdown === 'function' ? analyzeBreakdown(dataYest.breakdown, dataBefore?.breakdown) : [];

            if (scoreYest === 0) {
                icon = "😔"; title = "يومك كان فارغاً!"; body = "سجلت الدخول أمس لكنك لم تنجز شيئاً. الأيام تمضي، فلا تتركها تسرقك.";
            } else if (diff > 0) {
                icon = "🏆"; title = `أحسنت! تقدمت بنسبة ${diff}%`; body = `أداؤك أمس (${scoreYest}%) كان أفضل من اليوم الذي قبله.`;
            } else if (diff < 0) {
                icon = "📉"; title = `تراجع بسيط (${Math.abs(diff)}%-)`; body = `أداؤك أمس (${scoreYest}%) كان أقل من قبله. استدرك ما فاتك.`;
            } else {
                icon = "⚖️"; title = "مستواك ثابت"; body = `حافظت على نفس المستوى (${scoreYest}%). الثبات جيد، لكن المؤمن يطمح للزيادة.`;
            }
        }

        // عرض النافذة (دالة showSmartPopup من الردود السابقة)
        if(typeof showSmartPopup === 'function') showSmartPopup(icon, title, body, analysis);

        // تسجيل الفحص
        if (!force) localStorage.setItem('last_smart_check_date', todayStr);
    }
}

// =========================================
//  3. المايسترو (التحكم في بدء التشغيل)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // إضافة زر "إعادة الجولة" داخل قائمة الإعدادات (مرة واحدة)
    const setupModalBody = document.querySelector('#setup-modal .modal-body');
    if(setupModalBody && !document.getElementById('restart-tour-btn')) {
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restart-tour-btn';
        restartBtn.className = 'btn-primary';
        restartBtn.style.cssText = 'margin-top: 1rem; width: 100%; background: #0891b2;';
        restartBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i> تشغيل الجولة التعريفية';
        
        restartBtn.onclick = () => {
            document.getElementById('setup-modal').classList.add('hidden');
            if (window.innerWidth < 600) document.getElementById('action-icons').classList.add('show-mobile');
            startAppTour();
        };
        setupModalBody.appendChild(restartBtn);
    }

    // --- منطق التشغيل الرئيسي ---
    const tourSeen = localStorage.getItem('tour_seen_v2');
    
    if (!tourSeen) {
        // الحالة 1: المستخدم يفتح لأول مرة بعد التحديث -> شغل الجولة
        setTimeout(startAppTour, 1500);
        // منع ظهور رسالة "افتقدناك" في هذا اليوم لعدم التشتيت
        const todayStr = new Date().toLocaleDateString('en-CA');
        localStorage.setItem('last_smart_check_date', todayStr);

    } else {
        // الحالة 2: المستخدم قديم -> شغل المحلل الذكي
        setTimeout(() => {
            if (typeof runDailyAnalysis === 'function') runDailyAnalysis(); 
        }, 2000);
    }
});
