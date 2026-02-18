<div align="center">
  <img src="www/assets/images/logo.png" alt="شعار محاسبة النفس" width="120" />
  <h1>محاسبة النفس</h1>
  <p>منصة عملية لمتابعة العبادات اليومية، بقياس واضح، وتحليل مستمر، وتجربة متكاملة على الويب وAndroid.</p>

  <p>
    <img src="https://img.shields.io/badge/Platforms-Web%20%7C%20Android-0f172a?style=for-the-badge" alt="المنصات" />
    <img src="https://img.shields.io/badge/Capacitor-v5-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/PWA-Offline%20Ready-2563eb?style=for-the-badge" alt="PWA" />
    <img src="https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Netlify" />
    <img src="https://img.shields.io/badge/Android-Home%20Widget-15803d?style=for-the-badge&logo=android&logoColor=white" alt="Android Widget" />
  </p>
</div>

---

## نظرة عامة
**محاسبة النفس** تطبيق عربي لتتبّع الإنجاز الإيماني اليومي عبر نظام نقاط ومؤشرات أداء، مع مزامنة سحابية عبر Firebase، وتجربة استخدام مناسبة للجوال والويب، بالإضافة إلى نسخة Android مبنية بـ Capacitor.

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

## متطلبات الأمان الموصى بها
- تقييد مفتاح Firebase API حسب النطاقات (HTTP referrers).
- قصر Firestore Rules على المستخدم المصرّح له (`request.auth != null` مع التحقق من `uid`).
- تفعيل App Check في الإنتاج.
- مراقبة Firebase Usage والتنبيهات الأمنية بشكل دوري.

## ملاحظات
- التطبيق موجه لواجهة عربية RTL بالكامل.
- يدعم العمل كويب وتطبيق Android بنفس قاعدة الكود.
