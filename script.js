document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
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

    // --- Scroll Logic ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('liquid-glass');
        } else {
            header.classList.remove('liquid-glass');
        }
    });

// ... (الكود القديم بتاعك زي ما هو من فوق) ...

    // --- 1. إعدادات Firebase (استبدل القيم دي باللي جبتها من الموقع) ---
    const firebaseConfig = {
        apiKey: "AIzaSyD8ltXQrl8XhRbjLlOfr5QiTGx_IQMan3U",
        authDomain: "mohasba-app.firebaseapp.com",
        projectId: "mohasba-app",
        storageBucket: "mohasba-app.firebasestorage.app",
        messagingSenderId: "24957282420",
        appId: "1:24957282420:web:982d83e0e0b1f7d6da8921"
    };

    // تهيئة Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- 2. دالة تسجيل الدخول بجوجل ---
    loginBtn.addEventListener('click', () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                // تم الدخول بنجاح
                const user = result.user;
                console.log("User logged in:", user.displayName);
                updateUI(user);
            }).catch((error) => {
                console.error("Error:", error.message);
                alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
            });
    });

    // --- 3. دالة تسجيل الخروج ---
    profileIcon.addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            auth.signOut().then(() => {
                console.log("User signed out");
                updateUI(null); // إخفاء البروفايل
                // ممكن هنا تمسح البيانات المحفوظة لو حابب
                // localStorage.clear(); 
                // location.reload();
            }).catch((error) => {
                console.error("Sign out error", error);
            });
        }
    });

    // --- 4. مراقبة حالة المستخدم (عشان لو عمل ريفرش يفضل مسجل دخول) ---
    auth.onAuthStateChanged((user) => {
        updateUI(user);
    });

    // دالة لتحديث شكل الموقع بناء على حالة الدخول
    function updateUI(user) {
        if (user) {
            // المستخدم مسجل دخول
            loginBtn.classList.add('hidden');
            profileIcon.classList.remove('hidden');
            
            // تغيير الصورة لصورة جوجل
            const img = profileIcon.querySelector('img');
            if(img && user.photoURL) {
                img.src = user.photoURL;
            }
        } else {
            // المستخدم غير مسجل
            profileIcon.classList.add('hidden');
            loginBtn.classList.remove('hidden');
        }
    }


    // --- Date Logic ---
    const today = new Date();
    let currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const daysGrid = document.getElementById('days-grid');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    function getStorageKey(date) {
        return `mohasba_data_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function updateDateDisplay() {
        currentDateDisplay.textContent = currentDate.toLocaleDateString('ar-EG', options);
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentMonthDisplay.textContent = new Date(year, month).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        daysGrid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startDayIndex = (firstDayOfMonth + 1) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDayIndex; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.classList.add('date-day', 'empty');
            daysGrid.appendChild(emptySlot);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('date-day');
            dayElement.textContent = i;

            if (i === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayElement.classList.add('selected');
            }

            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => {
                currentDate.setDate(i);
                currentDate.setMonth(month);
                currentDate.setFullYear(year);
                updateDateDisplay();
                renderCalendar();
                loadData();
                dateDropdown.classList.add('hidden');
            });

            daysGrid.appendChild(dayElement);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (dateToggleBtn) {
        dateToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dateDropdown.classList.toggle('hidden');
            if (!dateDropdown.classList.contains('hidden')) {
                renderCalendar();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (dateToggleBtn && dateDropdown && !dateToggleBtn.contains(e.target) && !dateDropdown.contains(e.target)) {
            dateDropdown.classList.add('hidden');
        }
    });

    // --- Constants ---
    const ADHKAR_TYPES = ['morning', 'wakeup', 'evening', 'post_fajr', 'post_dhuhr', 'post_asr', 'post_maghrib', 'post_isha'];
    const postPrayerAdhkar = [
        'أستغفر الله (3 مرات)',
        'اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام',
        'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير (3 مرات)',
        'سبحان الله (33 مرة)',
        'الحمد لله (33 مرة)',
        'الله أكبر (33 مرة)',
        'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
        'آية الكرسي'
    ];

    const adhkarData = {
        'wakeup': [
            'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَريكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ للَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفرْ لِي',
            'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لي بِذِكْرِهِ',
            '﴿ إِنَّ فِي خَلْقِ السَّمَوَاتِ وَالأَرْضِ وَاخْتِلاَفِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لأُوْلِي الألْبَابِ * الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَاماً وَقُعُوداً وَعَلَىَ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَوَاتِ وَالأَرْضِ رَبَّنَا مَا خَلَقْتَ هَذا بَاطِلاً سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ* رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ* رَّبَّنَا إِنَّنَا سَمِعْنَا مُنَادِياً يُنَادِي لِلإِيمَانِ أَنْ آمِنُواْ بِرَبِّكُمْ فَآمَنَّا رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الأبْرَارِ* رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَى رُسُلِكَ وَلاَ تُخْزِنَا يَوْمَ الْقِيَامَةِ إِنَّكَ لاَ تُخْلِفُ الْمِيعَادَ* فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لاَ أُضِيعُ عَمَلَ عَامِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَى بَعْضُكُم مِّن بَعْضٍ فَالَّذِينَ هَاجَرُواْ وَأُخْرِجُواْ مِن دِيَارِهِمْ وَأُوذُواْ فِي سَبِيلِي وَقَاتَلُواْ وَقُتِلُواْ لأُكَفِّرَنَّ عَنْهُمْ سَيِّئَاتِهِمْ وَلأُدْخِلَنَّهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الأَنْهَارُ ثَوَاباً مِّن عِندِ اللَّهِ وَاللَّهُ عِندَهُ حُسْنُ الثَّوَابِ * لاَ يَغُرَّنَّكَ تَقَلُّبُ الَّذِينَ كَفَرُواْ فِي الْبِلاَدِ * مَتَاعٌ قَلِيلٌ ثُمَّ مَأْوَاهُمْ جَهَنَّمُ وَبِئْسَ الْمِهَادُ * لَكِنِ الَّذِينَ اتَّقَوْاْ رَبَّهُمْ لَهُمْ جَنَّاتٌ تَجْرِي مِنْ تَحْتِهَا الأَنْهَارُ خَالِدِينَ فِيهَا نُزُلاً مِّنْ عِندِ اللَّهِ وَمَا عِندَ اللَّهِ خَيْرٌ لِّلأَبْرَارِ * وَإِنَّ مِنْ أَهْلِ الْكِتَابِ لَمَن يُؤْمِنُ بِاللَّهِ وَمَا أُنزِلَ إِلَيْكُمْ وَمَآ أُنزِلَ إِلَيْهِمْ خَاشِعِينَ لِلَّهِ لاَ يَشْتَرُونَ بِآيَاتِ اللَّهِ ثَمَناً قَلِيلاً أُوْلَئِكَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ*يَا أَيُّهَا الَّذِينَ آمَنُواْ اصْبِرُواْ وَصَابِرُواْ وَرَابِطُواْ وَاتَّقُواْ اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ ﴾'
        ],
'morning': [
            'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيم: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ (١ مرة)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤ (٣ مرات)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥ (٣ مرات)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦ (٣ مرات)',
            'أَصْـبَحْنا وَأَصْـبَحَ المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذا اليوم وَخَـيرَ ما بَعْـدَه ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذا اليوم وَشَرِّ ما بَعْـدَه، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر (١ مرة)',
            'اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ (١ مرة)',
            'رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً (٣ مرات)',
            'اللّهُـمَّ إِنِّـي أَصْبَـحْتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك (٤ مرات)',
            'اللّهُـمَّ ما أَصْبَـَحَ بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر (١ مرة)',
            'حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم (٧ مرات)',
            'بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم (٣ مرات)',
            'اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشُور (١ مرة)',
            'أَصْبَـحْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ (١ مرة)',
            'سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه (٣ مرات)',
            'اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ (٣ مرات)',
            'اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي (١ مرة)',
            'يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ (١ مرة)',
            'أَصْبَـحْـنا وَأَصْبَـحْ المُـلكُ للهِ رَبِّ العـالَمـين ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ خَـيْرَ هـذا الـيَوْم ، فَـتْحَهُ ، وَنَصْـرَهُ ، وَنـورَهُ وَبَـرَكَتَـهُ ، وَهُـداهُ ، وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهِ وَشَـرِّ ما بَعْـدَه (١ مرة)',
            'اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم (١ مرة)',
            'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق (٣ مرات)',
            'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا (١ مرة)',
            'لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ (١٠٠ مرة)',
            'سُبْحـانَ اللهِ وَبِحَمْـدِهِ (١٠٠ مرة)',
            'أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيْهِ (١٠٠ مرة)',
            'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ (١٠ مرات)'
        ],
        'evening': [
            'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ (١ مرة)',
            'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ: آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝٢٨٥ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَّسِينَآ أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ۝٢٨٦ (١ مرة)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝١ ٱللَّهُ ٱلصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ۝٤ (٣ مرات)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥ (٣ مرات)',
            'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم: قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝١ مَلِكِ ٱلنَّاسِ ۝٢ إِلَٰهِ ٱلنَّاسِ ۝٣ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝٤ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝٥ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ۝٦ (٣ مرات)',
            'أَمْسَيْـنا وَأَمْسـى المُـلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُـلكُ ولهُ الحَمْـد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْـأَلُـكَ خَـيرَ ما في هـذهِ اللَّـيْلَةِ وَخَـيرَ ما بَعْـدَهـا ، وَأَعـوذُ بِكَ مِنْ شَـرِّ ما في هـذهِ اللَّـيْلةِ وَشَرِّ ما بَعْـدَهـا ، رَبِّ أَعـوذُبِكَ مِنَ الْكَسَـلِ وَسـوءِ الْكِـبَر ، رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر (١ مرة)',
            'اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَنـي وَأَنا عَبْـدُك ، وَأَنا عَلـى عَهْـدِكَ وَوَعْـدِكَ ما اسْتَـطَعْـت ، أَعـوذُبِكَ مِنْ شَـرِّ ما صَنَـعْت ، أَبـوءُ لَـكَ بِنِعْـمَتِـكَ عَلَـيَّ وَأَبـوءُ بِذَنْـبي فَاغْفـِرْ لي فَإِنَّـهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ (١ مرة)',
            'رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً (٣ مرات)',
            'اللّهُـمَّ إِنِّـي أَمسيتُ أُشْـهِدُك ، وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـك ، وَمَلَائِكَتَكَ ، وَجَمـيعَ خَلْـقِك ، أَنَّـكَ أَنْـتَ اللهُ لا إلهَ إلاّ أَنْـتَ وَحْـدَكَ لا شَريكَ لَـك ، وَأَنَّ ُ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك (٤ مرات)',
            'اللّهُـمَّ ما أَمسى بي مِـنْ نِعْـمَةٍ أَو بِأَحَـدٍ مِـنْ خَلْـقِك ، فَمِـنْكَ وَحْـدَكَ لا شريكَ لَـك ، فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر (١ مرة)',
            'حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَـيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم (٧ مرات)',
            'بِسـمِ اللهِ الذي لا يَضُـرُّ مَعَ اسمِـهِ شَيءٌ في الأرْضِ وَلا في السّمـاءِ وَهـوَ السّمـيعُ العَلـيم (٣ مرات)',
            'اللّهُـمَّ بِكَ أَمْسَيْـنا وَبِكَ أَصْـبَحْنا ، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ الْمَصِيرُ (١ مرة)',
            'أَمْسَيْـنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ (١ مرة)',
            'سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ، وَرِضـا نَفْسِـه ، وَزِنَـةَ عَـرْشِـه ، وَمِـدادَ كَلِمـاتِـه (٣ مرات)',
            'اللّهُـمَّ عافِـني في بَدَنـي ، اللّهُـمَّ عافِـني في سَمْـعي ، اللّهُـمَّ عافِـني في بَصَـري ، لا إلهَ إلاّ أَنْـتَ. اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْر ، لا إلهَ إلاّ أَنْـتَ (٣ مرات)',
            'اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في الدُّنْـيا وَالآخِـرَة ، اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـيةَ في ديني وَدُنْـيايَ وَأهْـلي وَمالـي ، اللّهُـمَّ اسْتُـرْ عـوْراتي وَآمِـنْ رَوْعاتـي ، اللّهُـمَّ احْفَظْـني مِن بَـينِ يَدَيَّ وَمِن خَلْفـي وَعَن يَمـيني وَعَن شِمـالي ، وَمِن فَوْقـي ، وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي (١ مرة)',
            'يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَـرْفَةَ عَيْنٍ (١ مرة)',
            'أَمْسَيْنا وَأَمْسَى الْمُلْكُ للهِ رَبِّ الْعَالَمَيْنِ، اللَّهُمَّ إِنَّي أسْأَلُكَ خَيْرَ هَذَه اللَّيْلَةِ فَتْحَهَا ونَصْرَهَا، ونُوْرَهَا وبَرَكَتهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فيهِا وَشَرَّ مَا بَعْدَهَا (١ مرة)',
            'اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ فاطِـرَ السّماواتِ وَالأرْضِ رَبَّ كـلِّ شَـيءٍ وَمَليـكَه ، أَشْهَـدُ أَنْ لا إِلـهَ إِلاّ أَنْت ، أَعـوذُ بِكَ مِن شَـرِّ نَفْسـي وَمِن شَـرِّ الشَّيْـطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَـرِفَ عَلـى نَفْسـي سوءاً أَوْ أَجُـرَّهُ إِلـى مُسْـلِم (١ مرة)',
            'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق (٣ مرات)',
            'لَا إلَه إلّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءِ قَدِيرِ (١٠٠ مرة)',
            'سُبْحـانَ اللهِ وَبِحَمْـدِهِ (١٠٠ مرة)',
            'أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيهِ (١٠٠ مرة)',
            'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ (١٠ مرات)'
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

    // --- Scoring System ---
    function updateGlobalScore() {
        let currentPoints = 0;
        let maxPossiblePoints = 0;

        // 1. Prayer Buttons (Max = Highest option, Current = Active option)
        document.querySelectorAll('.prayer-item').forEach(card => {
            const prayerBtns = card.querySelectorAll('.prayer-btn');
            if (prayerBtns.length > 0) {
                let maxForThisPrayer = 0;
                prayerBtns.forEach(btn => {
                    const pts = parseInt(btn.getAttribute('data-points') || 0);
                    if (pts > maxForThisPrayer) maxForThisPrayer = pts;
                });
                maxPossiblePoints += maxForThisPrayer;

                const activeBtn = card.querySelector('.prayer-btn.active');
                if (activeBtn) {
                    currentPoints += parseInt(activeBtn.getAttribute('data-points') || 0);
                }
            }
        });

        // 2. Toggle Buttons (Sunnah + Extras)
        document.querySelectorAll('.task-btn.toggle-btn').forEach(btn => {
            const points = parseInt(btn.getAttribute('data-points') || 0);
            maxPossiblePoints += points;
            if (btn.classList.contains('active')) {
                currentPoints += points;
            }
        });

        // 3. Adhkar
        ADHKAR_TYPES.forEach(type => {
            const progress = document.getElementById(`progress-${type}`);
            if (progress) {
                maxPossiblePoints += 2;
                if (progress.style.width === '100%') {
                    currentPoints += 2;
                }
            }
        });

        // 4. Rukn Al-Ibadat (Static + Dynamic)
        document.querySelectorAll('.ibada-box').forEach(box => {
            const points = parseInt(box.getAttribute('data-points') || 0);
            maxPossiblePoints += points;
            if (box.classList.contains('done')) {
                currentPoints += points;
            }
        });

        // ... (داخل دالة updateGlobalScore) ...

        // 5. الحساب النهائي للنسبة المئوية
        const percentage = maxPossiblePoints === 0 ? 0 : Math.round((currentPoints / maxPossiblePoints) * 100);

        // --- [جديد] تحديث عنوان قسم المحاسبة بناءً على النسبة ---
        const reflectionTitle = document.getElementById('reflection-title');
        if (reflectionTitle) {
            if (percentage >= 50) {
                reflectionTitle.textContent = "أحسنت! ما الذي أعانك على هذا الإنجاز اليوم؟";
                reflectionTitle.style.color = "#22c55e"; // أخضر
            } else {
                reflectionTitle.textContent = "ما الذي منعك وشغلك عن وردك اليوم؟";
                reflectionTitle.style.color = "#ef4444"; // أحمر
            }
        }
        // -------------------------------------------------------

        // التحديث في الشاشة
        if (totalScoreDisplay) totalScoreDisplay.textContent = `${percentage}%`;
        if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;

        if (totalScoreDisplay) totalScoreDisplay.textContent = `${percentage}%`;
        if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;
    }

    // --- Data Persistence Functions ---
    function saveData() {
        const key = getStorageKey(currentDate);
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

        localStorage.setItem(key, JSON.stringify(data));
        updateGlobalScore();
    }

    function saveIbadatData() {
        const key = `ibadat_data_${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const data = { static: {}, dynamic: [] };

        document.querySelectorAll('.ibada-box[data-id]').forEach(box => {
            data.static[box.dataset.id] = box.classList.contains('done');
        });

        document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => {
            const title = box.querySelector('.ibada-title').textContent;
            const time = box.querySelector('.ibada-time').textContent;
            const isDone = box.classList.contains('done');
            const points = box.getAttribute('data-points');
            data.dynamic.push({ name: title, time: time, done: isDone, points: points });
        });

        localStorage.setItem(key, JSON.stringify(data));
        updateGlobalScore();
    }

    function saveExtras() {
        const key = `extras_${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const extrasData = [];

        document.querySelectorAll('.extra-worship-box').forEach(box => {
            const prayerCard = box.closest('.prayer-item');
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
        });

        localStorage.setItem(key, JSON.stringify(extrasData));
    }

    // --- Loading Functions ---
    function loadData() {
        const key = getStorageKey(currentDate);
        const saved = localStorage.getItem(key);

        // Reset
        document.querySelectorAll('.task-btn').forEach(btn => btn.classList.remove('active', 'completed'));
        ADHKAR_TYPES.forEach(type => {
            const progress = document.getElementById(`progress-${type}`);
            if (progress) progress.style.width = '0%';
            const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
            if (btn) btn.classList.remove('completed');
        });

        if (saved) {
            const data = JSON.parse(saved);
            document.querySelectorAll('.task-btn:not(.extra-worship-box .task-btn)').forEach((btn, index) => {
                if (data.buttons[index]) {
                    btn.classList.add(btn.classList.contains('action-btn') ? 'completed' : 'active');
                }
            });

            if (data.adhkar) {
                Object.keys(data.adhkar).forEach(type => {
                    const progress = document.getElementById(`progress-${type}`);
                    if (progress) progress.style.width = data.adhkar[type];
                    const btn = document.querySelector(`button[onclick="openAdhkar('${type}')"]`);
                    if (btn && data.adhkar[type] === '100%') btn.classList.add('completed');
                });
            }
        }

        loadExtras();
        loadIbadatData();
    }

    function loadIbadatData() {
        const key = `ibadat_data_${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const saved = localStorage.getItem(key);

        document.querySelectorAll('.ibada-box[data-id]').forEach(box => box.classList.remove('done'));
        document.querySelectorAll('.ibada-box:not([data-id])').forEach(box => box.remove());

        if (saved) {
            const data = JSON.parse(saved);
            if (data.static) {
                Object.keys(data.static).forEach(id => {
                    const box = document.querySelector(`.ibada-box[data-id="${id}"]`);
                    if (box && data.static[id]) box.classList.add('done');
                });
            }
            if (data.dynamic) {
                data.dynamic.forEach(item => {
                    createNewWorshipBox(item.name, item.time, item.done, item.points || 1);
                });
            }
        }
        updateGlobalScore();
    }

    // --- Download Report Logic ---
    const downloadBtn = document.getElementById('download-report-btn');
    const reflectionInput = document.getElementById('reflection-input');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const date = currentDateDisplay.textContent;
            const score = totalScoreDisplay.textContent;
            const note = reflectionInput.value;

            // محتوى ملف الوورد (HTML بسيط يفهمه الوورد)
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

            // إنشاء الملف وتنزيله
            const blob = new Blob(['\ufeff', fileContent], {
                type: 'application/msword'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = `تقرير_محاسبة_${date.replace(/\//g, '-')}.doc`; // اسم الملف
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    function loadExtras() {
        const key = `extras_${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const saved = localStorage.getItem(key);

        document.querySelectorAll('.extra-worship-box').forEach(box => box.remove());

        if (saved) {
            const extrasData = JSON.parse(saved);
            extrasData.forEach(item => {
                const prayerCard = document.getElementById(`${item.prayer}-card`);
                if (prayerCard) {
                    const grid = prayerCard.querySelector('.prayer-content-grid');
                    const box = document.createElement('div');
                    box.className = 'task-box extra-worship-box';
                    box.setAttribute('data-points', item.points);
                    if (item.done) box.classList.add('done');

                    box.innerHTML = `
                        <h4 class="box-title">نافلة إضافية</h4>
                        <button class="task-btn toggle-btn ${item.done ? 'active' : ''}" data-points="${item.points}">${item.name}</button>
                        <button class="delete-extra-btn">&times;</button>
                    `;

                    const btn = box.querySelector('.task-btn');
                    btn.addEventListener('click', () => {
                        btn.classList.toggle('active');
                        box.classList.toggle('done', btn.classList.contains('active'));
                        saveData();
                        saveExtras();
                        updateGlobalScore();
                    });

                    box.querySelector('.delete-extra-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('حذف هذه النافلة؟')) {
                            box.remove();
                            saveData();
                            saveExtras();
                            updateGlobalScore();
                        }
                    });

                    const addBtn = grid.querySelector('.add-prayer-extra-btn');
                    grid.insertBefore(box, addBtn);
                }
            });
        }
        updateGlobalScore();
    }

    // --- Event Listeners ---

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

    // 4. Adhkar Modal
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

        if (adhkarListContainer) {
            if (type.startsWith('post_')) {
                adhkarListContainer.classList.add('hide-scrollbar');
            } else {
                adhkarListContainer.classList.remove('hide-scrollbar');
            }

            adhkarListContainer.innerHTML = '';
            const items = adhkarData[type] || [];
            items.forEach(text => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'adhkar-item';
                itemDiv.innerHTML = `<div class="adhkar-checkbox"></div><span>${text}</span>`;
                itemDiv.addEventListener('click', () => {
                    itemDiv.classList.toggle('completed');
                    updateAdhkarProgress(type);
                });
                adhkarListContainer.appendChild(itemDiv);
            });
        }
        if (adhkarModal) adhkarModal.classList.remove('hidden');
    };

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

    if (saveWorshipBtn) {
        saveWorshipBtn.addEventListener('click', () => {
            const name = worshipNameInput.value.trim();
            const time = worshipTimeInput.value.trim();
            const points = parseInt(worshipPointsInput.value);

            if (name && time) {
                createNewWorshipBox(name, time, false, points);
                worshipNameInput.value = '';
                worshipTimeInput.value = '';
                worshipPointsInput.value = '1';
                addWorshipModal.classList.add('hidden');
                saveIbadatData();
            } else {
                alert('الرجاء إدخال اسم العبادة ووقت التنفيذ');
            }
        });
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
        const prayerCard = document.getElementById(`${prayer}-card`);
        const grid = prayerCard.querySelector('.prayer-content-grid');
        const box = document.createElement('div');
        box.className = 'task-box extra-worship-box';
        box.setAttribute('data-points', extra.points);
        box.innerHTML = `
            <h4 class="box-title">نافلة إضافية</h4>
            <button class="task-btn toggle-btn" data-points="${extra.points}">${extra.name}</button>
            <button class="delete-extra-btn">&times;</button>
        `;

        const btn = box.querySelector('.task-btn');
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            box.classList.toggle('done', btn.classList.contains('active'));
            saveData();
            saveExtras();
            updateGlobalScore();
        });

        box.querySelector('.delete-extra-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('حذف هذه النافلة؟')) {
                box.remove();
                saveData();
                saveExtras();
                updateGlobalScore();
            }
        });

        const addBtn = grid.querySelector('.add-prayer-extra-btn');
        grid.insertBefore(box, addBtn);
        saveData();
        saveExtras();
        updateGlobalScore();
    }

    // --- Init ---
    updateDateDisplay();
    renderCalendar();
    loadData();

    // --- AOS Init ---
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 500,
            offset: 120,
            mirror: true,
            once: false
        });
    }

    // --- Warning Section Logic ---
    
    // قاعدة بيانات التحذيرات (نصوص الترهيب)
    const warningsData = {
        'lying': {
            title: 'خطر الكذب',
            quran: 'قال تعالى: ﴿إِنَّمَا يَفْتَرِي الْكَذِبَ الَّذِينَ لَا يُؤْمِنُونَ بِآيَاتِ اللَّهِ ۖ وَأُولَٰئِكَ هُمُ الْكَاذِبُونَ﴾',
            hadith: 'قال رسول الله ﷺ: "إِيَّاكُمْ وَالْكَذِبَ، فَإِنَّ الْكِذْبَ يَهْدِي إِلَى الْفُجُورِ، وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ."'
        },
        'backbiting': {
            title: 'عاقبة الغيبة',
            quran: 'قال تعالى: ﴿وَلَا يَغْتَب بَّعْضُكُم بَعْضًا ۚ أَيُحِبُّ أَحَدُكُمْ أَن يَأْكُلَ لَحْمَ أَخِيهِ مَيْتًا فَكَرِهْتُمُوهُ﴾',
            hadith: 'قال رسول الله ﷺ: "لَمَّا عُرِجَ بِي مَرَرْتُ بِقَوْمٍ لَهُمْ أَظْفَارٌ مِنْ نُحَاسٍ يَخْمُشُونَ وُجُوهَهُمْ وَصُدُورَهُمْ، فَقُلْتُ: مَنْ هَؤُلَاءِ يَا جِبْرِيلُ؟ قَالَ: هَؤُلَاءِ الَّذِينَ يَأْكُلُونَ لُحُومَ النَّاسِ، وَيَقَعُونَ فِي أَعْرَاضِهِمْ."'
        },
        'gazing': {
            title: 'فتنة النظر',
            quran: 'قال تعالى: ﴿قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ اللَّهَ خَبِيرٌ بِمَا يَصْنَعُونَ﴾',
            hadith: 'قال رسول الله ﷺ: "النَّظْرَةُ سَهْمٌ مِنْ سِهَامِ إِبْلِيسَ مَسْمُومٌ مَنْ تَرَكَهَا مَخَافَتِي أَبْدَلْتُهُ إِيمَانًا يَجِدُ حَلَاوَتَهُ فِي قَلْبِهِ."'
        },
        'cursing': {
            title: 'السب واللعن',
            quran: 'قال تعالى: ﴿مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ﴾',
            hadith: 'قال رسول الله ﷺ: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا اللَّعَّانِ وَلَا الْفَاحِشِ وَلَا الْبَذِيءِ."'
        }
    };

    const warningModal = document.getElementById('warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-modal');
    const warningTitle = document.getElementById('warning-modal-title');
    const warningQuran = document.getElementById('warning-quran');
    const warningHadith = document.getElementById('warning-hadith');

    // دالة فتح المودال
    window.openWarning = function(type) {
        const data = warningsData[type];
        if (data) {
            warningTitle.textContent = data.title;
            
            // تعبئة البيانات
            warningQuran.textContent = data.quran;
            warningHadith.textContent = data.hadith;
            
            // إظهار المودال
            warningModal.classList.remove('hidden');
        }
    };

    // إغلاق المودال
    if (closeWarningBtn) {
        closeWarningBtn.addEventListener('click', () => {
            warningModal.classList.add('hidden');
        });
    }

    // الإغلاق عند الضغط في الخارج
    window.addEventListener('click', (e) => {
        if (e.target === warningModal) {
            warningModal.classList.add('hidden');
        }
    });
});