<div align="center">
  <img src="www/assets/images/logo.png" alt="شعار محاسبة النفس" width="120" />
  <h1>محاسبة النفس</h1>
  <p>منصة عملية لمتابعة العبادات اليومية، بقياس واضح، وتحليل مستمر، وتجربة متكاملة على الويب وAndroid.</p>
  <p><strong>الموقع المباشر:</strong> <a href="https://mouhasabat-nafs.netlify.app">mouhasabat-nafs.netlify.app</a></p>

  <p>
    <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android-111827?style=flat-square&logo=googlechrome&logoColor=white" alt="المنصات" />
    <img src="https://img.shields.io/badge/Capacitor-v5-2563eb?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-f59e0b?style=flat-square&logo=firebase&logoColor=white" alt="Firebase" />
    <img src="https://img.shields.io/badge/PWA-Offline%20Ready-0ea5e9?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
    <img src="https://img.shields.io/badge/Deploy-Netlify-14b8a6?style=flat-square&logo=netlify&logoColor=white" alt="Netlify" />
    <img src="https://img.shields.io/badge/Android-Home%20Widget-16a34a?style=flat-square&logo=android&logoColor=white" alt="Android Widget" />
    <img src="https://img.shields.io/badge/Live-mouhasabat--nafs.netlify.app-0f766e?style=flat-square&logo=internetexplorer&logoColor=white" alt="Live Site" />
  </p>
</div>

---

## نظرة عامة
**محاسبة النفس** تطبيق عربي لتتبّع الإنجاز الإيماني اليومي عبر نظام نقاط ومؤشرات أداء، مع مزامنة سحابية عبر Firebase، وتجربة استخدام مناسبة للجوال والويب، بالإضافة إلى نسخة Android مبنية بـ Capacitor.

## روابط سريعة
- الموقع الرسمي: [https://mouhasabat-nafs.netlify.app](https://mouhasabat-nafs.netlify.app)
- ملف الويب الرئيسي: `www/index.html`
- إعدادات Firebase: `www/assets/js/config/firebase-config.js`
- ملف APK الحالي: `artifacts/mohasbat-alnafs-debug.apk`

## المميزات الرئيسية
- تسجيل الدخول بحساب Google عبر Firebase Authentication.
- حفظ ومزامنة البيانات في Cloud Firestore لكل مستخدم.
- تتبع يومي للصلوات والأذكار والسنن والورد القرآني بنظام نقاط واضح.
- جلب مواقيت الصلاة تلقائيًا حسب الموقع الجغرافي مع عدّادات وقت لكل صلاة.
- إدارة العبادات الإضافية (عبادات عامة + نوافل خاصة بكل صلاة).
- لوحة تحليلات متقدمة: أداء أسبوعي/شهري، أفضل يوم، أيام الالتزام، توزيع العبادات.
- تصدير تقارير الأداء بصيغ مرئية (PDF) وتقارير يومية للتوثيق.
- قسم انعكاس يومي لكتابة الملاحظات وأسباب التقصير أو النجاح.
- نظام تنبيهات محلي للأذكار والورد والتنبيه قبل الصلاة.
- قسم توعوي "المهلكات" بمحتوى تعليمي تفاعلي.
- دعم الثيم الداكن وتجربة RTL كاملة.
- تنقل سفلي للموبايل بأسلوب تطبيقات الهاتف مع انتقالات سلسة.
- دعم PWA (Service Worker + Manifest) للعمل بشكل موثوق حتى مع ضعف الاتصال.
- نسخة Android كاملة مع **Widget** للشاشة الرئيسية وإجراءات سريعة (صلاة/ورد/أذكار).

## تقنيات المشروع
- **Frontend:** HTML, CSS, JavaScript (Vanilla).
- **Charts & UX:** Chart.js, AOS, Driver.js, html2pdf.
- **Backend as a Service:** Firebase Authentication + Cloud Firestore.
- **Mobile:** Capacitor Android.
- **Deployment:** Netlify (مهيأ عبر `netlify.toml`).

## رحلة الاستخدام داخل التطبيق
1. تسجيل الدخول عبر Google.
2. ضبط الإعدادات الأولية (الاسم، الجنس، الهدف القرآني، الموقع).
3. تسجيل إنجازات اليوم في الصلاة والأذكار والسنن والورد.
4. متابعة التقدم العام الفوري ونسبة الإنجاز اليومية.
5. مراجعة التحليلات الأسبوعية والشهرية واستخراج التقارير.

## هيكل المشروع
```text
.
├── android/                         # مشروع Android (Capacitor)
├── artifacts/
│   └── mohasbat-alnafs-debug.apk    # نسخة APK Debug الجاهزة
├── www/
│   ├── assets/
│   │   ├── css/main.css
│   │   ├── images/logo.png
│   │   └── js/
│   │       ├── app.js
│   │       ├── sw-register.js
│   │       └── config/firebase-config.js
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── capacitor.config.json
├── netlify.toml
└── package.json
```

## تشغيل المشروع محليًا
```bash
npm install
npx serve www
```

بديل بدون أدوات إضافية:
```bash
cd www
python3 -m http.server 8080
```

## إعداد Firebase
1. أنشئ مشروع Firebase جديد.
2. فعّل **Authentication > Google**.
3. فعّل **Cloud Firestore**.
4. أضف دومينات التطبيق ضمن **Authorized domains** (مثل `localhost` واسم نطاق Netlify).
5. ضع إعدادات Firebase داخل الملف:
   - `www/assets/js/config/firebase-config.js`

مثال الصيغة المطلوبة:
```js
window.APP_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  }
};
```

## بناء تطبيق Android
```bash
npm run sync:android
cd android
JAVA_HOME=/opt/android-studio/jbr ANDROID_HOME=$HOME/Android/Sdk ./gradlew clean assembleDebug
```

ملف الـ APK الناتج:
- `android/app/build/outputs/apk/debug/app-debug.apk`

نسخة مجمعة داخل المشروع:
- `artifacts/mohasbat-alnafs-debug.apk`

## النشر على Netlify
- `publish` مضبوط مسبقًا على مجلد `www` عبر `netlify.toml`.
- بعد ربط المستودع، يكفي تفعيل النشر المباشر من الفرع الرئيسي.
- رابط النشر الحالي: [https://mouhasabat-nafs.netlify.app](https://mouhasabat-nafs.netlify.app)

## متطلبات الأمان الموصى بها
- تقييد مفتاح Firebase API حسب النطاقات (HTTP referrers).
- قصر Firestore Rules على المستخدم المصرّح له (`request.auth != null` مع التحقق من `uid`).
- تفعيل App Check في الإنتاج.
- مراقبة Firebase Usage والتنبيهات الأمنية بشكل دوري.

## ملاحظات
- التطبيق موجه لواجهة عربية RTL بالكامل.
- يدعم العمل كويب وتطبيق Android بنفس قاعدة الكود.
- أي تعديل على `www/assets/js/config/firebase-config.js` يتطلب إعادة بناء APK لأخذ الإعدادات الجديدة داخل نسخة Android.
