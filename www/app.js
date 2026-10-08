/**
 * DAILY ROUTINE & HABIT TRACKER - ANDROID MOBILE APP
 * Full Application Logic & State Engine
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATA STATE & PERSISTENCE
  // ==========================================================================
  const STORAGE_KEY = 'daily_routine_app_data_v2';

  const DEFAULT_DATA = {
    settings: {
      theme: 'theme-dark',
      soundEnabled: true,
      vibrationEnabled: true,
      alarmBellEnabled: true,
      metronomeEnabled: false,
      showDeviceFrame: true
    },
    routines: [
      {
        id: 'r1',
        title: 'Morning Sunlight & Hydration',
        startTime: '06:30',
        endTime: '07:00',
        category: 'Health',
        emoji: '☀️',
        notes: 'Drink 500ml warm water, 10 min outside sunlight',
        completed: true
      },
      {
        id: 'r2',
        title: 'Morning Workout & Stretch',
        startTime: '07:00',
        endTime: '08:00',
        category: 'Fitness',
        emoji: '🏋️',
        notes: 'Full body mobility and core workout',
        completed: true
      },
      {
        id: 'r3',
        title: 'Healthy Breakfast & Day Plan',
        startTime: '08:00',
        endTime: '08:45',
        category: 'Health',
        emoji: '🥑',
        notes: 'High protein breakfast, review top 3 tasks',
        completed: false
      },
      {
        id: 'r4',
        title: 'Deep Focus & Code / Study',
        startTime: '09:00',
        endTime: '12:30',
        category: 'Productivity',
        emoji: '💻',
        notes: 'No phone, pure flow state focus blocks',
        completed: false
      },
      {
        id: 'r5',
        title: 'Nutritious Lunch & Quick Walk',
        startTime: '12:30',
        endTime: '13:30',
        category: 'Health',
        emoji: '🥗',
        notes: 'Step away from screen, 15 min outdoor walk',
        completed: false
      },
      {
        id: 'r6',
        title: 'Afternoon Skills & Project Build',
        startTime: '14:00',
        endTime: '17:00',
        category: 'Study',
        emoji: '📚',
        notes: 'Android application building and revisions',
        completed: false
      },
      {
        id: 'r7',
        title: 'Evening Decompression & Family',
        startTime: '17:30',
        endTime: '19:30',
        category: 'Personal',
        emoji: '🌆',
        notes: 'Call family, hobbies, relaxation',
        completed: false
      },
      {
        id: 'r8',
        title: 'Dinner & Mindful Reflection',
        startTime: '19:30',
        endTime: '21:00',
        category: 'Mindfulness',
        emoji: '🍽️',
        notes: 'Light dinner, log gratitude in app',
        completed: false
      },
      {
        id: 'r9',
        title: 'Reading & Wind Down Sleep Prep',
        startTime: '21:30',
        endTime: '22:30',
        category: 'Mindfulness',
        emoji: '📖',
        notes: 'No blue light screens, read 20 pages',
        completed: false
      }
    ],
    habits: [
      {
        id: 'h1',
        title: 'Drink 8 Glasses of Water',
        emoji: '💧',
        type: 'counter',
        target: 8,
        current: 6,
        streak: 7,
        history: [true, true, true, true, true, true, false]
      },
      {
        id: 'h2',
        title: '30 Min Physical Exercise',
        emoji: '🏃',
        type: 'boolean',
        target: 1,
        current: 1,
        streak: 12,
        history: [true, true, true, true, true, true, true]
      },
      {
        id: 'h3',
        title: 'Read 15 Pages of a Book',
        emoji: '📚',
        type: 'boolean',
        target: 1,
        current: 0,
        streak: 5,
        history: [true, false, true, true, true, true, false]
      },
      {
        id: 'h4',
        title: '10 Min Meditation & Breathwork',
        emoji: '🧘',
        type: 'boolean',
        target: 1,
        current: 1,
        streak: 4,
        history: [false, true, true, true, true, false, true]
      }
    ],
    tasks: [
      {
        id: 't1',
        title: 'Review Android daily routine project structure',
        priority: 'high',
        completed: true
      },
      {
        id: 't2',
        title: 'Test offline mode and service worker',
        priority: 'high',
        completed: false
      },
      {
        id: 't3',
        title: 'Log daily focus sessions with timer',
        priority: 'medium',
        completed: false
      },
      {
        id: 't4',
        title: 'Set up evening gratitude journal',
        priority: 'low',
        completed: false
      }
    ],
    reflections: {
      mood: 'good',
      note: 'Had a strong start today! Staying consistent with morning routines.'
    },
    analytics: {
      totalFocusMinutes: 75,
      sessionsCompleted: 3,
      historyScores: [75, 80, 85, 90, 70, 85, 95]
    },
    gamification: {
      xp: 280,
      level: 2,
      unlockedBadges: ['streak_flame']
    },
    scratchpad: '',
    ambientSound: {
      current: null,
      volume: 0.65,
      autoSync: true
    }
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_DATA, ...parsed };
        if (!merged.gamification) merged.gamification = JSON.parse(JSON.stringify(DEFAULT_DATA.gamification));
        if (!merged.ambientSound) merged.ambientSound = JSON.parse(JSON.stringify(DEFAULT_DATA.ambientSound));
        if (typeof merged.scratchpad === 'undefined') merged.scratchpad = '';
        return merged;
      }
    } catch (e) {
      console.warn('Could not parse localStorage, falling back to default:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (!navigator.onLine && typeof triggerBackgroundSync === 'function') {
        triggerBackgroundSync();
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // ==========================================================================
  // 2. WEB AUDIO SYNTHESIZER ENGINE (Zero External Assets Required)
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft tactile UI click
  function playClickSound() {
    if (!state.settings.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {
      // Audio playback failsafe
    }
  }

  // Upward rising checkmark chime
  function playCheckmarkSound() {
    if (!state.settings.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Cheerful victory arpeggio
  function playCompletionSound() {
    if (!state.settings.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const start = audioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const noteStart = start + idx * 0.08;
        gain.gain.setValueAtTime(0.16, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.18);
      });
    } catch (e) {}
  }

  // Resonant Gong / Meditation Bell for Pomodoro
  function playTimerBell() {
    if (!state.settings.alarmBellEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const start = audioCtx.currentTime;
      const harmonics = [440, 880, 1320, 1760];
      harmonics.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        const vol = 0.25 / (i + 1);
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 2.5);
      });
    } catch (e) {}
  }

  // Metronome tick
  function playTickSound() {
    if (!state.settings.metronomeEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } catch (e) {}
  }

  // Soft Singing Bowl Chime for 4-7-8 Breathing Phase Transitions
  function playBreathingChime(pitch = 528) {
    if (!state.settings.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  }

  // ==========================================================================
  // AMBIENT SOUNDSCAPES SYNTHESIS ENGINE (Rain, Ocean, Cafe, Forest, Brown Noise)
  // Zero external MP3 files required — 100% offline & instantaneous
  // ==========================================================================
  let ambientSource = null;
  let ambientGain = null;
  let ambientFilter = null;
  let ambientLFO = null;
  let ambientLFOGain = null;
  let ambientAuxInterval = null;
  let isAmbientPlaying = false;

  function createNoiseBuffer(duration = 5, color = 'white') {
    if (!audioCtx) initAudio();
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'brown') {
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        output[i] = lastOut * 3.5;
      } else if (color === 'pink') {
        output[i] = (white + lastOut) * 0.5;
        lastOut = white;
      } else {
        output[i] = white;
      }
    }
    return buffer;
  }

  function stopAmbientSound(fadeTime = 0.3) {
    if (ambientAuxInterval) {
      clearInterval(ambientAuxInterval);
      ambientAuxInterval = null;
    }
    if (ambientGain && audioCtx) {
      try {
        const now = audioCtx.currentTime;
        ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
        ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeTime);
      } catch (e) {}
    }
    setTimeout(() => {
      if (ambientSource) {
        try { ambientSource.stop(); ambientSource.disconnect(); } catch (e) {}
        ambientSource = null;
      }
      if (ambientLFO) {
        try { ambientLFO.stop(); ambientLFO.disconnect(); } catch (e) {}
        ambientLFO = null;
      }
      if (ambientLFOGain) {
        try { ambientLFOGain.disconnect(); } catch (e) {}
        ambientLFOGain = null;
      }
      if (ambientFilter) {
        try { ambientFilter.disconnect(); } catch (e) {}
        ambientFilter = null;
      }
      if (ambientGain) {
        try { ambientGain.disconnect(); } catch (e) {}
        ambientGain = null;
      }
      isAmbientPlaying = false;
      updateAmbientUI();
    }, fadeTime * 1000 + 30);
  }

  function playAmbientSound(type) {
    initAudio();
    if (!audioCtx) return;

    if (isAmbientPlaying) {
      const wasSame = state.ambientSound.current === type;
      stopAmbientSound(0.2);
      if (wasSame) {
        state.ambientSound.current = null;
        saveState();
        updateAmbientUI();
        showToast('Ambient sound stopped', 'normal');
        return;
      }
    }

    state.ambientSound.current = type;
    saveState();

    setTimeout(() => {
      if (!state.ambientSound.current) return;
      initAudio();
      const now = audioCtx.currentTime;
      const targetVol = (state.ambientSound.volume || 0.65) * 0.25;

      ambientGain = audioCtx.createGain();
      ambientGain.gain.setValueAtTime(0.001, now);
      ambientGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetVol), now + 0.8);
      ambientGain.connect(audioCtx.destination);

      if (type === 'rain') {
        const buffer = createNoiseBuffer(4, 'pink');
        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        ambientFilter = audioCtx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.setValueAtTime(1400, now);
        ambientFilter.Q.setValueAtTime(1.2, now);

        ambientSource.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientSource.start(now);

        // Soft intermittent raindrops
        ambientAuxInterval = setInterval(() => {
          if (!isAmbientPlaying || !audioCtx) return;
          try {
            const dropTime = audioCtx.currentTime;
            const dropOsc = audioCtx.createOscillator();
            const dropGain = audioCtx.createGain();
            dropOsc.type = 'sine';
            const freq = 1200 + Math.random() * 1200;
            dropOsc.frequency.setValueAtTime(freq, dropTime);
            dropOsc.frequency.exponentialRampToValueAtTime(300, dropTime + 0.04);
            dropGain.gain.setValueAtTime(targetVol * 0.35, dropTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.04);
            dropOsc.connect(dropGain);
            dropGain.connect(ambientGain);
            dropOsc.start(dropTime);
            dropOsc.stop(dropTime + 0.05);
          } catch (e) {}
        }, 180);

      } else if (type === 'ocean') {
        const buffer = createNoiseBuffer(6, 'brown');
        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        ambientFilter = audioCtx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.setValueAtTime(450, now);
        ambientFilter.Q.setValueAtTime(2.0, now);

        // LFO for surf wave swells (slow 7.5s cycle)
        ambientLFO = audioCtx.createOscillator();
        ambientLFO.frequency.setValueAtTime(0.13, now);
        ambientLFOGain = audioCtx.createGain();
        ambientLFOGain.gain.setValueAtTime(350, now);

        ambientLFO.connect(ambientLFOGain);
        ambientLFOGain.connect(ambientFilter.frequency);

        ambientSource.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientLFO.start(now);
        ambientSource.start(now);

      } else if (type === 'cafe') {
        const buffer = createNoiseBuffer(5, 'brown');
        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        ambientFilter = audioCtx.createBiquadFilter();
        ambientFilter.type = 'bandpass';
        ambientFilter.frequency.setValueAtTime(650, now);
        ambientFilter.Q.setValueAtTime(0.8, now);

        ambientSource.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientSource.start(now);

        ambientAuxInterval = setInterval(() => {
          if (!isAmbientPlaying || !audioCtx) return;
          if (Math.random() > 0.4) return;
          try {
            const clinkTime = audioCtx.currentTime;
            const clinkOsc = audioCtx.createOscillator();
            const clinkGain = audioCtx.createGain();
            clinkOsc.type = 'triangle';
            const freq = 2800 + Math.random() * 800;
            clinkOsc.frequency.setValueAtTime(freq, clinkTime);
            clinkGain.gain.setValueAtTime(targetVol * 0.15, clinkTime);
            clinkGain.gain.exponentialRampToValueAtTime(0.0001, clinkTime + 0.12);
            clinkOsc.connect(clinkGain);
            clinkGain.connect(ambientGain);
            clinkOsc.start(clinkTime);
            clinkOsc.stop(clinkTime + 0.13);
          } catch (e) {}
        }, 1200);

      } else if (type === 'forest') {
        const buffer = createNoiseBuffer(5, 'pink');
        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        ambientFilter = audioCtx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.setValueAtTime(900, now);
        ambientFilter.Q.setValueAtTime(0.6, now);

        ambientSource.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientSource.start(now);

        ambientAuxInterval = setInterval(() => {
          if (!isAmbientPlaying || !audioCtx) return;
          if (Math.random() > 0.45) return;
          try {
            const birdTime = audioCtx.currentTime;
            const bOsc = audioCtx.createOscillator();
            const bGain = audioCtx.createGain();
            bOsc.type = 'sine';
            const baseF = 2600 + Math.random() * 600;
            bOsc.frequency.setValueAtTime(baseF, birdTime);
            bOsc.frequency.linearRampToValueAtTime(baseF + 400, birdTime + 0.05);
            bOsc.frequency.linearRampToValueAtTime(baseF - 200, birdTime + 0.12);
            bGain.gain.setValueAtTime(targetVol * 0.22, birdTime);
            bGain.gain.exponentialRampToValueAtTime(0.0001, birdTime + 0.14);
            bOsc.connect(bGain);
            bGain.connect(ambientGain);
            bOsc.start(birdTime);
            bOsc.stop(birdTime + 0.15);
          } catch (e) {}
        }, 1500);

      } else { // 'brown'
        const buffer = createNoiseBuffer(5, 'brown');
        ambientSource = audioCtx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;

        ambientFilter = audioCtx.createBiquadFilter();
        ambientFilter.type = 'lowpass';
        ambientFilter.frequency.setValueAtTime(700, now);
        ambientFilter.Q.setValueAtTime(0.5, now);

        ambientSource.connect(ambientFilter);
        ambientFilter.connect(ambientGain);
        ambientSource.start(now);
      }

      isAmbientPlaying = true;
      updateAmbientUI();
      showToast(`🎧 Playing ${type.toUpperCase()} ambient soundscape`, 'normal');
    }, 240);
  }

  function setAmbientVolume(valRatio) {
    state.ambientSound.volume = valRatio;
    saveState();
    if (ambientGain && audioCtx && isAmbientPlaying) {
      try {
        const targetVol = valRatio * 0.25;
        ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(Math.max(0.0001, targetVol), audioCtx.currentTime + 0.05);
      } catch (e) {}
    }
  }

  function updateAmbientUI() {
    if (!el.ambientTileBtns) return;
    el.ambientTileBtns.forEach(btn => {
      const snd = btn.getAttribute('data-sound');
      if (isAmbientPlaying && state.ambientSound.current === snd) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (el.ambientMasterToggleBtn) {
      el.ambientMasterToggleBtn.textContent = isAmbientPlaying ? '⏹️ Stop Sound' : '▶ Play Ambient';
    }
  }

  // Haptic Feedback for Android Mobile
  function triggerVibrate(pattern = [40]) {
    if (!state.settings.vibrationEnabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Floating Toast Alert
  function showToast(message, type = 'normal') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = '✨';
    if (type === 'success') icon = '🎉';
    if (type === 'alert') icon = '🔔';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  window.showAppToast = showToast;

  // ==========================================================================
  // 3. UI ELEMENT REFERENCES
  // ==========================================================================
  const el = {
    // Header & Status
    statusClock: document.getElementById('statusClock'),
    liveDigitalClock: document.getElementById('liveDigitalClock'),
    currentDateBadge: document.getElementById('currentDateBadge'),
    greetingHeading: document.getElementById('greetingHeading'),
    headerStreakCount: document.getElementById('headerStreakCount'),
    networkStatusIcon: document.getElementById('networkStatusIcon'),
    wifiStatusIcon: document.getElementById('wifiStatusIcon'),
    notifToggleBtn: document.getElementById('notifToggleBtn'),
    notifIcon: document.getElementById('notifIcon'),
    connectivityToast: document.getElementById('connectivityToast'),
    connectivityDot: document.getElementById('connectivityDot'),
    connectivityText: document.getElementById('connectivityText'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),
    settingsBtn: document.getElementById('settingsBtn'),
    headerProgressPercent: document.getElementById('headerProgressPercent'),
    headerRingProgress: document.getElementById('headerRingProgress'),

    // Hero Active Routine
    heroTimeRemaining: document.getElementById('heroTimeRemaining'),
    heroActivityEmoji: document.getElementById('heroActivityEmoji'),
    heroActivityTitle: document.getElementById('heroActivityTitle'),
    heroActivityInterval: document.getElementById('heroActivityInterval'),
    heroCategoryTag: document.getElementById('heroCategoryTag'),
    heroProgressBar: document.getElementById('heroProgressBar'),
    heroStartTimerBtn: document.getElementById('heroStartTimerBtn'),
    heroCompleteBtn: document.getElementById('heroCompleteBtn'),

    // Tab 1: Routine
    routineTimelineList: document.getElementById('routineTimelineList'),
    routineFilterBtns: document.querySelectorAll('.routine-filter-bar .filter-pill'),
    openAddRoutineModalBtn: document.getElementById('openAddRoutineModalBtn'),

    // Tab 2: Habits
    habitsList: document.getElementById('habitsList'),
    longestStreakDisplay: document.getElementById('longestStreakDisplay'),
    openAddHabitModalBtn: document.getElementById('openAddHabitModalBtn'),

    // Tab 3: Tasks
    tasksList: document.getElementById('tasksList'),
    quickTaskInput: document.getElementById('quickTaskInput'),
    quickTaskPriority: document.getElementById('quickTaskPriority'),
    quickAddTaskBtn: document.getElementById('quickAddTaskBtn'),
    clearCompletedTasksBtn: document.getElementById('clearCompletedTasksBtn'),
    taskFilterBtns: document.querySelectorAll('.tasks-filter-bar .filter-pill'),
    taskCountAll: document.getElementById('taskCountAll'),
    taskCountPending: document.getElementById('taskCountPending'),

    // Tab 4: Focus Timer
    timerModeBtns: document.querySelectorAll('.timer-mode-btn'),
    timerDigits: document.getElementById('timerDigits'),
    timerSubStatus: document.getElementById('timerSubStatus'),
    timerSessionBadge: document.getElementById('timerSessionBadge'),
    timerProgressRing: document.getElementById('timerProgressRing'),
    timerPlayBtn: document.getElementById('timerPlayBtn'),
    timerResetBtn: document.getElementById('timerResetBtn'),
    timerSkipBtn: document.getElementById('timerSkipBtn'),
    timerAlarmToggle: document.getElementById('timerAlarmToggle'),
    timerVibrationToggle: document.getElementById('timerVibrationToggle'),
    timerTickToggle: document.getElementById('timerTickToggle'),

    // Tab 5: Insights
    moodBtns: document.querySelectorAll('.mood-btn'),
    dailyReflectionNote: document.getElementById('dailyReflectionNote'),
    journalSaveStatus: document.getElementById('journalSaveStatus'),
    weeklyChartCanvas: document.getElementById('weeklyChartCanvas'),
    weeklyAverageRate: document.getElementById('weeklyAverageRate'),
    statRoutinesCompleted: document.getElementById('statRoutinesCompleted'),
    statHabitsCompleted: document.getElementById('statHabitsCompleted'),
    statFocusMinutes: document.getElementById('statFocusMinutes'),
    statTasksDone: document.getElementById('statTasksDone'),
    resetDayConfirmBtn: document.getElementById('resetDayConfirmBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    importFileInput: document.getElementById('importFileInput'),

    // Navigation & Device
    navTabs: document.querySelectorAll('.bottom-nav-bar .nav-tab'),
    tabViews: document.querySelectorAll('.tab-view'),
    deviceWrapper: document.getElementById('deviceWrapper'),

    // Modals
    routineModal: document.getElementById('routineModal'),
    routineForm: document.getElementById('routineForm'),
    routineEditId: document.getElementById('routineEditId'),
    routineTitleInput: document.getElementById('routineTitleInput'),
    routineStartTimeInput: document.getElementById('routineStartTimeInput'),
    routineEndTimeInput: document.getElementById('routineEndTimeInput'),
    routineCategoryInput: document.getElementById('routineCategoryInput'),
    routineEmojiInput: document.getElementById('routineEmojiInput'),
    routineNotesInput: document.getElementById('routineNotesInput'),
    closeRoutineModalBtn: document.getElementById('closeRoutineModalBtn'),
    cancelRoutineModalBtn: document.getElementById('cancelRoutineModalBtn'),

    habitModal: document.getElementById('habitModal'),
    habitForm: document.getElementById('habitForm'),
    habitEditId: document.getElementById('habitEditId'),
    habitTitleInput: document.getElementById('habitTitleInput'),
    habitEmojiInput: document.getElementById('habitEmojiInput'),
    habitTypeInput: document.getElementById('habitTypeInput'),
    habitTargetInput: document.getElementById('habitTargetInput'),
    habitTargetGroup: document.getElementById('habitTargetGroup'),
    closeHabitModalBtn: document.getElementById('closeHabitModalBtn'),
    cancelHabitModalBtn: document.getElementById('cancelHabitModalBtn'),

    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    doneSettingsModalBtn: document.getElementById('doneSettingsModalBtn'),
    themeSelect: document.getElementById('themeSelect'),
    testSoundBtn: document.getElementById('testSoundBtn'),
    testVibrateBtn: document.getElementById('testVibrateBtn'),
    toggleDeviceFrameBtn: document.getElementById('toggleDeviceFrameBtn'),

    // Gamification & Header Level
    headerLevelBtn: document.getElementById('headerLevelBtn'),
    headerLevelText: document.getElementById('headerLevelText'),

    // Routine Presets & Top actions
    openTemplatesModalBtn: document.getElementById('openTemplatesModalBtn'),
    openAddRoutineTopBtn: document.getElementById('openAddRoutineTopBtn'),

    // Ambient Soundscapes
    ambientMasterToggleBtn: document.getElementById('ambientMasterToggleBtn'),
    ambientTileBtns: document.querySelectorAll('.ambient-tile-btn'),
    ambientVolumeSlider: document.getElementById('ambientVolumeSlider'),
    ambientVolumeVal: document.getElementById('ambientVolumeVal'),
    ambientAutoSyncToggle: document.getElementById('ambientAutoSyncToggle'),
    openBreathingModalBtn: document.getElementById('openBreathingModalBtn'),

    // Scratchpad FAB & Drawer
    fabScratchpadBtn: document.getElementById('fabScratchpadBtn'),
    fabNoteDot: document.getElementById('fabNoteDot'),
    scratchpadModal: document.getElementById('scratchpadModal'),
    closeScratchpadModalBtn: document.getElementById('closeScratchpadModalBtn'),
    closeScratchpadDoneBtn: document.getElementById('closeScratchpadDoneBtn'),
    scratchpadTextarea: document.getElementById('scratchpadTextarea'),
    scratchpadSaveStatus: document.getElementById('scratchpadSaveStatus'),
    scratchpadWordCount: document.getElementById('scratchpadWordCount'),
    convertLineToTaskBtn: document.getElementById('convertLineToTaskBtn'),
    copyScratchpadBtn: document.getElementById('copyScratchpadBtn'),
    clearScratchpadBtn: document.getElementById('clearScratchpadBtn'),

    // Badges Modal
    badgesModal: document.getElementById('badgesModal'),
    closeBadgesModalBtn: document.getElementById('closeBadgesModalBtn'),
    closeBadgesModalDoneBtn: document.getElementById('closeBadgesModalDoneBtn'),
    modalLevelEmoji: document.getElementById('modalLevelEmoji'),
    modalLevelTitle: document.getElementById('modalLevelTitle'),
    modalLevelNumber: document.getElementById('modalLevelNumber'),
    modalCurrentXP: document.getElementById('modalCurrentXP'),
    modalLevelProgressBar: document.getElementById('modalLevelProgressBar'),
    modalXPToNext: document.getElementById('modalXPToNext'),
    modalLevelNextTitle: document.getElementById('modalLevelNextTitle'),
    unlockedBadgesCount: document.getElementById('unlockedBadgesCount'),
    badgesGrid: document.getElementById('badgesGrid'),

    // Templates Modal
    templatesModal: document.getElementById('templatesModal'),
    closeTemplatesModalBtn: document.getElementById('closeTemplatesModalBtn'),
    templatesList: document.getElementById('templatesList'),
    previewTemplateTitle: document.getElementById('previewTemplateTitle'),
    previewTemplateCount: document.getElementById('previewTemplateCount'),
    previewItemsList: document.getElementById('previewItemsList'),
    appendTemplateBtn: document.getElementById('appendTemplateBtn'),
    replaceTemplateBtn: document.getElementById('replaceTemplateBtn'),

    // Breathing Modal
    breathingModal: document.getElementById('breathingModal'),
    closeBreathingModalBtn: document.getElementById('closeBreathingModalBtn'),
    patternPills: document.querySelectorAll('.pattern-pill'),
    breathingGlowRing: document.getElementById('breathingGlowRing'),
    breathingOrb: document.getElementById('breathingOrb'),
    breathingPhaseText: document.getElementById('breathingPhaseText'),
    breathingCounterNum: document.getElementById('breathingCounterNum'),
    breathingCycleLabel: document.getElementById('breathingCycleLabel'),
    breathingGuideTip: document.getElementById('breathingGuideTip'),
    resetBreathingBtn: document.getElementById('resetBreathingBtn'),
    toggleBreathingBtn: document.getElementById('toggleBreathingBtn')
  };

  // State filters
  let currentRoutineFilter = 'all';
  let currentTaskFilter = 'all';

  // ==========================================================================
  // 4. CLOCK & ACTIVE ROUTINE SCHEDULER
  // ==========================================================================
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${mins}:${secs}`;
    const shortTime = `${hours}:${mins}`;

    if (el.liveDigitalClock) el.liveDigitalClock.textContent = timeStr;
    if (el.statusClock) el.statusClock.textContent = shortTime;

    // Date formatting
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();

    if (el.currentDateBadge) {
      el.currentDateBadge.textContent = `${dayName}, ${monthName} ${dateNum}`;
    }

    // Dynamic greeting
    const h = now.getHours();
    let greeting = 'Hello, Achiever ✨';
    if (h >= 5 && h < 12) greeting = 'Good Morning ☀️';
    else if (h >= 12 && h < 17) greeting = 'Good Afternoon 🌤️';
    else if (h >= 17 && h < 21) greeting = 'Good Evening 🌆';
    else greeting = 'Night Wind Down 🌙';
    if (el.greetingHeading) el.greetingHeading.textContent = greeting;

    // Update active routine analysis
    evaluateActiveRoutine(now);
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  let currentActiveRoutineObj = null;

  function evaluateActiveRoutine(now) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const routines = state.routines;

    let activeItem = null;
    let nextItem = null;
    let smallestFutureDiff = Infinity;

    for (const r of routines) {
      const startMins = parseTimeToMinutes(r.startTime);
      const endMins = parseTimeToMinutes(r.endTime);

      if (currentMins >= startMins && currentMins < endMins) {
        activeItem = r;
        break;
      } else if (startMins > currentMins && (startMins - currentMins) < smallestFutureDiff) {
        smallestFutureDiff = startMins - currentMins;
        nextItem = r;
      }
    }

    currentActiveRoutineObj = activeItem;

    if (activeItem) {
      const startMins = parseTimeToMinutes(activeItem.startTime);
      const endMins = parseTimeToMinutes(activeItem.endTime);
      const totalDuration = endMins - startMins;
      const elapsed = currentMins - startMins;
      const remaining = endMins - currentMins;
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

      if (el.heroActivityEmoji) el.heroActivityEmoji.textContent = activeItem.emoji || '⚡';
      if (el.heroActivityTitle) el.heroActivityTitle.textContent = activeItem.title;
      if (el.heroActivityInterval) el.heroActivityInterval.textContent = `${activeItem.startTime} - ${activeItem.endTime}`;
      if (el.heroCategoryTag) el.heroCategoryTag.textContent = activeItem.category;
      if (el.heroTimeRemaining) el.heroTimeRemaining.textContent = `${remaining}m remaining`;
      if (el.heroProgressBar) el.heroProgressBar.style.width = `${pct}%`;
      if (el.heroCompleteBtn) {
        el.heroCompleteBtn.textContent = activeItem.completed ? '✓ Completed' : '✓ Mark Done';
        el.heroCompleteBtn.className = activeItem.completed ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';
      }
    } else if (nextItem) {
      if (el.heroActivityEmoji) el.heroActivityEmoji.textContent = '⏳';
      if (el.heroActivityTitle) el.heroActivityTitle.textContent = `Next Up: ${nextItem.title}`;
      if (el.heroActivityInterval) el.heroActivityInterval.textContent = `Starts at ${nextItem.startTime}`;
      if (el.heroCategoryTag) el.heroCategoryTag.textContent = nextItem.category;
      if (el.heroTimeRemaining) el.heroTimeRemaining.textContent = `In ${smallestFutureDiff}m`;
      if (el.heroProgressBar) el.heroProgressBar.style.width = '0%';
      if (el.heroCompleteBtn) {
        el.heroCompleteBtn.textContent = 'Ready';
        el.heroCompleteBtn.className = 'btn btn-secondary btn-sm';
      }
    } else {
      if (el.heroActivityEmoji) el.heroActivityEmoji.textContent = '🌟';
      if (el.heroActivityTitle) el.heroActivityTitle.textContent = 'All Set For Today';
      if (el.heroActivityInterval) el.heroActivityInterval.textContent = 'Take time to relax and recharge';
      if (el.heroCategoryTag) el.heroCategoryTag.textContent = 'Free Time';
      if (el.heroTimeRemaining) el.heroTimeRemaining.textContent = 'Enjoy!';
      if (el.heroProgressBar) el.heroProgressBar.style.width = '100%';
      if (el.heroCompleteBtn) {
        el.heroCompleteBtn.textContent = 'Well Done';
        el.heroCompleteBtn.className = 'btn btn-secondary btn-sm';
      }
    }

    updateOverallProgress();
  }

  function updateOverallProgress() {
    const total = state.routines.length;
    if (total === 0) {
      if (el.headerProgressPercent) el.headerProgressPercent.textContent = '0%';
      if (el.headerRingProgress) el.headerRingProgress.setAttribute('stroke-dasharray', '0, 100');
      return;
    }
    const completed = state.routines.filter(r => r.completed).length;
    const pct = Math.round((completed / total) * 100);

    if (el.headerProgressPercent) el.headerProgressPercent.textContent = `${pct}%`;
    if (el.headerRingProgress) {
      el.headerRingProgress.setAttribute('stroke-dasharray', `${pct}, 100`);
    }

    if (el.statRoutinesCompleted) el.statRoutinesCompleted.textContent = completed;
  }

  // ==========================================================================
  // 5. TAB 1: ROUTINES CONTROLLER
  // ==========================================================================
  function renderRoutines() {
    if (!el.routineTimelineList) return;
    el.routineTimelineList.innerHTML = '';

    const sorted = [...state.routines].sort((a, b) => {
      return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
    });

    const filtered = sorted.filter(r => {
      if (currentRoutineFilter === 'all') return true;
      const startH = parseInt(r.startTime.split(':')[0], 10);
      if (currentRoutineFilter === 'morning') return startH >= 5 && startH < 12;
      if (currentRoutineFilter === 'afternoon') return startH >= 12 && startH < 17;
      if (currentRoutineFilter === 'evening') return startH >= 17 && startH < 21;
      if (currentRoutineFilter === 'night') return startH >= 21 || startH < 5;
      return true;
    });

    if (filtered.length === 0) {
      el.routineTimelineList.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <p style="font-size: 2rem; margin-bottom: 8px;">📋</p>
          <p>No routines in this section yet.</p>
          <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" id="emptyAddRoutineBtn">+ Add Activity</button>
        </div>
      `;
      const emptyBtn = document.getElementById('emptyAddRoutineBtn');
      if (emptyBtn) emptyBtn.addEventListener('click', openAddRoutineModal);
      return;
    }

    filtered.forEach(r => {
      const card = document.createElement('div');
      const isActive = currentActiveRoutineObj && currentActiveRoutineObj.id === r.id;
      card.className = `routine-card ${r.completed ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`;

      card.innerHTML = `
        <button class="routine-checkbox" data-id="${r.id}" title="Toggle Completed">
          ${r.completed ? '✓' : ''}
        </button>
        <div class="routine-emoji-wrap">${r.emoji || '⚡'}</div>
        <div class="routine-info-col">
          <div class="routine-time-row">
            <span class="routine-time-text">${r.startTime} - ${r.endTime}</span>
            <span class="category-badge">${r.category}</span>
          </div>
          <div class="routine-item-title">${escapeHTML(r.title)}</div>
        </div>
        <div class="routine-actions">
          <button class="action-icon-btn edit-routine-btn" data-id="${r.id}" title="Edit Activity">✏️</button>
          <button class="action-icon-btn del-routine-btn" data-id="${r.id}" title="Delete Activity">🗑️</button>
        </div>
      `;

      el.routineTimelineList.appendChild(card);
    });

    // Event listeners
    el.routineTimelineList.querySelectorAll('.routine-checkbox').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleRoutineCompleted(id);
      });
    });

    el.routineTimelineList.querySelectorAll('.edit-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openEditRoutineModal(id);
      });
    });

    el.routineTimelineList.querySelectorAll('.del-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        deleteRoutine(id);
      });
    });
  }

  function toggleRoutineCompleted(id) {
    const routine = state.routines.find(r => r.id === id);
    if (!routine) return;
    routine.completed = !routine.completed;
    saveState();

    if (routine.completed) {
      playCheckmarkSound();
      triggerVibrate([50]);
      awardXP(25, 'Routine Activity Done');
      showToast(`Completed: ${routine.title}`, 'success');
      // If all completed, victory fanfare!
      const remaining = state.routines.filter(r => !r.completed).length;
      if (remaining === 0) {
        setTimeout(playCompletionSound, 300);
        awardXP(50, 'All Daily Routines Conquered');
        showToast('🎉 All daily routines completed! Fantastic job!', 'success');
        dispatchSystemNotification(
          '🎉 All Daily Routines Completed Today! (+50 XP)',
          'You conquered today\'s entire timeline! Keep your streak burning 🔥',
          'actiday-routine'
        );
      }
    } else {
      playClickSound();
    }

    renderRoutines();
    updateOverallProgress();
  }

  function deleteRoutine(id) {
    if (!confirm('Are you sure you want to delete this routine activity?')) return;
    state.routines = state.routines.filter(r => r.id !== id);
    saveState();
    playClickSound();
    showToast('Activity deleted');
    renderRoutines();
    updateOverallProgress();
  }

  function openAddRoutineModal() {
    playClickSound();
    el.routineForm.reset();
    el.routineEditId.value = '';
    document.getElementById('routineModalTitle').textContent = 'Add Routine Activity';
    el.routineStartTimeInput.value = '08:00';
    el.routineEndTimeInput.value = '09:00';
    el.routineEmojiInput.value = '⚡';
    el.routineModal.classList.add('open');
  }

  function openEditRoutineModal(id) {
    playClickSound();
    const r = state.routines.find(item => item.id === id);
    if (!r) return;
    el.routineEditId.value = r.id;
    el.routineTitleInput.value = r.title;
    el.routineStartTimeInput.value = r.startTime;
    el.routineEndTimeInput.value = r.endTime;
    el.routineCategoryInput.value = r.category;
    el.routineEmojiInput.value = r.emoji;
    el.routineNotesInput.value = r.notes || '';
    document.getElementById('routineModalTitle').textContent = 'Edit Routine Activity';
    el.routineModal.classList.add('open');
  }

  function closeRoutineModal() {
    playClickSound();
    el.routineModal.classList.remove('open');
  }

  el.routineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = el.routineEditId.value;
    const title = el.routineTitleInput.value.trim();
    const startTime = el.routineStartTimeInput.value;
    const endTime = el.routineEndTimeInput.value;
    const category = el.routineCategoryInput.value;
    const emoji = el.routineEmojiInput.value.trim() || '⚡';
    const notes = el.routineNotesInput.value.trim();

    if (!title) return;

    if (id) {
      // Edit
      const r = state.routines.find(item => item.id === id);
      if (r) {
        r.title = title;
        r.startTime = startTime;
        r.endTime = endTime;
        r.category = category;
        r.emoji = emoji;
        r.notes = notes;
      }
      showToast('Activity updated');
    } else {
      // New
      state.routines.push({
        id: 'r_' + Date.now(),
        title,
        startTime,
        endTime,
        category,
        emoji,
        notes,
        completed: false
      });
      showToast('Activity added to routine', 'success');
    }

    saveState();
    playCheckmarkSound();
    closeRoutineModal();
    renderRoutines();
    updateOverallProgress();
  });

  // Filter Buttons
  el.routineFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      el.routineFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoutineFilter = btn.getAttribute('data-filter');
      renderRoutines();
    });
  });

  if (el.heroStartTimerBtn) {
    el.heroStartTimerBtn.addEventListener('click', () => {
      playClickSound();
      switchTab('tabFocus');
    });
  }

  if (el.heroCompleteBtn) {
    el.heroCompleteBtn.addEventListener('click', () => {
      if (currentActiveRoutineObj) {
        toggleRoutineCompleted(currentActiveRoutineObj.id);
      } else {
        showToast('No routine active right now. Select one below!');
      }
    });
  }

  // ==========================================================================
  // 6. TAB 2: HABITS & STREAKS CONTROLLER
  // ==========================================================================
  function renderHabits() {
    if (!el.habitsList) return;
    el.habitsList.innerHTML = '';

    let maxStreak = 0;
    let completedCount = 0;

    state.habits.forEach(h => {
      if (h.streak > maxStreak) maxStreak = h.streak;
      const isDoneToday = h.type === 'counter' ? h.current >= h.target : h.current >= 1;
      if (isDoneToday) completedCount++;

      const card = document.createElement('div');
      card.className = 'habit-card';

      // 7-day labels: Sun Mon Tue Wed Thu Fri Sat
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const todayIdx = (new Date()).getDay();

      let historyHTML = '';
      for (let i = 0; i < 7; i++) {
        const isCompletedDay = h.history && h.history[i];
        const isToday = i === todayIdx;
        historyHTML += `
          <div class="history-day-col">
            <span class="day-label">${dayNames[i]}</span>
            <div class="day-dot ${isCompletedDay ? 'completed' : ''} ${isToday ? 'today' : ''}">
              ${isCompletedDay ? '✓' : ''}
            </div>
          </div>
        `;
      }

      let actionRowHTML = '';
      if (h.type === 'counter') {
        actionRowHTML = `
          <div class="habit-counter-row">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Goal: ${h.target} times</span>
            <div class="habit-counter-controls">
              <button class="counter-btn" data-action="dec" data-id="${h.id}">-</button>
              <span class="counter-display">${h.current} / ${h.target}</span>
              <button class="counter-btn" data-action="inc" data-id="${h.id}">+</button>
            </div>
          </div>
        `;
      } else {
        actionRowHTML = `
          <div class="habit-counter-row">
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Status: ${isDoneToday ? 'Complete for today' : 'Pending'}</span>
            <button class="btn btn-sm ${isDoneToday ? 'btn-secondary' : 'btn-primary'}" data-action="toggle-bool" data-id="${h.id}">
              ${isDoneToday ? '✓ Done' : 'Complete'}
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="habit-top-row">
          <div class="habit-title-wrap">
            <span class="habit-emoji">${h.emoji || '🎯'}</span>
            <span class="habit-name">${escapeHTML(h.title)}</span>
          </div>
          <span class="habit-streak-pill">🔥 ${h.streak}d</span>
        </div>
        ${actionRowHTML}
        <div class="habit-history-row">
          ${historyHTML}
        </div>
      `;

      el.habitsList.appendChild(card);
    });

    if (el.longestStreakDisplay) el.longestStreakDisplay.textContent = maxStreak;
    if (el.headerStreakCount) el.headerStreakCount.textContent = maxStreak;
    if (el.statHabitsCompleted) el.statHabitsCompleted.textContent = completedCount;

    // Attach Habit actions
    el.habitsList.querySelectorAll('.counter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        modifyHabitCounter(id, action);
      });
    });

    el.habitsList.querySelectorAll('[data-action="toggle-bool"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleBooleanHabit(id);
      });
    });
  }

  function modifyHabitCounter(id, action) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    const wasDone = habit.current >= habit.target;

    if (action === 'inc') {
      habit.current = Math.min(habit.target * 2, habit.current + 1);
      playClickSound();
      triggerVibrate([40]);
    } else {
      habit.current = Math.max(0, habit.current - 1);
      playClickSound();
    }

    const nowDone = habit.current >= habit.target;
    const todayIdx = (new Date()).getDay();

    if (!wasDone && nowDone) {
      playCompletionSound();
      triggerVibrate([60, 40, 100]);
      habit.streak += 1;
      if (habit.history) habit.history[todayIdx] = true;
      awardXP(20, 'Habit Goal Reached');
      showToast(`🔥 Habit goal reached: ${habit.title}!`, 'success');
    } else if (wasDone && !nowDone) {
      if (habit.history) habit.history[todayIdx] = false;
    }

    saveState();
    renderHabits();
  }

  function toggleBooleanHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    const todayIdx = (new Date()).getDay();

    if (habit.current === 0) {
      habit.current = 1;
      habit.streak += 1;
      if (habit.history) habit.history[todayIdx] = true;
      playCompletionSound();
      triggerVibrate([50, 40, 80]);
      awardXP(20, 'Habit Completed');
      showToast(`🔥 Great job! ${habit.title} completed`, 'success');
    } else {
      habit.current = 0;
      habit.streak = Math.max(0, habit.streak - 1);
      if (habit.history) habit.history[todayIdx] = false;
      playClickSound();
    }

    saveState();
    renderHabits();
  }

  function openAddHabitModal() {
    playClickSound();
    el.habitForm.reset();
    el.habitTypeInput.value = 'counter';
    el.habitTargetGroup.style.display = 'block';
    el.habitEmojiInput.value = '💧';
    el.habitModal.classList.add('open');
  }

  function closeHabitModal() {
    playClickSound();
    el.habitModal.classList.remove('open');
  }

  el.habitTypeInput.addEventListener('change', () => {
    if (el.habitTypeInput.value === 'counter') {
      el.habitTargetGroup.style.display = 'block';
    } else {
      el.habitTargetGroup.style.display = 'none';
    }
  });

  el.habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = el.habitTitleInput.value.trim();
    const emoji = el.habitEmojiInput.value.trim() || '🎯';
    const type = el.habitTypeInput.value;
    const target = type === 'counter' ? parseInt(el.habitTargetInput.value, 10) || 1 : 1;

    if (!title) return;

    state.habits.push({
      id: 'h_' + Date.now(),
      title,
      emoji,
      type,
      target,
      current: 0,
      streak: 0,
      history: [false, false, false, false, false, false, false]
    });

    saveState();
    playCheckmarkSound();
    closeHabitModal();
    renderHabits();
    showToast('New habit created!', 'success');
  });

  // ==========================================================================
  // 7. TAB 3: TASKS & TO-DO CHECKLIST CONTROLLER
  // ==========================================================================
  function renderTasks() {
    if (!el.tasksList) return;
    el.tasksList.innerHTML = '';

    const allCount = state.tasks.length;
    const pendingCount = state.tasks.filter(t => !t.completed).length;
    const completedCount = state.tasks.filter(t => t.completed).length;

    if (el.taskCountAll) el.taskCountAll.textContent = allCount;
    if (el.taskCountPending) el.taskCountPending.textContent = pendingCount;
    if (el.statTasksDone) el.statTasksDone.textContent = completedCount;

    const filtered = state.tasks.filter(t => {
      if (currentTaskFilter === 'all') return true;
      if (currentTaskFilter === 'pending') return !t.completed;
      if (currentTaskFilter === 'high') return t.priority === 'high' && !t.completed;
      if (currentTaskFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      el.tasksList.innerHTML = `
        <div style="text-align: center; padding: 28px; color: var(--text-muted);">
          <p style="font-size: 2rem; margin-bottom: 6px;">✨</p>
          <p>No tasks found in this view.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = `task-card ${t.completed ? 'is-completed' : ''}`;

      let priorityClass = 'priority-low';
      let tagClass = 'tag-low';
      if (t.priority === 'high') { priorityClass = 'priority-high'; tagClass = 'tag-high'; }
      if (t.priority === 'medium') { priorityClass = 'priority-medium'; tagClass = 'tag-medium'; }

      card.innerHTML = `
        <div class="task-priority-indicator ${priorityClass}"></div>
        <button class="routine-checkbox" data-id="${t.id}" title="Toggle Complete">
          ${t.completed ? '✓' : ''}
        </button>
        <div class="task-content">
          <div class="task-title">${escapeHTML(t.title)}</div>
          <div class="task-badge-row">
            <span class="task-priority-tag ${tagClass}">${t.priority}</span>
          </div>
        </div>
        <button class="action-icon-btn del-task-btn" data-id="${t.id}" title="Delete Task">🗑️</button>
      `;

      el.tasksList.appendChild(card);
    });

    // Task listeners
    el.tasksList.querySelectorAll('.routine-checkbox').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        toggleTaskCompleted(id);
      });
    });

    el.tasksList.querySelectorAll('.del-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteTask(id);
      });
    });
  }

  function toggleTaskCompleted(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveState();

    if (task.completed) {
      playCheckmarkSound();
      triggerVibrate([40]);
      awardXP(15, 'Task Completed');
      showToast('Task completed', 'success');
    } else {
      playClickSound();
    }

    renderTasks();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    playClickSound();
    renderTasks();
  }

  function addNewQuickTask() {
    const text = el.quickTaskInput.value.trim();
    const priority = el.quickTaskPriority.value;
    if (!text) return;

    state.tasks.unshift({
      id: 't_' + Date.now(),
      title: text,
      priority: priority,
      completed: false
    });

    el.quickTaskInput.value = '';
    saveState();
    playCheckmarkSound();
    triggerVibrate([30]);
    renderTasks();
    showToast('Task added');
  }

  if (el.quickAddTaskBtn) el.quickAddTaskBtn.addEventListener('click', addNewQuickTask);
  if (el.quickTaskInput) {
    el.quickTaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNewQuickTask();
    });
  }

  if (el.clearCompletedTasksBtn) {
    el.clearCompletedTasksBtn.addEventListener('click', () => {
      const count = state.tasks.filter(t => t.completed).length;
      if (count === 0) {
        showToast('No completed tasks to clear');
        return;
      }
      state.tasks = state.tasks.filter(t => !t.completed);
      saveState();
      playClickSound();
      renderTasks();
      showToast(`Cleared ${count} completed task(s)`);
    });
  }

  el.taskFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      el.taskFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTaskFilter = btn.getAttribute('data-task-filter');
      renderTasks();
    });
  });

  // ==========================================================================
  // 8. TAB 4: FOCUS & POMODORO TIMER ENGINE
  // ==========================================================================
  let timerDurationSecs = 25 * 60;
  let timerRemainingSecs = 25 * 60;
  let timerInterval = null;
  let isTimerRunning = false;
  let currentSession = 1;
  const maxSessions = 4;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110; // ~691.15

  function updateTimerUI() {
    const mins = Math.floor(timerRemainingSecs / 60);
    const secs = timerRemainingSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (el.timerDigits) el.timerDigits.textContent = formatted;

    const progressRatio = (timerDurationSecs - timerRemainingSecs) / timerDurationSecs;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progressRatio);
    if (el.timerProgressRing) {
      el.timerProgressRing.style.strokeDashoffset = offset;
    }

    if (el.timerPlayBtn) {
      el.timerPlayBtn.textContent = isTimerRunning ? '⏸' : '▶';
    }

    if (el.timerSessionBadge) {
      el.timerSessionBadge.textContent = `SESSION ${currentSession} OF ${maxSessions}`;
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    initAudio();
    isTimerRunning = true;
    updateTimerUI();
    if (el.timerSubStatus) el.timerSubStatus.textContent = 'Focusing... Stay in flow';

    // Auto-sync ambient soundscape if configured
    if (state.ambientSound && state.ambientSound.autoSync && state.ambientSound.current && !isAmbientPlaying) {
      playAmbientSound(state.ambientSound.current);
    }

    timerInterval = setInterval(() => {
      if (timerRemainingSecs > 0) {
        timerRemainingSecs--;
        playTickSound();
        updateTimerUI();
      } else {
        finishTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    clearInterval(timerInterval);
    updateTimerUI();
    if (el.timerSubStatus) el.timerSubStatus.textContent = 'Paused';

    if (state.ambientSound && state.ambientSound.autoSync && isAmbientPlaying) {
      stopAmbientSound(0.4);
    }
  }

  function resetTimer() {
    pauseTimer();
    timerRemainingSecs = timerDurationSecs;
    updateTimerUI();
    if (el.timerSubStatus) el.timerSubStatus.textContent = 'Ready to focus';

    if (state.ambientSound && state.ambientSound.autoSync && isAmbientPlaying) {
      stopAmbientSound(0.4);
    }
  }

  function finishTimer() {
    pauseTimer();
    playTimerBell();
    triggerVibrate([200, 100, 300, 100, 400]);

    if (state.ambientSound && state.ambientSound.autoSync && isAmbientPlaying) {
      stopAmbientSound(0.4);
    }

    // Track completed session
    const minutesAdded = Math.round(timerDurationSecs / 60);
    state.analytics.totalFocusMinutes += minutesAdded;
    state.analytics.sessionsCompleted += 1;
    saveState();

    currentSession = (currentSession % maxSessions) + 1;
    awardXP(50, 'Focus Session Logged');
    showToast(`🔔 Session complete! Logged ${minutesAdded} focus mins`, 'success');
    dispatchSystemNotification(
      '⏰ Focus Round Complete! (+50 XP)',
      `Awesome job! Logged ${minutesAdded} minutes of deep focus. Take a 5-minute break.`,
      'actiday-timer'
    );

    timerRemainingSecs = timerDurationSecs;
    updateTimerUI();
    if (el.timerSubStatus) el.timerSubStatus.textContent = 'Session complete! Take a breather';
    renderAnalytics();
  }

  if (el.timerPlayBtn) {
    el.timerPlayBtn.addEventListener('click', () => {
      playClickSound();
      if (isTimerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }

  if (el.timerResetBtn) {
    el.timerResetBtn.addEventListener('click', () => {
      playClickSound();
      resetTimer();
    });
  }

  if (el.timerSkipBtn) {
    el.timerSkipBtn.addEventListener('click', () => {
      playClickSound();
      currentSession = (currentSession % maxSessions) + 1;
      resetTimer();
      showToast(`Skipped to session ${currentSession}`);
    });
  }

  el.timerModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      el.timerModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const durationMins = parseInt(btn.getAttribute('data-duration'), 10) || 25;
      timerDurationSecs = durationMins * 60;
      resetTimer();
    });
  });

  if (el.timerAlarmToggle) {
    el.timerAlarmToggle.addEventListener('change', (e) => {
      state.settings.alarmBellEnabled = e.target.checked;
      saveState();
    });
  }

  if (el.timerVibrationToggle) {
    el.timerVibrationToggle.addEventListener('change', (e) => {
      state.settings.vibrationEnabled = e.target.checked;
      saveState();
    });
  }

  if (el.timerTickToggle) {
    el.timerTickToggle.addEventListener('change', (e) => {
      state.settings.metronomeEnabled = e.target.checked;
      saveState();
    });
  }

  // ==========================================================================
  // 9. TAB 5: INSIGHTS, MOOD & CANVAS CHART ENGINE
  // ==========================================================================
  function renderAnalytics() {
    if (el.statFocusMinutes) el.statFocusMinutes.textContent = `${state.analytics.totalFocusMinutes}m`;

    // Reflection & Mood
    if (state.reflections && state.reflections.mood) {
      el.moodBtns.forEach(btn => {
        if (btn.getAttribute('data-mood') === state.reflections.mood) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    if (el.dailyReflectionNote && state.reflections && state.reflections.note) {
      el.dailyReflectionNote.value = state.reflections.note;
    }

    drawWeeklyChart();
  }

  function drawWeeklyChart() {
    const canvas = el.weeklyChartCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const scores = state.analytics.historyScores || [75, 80, 85, 90, 70, 85, 95];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Average
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    if (el.weeklyAverageRate) el.weeklyAverageRate.textContent = `${avg}% Avg`;

    const paddingX = 28;
    const paddingBottom = 26;
    const paddingTop = 20;
    const barWidth = 18;
    const chartHeight = h - paddingTop - paddingBottom;
    const stepX = (w - paddingX * 2) / (scores.length - 1);

    // Draw grid background line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX - 10, paddingTop);
    ctx.lineTo(w - paddingX + 10, paddingTop);
    ctx.moveTo(paddingX - 10, paddingTop + chartHeight / 2);
    ctx.lineTo(w - paddingX + 10, paddingTop + chartHeight / 2);
    ctx.stroke();

    // Draw bars
    scores.forEach((score, i) => {
      const x = paddingX + i * stepX;
      const barH = (score / 100) * chartHeight;
      const y = paddingTop + (chartHeight - barH);

      // Gradient bar fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (score >= 85) {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#059669');
      } else if (score >= 70) {
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#8b5cf6');
      } else {
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#d97706');
      }

      ctx.fillStyle = grad;
      // Rounded bar top
      roundRect(ctx, x - barWidth / 2, y, barWidth, barH, 5);

      // Score text on top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '600 9px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText(`${score}%`, x, y - 6);

      // Day label below
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '500 10px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillText(days[i], x, h - 8);
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, 0);
    ctx.arcTo(x, y + height, x, y, 0);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  // Mood selector listeners
  el.moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      triggerVibrate([30]);
      el.moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mood = btn.getAttribute('data-mood');
      state.reflections.mood = mood;
      saveState();
      showToast(`Mood logged: ${mood}!`);
    });
  });

  // Reflection note auto-save
  let noteTimeout = null;
  if (el.dailyReflectionNote) {
    el.dailyReflectionNote.addEventListener('input', (e) => {
      if (el.journalSaveStatus) el.journalSaveStatus.textContent = 'Saving...';
      clearTimeout(noteTimeout);
      noteTimeout = setTimeout(() => {
        state.reflections.note = e.target.value;
        saveState();
        if (el.journalSaveStatus) el.journalSaveStatus.textContent = 'Auto-saved ✓';
        if (state.reflections.note && state.reflections.note.length > 10) {
          awardXP(20, 'Daily Reflection Logged');
        }
      }, 500);
    });
  }

  // Reset Day Progress
  if (el.resetDayConfirmBtn) {
    el.resetDayConfirmBtn.addEventListener('click', () => {
      if (!confirm('Reset today’s completed routines & counters for a fresh start?')) return;
      state.routines.forEach(r => r.completed = false);
      state.habits.forEach(h => {
        if (h.type === 'counter') h.current = 0;
        else h.current = 0;
      });
      saveState();
      playClickSound();
      renderRoutines();
      renderHabits();
      updateOverallProgress();
      showToast('Today’s progress has been reset for a fresh day!');
    });
  }

  // Data Export / Import
  if (el.exportDataBtn) {
    el.exportDataBtn.addEventListener('click', () => {
      playClickSound();
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-routine-backup-${(new Date()).toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported successfully!', 'success');
    });
  }

  if (el.importDataBtn) {
    el.importDataBtn.addEventListener('click', () => {
      playClickSound();
      el.importFileInput.click();
    });
  }

  if (el.importFileInput) {
    el.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.routines && imported.habits) {
            state = { ...DEFAULT_DATA, ...imported };
            saveState();
            applyTheme(state.settings.theme);
            renderRoutines();
            renderHabits();
            renderTasks();
            renderAnalytics();
            updateOverallProgress();
            showToast('Backup restored successfully!', 'success');
          } else {
            showToast('Invalid routine backup file format', 'alert');
          }
        } catch (err) {
          showToast('Failed to parse backup file', 'alert');
        }
      };
      reader.readAsText(file);
    });
  }

  // ==========================================================================
  // 10. NAVIGATION, MODALS & SETTINGS
  // ==========================================================================
  function switchTab(tabId) {
    playClickSound();
    el.navTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    el.tabViews.forEach(view => {
      if (view.id === tabId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    if (tabId === 'tabInsights') {
      setTimeout(drawWeeklyChart, 100);
    }
  }

  el.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Settings modal
  function applyTheme(themeName) {
    document.body.className = themeName || 'theme-dark';
    if (el.themeSelect) el.themeSelect.value = themeName || 'theme-dark';
  }

  if (el.settingsBtn) {
    el.settingsBtn.addEventListener('click', () => {
      playClickSound();
      el.settingsModal.classList.add('open');
    });
  }

  if (el.closeSettingsModalBtn) {
    el.closeSettingsModalBtn.addEventListener('click', () => {
      playClickSound();
      el.settingsModal.classList.remove('open');
    });
  }

  if (el.doneSettingsModalBtn) {
    el.doneSettingsModalBtn.addEventListener('click', () => {
      playClickSound();
      el.settingsModal.classList.remove('open');
    });
  }

  if (el.themeSelect) {
    el.themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      state.settings.theme = newTheme;
      applyTheme(newTheme);
      saveState();
      drawWeeklyChart();
      showToast('Theme updated');
    });
  }

  if (el.soundToggleBtn) {
    el.soundToggleBtn.addEventListener('click', () => {
      state.settings.soundEnabled = !state.settings.soundEnabled;
      saveState();
      if (el.soundIcon) el.soundIcon.textContent = state.settings.soundEnabled ? '🔊' : '🔇';
      if (state.settings.soundEnabled) playCheckmarkSound();
      showToast(state.settings.soundEnabled ? 'Sound enabled' : 'Sound muted');
    });
  }

  if (el.testSoundBtn) {
    el.testSoundBtn.addEventListener('click', () => {
      playCompletionSound();
      showToast('Playing completion chime');
    });
  }

  if (el.testVibrateBtn) {
    el.testVibrateBtn.addEventListener('click', () => {
      triggerVibrate([80, 50, 80]);
      showToast('Haptic vibration triggered');
    });
  }

  if (el.toggleDeviceFrameBtn) {
    el.toggleDeviceFrameBtn.addEventListener('click', () => {
      playClickSound();
      if (el.deviceWrapper) {
        el.deviceWrapper.classList.toggle('full-screen-mode');
        showToast('Toggled full screen / mobile bezel');
      }
    });
  }

  // ==========================================================================
  // 11. GAMIFICATION, XP & BADGES SYSTEM
  // ==========================================================================
  const LEVELS = [
    { level: 1, title: 'Novice Striver', minXP: 0, maxXP: 150, emoji: '🐣' },
    { level: 2, title: 'Consistent Builder', minXP: 150, maxXP: 350, emoji: '🔨' },
    { level: 3, title: 'Momentum Rider', minXP: 350, maxXP: 650, emoji: '🚀' },
    { level: 4, title: 'Focus Specialist', minXP: 650, maxXP: 1050, emoji: '🎯' },
    { level: 5, title: 'Discipline Master', minXP: 1050, maxXP: 1550, emoji: '⚡' },
    { level: 6, title: 'Habit Alchemist', minXP: 1550, maxXP: 2150, emoji: '🔮' },
    { level: 7, title: 'Flow State Sorcerer', minXP: 2150, maxXP: 2850, emoji: '🌌' },
    { level: 8, title: 'Daily Grandmaster', minXP: 2850, maxXP: 5000, emoji: '👑' }
  ];

  const BADGES = [
    { id: 'early_bird', title: 'Early Riser', desc: 'Complete any morning routine before 9 AM', emoji: '🌅' },
    { id: 'streak_flame', title: 'Streak Legend', desc: 'Maintain a 7-day habit streak', emoji: '🔥' },
    { id: 'deep_focus', title: 'Hyperfocus Champion', desc: 'Log 50+ focus minutes with timer', emoji: '⏱️' },
    { id: 'water_hero', title: 'Hydration Hero', desc: 'Drink 8 glasses of water in a day', emoji: '💧' },
    { id: 'task_crusher', title: 'Task Destroyer', desc: 'Complete 3 or more daily tasks', emoji: '🎯' },
    { id: 'zen_master', title: 'Inner Calm', desc: 'Complete a guided breathwork session', emoji: '🫁' },
    { id: 'brain_dump', title: 'Clarity Keeper', desc: 'Capture thoughts in Quick Scratchpad', emoji: '📝' },
    { id: 'perfectionist', title: '100% Conqueror', desc: 'Complete all scheduled daily routines', emoji: '🏆' }
  ];

  function getLevelInfo(xp) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        const next = LEVELS[i + 1] || { level: 9, title: 'Ascended Achiever', minXP: 5000, maxXP: 10000, emoji: '🌟' };
        return { current: LEVELS[i], next };
      }
    }
    return { current: LEVELS[0], next: LEVELS[1] };
  }

  function awardXP(points, reason = '') {
    if (!state.gamification) {
      state.gamification = { xp: 240, level: 2, unlockedBadges: ['streak_flame'] };
    }
    const prevXP = state.gamification.xp;
    const prevLevel = getLevelInfo(prevXP).current.level;
    state.gamification.xp += points;

    const newLevelInfo = getLevelInfo(state.gamification.xp);
    const newLevel = newLevelInfo.current.level;
    state.gamification.level = newLevel;

    saveState();
    renderGamification();

    if (newLevel > prevLevel) {
      playCompletionSound();
      triggerVibrate([100, 50, 100, 50, 200]);
      showToast(`👑 LEVEL UP! Level ${newLevel}: ${newLevelInfo.current.title}!`, 'success');
    } else if (reason) {
      showToast(`+${points} XP (${reason})`, 'normal');
    }

    checkBadges();
  }

  function checkBadges() {
    if (!state.gamification) {
      state.gamification = { xp: 240, level: 2, unlockedBadges: ['streak_flame'] };
    }
    if (!state.gamification.unlockedBadges) state.gamification.unlockedBadges = [];
    const unlocked = state.gamification.unlockedBadges;

    function tryUnlock(badgeId) {
      if (!unlocked.includes(badgeId)) {
        unlocked.push(badgeId);
        saveState();
        playCompletionSound();
        triggerVibrate([80, 40, 120]);
        const badgeObj = BADGES.find(b => b.id === badgeId);
        if (badgeObj) {
          showToast(`🏆 Badge Unlocked: ${badgeObj.emoji} ${badgeObj.title}!`, 'success');
        }
        renderGamification();
      }
    }

    // 1. early_bird: any completed routine between 5 AM and 9 AM
    const morningDone = state.routines.some(r => {
      const h = parseInt(r.startTime.split(':')[0], 10);
      return r.completed && h >= 5 && h < 9;
    });
    if (morningDone) tryUnlock('early_bird');

    // 2. streak_flame: any habit with streak >= 7
    const has7Streak = state.habits.some(h => h.streak >= 7);
    if (has7Streak) tryUnlock('streak_flame');

    // 3. deep_focus: totalFocusMinutes >= 50
    if (state.analytics.totalFocusMinutes >= 50) tryUnlock('deep_focus');

    // 4. water_hero: habit with title water and current >= 8
    const waterDone = state.habits.some(h => h.title.toLowerCase().includes('water') && h.current >= 8);
    if (waterDone) tryUnlock('water_hero');

    // 5. task_crusher: completed tasks >= 3
    const tasksDone = state.tasks.filter(t => t.completed).length;
    if (tasksDone >= 3) tryUnlock('task_crusher');

    // 6. perfectionist: all routines completed (minimum 3 routines)
    if (state.routines.length >= 3 && state.routines.every(r => r.completed)) {
      tryUnlock('perfectionist');
    }
  }

  function renderGamification() {
    if (!state.gamification) {
      state.gamification = { xp: 240, level: 2, unlockedBadges: ['streak_flame'] };
    }
    const { current, next } = getLevelInfo(state.gamification.xp);

    // Header badge
    if (el.headerLevelText) {
      el.headerLevelText.textContent = `Lv.${current.level}`;
    }

    // Modal elements
    if (el.modalLevelEmoji) el.modalLevelEmoji.textContent = current.emoji;
    if (el.modalLevelTitle) el.modalLevelTitle.textContent = current.title;
    if (el.modalLevelNumber) el.modalLevelNumber.textContent = `Level ${current.level}`;
    if (el.modalCurrentXP) el.modalCurrentXP.textContent = state.gamification.xp;

    const levelRange = Math.max(1, next.minXP - current.minXP);
    const progressXP = Math.max(0, state.gamification.xp - current.minXP);
    const pct = Math.min(100, Math.max(0, Math.round((progressXP / levelRange) * 100)));

    if (el.modalLevelProgressBar) el.modalLevelProgressBar.style.width = `${pct}%`;
    if (el.modalXPToNext) el.modalXPToNext.textContent = `${Math.max(0, next.minXP - state.gamification.xp)} XP to Level ${next.level}`;
    if (el.modalLevelNextTitle) el.modalLevelNextTitle.textContent = `Next: ${next.title} ${next.emoji}`;

    const unlocked = state.gamification.unlockedBadges || [];
    if (el.unlockedBadgesCount) el.unlockedBadgesCount.textContent = unlocked.length;

    if (el.badgesGrid) {
      el.badgesGrid.innerHTML = '';
      BADGES.forEach(b => {
        const isUnlocked = unlocked.includes(b.id);
        const card = document.createElement('div');
        card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="badge-top-row">
            <span class="badge-card-emoji">${b.emoji}</span>
            <span class="badge-card-pill">${isUnlocked ? 'Unlocked ✓' : '🔒 Locked'}</span>
          </div>
          <div class="badge-card-title">${escapeHTML(b.title)}</div>
          <div class="badge-card-desc">${escapeHTML(b.desc)}</div>
        `;
        el.badgesGrid.appendChild(card);
      });
    }
  }

  // ==========================================================================
  // 12. ROUTINE TEMPLATES & SCHEDULE PRESETS
  // ==========================================================================
  const ROUTINE_TEMPLATES = [
    {
      id: 'student',
      title: 'University Student & Exam Prep',
      emoji: '🎓',
      desc: 'Optimized for deep study blocks, lecture notes & healthy recovery.',
      routines: [
        { title: 'Morning Hydration & Flashcards', startTime: '06:45', endTime: '07:30', category: 'Study', emoji: '🌅', notes: 'Review top cards, drink water' },
        { title: 'Classes & Lecture Attendance', startTime: '08:00', endTime: '12:00', category: 'Study', emoji: '🏫', notes: 'Active note taking' },
        { title: 'Healthy Lunch & Campus Walk', startTime: '12:00', endTime: '13:00', category: 'Health', emoji: '🥗', notes: 'Get fresh air, screen break' },
        { title: 'Deep Library Focus Sprint', startTime: '13:30', endTime: '16:30', category: 'Productivity', emoji: '📚', notes: 'Problem sets & textbook reading' },
        { title: 'Workout / Cardio Decompression', startTime: '17:00', endTime: '18:15', category: 'Fitness', emoji: '🏃', notes: 'Sweat session, lower stress' },
        { title: 'Dinner & Social Time', startTime: '18:30', endTime: '20:00', category: 'Personal', emoji: '🍽️', notes: 'Eat well and connect' },
        { title: 'Spaced Repetition & Tomorrow Prep', startTime: '20:30', endTime: '22:00', category: 'Mindfulness', emoji: '📖', notes: 'Prep backpack and sleep at 10:30' }
      ]
    },
    {
      id: 'developer',
      title: 'Remote Developer & Tech Flow',
      emoji: '💻',
      desc: 'Built for software engineers needing uninterrupted code blocks.',
      routines: [
        { title: 'Espresso, Morning Walk & Standup', startTime: '07:30', endTime: '08:45', category: 'Productivity', emoji: '☕', notes: 'Plan git PRs and top 3 deliverables' },
        { title: 'Deep Coding & Architecture Sprint', startTime: '09:00', endTime: '12:30', category: 'Productivity', emoji: '💻', notes: 'Zero distractions, full flow state' },
        { title: 'Lunch Away From Laptop', startTime: '12:30', endTime: '13:30', category: 'Health', emoji: '🥑', notes: 'Step away from screen' },
        { title: 'Code Reviews, Debugging & Sync', startTime: '14:00', endTime: '16:30', category: 'Study', emoji: '🛠️', notes: 'Review pull requests and tickets' },
        { title: 'Gym Workout & Mobility', startTime: '17:00', endTime: '18:15', category: 'Fitness', emoji: '🏋️', notes: 'Shoulder and spinal health' },
        { title: 'Dinner & Creative Side Projects', startTime: '19:00', endTime: '21:00', category: 'Personal', emoji: '🌆', notes: 'Relax and unwind' },
        { title: 'Digital Sunset & Sleep Prep', startTime: '21:30', endTime: '22:30', category: 'Mindfulness', emoji: '🌙', notes: 'No blue light, ready for bed' }
      ]
    },
    {
      id: 'fitness',
      title: 'Fitness & Athletic High Energy',
      emoji: '🏋️',
      desc: 'Maximize physical energy, disciplined nutrition & recovery.',
      routines: [
        { title: 'Electrolytes & Dynamic Warmup', startTime: '06:00', endTime: '06:30', category: 'Health', emoji: '💧', notes: '1L water with pinch of pink salt' },
        { title: 'Gym Strength & Core Training', startTime: '06:30', endTime: '08:00', category: 'Fitness', emoji: '🏋️', notes: 'Compound lifts and progression' },
        { title: 'Protein Fuel & Recovery Shower', startTime: '08:15', endTime: '09:00', category: 'Health', emoji: '🥑', notes: 'High protein breakfast' },
        { title: 'High-Output Work Sprint', startTime: '09:30', endTime: '13:00', category: 'Productivity', emoji: '⚡', notes: 'Execute key daily targets' },
        { title: 'Nutritious Lunch & Sunshine Walk', startTime: '13:00', endTime: '14:00', category: 'Health', emoji: '🥗', notes: 'Get 2,000 steps' },
        { title: 'Afternoon Execution & Projects', startTime: '14:30', endTime: '17:30', category: 'Study', emoji: '🎯', notes: 'Finish pending tasks' },
        { title: 'Foam Rolling, Stretch & Dinner', startTime: '18:30', endTime: '20:00', category: 'Mindfulness', emoji: '🧘', notes: 'Mobility and nourishing dinner' },
        { title: 'Total Darkness Sleep Prep', startTime: '21:00', endTime: '22:00', category: 'Mindfulness', emoji: '😴', notes: 'Sleep 8 hours for muscular recovery' }
      ]
    },
    {
      id: 'mindful',
      title: 'Mindful, Serene & Balanced Life',
      emoji: '🧘',
      desc: 'Low-stress lifestyle focusing on mental clarity, peace & intentionality.',
      routines: [
        { title: 'Sunrise Meditation & Breathwork', startTime: '06:45', endTime: '07:30', category: 'Mindfulness', emoji: '🌿', notes: '20 min sitting meditation' },
        { title: 'Mindful Herbal Tea & Journaling', startTime: '07:30', endTime: '08:30', category: 'Mindfulness', emoji: '🍵', notes: 'Log intentions for today' },
        { title: 'Focused Single-Tasking Sprint', startTime: '09:00', endTime: '12:00', category: 'Productivity', emoji: '🎯', notes: 'Work on one task at a time' },
        { title: 'Wholesome Cooking & Nature Walk', startTime: '12:30', endTime: '14:00', category: 'Health', emoji: '🍲', notes: 'Mindful eating in peace' },
        { title: 'Creative Writing & Reading', startTime: '14:30', endTime: '17:00', category: 'Study', emoji: '✍️', notes: 'Deep thoughtful reading' },
        { title: 'Evening Sunset & Light Stretch', startTime: '17:30', endTime: '19:00', category: 'Fitness', emoji: '🌅', notes: 'Gentle walk outdoors' },
        { title: 'Candlelit Reflection & Sleep', startTime: '20:30', endTime: '22:00', category: 'Mindfulness', emoji: '🕯️', notes: 'Gratitude journal & restorative rest' }
      ]
    }
  ];

  let selectedTemplateId = 'student';

  function renderTemplatesUI() {
    if (!el.templatesList) return;
    el.templatesList.innerHTML = '';

    ROUTINE_TEMPLATES.forEach(tpl => {
      const card = document.createElement('div');
      card.className = `template-card ${tpl.id === selectedTemplateId ? 'active' : ''}`;
      card.innerHTML = `
        <span class="template-card-emoji">${tpl.emoji}</span>
        <span class="template-card-title">${escapeHTML(tpl.title)}</span>
        <span class="template-card-count">${tpl.routines.length} activities</span>
      `;
      card.addEventListener('click', () => {
        playClickSound();
        selectedTemplateId = tpl.id;
        renderTemplatesUI();
      });
      el.templatesList.appendChild(card);
    });

    const activeTpl = ROUTINE_TEMPLATES.find(t => t.id === selectedTemplateId) || ROUTINE_TEMPLATES[0];
    if (el.previewTemplateTitle) el.previewTemplateTitle.textContent = `${activeTpl.emoji} ${activeTpl.title}`;
    if (el.previewTemplateCount) el.previewTemplateCount.textContent = `${activeTpl.routines.length} activities`;

    if (el.previewItemsList) {
      el.previewItemsList.innerHTML = '';
      activeTpl.routines.forEach(r => {
        const row = document.createElement('div');
        row.className = 'preview-item-row';
        row.innerHTML = `
          <span class="preview-item-time">${r.startTime} - ${r.endTime}</span>
          <span class="preview-item-name">${r.emoji} ${escapeHTML(r.title)}</span>
          <span class="preview-item-tag">${r.category}</span>
        `;
        el.previewItemsList.appendChild(row);
      });
    }
  }

  function applyTemplate(mode = 'append') {
    const tpl = ROUTINE_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!tpl) return;

    playCompletionSound();
    triggerVibrate([80, 50, 100]);

    const formattedRoutines = tpl.routines.map((r, i) => ({
      id: 'r_tpl_' + Date.now() + '_' + i,
      title: r.title,
      startTime: r.startTime,
      endTime: r.endTime,
      category: r.category,
      emoji: r.emoji,
      notes: r.notes,
      completed: false
    }));

    if (mode === 'replace') {
      state.routines = formattedRoutines;
    } else {
      state.routines = [...state.routines, ...formattedRoutines];
    }

    saveState();
    renderRoutines();
    updateOverallProgress();
    awardXP(30, 'Loaded Routine Preset');
    el.templatesModal.classList.remove('open');
    showToast(`Loaded "${tpl.title}" template!`, 'success');
  }

  // ==========================================================================
  // 13. 4-7-8 & BOX BREATHING ENGINE
  // ==========================================================================
  let breathingInterval = null;
  let isBreathingActive = false;
  let breathingPattern = '4-7-8'; // '4-7-8' or 'box'
  let currentCycle = 1;
  const maxCycles = 4;
  let currentPhaseIndex = 0;
  let phaseSecondsRemaining = 4;

  const BREATHING_CONFIGS = {
    '4-7-8': [
      { name: 'Inhale', duration: 4, tip: 'Breathe in slowly and deeply through your nose...', scale: 1.35, chimePitch: 528 },
      { name: 'Hold', duration: 7, tip: 'Gently hold your breath with relaxed shoulders...', scale: 1.35, chimePitch: 639 },
      { name: 'Exhale', duration: 8, tip: 'Whoosh the breath completely out through your mouth...', scale: 0.85, chimePitch: 432 }
    ],
    'box': [
      { name: 'Inhale', duration: 4, tip: 'Inhale smoothly for 4 seconds...', scale: 1.35, chimePitch: 528 },
      { name: 'Hold', duration: 4, tip: 'Hold full lungs gently for 4 seconds...', scale: 1.35, chimePitch: 639 },
      { name: 'Exhale', duration: 4, tip: 'Exhale steadily for 4 seconds...', scale: 0.85, chimePitch: 432 },
      { name: 'Hold', duration: 4, tip: 'Hold empty lungs calmly for 4 seconds...', scale: 0.85, chimePitch: 396 }
    ]
  };

  function updateBreathingVisuals() {
    const config = BREATHING_CONFIGS[breathingPattern];
    const phase = config[currentPhaseIndex];

    if (el.breathingPhaseText) el.breathingPhaseText.textContent = phase.name;
    if (el.breathingCounterNum) el.breathingCounterNum.textContent = phaseSecondsRemaining;
    if (el.breathingCycleLabel) el.breathingCycleLabel.textContent = `Cycle ${currentCycle} of ${maxCycles}`;
    if (el.breathingGuideTip) el.breathingGuideTip.textContent = phase.tip;

    if (el.breathingOrb) {
      el.breathingOrb.style.transform = `scale(${phase.scale})`;
    }
  }

  function startBreathingSession() {
    initAudio();
    isBreathingActive = true;
    if (el.toggleBreathingBtn) el.toggleBreathingBtn.textContent = '⏸ Pause';

    const config = BREATHING_CONFIGS[breathingPattern];
    playBreathingChime(config[currentPhaseIndex].chimePitch);
    triggerVibrate([60]);
    updateBreathingVisuals();

    breathingInterval = setInterval(() => {
      phaseSecondsRemaining--;

      if (phaseSecondsRemaining <= 0) {
        // Next phase
        currentPhaseIndex++;
        if (currentPhaseIndex >= config.length) {
          currentPhaseIndex = 0;
          currentCycle++;
          if (currentCycle > maxCycles) {
            finishBreathingSession();
            return;
          }
        }
        phaseSecondsRemaining = config[currentPhaseIndex].duration;
        playBreathingChime(config[currentPhaseIndex].chimePitch);
        triggerVibrate([80]);
      }

      updateBreathingVisuals();
    }, 1000);
  }

  function pauseBreathingSession() {
    isBreathingActive = false;
    clearInterval(breathingInterval);
    if (el.toggleBreathingBtn) el.toggleBreathingBtn.textContent = '▶ Resume';
    if (el.breathingPhaseText) el.breathingPhaseText.textContent = 'Paused';
  }

  function resetBreathingSession() {
    pauseBreathingSession();
    currentCycle = 1;
    currentPhaseIndex = 0;
    const config = BREATHING_CONFIGS[breathingPattern];
    phaseSecondsRemaining = config[0].duration;
    if (el.toggleBreathingBtn) el.toggleBreathingBtn.textContent = '▶ Start Session';
    if (el.breathingPhaseText) el.breathingPhaseText.textContent = 'Ready';
    if (el.breathingCounterNum) el.breathingCounterNum.textContent = phaseSecondsRemaining;
    if (el.breathingCycleLabel) el.breathingCycleLabel.textContent = `Cycle 1 of ${maxCycles}`;
    if (el.breathingGuideTip) el.breathingGuideTip.textContent = config[0].tip;
    if (el.breathingOrb) el.breathingOrb.style.transform = 'scale(1)';
  }

  function finishBreathingSession() {
    resetBreathingSession();
    playCompletionSound();
    triggerVibrate([100, 50, 150]);
    awardXP(20, 'Breathwork Reset Completed');
    checkBadges();
    showToast('🫁 Fantastic! Parasympathetic calm restored.', 'success');
  }

  // ==========================================================================
  // 14. QUICK SCRATCHPAD / BRAIN DUMP CONTROLLER
  // ==========================================================================
  let scratchpadSaveTimeout = null;

  function initScratchpad() {
    const text = state.scratchpad || '';
    if (el.scratchpadTextarea) el.scratchpadTextarea.value = text;
    updateScratchpadStats();
  }

  function updateScratchpadStats() {
    const text = el.scratchpadTextarea ? el.scratchpadTextarea.value : (state.scratchpad || '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    if (el.scratchpadWordCount) {
      el.scratchpadWordCount.textContent = `${words} words • ${chars} chars`;
    }

    if (el.fabNoteDot) {
      if (chars > 0) el.fabNoteDot.classList.add('visible');
      else el.fabNoteDot.classList.remove('visible');
    }
  }

  // ==========================================================================
  // 15. ATTACH NEW FEATURE EVENT LISTENERS
  // ==========================================================================
  // Gamification Header & Badges Modal
  if (el.headerLevelBtn) {
    el.headerLevelBtn.addEventListener('click', () => {
      playClickSound();
      renderGamification();
      el.badgesModal.classList.add('open');
    });
  }

  if (el.closeBadgesModalBtn) {
    el.closeBadgesModalBtn.addEventListener('click', () => {
      playClickSound();
      el.badgesModal.classList.remove('open');
    });
  }

  if (el.closeBadgesModalDoneBtn) {
    el.closeBadgesModalDoneBtn.addEventListener('click', () => {
      playClickSound();
      el.badgesModal.classList.remove('open');
    });
  }

  // Routine Presets Modal
  if (el.openTemplatesModalBtn) {
    el.openTemplatesModalBtn.addEventListener('click', () => {
      playClickSound();
      renderTemplatesUI();
      el.templatesModal.classList.add('open');
    });
  }

  if (el.closeTemplatesModalBtn) {
    el.closeTemplatesModalBtn.addEventListener('click', () => {
      playClickSound();
      el.templatesModal.classList.remove('open');
    });
  }

  if (el.openAddRoutineTopBtn) {
    el.openAddRoutineTopBtn.addEventListener('click', openAddRoutineModal);
  }

  if (el.appendTemplateBtn) {
    el.appendTemplateBtn.addEventListener('click', () => applyTemplate('append'));
  }

  if (el.replaceTemplateBtn) {
    el.replaceTemplateBtn.addEventListener('click', () => {
      if (confirm('Replace your current daily routine with this preset template?')) {
        applyTemplate('replace');
      }
    });
  }

  // Ambient Focus Soundscapes
  if (el.ambientTileBtns) {
    el.ambientTileBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        const snd = btn.getAttribute('data-sound');
        playAmbientSound(snd);
      });
    });
  }

  if (el.ambientMasterToggleBtn) {
    el.ambientMasterToggleBtn.addEventListener('click', () => {
      playClickSound();
      if (isAmbientPlaying) {
        stopAmbientSound(0.3);
        state.ambientSound.current = null;
        saveState();
        updateAmbientUI();
        showToast('Ambient sound stopped');
      } else {
        const toPlay = state.ambientSound.current || 'rain';
        playAmbientSound(toPlay);
      }
    });
  }

  if (el.ambientVolumeSlider) {
    el.ambientVolumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) / 100;
      setAmbientVolume(val);
      if (el.ambientVolumeVal) el.ambientVolumeVal.textContent = `${e.target.value}%`;
    });
  }

  if (el.ambientAutoSyncToggle) {
    el.ambientAutoSyncToggle.addEventListener('change', (e) => {
      state.ambientSound.autoSync = e.target.checked;
      saveState();
      showToast(state.ambientSound.autoSync ? 'Synced sound with timer' : 'Timer sound sync off');
    });
  }

  // Zen Breathwork
  if (el.openBreathingModalBtn) {
    el.openBreathingModalBtn.addEventListener('click', () => {
      playClickSound();
      resetBreathingSession();
      el.breathingModal.classList.add('open');
    });
  }

  if (el.closeBreathingModalBtn) {
    el.closeBreathingModalBtn.addEventListener('click', () => {
      playClickSound();
      pauseBreathingSession();
      el.breathingModal.classList.remove('open');
    });
  }

  if (el.patternPills) {
    el.patternPills.forEach(pill => {
      pill.addEventListener('click', () => {
        playClickSound();
        el.patternPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        breathingPattern = pill.getAttribute('data-pattern');
        resetBreathingSession();
      });
    });
  }

  if (el.toggleBreathingBtn) {
    el.toggleBreathingBtn.addEventListener('click', () => {
      playClickSound();
      if (isBreathingActive) {
        pauseBreathingSession();
      } else {
        startBreathingSession();
      }
    });
  }

  if (el.resetBreathingBtn) {
    el.resetBreathingBtn.addEventListener('click', () => {
      playClickSound();
      resetBreathingSession();
    });
  }

  // Scratchpad FAB & Actions
  if (el.fabScratchpadBtn) {
    el.fabScratchpadBtn.addEventListener('click', () => {
      playClickSound();
      initScratchpad();
      el.scratchpadModal.classList.add('open');
    });
  }

  if (el.closeScratchpadModalBtn) {
    el.closeScratchpadModalBtn.addEventListener('click', () => {
      playClickSound();
      el.scratchpadModal.classList.remove('open');
    });
  }

  if (el.closeScratchpadDoneBtn) {
    el.closeScratchpadDoneBtn.addEventListener('click', () => {
      playClickSound();
      el.scratchpadModal.classList.remove('open');
    });
  }

  if (el.scratchpadTextarea) {
    el.scratchpadTextarea.addEventListener('input', () => {
      if (el.scratchpadSaveStatus) el.scratchpadSaveStatus.textContent = 'Saving...';
      updateScratchpadStats();
      clearTimeout(scratchpadSaveTimeout);
      scratchpadSaveTimeout = setTimeout(() => {
        state.scratchpad = el.scratchpadTextarea.value;
        saveState();
        if (el.scratchpadSaveStatus) el.scratchpadSaveStatus.textContent = 'Saved locally ✓';
        if (state.scratchpad && state.scratchpad.length > 5) {
          awardXP(10, 'Scratchpad Note');
          checkBadges();
        }
      }, 400);
    });
  }

  if (el.convertLineToTaskBtn) {
    el.convertLineToTaskBtn.addEventListener('click', () => {
      playClickSound();
      const text = el.scratchpadTextarea ? el.scratchpadTextarea.value : '';
      const lines = text.split('\n').map(l => l.replace(/^[•\-\*\d\.]+\s*/, '').trim()).filter(Boolean);
      if (lines.length === 0) {
        showToast('Write a note first to convert to task');
        return;
      }
      const taskTitle = lines[0];
      state.tasks.unshift({
        id: 't_' + Date.now(),
        title: taskTitle,
        priority: 'medium',
        completed: false
      });
      saveState();
      renderTasks();
      awardXP(15, 'Converted Note to Task');
      playCheckmarkSound();
      showToast(`Added Task: "${taskTitle}"`, 'success');
    });
  }

  if (el.copyScratchpadBtn) {
    el.copyScratchpadBtn.addEventListener('click', () => {
      playClickSound();
      const text = el.scratchpadTextarea ? el.scratchpadTextarea.value : '';
      if (!text) {
        showToast('Notepad is empty');
        return;
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied scratchpad to clipboard!', 'success');
        }).catch(() => {
          showToast('Could not access clipboard');
        });
      } else {
        showToast('Clipboard not supported');
      }
    });
  }

  if (el.clearScratchpadBtn) {
    el.clearScratchpadBtn.addEventListener('click', () => {
      if (!confirm('Clear all scratchpad notes?')) return;
      playClickSound();
      if (el.scratchpadTextarea) el.scratchpadTextarea.value = '';
      state.scratchpad = '';
      saveState();
      updateScratchpadStats();
      showToast('Scratchpad cleared');
    });
  }

  // Modal triggers
  if (el.openAddRoutineModalBtn) el.openAddRoutineModalBtn.addEventListener('click', openAddRoutineModal);
  if (el.closeRoutineModalBtn) el.closeRoutineModalBtn.addEventListener('click', closeRoutineModal);
  if (el.cancelRoutineModalBtn) el.cancelRoutineModalBtn.addEventListener('click', closeRoutineModal);

  if (el.openAddHabitModalBtn) el.openAddHabitModalBtn.addEventListener('click', openAddHabitModal);
  if (el.closeHabitModalBtn) el.closeHabitModalBtn.addEventListener('click', closeHabitModal);
  if (el.cancelHabitModalBtn) el.cancelHabitModalBtn.addEventListener('click', closeHabitModal);

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === el.routineModal) closeRoutineModal();
    if (e.target === el.habitModal) closeHabitModal();
    if (e.target === el.settingsModal) el.settingsModal.classList.remove('open');
    if (e.target === el.badgesModal) el.badgesModal.classList.remove('open');
    if (e.target === el.templatesModal) el.templatesModal.classList.remove('open');
    if (e.target === el.breathingModal) {
      pauseBreathingSession();
      el.breathingModal.classList.remove('open');
    }
    if (e.target === el.scratchpadModal) el.scratchpadModal.classList.remove('open');
  });

  // Utility to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Window resize handler for canvas
  window.addEventListener('resize', () => {
    drawWeeklyChart();
  });

  // ==========================================================================
  // 16. CONNECTIVITY, BACKGROUND SYNC & NOTIFICATIONS CONTROLLER
  // ==========================================================================
  let offlineHideTimeout = null;

  function updateConnectivityUI(isOnline) {
    if (!el.connectivityToast) return;
    clearTimeout(offlineHideTimeout);

    if (!isOnline) {
      el.connectivityToast.classList.remove('hidden', 'online-toast', 'sync-toast');
      if (el.connectivityText) {
        el.connectivityText.innerHTML = '⚡ Offline Mode &bull; Changes saved locally';
      }
      if (el.networkStatusIcon) {
        el.networkStatusIcon.textContent = '🚫';
        el.networkStatusIcon.title = 'Offline';
      }
      if (el.wifiStatusIcon) {
        el.wifiStatusIcon.textContent = '📡';
        el.wifiStatusIcon.title = 'Local Cache Only';
      }
      showToast('Working offline. All changes are saved locally!', 'normal');
    } else {
      el.connectivityToast.classList.remove('hidden', 'sync-toast');
      el.connectivityToast.classList.add('online-toast');
      if (el.connectivityText) {
        el.connectivityText.innerHTML = '✓ Back Online &bull; Data synchronized';
      }
      if (el.networkStatusIcon) {
        el.networkStatusIcon.textContent = '📶';
        el.networkStatusIcon.title = 'Online';
      }
      if (el.wifiStatusIcon) {
        el.wifiStatusIcon.textContent = '🛜';
        el.wifiStatusIcon.title = 'Connected';
      }

      triggerBackgroundSync();

      offlineHideTimeout = setTimeout(() => {
        if (el.connectivityToast) el.connectivityToast.classList.add('hidden');
      }, 3500);
    }
  }

  function triggerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window && window.swRegistration) {
      try {
        window.swRegistration.sync.register('sync-actiday-data').catch(err => {
          console.log('Background sync registration note:', err);
        });
      } catch (e) {}
    }
  }

  function dispatchSystemNotification(title, body, tag = 'actiday-notification') {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    if (window.swRegistration && window.swRegistration.active) {
      window.swRegistration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag
      });
    } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag
      });
    } else {
      try {
        new Notification(title, {
          body,
          icon: './icons/icon.svg',
          tag
        });
      } catch (e) {
        console.log('Notification fallback:', e);
      }
    }
  }

  function updateNotifButtonUI() {
    if (!el.notifToggleBtn) return;
    if (!('Notification' in window)) {
      el.notifToggleBtn.style.display = 'none';
      return;
    }
    if (Notification.permission === 'granted') {
      el.notifToggleBtn.classList.add('active-granted');
      el.notifToggleBtn.title = 'Notifications Active (Focus & routine alerts enabled)';
      if (el.notifIcon) el.notifIcon.textContent = '🔔';
    } else if (Notification.permission === 'denied') {
      el.notifToggleBtn.classList.remove('active-granted');
      el.notifToggleBtn.title = 'Notifications Blocked in Browser Settings';
      if (el.notifIcon) el.notifIcon.textContent = '🔕';
    } else {
      el.notifToggleBtn.classList.remove('active-granted');
      el.notifToggleBtn.title = 'Enable Focus & Routine Notifications';
      if (el.notifIcon) el.notifIcon.textContent = '🔔';
    }
  }

  function requestNotificationAccess() {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported by this browser.', 'alert');
      return;
    }
    playClickSound();

    if (Notification.permission === 'granted') {
      dispatchSystemNotification(
        'ActiDay Reminders Active 🔔',
        'You are already subscribed to focus timer alarms and routine milestone alerts!'
      );
      showToast('Notifications are enabled and active! 🔔', 'success');
      updateNotifButtonUI();
      return;
    }

    Notification.requestPermission().then(permission => {
      updateNotifButtonUI();
      if (permission === 'granted') {
        playCompletionSound();
        triggerVibrate([60, 40, 60]);
        awardXP(25, 'Enabled Productivity Alerts');
        checkBadges();
        showToast('🎉 Notifications enabled! Focus alerts will pop up.', 'success');
        dispatchSystemNotification(
          'ActiDay Notifications Active 🎉',
          'You will now receive alerts for Pomodoro timer sessions & daily milestone streaks.'
        );
      } else if (permission === 'denied') {
        showToast('Notification permission denied. Re-enable in site settings.', 'alert');
      }
    });
  }

  // Connectivity Listeners
  window.addEventListener('online', () => updateConnectivityUI(true));
  window.addEventListener('offline', () => updateConnectivityUI(false));

  if (el.notifToggleBtn) {
    el.notifToggleBtn.addEventListener('click', requestNotificationAccess);
  }

  // ==========================================================================
  // 17. INITIALIZATION
  // ==========================================================================
  function init() {
    applyTheme(state.settings.theme);
    if (el.soundIcon) el.soundIcon.textContent = state.settings.soundEnabled ? '🔊' : '🔇';

    updateClock();
    setInterval(updateClock, 1000);

    renderRoutines();
    renderHabits();
    renderTasks();
    resetTimer();
    renderAnalytics();
    updateOverallProgress();

    // Initialize gamification & interactive features
    renderGamification();
    checkBadges();
    renderTemplatesUI();
    initScratchpad();
    updateAmbientUI();

    // Initialize Service Worker connectivity & notification UI
    if (!navigator.onLine) {
      updateConnectivityUI(false);
    }
    updateNotifButtonUI();

    if (el.ambientVolumeSlider && state.ambientSound) {
      el.ambientVolumeSlider.value = Math.round((state.ambientSound.volume || 0.65) * 100);
    }
    if (el.ambientVolumeVal && state.ambientSound) {
      el.ambientVolumeVal.textContent = `${Math.round((state.ambientSound.volume || 0.65) * 100)}%`;
    }
    if (el.ambientAutoSyncToggle && state.ambientSound) {
      el.ambientAutoSyncToggle.checked = state.ambientSound.autoSync !== false;
    }

    // Handle deep-link hash routing from PWA Manifest Shortcuts
    function handleRouteHash() {
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        const validTabs = ['tabRoutine', 'tabHabits', 'tabTasks', 'tabFocus', 'tabInsights'];
        if (validTabs.includes(hash)) {
          switchTab(hash);
        }
      }
    }
    handleRouteHash();
    window.addEventListener('hashchange', handleRouteHash);

    console.log('Daily Routine Android App initialized successfully with Service Worker offline & notification suite.');
  }

  document.addEventListener('DOMContentLoaded', init);

})();

