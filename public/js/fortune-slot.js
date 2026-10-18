/**
 * FORTUNE SLOT - Caça-Níquel Interativo Completo com Animação, Giros e Prêmios
 */
(function () {
  const SYMBOLS = [
    { icon: '🐯', name: 'Tigre da Sorte', mult: 25 },
    { icon: '🪙', name: 'Lingote de Ouro', mult: 10 },
    { icon: '🧧', name: 'Envelope Vermelho', mult: 5 },
    { icon: '💰', name: 'Saco de Moedas', mult: 3 },
    { icon: '🍊', name: 'Laranja da Prosperidade', mult: 2 },
    { icon: '🧨', name: 'Fogos de Artifício', mult: 1.5 }
  ];

  let currentBet = 1.00;
  let isSpinning = false;
  let activeGameTitle = 'Fortune Tiger';

  window.FortuneSlot = {
    open: function (gameId, gameTitle) {
      activeGameTitle = gameTitle || 'Fortune Tiger';
      if (window.FortuneAudio) window.FortuneAudio.click();

      // Criar modal se não existir
      let modal = document.getElementById('slotModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'slotModal';
        modal.className = 'fg-modal-overlay';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="fg-modal">
          <div class="fg-modal-header">
            <h3><span>🎰</span> <span id="slotModalTitle">${activeGameTitle}</span></h3>
            <button class="fg-close-btn" onclick="window.FortuneSlot.close()">✕</button>
          </div>
          <div class="fg-modal-body">
            <!-- REELS -->
            <div class="slot-machine">
              <div class="slot-reels-container">
                <div class="slot-reel" id="reel-0">
                  <div class="slot-symbol">🐯</div>
                </div>
                <div class="slot-reel" id="reel-1">
                  <div class="slot-symbol">🪙</div>
                </div>
                <div class="slot-reel" id="reel-2">
                  <div class="slot-symbol">🧧</div>
                </div>
              </div>
            </div>

            <!-- RESULT MESSAGE -->
            <div id="slotMessage" style="text-align:center;font-size:13px;font-weight:800;min-height:22px;color:#fcd34d">
              Aposte e gire os rolos da sorte!
            </div>

            <!-- CONTROLS -->
            <div class="slot-controls">
              <div class="bet-selector">
                <button onclick="window.FortuneSlot.adjustBet(-0.50)">-</button>
                <div style="font-size:12px;font-weight:800;color:#fff;min-width:65px;text-align:center">
                  R$ <span id="slotBetVal">${currentBet.toFixed(2).replace('.', ',')}</span>
                </div>
                <button onclick="window.FortuneSlot.adjustBet(0.50)">+</button>
              </div>

              <button class="spin-btn" id="slotSpinBtn" onclick="window.FortuneSlot.spin()">
                GIRAR (R$ <span id="slotSpinBet">${currentBet.toFixed(2).replace('.', ',')}</span>)
              </button>
            </div>

            <!-- MULTIPLIERS BAR -->
            <div style="display:flex;justify-content:space-between;padding:8px 12px;background:#180F29;border-radius:12px;font-size:11px;color:var(--text-muted)">
              <span>🐯 3x = 25x</span>
              <span>🪙 3x = 10x</span>
              <span>🧧 3x = 5x</span>
              <span>💰 3x = 3x</span>
            </div>
          </div>
        </div>
      `;

      modal.style.display = 'flex';
    },

    close: function () {
      const modal = document.getElementById('slotModal');
      if (modal) {
        modal.style.display = 'none';
      }
      if (window.FortuneAudio) window.FortuneAudio.click();
    },

    adjustBet: function (delta) {
      if (isSpinning) return;
      currentBet = Math.max(0.50, Math.min(50.00, currentBet + delta));
      const betStr = currentBet.toFixed(2).replace('.', ',');
      const elVal = document.getElementById('slotBetVal');
      const elSpin = document.getElementById('slotSpinBet');
      if (elVal) elVal.textContent = betStr;
      if (elSpin) elSpin.textContent = betStr;
      if (window.FortuneAudio) window.FortuneAudio.click();
    },

    spin: function () {
      if (isSpinning) return;
      const currentBalance = window.FortuneLobby.getBalance();

      if (currentBalance < currentBet) {
        const msg = document.getElementById('slotMessage');
        if (msg) {
          msg.textContent = 'Saldo insuficiente! Deposite via Pix para continuar.';
          msg.style.color = '#f87171';
        }
        if (window.FortuneAudio) window.FortuneAudio.vibrate([40, 40]);
        return;
      }

      // Deduz aposta
      isSpinning = true;
      window.FortuneLobby.updateBalance(-currentBet);
      window.FortuneLobby.incrementSpin();

      const spinBtn = document.getElementById('slotSpinBtn');
      const msg = document.getElementById('slotMessage');
      if (spinBtn) spinBtn.disabled = true;
      if (msg) {
        msg.textContent = 'Girando os rolos... Boa sorte! 🍀';
        msg.style.color = '#fcd34d';
      }

      if (window.FortuneAudio) window.FortuneAudio.spin();

      const reels = [
        document.getElementById('reel-0'),
        document.getElementById('reel-1'),
        document.getElementById('reel-2')
      ];

      // Animação de rotação rápida
      const intervals = reels.map((reel) => {
        return setInterval(() => {
          const randSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          if (reel) reel.innerHTML = `<div class="slot-symbol">${randSym.icon}</div>`;
        }, 60);
      });

      // Parar os rolos progressivamente
      setTimeout(() => {
        clearInterval(intervals[0]);
        const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        if (reels[0]) reels[0].innerHTML = `<div class="slot-symbol">${s1.icon}</div>`;
        if (window.FortuneAudio) window.FortuneAudio.click();

        setTimeout(() => {
          clearInterval(intervals[1]);
          // 35% de chance do segundo símbolo bater com o primeiro para gerar emoção
          const s2 = Math.random() < 0.35 ? s1 : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          if (reels[1]) reels[1].innerHTML = `<div class="slot-symbol">${s2.icon}</div>`;
          if (window.FortuneAudio) window.FortuneAudio.click();

          setTimeout(() => {
            clearInterval(intervals[2]);
            // 25% de chance de vitória total
            const s3 = (s1.icon === s2.icon && Math.random() < 0.28)
              ? s1
              : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            if (reels[2]) reels[2].innerHTML = `<div class="slot-symbol">${s3.icon}</div>`;

            // Verificar se houve vitória
            isSpinning = false;
            if (spinBtn) spinBtn.disabled = false;

            if (s1.icon === s2.icon && s2.icon === s3.icon) {
              const prize = currentBet * s1.mult;
              window.FortuneLobby.updateBalance(prize);
              window.FortuneLobby.recordWin(prize, s1.name);

              if (msg) {
                msg.textContent = `🎉 GRANDE VITÓRIA! 3x ${s1.icon} - Ganhou R$ ${prize.toFixed(2).replace('.', ',')}!`;
                msg.style.color = '#4ade80';
              }
              if (window.FortuneAudio) {
                if (s1.mult >= 10) window.FortuneAudio.bigWin();
                else window.FortuneAudio.win();
              }
              if (window.FortuneConfetti) {
                if (s1.mult >= 10) window.FortuneConfetti.celebrateBigWin();
                else window.FortuneConfetti.celebrateWin();
              }
            } else if (s1.icon === s2.icon || s2.icon === s3.icon || s1.icon === s3.icon) {
              // Prêmio menor de 2 símbolos
              const pairSymbol = (s1.icon === s2.icon || s1.icon === s3.icon) ? s1 : s2;
              const smallPrize = currentBet * 0.75;
              window.FortuneLobby.updateBalance(smallPrize);

              if (msg) {
                msg.textContent = `✨ Par de ${pairSymbol.icon}! Recuperou R$ ${smallPrize.toFixed(2).replace('.', ',')}`;
                msg.style.color = '#38bdf8';
              }
              if (window.FortuneAudio) window.FortuneAudio.coin();
              if (window.FortuneConfetti) window.FortuneConfetti.celebrateWin();
            } else {
              if (msg) {
                msg.textContent = 'Não foi desta vez! Tente novamente.';
                msg.style.color = '#94a3b8';
              }
            }
          }, 350);
        }, 300);
      }, 500);
    }
  };
})();
