# 📱 PWA Installation Guide

Vitality is a Progressive Web App (PWA) that you can install on your device for a native app-like experience!

## ✅ PWA Features

- **Install on Home Screen** - Add to your phone/tablet home screen
- **Offline Support** - Works without internet (data syncs when back online)
- **Push Notifications** - Get reminded of your habits (coming soon)
- **Background Sync** - Automatic data synchronization
- **Splash Screen** - Branded launch experience
- **Native Feel** - Full-screen, no browser UI

---

## 📲 How to Install

### iPhone / iPad (Safari)

1. Open **Safari** and navigate to your Vitality app URL
2. Tap the **Share** button (square with arrow up) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right corner
5. The Vitality app icon will appear on your home screen!

### Android (Chrome)

1. Open **Chrome** and navigate to your Vitality app URL
2. Tap the **three dots menu** (⋮) in the top right
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **"Install"** on the popup
5. The Vitality app will be added to your home screen!

**Alternative:** Wait for the install banner to appear at the bottom, then tap **"Install"**

### Desktop (Chrome/Edge)

1. Open **Chrome** or **Edge** and navigate to your Vitality app URL
2. Look for the **install icon** (➕) in the address bar
3. Click **"Install Vitality..."**
4. The app will open in its own window!

**Alternative:** Click the three dots menu → **"Install Vitality..."**

### Windows (Microsoft Store)

The app can be packaged for Microsoft Store submission using PWA Builder.

---

## 🔧 Troubleshooting

### Install Option Not Showing

- Make sure you're using a supported browser (Chrome, Safari, Edge)
- Ensure you have a stable internet connection
- Try refreshing the page
- Clear browser cache and try again

### App Not Working Offline

- First visit: The app needs to load once online to cache assets
- Check that "Offline mode" is enabled in your browser
- Try force-closing and reopening the app

### iOS Specific Issues

- Must use **Safari** (Chrome on iOS doesn't support PWA installation)
- "Add to Home Screen" option only appears in Safari share sheet
- Make sure you don't have content blockers preventing the prompt

### Android Specific Issues

- Use **Chrome** for best compatibility
- Check that "Add to Home screen" is enabled in Chrome settings
- Some Android launchers may not support PWA icons

---

## 🔄 Updating the App

PWAs update automatically in the background! When you open the app, it checks for updates and installs them. To force an update:

1. Close the app completely
2. Reopen it while connected to the internet
3. The latest version will be loaded

---

## 🗑️ Uninstalling

### iOS
- Long press the app icon
- Tap "Remove App"
- Tap "Delete App"

### Android
- Long press the app icon
- Drag to "Uninstall" or tap "App info" → "Uninstall"

### Desktop
- Chrome: Go to `chrome://apps`, right-click Vitality, select "Remove"
- Windows: Use "Add or remove programs" in Settings

---

## 🛠️ Developer Notes

### Regenerating Icons

If you change the app icon (icon.svg), regenerate all PWA icons:

```bash
npm run generate-icons
```

### Testing PWA Locally

```bash
npm run build
npm run preview
```

Then open the preview URL in Chrome and look for the install icon.

### PWA Checklist

✅ HTTPS enabled (required for PWA)
✅ Web App Manifest configured
✅ Service Worker registered
✅ Icons generated (72x72 to 512x512)
✅ Offline functionality working
✅ Responsive design
✅ Splash screen configured

---

## 📚 Resources

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [PWA Builder](https://www.pwabuilder.com/) - Package for app stores
- [Web App Manifest Docs](https://developer.mozilla.org/en-US/docs/Web/Manifest)
