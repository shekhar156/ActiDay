# 📱 ActiDay - Daily Routine & Habit Tracker (Android App & PWA)

A modern, mobile-first Daily Routine, Habit Tracker, Focus Timer, and Reflection app built for Android devices.

---

## ⚡ 1-Click Execution & Launchers

| What you want to do | How to do it | Description |
| :--- | :--- | :--- |
| **Launch Desktop App** | Double-click [**`Launch-App.bat`**](Launch-App.bat) | Launches the app in a standalone dedicated application window (no URL bar, native feel). |
| **Install on Android Phone** | Open **`http://172.17.220.211:3000`** in phone Chrome | Tap **⋮** > **"Install app"** or **"Add to Home screen"**. Installs as an offline app with an icon on your phone! |
| **Build Android .APK** | Double-click [**`build-apk.bat`**](build-apk.bat) | Syncs assets to Capacitor Android and builds the APK via Gradle or opens Android Studio. |

---

## ✨ Features Included

1. **🕒 Daily Routine Schedule (Time-Blocking)**
   - Smart timeline categorized into **🌅 Morning**, **☀️ Afternoon**, **🌆 Evening**, and **🌙 Night**.
   - **Happening Now Hero Widget**: Live detection of the active routine based on real-time clock with remaining time countdown and elapsed progress bar.
   - Quick one-tap completion with haptic feedback and upward chime sound.
   - Add, edit, or delete custom routines with time ranges, emojis, and category tags.

2. **🎯 Habit Tracker with Streaks & Targets**
   - Active streak counter (🔥) with celebration animations.
   - Multi-counter habits (e.g. 8 glasses of water with `+` and `-` controls).
   - 7-Day Mini Heatmap calendar view for consistency tracking.
   - Custom habit creator.

3. **✅ Priority Task Checklist**
   - To-do action items categorized by priority: 🔴 High (Urgent), 🟡 Medium, 🟢 Low.
   - Quick-add input bar for frictionless task capturing.
   - Filter pills (All, Pending, High, Completed) & "Clear Done" batch cleanup.

4. **⏱️ Focus & Pomodoro Timer**
   - Circular countdown progress ring with session counter (e.g. Session 1 of 4).
   - Modes: 🎯 Pomodoro (25m), ☕ Short Break (5m), 🌴 Long Break (15m), ⚡ Deep Work (50m).
   - Web Audio synthesizer bell gong & haptic vibration on completion.
   - Optional metronome tick sound.
   - Automatically records focused minutes into daily analytics.

5. **📊 Insights, Mood & Daily Reflection**
   - 5-point Emoji Mood Tracker (🤩 Amazing, 😊 Good, 😐 Neutral, 🥱 Tired, 😣 Stressed).
   - Gratitude & daily reflection journal note with auto-save.
   - Dynamic 7-day consistency chart (rendered on Canvas).
   - Total focus minutes, habit count, and routine completion stats.
   - **Data Backup & Restore**: Export and Import full routine data via JSON.

6. **🎧 Ambient Focus Soundscapes (Synthesizer)**
   - 100% synthesized procedural background audio using Web Audio API (zero external MP3 downloads, offline-ready).
   - Modes: 🌧️ **Gentle Rain**, 🌊 **Ocean Waves** (LFO wave surf swell), ☕ **Cozy Cafe**, 🌲 **Forest & Birds**, 🌌 **Deep Brown / Mask Noise**.
   - Master volume slider & **Sync with Focus Timer** toggle (auto-plays in focus mode, auto-pauses on breaks).

7. **🏆 Gamification & Milestone Badges (XP System)**
   - Leveling roadmap from **Level 1 (Novice Striver)** to **Level 8 (Daily Grandmaster)** with XP progress bar.
   - Earn XP on daily activities (+25 XP routine, +20 XP habit, +50 XP focus session, +15 XP task, +20 XP breathwork).
   - 8 Unlockable Achievement Trophies (🌅 Early Riser, 🔥 Streak Legend, ⏱️ Hyperfocus, 💧 Hydration Hero, 🎯 Task Destroyer, 🫁 Inner Calm, 📝 Clarity Keeper, 🏆 100% Conqueror).
   - Level-up fanfare chime and celebratory toast notifications.

8. **📋 Smart Routine Presets & Schedule Templates**
   - 1-Click battle-tested schedule templates:
     - 🎓 **University Student & Exam Prep**
     - 💻 **Remote Developer & Tech Flow**
     - 🏋️ **Fitness & High Energy**
     - 🧘 **Mindful & Balanced Life**
   - Full timetable preview with 1-click **Add to Schedule** or **Replace Schedule**.

9. **🫁 4-7-8 & Box Breathing Zen Guide**
   - Scientifically proven breathwork pacing (4-7-8 Relaxing Breath & 4-4-4-4 Navy SEAL Box Breath).
   - Glowing animated breathing orb with real-time expansion/contraction.
   - Soothing Web Audio singing bowl phase transition chimes and phone haptic vibration pulse.

10. **📝 Quick Scratchpad / Brain Dump Notepad**
    - Non-intrusive floating action button (FAB) for frictionless thought capturing while in flow.
    - Word & character counter with green active-note badge indicator.
    - 1-Tap **"Convert Line to Task"** bridge to priority checklist in Tab 3.
    - Copy to clipboard & clear with auto-save to local storage.

11. **🎧 Built-in Web Audio & Haptics**
    - 100% self-contained audio synthesis using Web Audio API (ambient soundscapes, chimes, bells).
    - Android haptic vibration (`navigator.vibrate`) integration.

12. **⚡ Advanced Service Worker & PWA Suite**
    - **Stale-While-Revalidate & Dynamic Font Caching**: Caches local assets and Google Fonts for full offline rendering.
    - **Real-Time Offline/Online Banner**: Live detection with visual toast and status bar indicator.
    - **Push & Timer Notifications**: Native alerts for Pomodoro timer sessions and daily routine milestone streaks.
    - **Background Sync API**: Queues routine actions and habit tracking while offline to sync automatically when reconnected.
    - **Rich PWA Manifest**: Includes unique `id`, `description`, `orientation: portrait-primary`, `theme_color` synchronization, shortcuts, and high-res showcase screenshots.

---

## 📁 Project Structure

```
Daily Activity/
├── Launch-App.bat           # 1-Click launcher to run as standalone desktop app
├── build-apk.bat            # 1-Click Android APK build script
├── capacitor.config.json    # Capacitor configuration for Android packaging
├── package.json             # NPM dependencies & helper scripts
├── server.js                # Lightweight Node.js local preview server
├── index.html               # Root redirect
├── android/                 # Native Android Gradle project
└── www/                     # Web app & mobile source code
    ├── index.html           # Main Android app interface
    ├── styles.css           # Glassmorphism & Material You design system
    ├── app.js               # Application logic, audio engine & state
    ├── manifest.json        # Rich PWA Web App Manifest
    ├── sw.js                # Offline Service Worker (Cache, Sync, Push)
    ├── icons/
    │   └── icon.svg         # App launcher icon
    └── screenshots/         # PWA store preview showcase screenshots
        ├── routine-mobile.jpg
        ├── timer-mobile.jpg
        └── dashboard-wide.jpg
```

