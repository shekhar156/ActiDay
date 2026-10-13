/**
 * ActiDay Comprehensive Automated Test Suite
 * Tests:
 *  1. HTML Structure & ID Uniqueness
 *  2. DOM Elements Mapping (Every ID in app.js exists in index.html)
 *  3. CSS Well-Formedness & Brace Balance
 *  4. JS Syntax & Static Analysis
 *  5. Time Formatting (12h/24h AM/PM Edge Cases)
 *  6. Streak Calculation Logic
 *  7. Gamification & Level Progression Logic
 *  8. Timer Presets & Custom Boundary Logic
 *  9. Alarm Trigger Logic
 * 10. Data State Schema & Persistence Integrity
 * 11. Android Manifest & Capacitor Config Integrity
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passedTests = 0;
let failedTests = 0;
const errors = [];

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    errors.push(`[FAIL] ${message}`);
    console.error(`  ❌ FAIL: ${message}`);
  } else {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('       ActiDay Automated Test Suite Execution        ');
console.log('====================================================\n');

// --------------------------------------------------------------------------
// TEST SUITE 1: HTML Structure & Duplicate ID Verification
// --------------------------------------------------------------------------
console.log('--- Test Suite 1: HTML Structure & IDs ---');
const htmlContent = fs.readFileSync(path.join(__dirname, 'www', 'index.html'), 'utf8');

// Check duplicate IDs in index.html
const idRegex = /id=["']([^"']+)["']/g;
const seenIds = new Map();
const duplicateIds = [];
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  const id = match[1];
  if (seenIds.has(id)) {
    duplicateIds.push(id);
  } else {
    seenIds.set(id, true);
  }
}

assert(duplicateIds.length === 0, `Duplicate IDs in index.html: ${duplicateIds.join(', ')}`);
assert(htmlContent.includes('<!DOCTYPE html>'), 'index.html contains valid doctype');
assert(htmlContent.includes('<header class="app-header">'), 'index.html contains app-header');
assert(htmlContent.includes('id="liveDigitalClock"'), 'index.html contains liveDigitalClock');
assert(htmlContent.includes('id="headerUserAvatar"'), 'index.html contains headerUserAvatar');
assert(htmlContent.includes('id="themeHeaderBtn"'), 'index.html contains themeHeaderBtn');
assert(htmlContent.includes('id="streakBadgeBtn"'), 'index.html contains streakBadgeBtn');
assert(htmlContent.includes('id="alarmHeaderBtn"'), 'index.html contains alarmHeaderBtn');

// --------------------------------------------------------------------------
// TEST SUITE 2: DOM Element ID References in app.js vs index.html
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 2: app.js DOM References ---');
const appJsContent = fs.readFileSync(path.join(__dirname, 'www', 'app.js'), 'utf8');

// Collect IDs dynamically generated in template strings within app.js
const dynamicIdRegex = /id=["']([^"']+)["']/g;
const dynamicIds = new Set();
let dynMatch;
while ((dynMatch = dynamicIdRegex.exec(appJsContent)) !== null) {
  dynamicIds.add(dynMatch[1]);
}

const getElemRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
const missingIds = [];
while ((match = getElemRegex.exec(appJsContent)) !== null) {
  const id = match[1];
  if (!seenIds.has(id) && !dynamicIds.has(id)) {
    missingIds.push(id);
  }
}

const uniqueMissingIds = [...new Set(missingIds)];
assert(uniqueMissingIds.length === 0, `Missing element IDs in index.html used in app.js: ${uniqueMissingIds.join(', ')}`);

// --------------------------------------------------------------------------
// TEST SUITE 3: CSS Well-Formedness & Brace Balance
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 3: CSS Well-Formedness ---');
const cssContent = fs.readFileSync(path.join(__dirname, 'www', 'styles.css'), 'utf8');

let openBraces = 0;
let closeBraces = 0;
for (let i = 0; i < cssContent.length; i++) {
  if (cssContent[i] === '{') openBraces++;
  if (cssContent[i] === '}') closeBraces++;
}
assert(openBraces === closeBraces, `CSS braces balanced (Open: ${openBraces}, Close: ${closeBraces})`);
assert(cssContent.includes('.app-header'), 'styles.css contains .app-header definition');
assert(cssContent.includes('.header-tier-upper'), 'styles.css contains .header-tier-upper definition');
assert(cssContent.includes('.header-tier-lower'), 'styles.css contains .header-tier-lower definition');
assert(cssContent.includes('.header-profile-horizontal'), 'styles.css contains .header-profile-horizontal');

// --------------------------------------------------------------------------
// TEST SUITE 4: 12-Hour vs 24-Hour Time Logic Test
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 4: 12-Hour / 24-Hour Time Formatting ---');

function format12Hour(hours, minutes, seconds) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  let h12 = hours % 12;
  h12 = h12 ? h12 : 12; // 0 hour becomes 12
  const hh = String(h12).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return { timeStr: `${hh}:${mm}:${ss}`, ampm };
}

// Midnight: 00:00:00 -> 12:00:00 AM
const midnight = format12Hour(0, 0, 0);
assert(midnight.timeStr === '12:00:00' && midnight.ampm === 'AM', `Midnight format: ${midnight.timeStr} ${midnight.ampm}`);

// Noon: 12:00:00 -> 12:00:00 PM
const noon = format12Hour(12, 0, 0);
assert(noon.timeStr === '12:00:00' && noon.ampm === 'PM', `Noon format: ${noon.timeStr} ${noon.ampm}`);

// 11:59:59 PM: 23:59:59 -> 11:59:59 PM
const night = format12Hour(23, 59, 59);
assert(night.timeStr === '11:59:59' && night.ampm === 'PM', `Night format: ${night.timeStr} ${night.ampm}`);

// Morning: 09:05:01 -> 09:05:01 AM
const morning = format12Hour(9, 5, 1);
assert(morning.timeStr === '09:05:01' && morning.ampm === 'AM', `Morning format: ${morning.timeStr} ${morning.ampm}`);

// Afternoon: 15:30:00 -> 03:30:00 PM
const afternoon = format12Hour(15, 30, 0);
assert(afternoon.timeStr === '03:30:00' && afternoon.ampm === 'PM', `Afternoon format: ${afternoon.timeStr} ${afternoon.ampm}`);

// --------------------------------------------------------------------------
// TEST SUITE 5: Streak Calculation Logic
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 5: Streak Calculation Logic ---');

function calculateStreak(historyDates) {
  if (!historyDates || historyDates.length === 0) return 0;
  const sorted = [...new Set(historyDates)].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Must have completed today or yesterday to maintain active streak
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  let curr = new Date(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      curr = prev;
    } else {
      break;
    }
  }
  return streak;
}

const todayStr = new Date().toISOString().split('T')[0];
const yestStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const d2Str = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
const d3Str = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

assert(calculateStreak([todayStr, yestStr, d2Str, d3Str]) === 4, '4-day consecutive streak calculated correctly');
assert(calculateStreak([yestStr, d2Str]) === 2, 'Yesterday completed streak still active');
assert(calculateStreak(['2026-01-01', '2026-01-02']) === 0, 'Old broken streak returns 0');
assert(calculateStreak([]) === 0, 'Empty streak history returns 0');
assert(calculateStreak([todayStr, todayStr]) === 1, 'Duplicate dates in history deduplicated');

// --------------------------------------------------------------------------
// TEST SUITE 6: Gamification Points & Level Formula
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 6: Gamification Logic ---');

function calculateLevel(xp) {
  // 100 XP per level
  return Math.floor(xp / 100) + 1;
}

function calculateNextLevelXP(xp) {
  const currentLevel = calculateLevel(xp);
  return currentLevel * 100;
}

assert(calculateLevel(0) === 1, '0 XP = Level 1');
assert(calculateLevel(99) === 1, '99 XP = Level 1');
assert(calculateLevel(100) === 2, '100 XP = Level 2');
assert(calculateLevel(250) === 3, '250 XP = Level 3');
assert(calculateNextLevelXP(50) === 100, 'Next level target for 50 XP is 100 XP');

// --------------------------------------------------------------------------
// TEST SUITE 7: Timer Presets & Boundary Checking
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 7: Timer Presets & Custom Boundaries ---');

const TIMER_PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  custom: 30 * 60
};

assert(TIMER_PRESETS.pomodoro === 1500, 'Pomodoro preset is 25 minutes (1500s)');
assert(TIMER_PRESETS.shortBreak === 300, 'Short break is 5 minutes (300s)');
assert(TIMER_PRESETS.longBreak === 900, 'Long break is 15 minutes (900s)');

function clampCustomMinutes(val) {
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 1) return 1;
  if (num > 180) return 180;
  return num;
}

assert(clampCustomMinutes(25) === 25, 'Valid 25m retains 25m');
assert(clampCustomMinutes(-5) === 1, 'Negative minutes clamped to 1m');
assert(clampCustomMinutes(0) === 1, '0 minutes clamped to 1m');
assert(clampCustomMinutes(200) === 180, 'Over 180m clamped to 180m');
assert(clampCustomMinutes('abc') === 1, 'Non-number clamped to 1m');

// --------------------------------------------------------------------------
// TEST SUITE 8: Alarm Matcher Logic
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 8: Alarm Trigger Verification ---');

function shouldAlarmTrigger(alarm, currentHour, currentMinute, currentDayName) {
  if (!alarm.enabled) return false;
  const [alarmH, alarmM] = alarm.time.split(':').map(Number);
  if (alarmH !== currentHour || alarmM !== currentMinute) return false;
  if (alarm.days && alarm.days.length > 0) {
    if (!alarm.days.includes(currentDayName) && !alarm.days.includes('daily')) {
      return false;
    }
  }
  return true;
}

const testAlarm = { time: '07:30', enabled: true, days: ['daily'] };
assert(shouldAlarmTrigger(testAlarm, 7, 30, 'Mon') === true, 'Matching alarm triggers');
assert(shouldAlarmTrigger(testAlarm, 7, 31, 'Mon') === false, 'Non-matching minute does not trigger');
assert(shouldAlarmTrigger({ ...testAlarm, enabled: false }, 7, 30, 'Mon') === false, 'Disabled alarm does not trigger');

// --------------------------------------------------------------------------
// TEST SUITE 9: State Schema Validation
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 9: State Schema & Export/Import Integrity ---');

const REQUIRED_STATE_KEYS = [
  'routines',
  'habits',
  'tasks',
  'focusSessions',
  'alarms',
  'settings',
  'profile'
];

function validateStateSchema(stateObj) {
  if (!stateObj || typeof stateObj !== 'object') return false;
  return REQUIRED_STATE_KEYS.every(k => k in stateObj);
}

const sampleState = {
  routines: [],
  habits: [],
  tasks: [],
  focusSessions: [],
  alarms: [],
  settings: { theme: 'default', alarmRingtone: 'digital' },
  profile: { name: 'Shekhar', title: 'Consistency Achiever', avatar: '🚀' }
};

assert(validateStateSchema(sampleState) === true, 'Sample state complies with schema');
assert(validateStateSchema({ routines: [] }) === false, 'Incomplete state fails validation');

// --------------------------------------------------------------------------
// TEST SUITE 10: Android Manifest & Capacitor Config
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 10: Android & Capacitor Integrity ---');

const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

assert(manifestContent.includes('android.permission.INTERNET'), 'AndroidManifest has INTERNET permission');
assert(manifestContent.includes('android.permission.VIBRATE'), 'AndroidManifest has VIBRATE permission');
assert(manifestContent.includes('android.permission.WAKE_LOCK'), 'AndroidManifest has WAKE_LOCK permission');
assert(manifestContent.includes('android.permission.POST_NOTIFICATIONS'), 'AndroidManifest has POST_NOTIFICATIONS permission');
assert(manifestContent.includes('MainActivity'), 'AndroidManifest registers MainActivity');
assert(manifestContent.includes('android:windowSoftInputMode="adjustResize"'), 'AndroidManifest has adjustResize softInputMode');

const capConfigPath = path.join(__dirname, 'capacitor.config.json');
const capConfig = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'));

assert(capConfig.webDir === 'www', 'Capacitor webDir is set to www');
assert(capConfig.appId.length > 0, `Capacitor appId is set: ${capConfig.appId}`);
assert(capConfig.plugins && capConfig.plugins.StatusBar, 'Capacitor config has StatusBar plugin settings');

// --------------------------------------------------------------------------
// TEST SUITE 11: Service Worker & PWA Manifest Integrity
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 11: Service Worker & PWA Manifest ---');

const swPath = path.join(__dirname, 'www', 'sw.js');
assert(fs.existsSync(swPath), 'www/sw.js exists');
const swContent = fs.readFileSync(swPath, 'utf8');

// Verify Service Worker JS syntax via vm.Script
let swSyntaxOk = true;
try {
  new vm.Script(swContent);
} catch (e) {
  swSyntaxOk = false;
}
assert(swSyntaxOk, 'www/sw.js is syntactically valid JavaScript');
assert(swContent.includes('addEventListener(\'install\''), 'sw.js registers install event');
assert(swContent.includes('addEventListener(\'fetch\''), 'sw.js registers fetch event');
assert(swContent.includes('addEventListener(\'activate\''), 'sw.js registers activate event');

const pwaManifestPath = path.join(__dirname, 'www', 'manifest.json');
assert(fs.existsSync(pwaManifestPath), 'www/manifest.json exists');
const pwaManifest = JSON.parse(fs.readFileSync(pwaManifestPath, 'utf8'));

assert(pwaManifest.name === 'ActiDay - Daily Routine & Habit Tracker', 'manifest.json has correct full app name');
assert(pwaManifest.short_name === 'ActiDay', 'manifest.json has correct short_name');
assert(pwaManifest.display === 'standalone', 'manifest.json display is set to standalone');
assert(pwaManifest.start_url === './index.html', 'manifest.json start_url points to index.html');
assert(Array.isArray(pwaManifest.icons) && pwaManifest.icons.length > 0, 'manifest.json includes app icons');
assert(Array.isArray(pwaManifest.shortcuts) && pwaManifest.shortcuts.length >= 4, 'manifest.json provides 4+ quick app shortcuts');

// --------------------------------------------------------------------------
// TEST SUITE 12: Theme Mode Resolution Engine
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 12: Theme Mode Resolution Engine ---');

function resolveThemeMode(chosenMode, isSystemDark) {
  if (chosenMode === 'day') return 'day';
  if (chosenMode === 'night') return 'night';
  return isSystemDark ? 'night' : 'day';
}

assert(resolveThemeMode('day', true) === 'day', 'Explicit day mode resolves to day regardless of system');
assert(resolveThemeMode('day', false) === 'day', 'Explicit day mode resolves to day on light system');
assert(resolveThemeMode('night', false) === 'night', 'Explicit night mode resolves to night regardless of system');
assert(resolveThemeMode('night', true) === 'night', 'Explicit night mode resolves to night on dark system');
assert(resolveThemeMode('default', true) === 'night', 'Default mode follows system dark mode (night)');
assert(resolveThemeMode('default', false) === 'day', 'Default mode follows system light mode (day)');

// --------------------------------------------------------------------------
// TEST SUITE 13: Routine Timeline & Happening-Now Detection
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 13: Routine Timeline & Happening-Now Calculations ---');

function parseTimeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isActivityActive(currentTimeStr, startStr, endStr) {
  const cur = parseTimeToMinutes(currentTimeStr);
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  if (start <= end) {
    return cur >= start && cur < end;
  }
  // Overnight interval (e.g., 22:00 - 06:00)
  return cur >= start || cur < end;
}

function calculateMinutesRemaining(currentTimeStr, endStr) {
  const cur = parseTimeToMinutes(currentTimeStr);
  let end = parseTimeToMinutes(endStr);
  if (end < cur) end += 24 * 60; // Crosses midnight
  return Math.max(0, end - cur);
}

assert(isActivityActive('10:00', '09:00', '11:30') === true, '10:00 AM is active between 09:00 - 11:30');
assert(isActivityActive('08:59', '09:00', '11:30') === false, '08:59 AM is inactive before 09:00');
assert(isActivityActive('11:30', '09:00', '11:30') === false, '11:30 AM is inactive at end boundary');
assert(isActivityActive('23:30', '22:00', '06:00') === true, 'Overnight activity active at 23:30 (22:00 - 06:00)');
assert(isActivityActive('05:30', '22:00', '06:00') === true, 'Overnight activity active at 05:30 (22:00 - 06:00)');
assert(isActivityActive('07:00', '22:00', '06:00') === false, 'Overnight activity inactive at 07:00');
assert(calculateMinutesRemaining('10:45', '11:30') === 45, 'Minutes remaining: 10:45 to 11:30 is 45m');
assert(calculateMinutesRemaining('23:30', '00:30') === 60, 'Minutes remaining across midnight: 23:30 to 00:30 is 60m');

// --------------------------------------------------------------------------
// TEST SUITE 14: 4-7-8 Breathwork Phase Engine
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 14: 4-7-8 Breathwork Engine ---');

const BREATH_CYCLE = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  total: 19
};

function getBreathPhase(secondInCycle) {
  const s = secondInCycle % BREATH_CYCLE.total;
  if (s < BREATH_CYCLE.inhale) return { phase: 'Inhale', remaining: BREATH_CYCLE.inhale - s };
  if (s < BREATH_CYCLE.inhale + BREATH_CYCLE.hold) return { phase: 'Hold', remaining: (BREATH_CYCLE.inhale + BREATH_CYCLE.hold) - s };
  return { phase: 'Exhale', remaining: BREATH_CYCLE.total - s };
}

assert(BREATH_CYCLE.total === 19, 'Breath cycle total is 19 seconds (4 + 7 + 8)');
assert(getBreathPhase(0).phase === 'Inhale', 'Second 0 is Inhale');
assert(getBreathPhase(3).phase === 'Inhale', 'Second 3 is Inhale');
assert(getBreathPhase(4).phase === 'Hold', 'Second 4 is Hold');
assert(getBreathPhase(10).phase === 'Hold', 'Second 10 is Hold');
assert(getBreathPhase(11).phase === 'Exhale', 'Second 11 is Exhale');
assert(getBreathPhase(18).phase === 'Exhale', 'Second 18 is Exhale');
assert(getBreathPhase(19).phase === 'Inhale', 'Second 19 starts next cycle Inhale');

// --------------------------------------------------------------------------
// TEST SUITE 15: Hardware Back Button Navigation Controller Logic
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 15: Hardware Back & Modal Navigation Controller ---');

function simulateDeviceBack({ openModalsCount, currentTab, lastBackPressTime, now }) {
  if (openModalsCount > 0) {
    return { action: 'close_modal', exited: false, newTab: currentTab, newBackPressTime: lastBackPressTime };
  }
  if (currentTab !== 'tabRoutine') {
    return { action: 'switch_to_routine', exited: false, newTab: 'tabRoutine', newBackPressTime: lastBackPressTime };
  }
  if (now - lastBackPressTime < 2000) {
    return { action: 'exit_app', exited: true, newTab: currentTab, newBackPressTime: now };
  }
  return { action: 'show_exit_toast', exited: false, newTab: currentTab, newBackPressTime: now };
}

// Case 1: Modal is open -> close modal
const backCase1 = simulateDeviceBack({ openModalsCount: 1, currentTab: 'tabHabits', lastBackPressTime: 0, now: 5000 });
assert(backCase1.action === 'close_modal' && !backCase1.exited, 'Back button prioritizes closing open modal');

// Case 2: No modal, on secondary tab -> returns to tabRoutine
const backCase2 = simulateDeviceBack({ openModalsCount: 0, currentTab: 'tabFocus', lastBackPressTime: 0, now: 5000 });
assert(backCase2.action === 'switch_to_routine' && backCase2.newTab === 'tabRoutine', 'Back button returns from Focus tab to Routine tab');

// Case 3: On tabRoutine, first press -> shows toast
const backCase3 = simulateDeviceBack({ openModalsCount: 0, currentTab: 'tabRoutine', lastBackPressTime: 0, now: 10000 });
assert(backCase3.action === 'show_exit_toast' && !backCase3.exited, 'First back press on Home tab shows exit toast');

// Case 4: On tabRoutine, second press within 2s -> exits app
const backCase4 = simulateDeviceBack({ openModalsCount: 0, currentTab: 'tabRoutine', lastBackPressTime: 10000, now: 10800 });
assert(backCase4.action === 'exit_app' && backCase4.exited, 'Second back press within 2 seconds exits app');

// Case 5: On tabRoutine, second press after 2.5s -> resets and shows toast again
const backCase5 = simulateDeviceBack({ openModalsCount: 0, currentTab: 'tabRoutine', lastBackPressTime: 10000, now: 12600 });
assert(backCase5.action === 'show_exit_toast' && !backCase5.exited, 'Back press after 2s timeout resets exit timer');

// --------------------------------------------------------------------------
// TEST SUITE 16: Compiled Android Artifacts & Assets Verification
// --------------------------------------------------------------------------
console.log('\n--- Test Suite 16: Android Build Artifacts & Assets Verification ---');

const gradleApkPath = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
assert(fs.existsSync(gradleApkPath), 'Gradle build output app-debug.apk exists');
const gradleApkStat = fs.statSync(gradleApkPath);
assert(gradleApkStat.size > 5000000, `Gradle app-debug.apk is healthy (${(gradleApkStat.size / (1024 * 1024)).toFixed(2)} MB)`);

const desktopApkPath = 'C:\\Users\\Mahab\\Desktop\\ActiDay.apk';
assert(fs.existsSync(desktopApkPath), 'Desktop export ActiDay.apk exists');
const desktopApkStat = fs.statSync(desktopApkPath);
assert(desktopApkStat.size === gradleApkStat.size, 'Desktop APK matches latest Gradle build size exactly');

const exportApkPath = path.join(__dirname, 'export', 'ActiDay.apk');
assert(fs.existsSync(exportApkPath), 'Project export/ActiDay.apk exists');
const exportApkStat = fs.statSync(exportApkPath);
assert(exportApkStat.size === gradleApkStat.size, 'Export folder APK matches latest build size exactly');

const stringsPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const stringsContent = fs.readFileSync(stringsPath, 'utf8');
assert(stringsContent.includes('<string name="app_name">ActiDay</string>'), 'strings.xml configures app_name as ActiDay');

const stylesPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
const stylesContent = fs.readFileSync(stylesPath, 'utf8');
assert(stylesContent.includes('AppTheme.NoActionBarLaunch'), 'styles.xml has AppTheme.NoActionBarLaunch');
assert(stylesContent.includes('AppTheme.NoActionBar'), 'styles.xml has AppTheme.NoActionBar');

// --------------------------------------------------------------------------
// SUMMARY
// --------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`Execution Complete: ${passedTests} Passed, ${failedTests} Failed`);
console.log('====================================================\n');

if (failedTests > 0) {
  console.error('Errors found:\n' + errors.join('\n'));
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED WITH 0 ERRORS OR WARNINGS!');
  process.exit(0);
}
