/**
 * FORTUNE RABBIT - MOTOR DE JOGO OFICIAL 1:1 (PG SOFT REPLICA)
 * Grade 3-4-3 com Funcionalidade Coelho da Fortuna, Notas de Prêmio e Auto Spin
 */
(function () {
  // Configuração das Apostas (Degraus oficiais)
  const BET_STEPS = [0.50, 1.00, 2.00, 3.00, 5.00, 10.00, 20.00, 50.00];
  let betIndex = 0; // Padrão R$ 0,50 conforme vídeo
  let balance = parseFloat(localStorage.getItem('fg_balance') || '12.50');

  // Multiplicadores dos Símbolos de Pagamento
  const PAYOUTS = {
    'wild': 200,
    'ingot': 100,
    'bag': 50,
    'envelope': 10,
    'coins': 5,
    'firecracker': 3,
    'carrot': 2
  };

  const PRIZE_VALUES = [0.25, 0.50, 1.00, 2.50, 5.00, 10.00, 25.00, 250.00];

  const REGULAR_SYMBOLS = ['ingot', 'bag', 'envelope', 'coins', 'firecracker', 'carrot'];

  // 10 Linhas de Pagamento Fixas no Grid 3-4-3
  // [linha_rolo0, linha_rolo1, linha_rolo2]
  const PAYLINES = [
    [0, 1, 0], // Linha superior
    [1, 1, 1], // Linha central alta
    [1, 2, 1], // Linha central baixa
    [2, 2, 2], // Linha inferior
    [0, 0, 0], // Topo estendido
    [2, 3, 2], // Fundo estendido
    [0, 1, 2], // Diagonal descendente
    [2, 2, 0], // Diagonal ascendente
    [1, 0, 1], // V invertido
    [1, 3, 1]  // V reto
  ];

  let isSpinning = false;
  let isTurbo = false;
  let isAuto = false;
  let autoSpinsRemaining = 0;
  let isFortuneMode = false;
  let fortuneSpinsRemaining = 0;

  // Formatação de Moeda BRL
  function formatBRL(val) {
    return 'R$ ' + val.toFixed(2).replace('.', ',');
  }

  // Atualização do Relógio em Tempo Real
  function startClock() {
    const clockEl = document.getElementById('liveClock');
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
  }

  // Atualizar Saldo e Aposta na Interface
  function updateDisplays() {
    const walletEl = document.getElementById('walletDisplay');
    const betEl = document.getElementById('betDisplay');
    if (walletEl) walletEl.textContent = formatBRL(balance);
    if (betEl) betEl.textContent = formatBRL(BET_STEPS[betIndex]);
    localStorage.setItem('fg_balance', balance.toString());
  }

  // Mostrar Toast Temporário
  function showToast(msg) {
    const toast = document.getElementById('betToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }

  // Áudio Sintetizado Especial Fortune Rabbit (Web Audio API)
  const RabbitSound = {
    ctx: null,
    muted: false,
    bgOsc: null,

    init() {
      if (!this.ctx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.ctx = new AudioClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },

    spinWhoosh() {
      if (this.muted) return;
      this.playTone(180, 'triangle', 0.2, 0.2);
    },

    reelStop() {
      if (this.muted) return;
      this.playTone(320, 'square', 0.06, 0.12);
    },

    anticipate() {
      if (this.muted) return;
      this.playTone(587.33, 'sine', 0.4, 0.2);
    },

    winChime() {
      if (this.muted) return;
      // Arpeggio alegre estilo chinês pentatônico
      const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      scale.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.2), idx * 60);
      });
    },

    bigWinFanfare() {
      if (this.muted) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'square', 0.3, 0.25), idx * 80);
      });
    },

    toggle() {
      this.muted = !this.muted;
      const btn = document.getElementById('btnSound');
      if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
      return !this.muted;
    }
  };

  // Inicialização do Jogo
  function init() {
    startClock();
    updateDisplays();

    // Eventos de Aposta
    document.getElementById('btnMinus')?.addEventListener('click', () => {
      if (isSpinning) return;
      if (betIndex > 0) {
        betIndex--;
        updateDisplays();
        showToast(betIndex === 0 ? 'Aposta Mínima' : `Aposta: ${formatBRL(BET_STEPS[betIndex])}`);
        RabbitSound.playTone(400, 'sine', 0.05, 0.1);
      }
    });

    document.getElementById('btnPlus')?.addEventListener('click', () => {
      if (isSpinning) return;
      if (betIndex < BET_STEPS.length - 1) {
        betIndex++;
        updateDisplays();
        showToast(`Aposta: ${formatBRL(BET_STEPS[betIndex])}`);
        RabbitSound.playTone(500, 'sine', 0.05, 0.1);
      }
    });

    // Turbo
    const btnTurbo = document.getElementById('btnTurbo');
    btnTurbo?.addEventListener('click', () => {
      isTurbo = !isTurbo;
      btnTurbo.classList.toggle('on', isTurbo);
      RabbitSound.playTone(isTurbo ? 880 : 440, 'triangle', 0.1, 0.2);
    });

    // Som
    document.getElementById('btnSound')?.addEventListener('click', () => {
      RabbitSound.toggle();
    });

    // Botão Principal de Giro (Redondo Verde / Quadrado Auto)
    document.getElementById('btnMainSpin')?.addEventListener('click', () => {
      if (isAuto) {
        stopAutoSpin();
      } else {
        triggerSpin();
      }
    });

    // Modal de Auto Spin
    const autoModal = document.getElementById('autoModal');
    document.getElementById('btnOpenAuto')?.addEventListener('click', () => {
      if (isAuto) {
        stopAutoSpin();
      } else if (autoModal) {
        autoModal.style.display = 'flex';
        RabbitSound.playTone(440, 'sine', 0.08, 0.1);
      }
    });

    // Opções de Rodadas Automáticas
    document.querySelectorAll('.auto-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.getAttribute('data-spins') || '50', 10);
        if (autoModal) autoModal.style.display = 'none';
        startAutoSpin(count);
      });
    });

    // Toque no mascote coelho faz ele reagir
    document.getElementById('mascotWrapper')?.addEventListener('click', () => {
      const bubble = document.getElementById('mascotBubble');
      const mascot = document.getElementById('rabbitMascotImg');
      if (bubble) {
        bubble.textContent = 'GANHE ATÉ x5000!';
        bubble.style.display = 'block';
        setTimeout(() => bubble.style.display = 'none', 2000);
      }
      if (mascot) {
        mascot.style.animation = 'mascotExcited 0.6s ease-in-out';
        setTimeout(() => mascot.style.animation = 'mascotBob 3s ease-in-out infinite', 600);
      }
      RabbitSound.winChime();
    });

    // Desbloquear áudio no primeiro toque
    document.addEventListener('pointerdown', () => RabbitSound.init(), { once: true });
  }

  // Gerenciamento de Auto Spin
  function startAutoSpin(count) {
    isAuto = true;
    autoSpinsRemaining = count;

    const btnSpin = document.getElementById('btnMainSpin');
    const spinArrows = document.getElementById('spinArrows');
    const autoBadge = document.getElementById('autoCounterBadge');
    const autoNum = document.getElementById('autoCountNum');

    if (btnSpin) btnSpin.classList.add('auto-active');
    if (spinArrows) spinArrows.style.display = 'none';
    if (autoBadge) autoBadge.style.display = 'flex';
    if (autoNum) autoNum.textContent = autoSpinsRemaining.toString();

    triggerSpin();
  }

  function stopAutoSpin() {
    isAuto = false;
    autoSpinsRemaining = 0;

    const btnSpin = document.getElementById('btnMainSpin');
    const spinArrows = document.getElementById('spinArrows');
    const autoBadge = document.getElementById('autoCounterBadge');

    if (btnSpin) btnSpin.classList.remove('auto-active');
    if (spinArrows) spinArrows.style.display = 'block';
    if (autoBadge) autoBadge.style.display = 'none';
  }

  // Disparador de Giro
  function triggerSpin() {
    if (isSpinning) return;

    const betAmount = BET_STEPS[betIndex];
    if (balance < betAmount) {
      setRibbonText('Saldo insuficiente! Deposite para continuar.', '#f87171');
      stopAutoSpin();
      return;
    }

    isSpinning = true;
    balance -= betAmount;
    updateDisplays();

    // Atualizar contador de auto spin
    if (isAuto) {
      autoSpinsRemaining--;
      const autoNum = document.getElementById('autoCountNum');
      if (autoNum) autoNum.textContent = autoSpinsRemaining.toString();
    }

    // Limpar Paylines anteriores e Destaques
    clearPaylines();
    document.querySelectorAll('.rabbit-symbol-cell').forEach(c => c.classList.remove('winning'));
    document.querySelectorAll('.reel-column').forEach(c => c.classList.remove('anticipating'));

    // Som de giro
    RabbitSound.spinWhoosh();

    // Animar mascote
    const mascot = document.getElementById('rabbitMascotImg');
    if (mascot) {
      mascot.style.transform = 'translateY(-10px) scale(1.05)';
      setTimeout(() => mascot.style.transform = 'none', 300);
    }

    // Botão de giro em rotação
    const btnSpin = document.getElementById('btnMainSpin');
    btnSpin?.classList.add('spinning');

    setRibbonText('8 RODADAS DA FORTUNA COM SÍMBOLOS DE PRÊMIO NA FUNCIONALIDADE COELHO DA FORTUNA!', '#fef08a');

    // Executar animação de rotação dos 3 rolos
    spinReelsAnimation();
  }

  // Animação de Rotação Rápida com Motion Blur
  function spinReelsAnimation() {
    const col0 = [document.getElementById('c0-r0'), document.getElementById('c0-r1'), document.getElementById('c0-r2')];
    const col1 = [document.getElementById('c1-r0'), document.getElementById('c1-r1'), document.getElementById('c1-r2'), document.getElementById('c1-r3')];
    const col2 = [document.getElementById('c2-r0'), document.getElementById('c2-r1'), document.getElementById('c2-r2')];

    const allCols = [col0, col1, col2];
    const colElements = [document.getElementById('col-0'), document.getElementById('col-1'), document.getElementById('col-2')];

    // Adicionar classe spinning para blur
    colElements.forEach(el => el?.classList.add('spinning'));

    // Intervalos rápidos trocando símbolos
    const intervals = allCols.map(col => {
      return setInterval(() => {
        col.forEach(cell => {
          const rand = getRandomSymbol();
          renderCell(cell, rand.type, rand.prizeVal);
        });
      }, isTurbo ? 35 : 55);
    });

    // Gerar resultado final da rodada
    const finalGrid = generateSpinResult();

    const baseDelay = isTurbo ? 220 : 450;
    const stepDelay = isTurbo ? 160 : 320;

    // Parar Rolo 0
    setTimeout(() => {
      clearInterval(intervals[0]);
      colElements[0]?.classList.remove('spinning');
      allCols[0].forEach((cell, r) => renderCell(cell, finalGrid[0][r].type, finalGrid[0][r].prizeVal));
      RabbitSound.reelStop();

      // Parar Rolo 1
      setTimeout(() => {
        clearInterval(intervals[1]);
        colElements[1]?.classList.remove('spinning');
        allCols[1].forEach((cell, r) => renderCell(cell, finalGrid[1][r].type, finalGrid[1][r].prizeVal));
        RabbitSound.reelStop();

        // Verificar se há antecipação no Rolo 2 (terceiro rolo)
        const hasPotential = checkAnticipation(finalGrid);
        if (hasPotential) {
          colElements[2]?.classList.add('anticipating');
          RabbitSound.anticipate();
        }

        // Parar Rolo 2
        setTimeout(() => {
          clearInterval(intervals[2]);
          colElements[2]?.classList.remove('spinning', 'anticipating');
          allCols[2].forEach((cell, r) => renderCell(cell, finalGrid[2][r].type, finalGrid[2][r].prizeVal));
          RabbitSound.reelStop();

          // Avaliar Vitória
          finishSpin(finalGrid);
        }, stepDelay + (hasPotential ? 400 : 0));

      }, stepDelay);

    }, baseDelay);
  }

  // Renderizar uma Célula com Símbolo e Prêmio Opcional
  function renderCell(cell, type, prizeVal) {
    if (!cell) return;
    let imgPath = `/img/rabbit/sym_${type}.jpg`;

    let prizeHtml = '';
    if (type === 'prize' && prizeVal !== undefined) {
      prizeHtml = `<span class="prize-note-value">${prizeVal >= 1 ? prizeVal.toFixed(0) : prizeVal.toFixed(2)}</span>`;
    }

    cell.innerHTML = `<img src="${imgPath}" alt="${type}">${prizeHtml}`;
  }

  // Obter um Símbolo Aleatório Ponderado
  function getRandomSymbol() {
    // 15% de chance de Wild, 20% de Prêmio, 65% Regulares
    const rand = Math.random();
    if (rand < 0.15) {
      return { type: 'wild' };
    } else if (rand < 0.35) {
      const pVal = PRIZE_VALUES[Math.floor(Math.random() * PRIZE_VALUES.length)];
      return { type: 'prize', prizeVal: pVal };
    } else {
      const sym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      return { type: sym };
    }
  }

  // Gerar Matriz de Resultados da Rodada
  function generateSpinResult() {
    // Grade: [ [3 itens], [4 itens], [3 itens] ]
    const grid = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];

    // Forçar 35% de taxa de acerto para boa emoção
    if (Math.random() < 0.38) {
      const winLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
      const winSym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      grid[0][winLine[0]] = { type: winSym };
      grid[1][winLine[1]] = Math.random() < 0.25 ? { type: 'wild' } : { type: winSym };
      grid[2][winLine[2]] = { type: winSym };
    }

    return grid;
  }

  // Checar se há potencial de vitória para antecipação no rolo 3
  function checkAnticipation(grid) {
    for (let line of PAYLINES) {
      const s0 = grid[0][line[0]].type;
      const s1 = grid[1][line[1]].type;
      if (s0 === s1 || s0 === 'wild' || s1 === 'wild') {
        if (s0 !== 'prize' && s1 !== 'prize') {
          return true;
        }
      }
    }
    return false;
  }

  // Avaliação e Finalização da Rodada
  function finishSpin(grid) {
    const bet = BET_STEPS[betIndex];
    let totalWin = 0;
    const winningCells = new Set();
    const winningPaylines = [];

    // 1. Checar Linhas de Pagamento
    PAYLINES.forEach((line, lineIdx) => {
      const s0 = grid[0][line[0]].type;
      const s1 = grid[1][line[1]].type;
      const s2 = grid[2][line[2]].type;

      // Determinar símbolo base da linha
      let matchSym = null;
      if (s0 === 'wild') {
        matchSym = (s1 === 'wild') ? s2 : s1;
      } else {
        matchSym = s0;
      }

      if (matchSym && matchSym !== 'prize') {
        const m0 = (s0 === matchSym || s0 === 'wild');
        const m1 = (s1 === matchSym || s1 === 'wild');
        const m2 = (s2 === matchSym || s2 === 'wild');

        if (m0 && m1 && m2) {
          const payoutMult = PAYOUTS[matchSym] || 5;
          const lineWin = (bet / 10) * payoutMult;
          totalWin += lineWin;

          winningCells.add(`c0-r${line[0]}`);
          winningCells.add(`c1-r${line[1]}`);
          winningCells.add(`c2-r${line[2]}`);

          winningPaylines.push(line);
        }
      }
    });

    // 2. Checar Símbolos de Prêmio (se 5 ou mais aparecerem na tela, paga todos!)
    let prizeCount = 0;
    let prizeSum = 0;
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        if (grid[c][r].type === 'prize') {
          prizeCount++;
          prizeSum += (grid[c][r].prizeVal || 0.50);
        }
      }
    }

    if (prizeCount >= 5) {
      totalWin += prizeSum;
      if (window.FortuneConfetti) {
        window.FortuneConfetti.celebrateBigWin();
      }
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < grid[c].length; r++) {
          if (grid[c][r].type === 'prize') {
            winningCells.add(`c${c}-r${r}`);
          }
        }
      }
      setRibbonText(`🎁 ${prizeCount} NOTAS DA FORTUNA! +${formatBRL(prizeSum)}`, '#facc15');
    }

    // Aplicar Destaques Visuais
    winningCells.forEach(cellId => {
      document.getElementById(cellId)?.classList.add('winning');
    });

    // Desenhar Linhas de Pagamento
    if (winningPaylines.length > 0) {
      drawPaylines(winningPaylines);
    }

    // Processar Resultado
    const btnSpin = document.getElementById('btnMainSpin');
    btnSpin?.classList.remove('spinning');
    isSpinning = false;

    if (totalWin > 0) {
      balance += totalWin;
      updateDisplays();

      // Atualizar Texto de Ganho exatamente como no vídeo: "GANHO 0,60"
      const winStr = `GANHO ${totalWin.toFixed(2).replace('.', ',')}`;
      setRibbonText(winStr, '#4ade80', true);

      // Efeito sonoro e Explosão de Confetes Comemorativos
      if (totalWin >= bet * 10) {
        RabbitSound.bigWinFanfare();
        if (window.FortuneConfetti) {
          window.FortuneConfetti.celebrateBigWin();
        }
        showBigWin(totalWin);
      } else {
        RabbitSound.winChime();
        if (window.FortuneConfetti) {
          window.FortuneConfetti.celebrateWin();
        }
      }
    } else {
      setRibbonText('GANHE ATÉ x5000!', '#fef08a', false);
    }

    // Continuação do Modo Automático
    if (isAuto) {
      if (autoSpinsRemaining > 0) {
        setTimeout(triggerSpin, isTurbo ? 250 : 700);
      } else {
        stopAutoSpin();
      }
    }
  }

  // Desenhar Linhas no SVG Overlay
  function drawPaylines(lines) {
    const svg = document.getElementById('paylineSvg');
    if (!svg) return;
    svg.innerHTML = '';

    // Coordenadas relativas aproximadas dos centros das células
    // Rolo 0 (3 linhas): x = 50, y = [45, 120, 195]
    // Rolo 1 (4 linhas): x = 160, y = [25, 95, 165, 235]
    // Rolo 2 (3 linhas): x = 270, y = [45, 120, 195]
    const coords = {
      0: [ {x: 50, y: 45}, {x: 50, y: 120}, {x: 50, y: 195} ],
      1: [ {x: 160, y: 25}, {x: 160, y: 95}, {x: 160, y: 165}, {x: 160, y: 235} ],
      2: [ {x: 270, y: 45}, {x: 270, y: 120}, {x: 270, y: 195} ]
    };

    lines.forEach((line, idx) => {
      const p0 = coords[0][line[0]];
      const p1 = coords[1][line[1]];
      const p2 = coords[2][line[2]];

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
      path.setAttribute('stroke', '#facc15');
      path.setAttribute('stroke-width', '4');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('fill', 'none');
      path.setAttribute('filter', 'drop-shadow(0 0 6px #f59e0b)');
      svg.appendChild(path);
    });
  }

  function clearPaylines() {
    const svg = document.getElementById('paylineSvg');
    if (svg) svg.innerHTML = '';
  }

  function setRibbonText(text, color = '#fef08a', celebrate = false) {
    const ribbon = document.getElementById('winRibbon');
    const ribbonText = document.getElementById('winRibbonText');
    if (ribbonText) {
      ribbonText.textContent = text;
      ribbonText.style.color = color;
    }
    if (ribbon) {
      ribbon.classList.toggle('celebrating', celebrate);
    }
  }

  function showBigWin(amount) {
    const overlay = document.getElementById('bigWinOverlay');
    const amountEl = document.getElementById('bigWinAmount');
    if (amountEl) amountEl.textContent = formatBRL(amount);
    if (overlay) overlay.style.display = 'flex';
  }

  window.addEventListener('DOMContentLoaded', init);
})();
