/**
 * FORTUNE LOBBY - Controle do Lobby, Navegação, Carteira Pix, Estatísticas e Jackpot
 */
window.FortuneLobby = (function () {
  let balance = parseFloat(localStorage.getItem('fg_balance') || '50.00');
  let spins = parseInt(localStorage.getItem('fg_spins') || '0', 10);
  let wins = parseInt(localStorage.getItem('fg_wins') || '0', 10);
  let bestWin = parseFloat(localStorage.getItem('fg_best') || '0.00');
  let historyLog = JSON.parse(localStorage.getItem('fg_history') || '[]');

  let jackpotBase = 1258420.50;

  function formatBRL(val) {
    return 'R$ ' + val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function updateBalanceDisplay() {
    const elBal = document.getElementById('balance');
    const elWBal = document.getElementById('walletBalance');
    const str = formatBRL(balance);
    if (elBal) elBal.textContent = str;
    if (elWBal) elWBal.textContent = str;
    localStorage.setItem('fg_balance', balance.toString());
  }

  function updateStatsDisplay() {
    const elSpins = document.getElementById('statSpins');
    const elWins = document.getElementById('statWins');
    const elBest = document.getElementById('statBest');
    const elHistory = document.getElementById('history');

    if (elSpins) elSpins.textContent = spins.toString();
    if (elWins) elWins.textContent = wins.toString();
    if (elBest) elBest.textContent = formatBRL(bestWin);

    if (elHistory) {
      if (historyLog.length === 0) {
        elHistory.textContent = 'Nenhuma jogada ainda. Escolha um jogo e boa sorte! 🍀';
      } else {
        elHistory.innerHTML = historyLog.slice(0, 5).map(item => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px">
            <span>${item.text}</span>
            <b style="color:${item.win ? '#4ade80' : '#f87171'}">${item.win ? '+' : '-'}${formatBRL(item.amount)}</b>
          </div>
        `).join('');
      }
    }
  }

  // Jackpot Ticker
  function startJackpotTicker() {
    const elJackpot = document.getElementById('jackpot');
    if (!elJackpot) return;

    setInterval(() => {
      jackpotBase += Math.random() * 0.45;
      elJackpot.textContent = 'R$ ' + Math.floor(jackpotBase).toLocaleString('pt-BR');
    }, 1200);
  }

  // Hero Slider
  function initHeroSlider() {
    const track = document.getElementById('heroTrack');
    const dotsContainer = document.getElementById('heroDots');
    if (!track || !dotsContainer) return;

    const slidesCount = 3;
    let currentSlide = 0;

    dotsContainer.innerHTML = Array.from({ length: slidesCount }, (_, i) => `
      <div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
    `).join('');

    const dots = dotsContainer.querySelectorAll('.hero-dot');

    function goToSlide(index) {
      currentSlide = (index + slidesCount) % slidesCount;
      track.style.transform = `translateX(-${currentSlide * (100 / slidesCount)}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        if (window.FortuneAudio) window.FortuneAudio.click();
      });
    });

    setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  // Pix Deposit Modal
  function showPixModal() {
    if (window.FortuneAudio) window.FortuneAudio.click();

    let modal = document.getElementById('pixModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pixModal';
      modal.className = 'fg-modal-overlay';
      document.body.appendChild(modal);
    }

    const pixCode = '00020126580014BR.GOV.BCB.PIX0136fortunego-pix-demo-20265204000053039865802BR5913FORTUNEGO_DEMO6009SAO_PAULO62070503***6304ABCD';

    modal.innerHTML = `
      <div class="fg-modal">
        <div class="fg-modal-header">
          <h3><span>⚡</span> <span>Depósito Rápido via PIX</span></h3>
          <button class="fg-close-btn" onclick="document.getElementById('pixModal').style.display='none'">✕</button>
        </div>
        <div class="fg-modal-body" style="text-align:center">
          <p style="font-size:12px;color:var(--text-muted)">Selecione o valor para recarga instantânea na sua conta:</p>
          
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0">
            <button class="btn ghost" style="padding:10px" onclick="window.FortuneLobby.depositPix(20)">+ R$ 20</button>
            <button class="btn ghost" style="padding:10px;border-color:var(--primary);color:#fbbf24" onclick="window.FortuneLobby.depositPix(50)">+ R$ 50</button>
            <button class="btn ghost" style="padding:10px" onclick="window.FortuneLobby.depositPix(100)">+ R$ 100</button>
          </div>

          <div style="background:#fff;padding:12px;border-radius:12px;width:150px;height:150px;margin:10px auto;display:flex;align-items:center;justify-content:center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(pixCode)}" alt="QR Code Pix" style="width:130px;height:130px">
          </div>

          <small style="color:#10b981;font-weight:700">QR Code gerado para demonstração</small>

          <button class="btn" style="margin-top:6px" onclick="window.FortuneLobby.depositPix(50)">
            ⚡ Confirmar Depósito de Demonstração (R$ 50)
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  return {
    init: function () {
      updateBalanceDisplay();
      updateStatsDisplay();
      startJackpotTicker();
      initHeroSlider();

      // Render inicial dos jogos
      if (window.renderGameGrid) {
        window.renderGameGrid('todos');
      }

      // Event Listeners dos botões de topo
      const soundBtn = document.getElementById('soundBtn');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          if (window.FortuneAudio) window.FortuneAudio.toggleSound();
        });
      }

      const depositBtn = document.getElementById('depositBtn');
      if (depositBtn) {
        depositBtn.addEventListener('click', showPixModal);
      }

      // Navegação por abas
      const navButtons = document.querySelectorAll('#nav button');
      const views = document.querySelectorAll('.view');

      navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-view');
          navButtons.forEach(b => b.classList.remove('on'));
          btn.classList.add('on');

          views.forEach(v => {
            v.classList.remove('on');
            if (v.id === `view-${target}`) {
              v.classList.add('on');
            }
          });

          if (window.FortuneAudio) window.FortuneAudio.click();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });

      // Filtro de chips
      const chips = document.querySelectorAll('#chips .chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('on'));
          chip.classList.add('on');
          const filter = chip.getAttribute('data-filter');
          const query = document.getElementById('searchInput')?.value || '';
          if (window.renderGameGrid) window.renderGameGrid(filter, query);
          if (window.FortuneAudio) window.FortuneAudio.click();
        });
      });

      // Busca
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const activeChip = document.querySelector('#chips .chip.on');
          const filter = activeChip ? activeChip.getAttribute('data-filter') : 'todos';
          if (window.renderGameGrid) window.renderGameGrid(filter, e.target.value);
        });
      }

      // Ações gerais (data-action)
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');

        if (action === 'deposit') {
          showPixModal();
        } else if (action === 'bonus' || action === 'giros') {
          window.location.href = '/game.html';
        } else if (action === 'torneio' || action === 'cashback') {
          alert('Promoção ativa na sua conta! Jogue qualquer slot para pontuar.');
          if (window.FortuneAudio) window.FortuneAudio.coin();
        } else if (action === 'indicar') {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('Jogue no FortuneGo com meu código: FORTUNE2026!');
            alert('Código FORTUNE2026 copiado para a área de transferência!');
          }
        } else if (action === 'recarga') {
          showPixModal();
        } else if (action === 'reset') {
          if (confirm('Deseja zerar o progresso e restaurar saldo para R$ 50,00?')) {
            balance = 50.00;
            spins = 0;
            wins = 0;
            bestWin = 0;
            historyLog = [];
            localStorage.clear();
            updateBalanceDisplay();
            updateStatsDisplay();
            alert('Progresso restaurado!');
          }
        }
      });
    },

    getBalance: function () {
      return balance;
    },

    updateBalance: function (delta) {
      balance = Math.max(0, balance + delta);
      updateBalanceDisplay();
    },

    incrementSpin: function () {
      spins++;
      localStorage.setItem('fg_spins', spins.toString());
      updateStatsDisplay();
    },

    recordWin: function (prize, gameName) {
      wins++;
      if (prize > bestWin) {
        bestWin = prize;
        localStorage.setItem('fg_best', bestWin.toString());
      }
      localStorage.setItem('fg_wins', wins.toString());

      historyLog.unshift({
        text: `Vitória no ${gameName}`,
        amount: prize,
        win: true,
        date: new Date().toLocaleTimeString('pt-BR')
      });
      localStorage.setItem('fg_history', JSON.stringify(historyLog.slice(0, 10)));

      updateStatsDisplay();
    },

    depositPix: function (amount) {
      balance += amount;
      updateBalanceDisplay();
      historyLog.unshift({
        text: 'Depósito Pix',
        amount: amount,
        win: true,
        date: new Date().toLocaleTimeString('pt-BR')
      });
      localStorage.setItem('fg_history', JSON.stringify(historyLog.slice(0, 10)));
      updateStatsDisplay();

      const modal = document.getElementById('pixModal');
      if (modal) modal.style.display = 'none';

      if (window.FortuneAudio) window.FortuneAudio.coin();
      alert(`Depósito de R$ ${amount.toFixed(2).replace('.', ',')} creditado com sucesso!`);
    }
  };
})();

// Iniciar lobby após carregamento da página
window.addEventListener('DOMContentLoaded', function () {
  if (window.FortuneLobby) {
    window.FortuneLobby.init();
  }
});
