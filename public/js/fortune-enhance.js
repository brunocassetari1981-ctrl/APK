/**
 * FORTUNE ENHANCE - Efeitos Sonoros (Web Audio Synth), Vibração Háptica e Explosão de Confetes
 */
(function () {
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Tocar som sintetizado (sem dependência de arquivos externos)
  function playBeep(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  window.FortuneAudio = {
    click: function () {
      playBeep(600, 'sine', 0.05, 0.08);
      FortuneAudio.vibrate(10);
    },
    coin: function () {
      playBeep(987, 'sine', 0.08, 0.12);
      setTimeout(() => playBeep(1318, 'sine', 0.15, 0.15), 50);
      FortuneAudio.vibrate([15, 30, 20]);
    },
    spin: function () {
      playBeep(220, 'triangle', 0.08, 0.1);
      FortuneAudio.vibrate(15);
    },
    win: function () {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => playBeep(freq, 'triangle', 0.2, 0.2), idx * 80);
      });
      FortuneAudio.vibrate([30, 40, 50, 40, 60]);
    },
    bigWin: function () {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => playBeep(freq, 'square', 0.25, 0.18), idx * 70);
      });
      FortuneAudio.vibrate([50, 50, 50, 50, 100]);
    },
    vibrate: function (pattern = 20) {
      if (navigator.vibrate && soundEnabled) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {}
      }
    },
    toggleSound: function () {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('soundBtn');
      if (btn) {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
      }
      localStorage.setItem('fortunego_sound', soundEnabled ? '1' : '0');
      return soundEnabled;
    },
    isSoundEnabled: function () {
      return soundEnabled;
    }
  };

  // SISTEMA CELEBRATÓRIO DE EXPLOSÃO DE CONFETES (CANVAS-CONFETTI)
  window.FortuneConfetti = {
    // Explosão comemorativa de vitória comum (canhões laterais dourados, esmeralda e vermelhos)
    celebrateWin: function () {
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#facc15', '#f59e0b', '#be123c', '#10b981', '#ffffff']
        });
        window.confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#facc15', '#f59e0b', '#be123c', '#10b981', '#ffffff']
        });
      }
    },

    // Explosão triunfal de GRANDE GANHO (chuva contínua de confetes dourados, estrelas e serpentinas por 2.5s)
    celebrateBigWin: function () {
      if (typeof window.confetti === 'function') {
        const duration = 2500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 999 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 40 * (timeLeft / duration);
          window.confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 },
            colors: ['#facc15', '#f59e0b', '#be123c', '#ffd700', '#ffffff']
          }));
          window.confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 },
            colors: ['#facc15', '#10b981', '#ec4899', '#ffd700', '#ffffff']
          }));
        }, 180);

        // Explosão central de ouro e brilho
        window.confetti({
          particleCount: 120,
          spread: 120,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#facc15', '#fbbf24', '#e11d48', '#34d399', '#ffffff']
        });
      }
    }
  };

  // Carregar preferência salva
  const saved = localStorage.getItem('fortunego_sound');
  if (saved !== null) {
    soundEnabled = saved === '1';
  }

  // Desbloqueia contexto de áudio no primeiro clique do usuário
  document.addEventListener('pointerdown', function unlock() {
    initAudio();
    document.removeEventListener('pointerdown', unlock);
  }, { once: true });
})();
