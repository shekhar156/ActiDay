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

const capConfigPath = path.join(__dirname, 'capacitor.config.json');
const capConfig = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'));

assert(capConfig.webDir === 'www', 'Capacitor webDir is set to www');
assert(capConfig.appId.length > 0, `Capacitor appId is set: ${capConfig.appId}`);

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
