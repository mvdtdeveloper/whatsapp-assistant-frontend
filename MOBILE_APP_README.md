# MVDT Field Assistant Mobile App

This is the existing React frontend converted to a mobile-first WhatsApp-style interface and prepared for Capacitor Android.

## What was kept unchanged
- Existing Axios API base URL and backend endpoints
- `/simulator/message` conversation flow
- Users CRUD API
- Jobs CRUD API
- Materials CRUD API
- `/reports/material-consumptions`
- `/reports/task-statuses`
- `/reports/expenses`
- Existing report/export logic

## Mobile UI added
- WhatsApp-style full-screen Field Assistant chat
- Fixed Android-style bottom navigation
- Registered Users mobile list with search, add, edit and delete
- Records page with Material Consumption / Task Status / Expenses tabs
- Mobile report cards, department filter, search and Excel export
- More page for Jobs & Sites and Materials
- Mobile card/list forms instead of desktop-heavy tables
- Safe-area spacing for phone status/navigation areas

## Capacitor configuration
- App ID: `com.mvdt.fieldassistant`
- App name: `MVDT Field Assistant`
- React build folder: `build`

## First Android setup on Windows
Requirements:
- Node.js 22+
- Android Studio with Android SDK
- JDK supported by the installed Capacitor/Android toolchain

Double-click:

`SETUP_ANDROID.bat`

Or run manually:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

After `android/` has been created, future frontend updates only need:

```bash
npm run android
```

## Create a debug APK
After the Android project has been generated once, double-click:

`BUILD_DEBUG_APK.bat`

The APK will be created at:

`android/app/build/outputs/apk/debug/app-debug.apk`

## API
The API logic remains in `src/api/client.js` and was not changed. The current fallback is:

`https://backend-whatsapp-assistant.onrender.com/api`

You can continue overriding it through `REACT_APP_API_URL` exactly as before.
