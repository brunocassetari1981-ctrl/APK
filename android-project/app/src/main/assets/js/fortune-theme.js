/**
 * FORTUNE THEME - Gerenciador de Temas, Sons e Efeitos Visuais
 */
(function () {
  window.FortuneTheme = {
    applyTheme: function (gameId) {
      const themes = {
        'tigre': { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: '#78350f' },
        'touro': { primary: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)', bg: '#701a75' },
        'coelho': { primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', bg: '#831843' },
        'dragao': { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', bg: '#1e3a8a' },
        'rato': { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: '#064e3b' },
        'panda': { primary: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', bg: '#134e4a' },
        'mina-de-ouro': { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', bg: '#1e1b4b' },
        'aviator': { primary: '#e11d48', glow: 'rgba(225, 29, 72, 0.4)', bg: '#881337' },
        'roleta': { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', bg: '#14532d' },
        'futebol': { primary: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)', bg: '#1d4ed8' },
        'bingo-imperial': { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', bg: '#581c87' },
        'espaco': { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', bg: '#0f172a' }
      };

      const theme = themes[gameId] || themes['tigre'];
      document.documentElement.style.setProperty('--primary', theme.primary);
      document.documentElement.style.setProperty('--border-gold', theme.glow);

      const frame = document.getElementById('slotFrame');
      if (frame) {
        frame.style.borderColor = theme.primary;
        frame.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.8), 0 0 20px ${theme.glow}`;
      }
    }
  };
})();
