export interface PGSymbolItem {
  id: string;
  name: string;
  emoji: string;
  multiplier: number;
  isWild?: boolean;
  prizeValue?: number;
}

export interface PGGameConfig {
  mascotEmoji: string;
  themeGradient: string;
  bannerEmoji: string;
  maxWinText: string;
  subtitle: string;
  lanternLeftText: string;
  lanternRightText: string;
  availableSymbols: PGSymbolItem[];
  initialReels: PGSymbolItem[][];
  marqueeMessages: string[];
}

export function getPGGameConfig(gameId: string, gameName: string): PGGameConfig {
  const normId = (gameId || '').toLowerCase();
  const normName = (gameName || '').toLowerCase();

  // 1. FORTUNE TIGER
  if (normId.includes('tiger') || normName.includes('tiger') || normName.includes('tigre')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_tiger', name: 'WILD', emoji: '🐯', multiplier: 250, isWild: true },
      { id: 'gold_ingot', name: 'Lingote Ouro', emoji: '🪙', multiplier: 100 },
      { id: 'jade_amulet', name: 'Jade Verde', emoji: '💎', multiplier: 50 },
      { id: 'coin_pot', name: 'Pote Moedas', emoji: '💰', multiplier: 25 },
      { id: 'red_envelope', name: 'Envelope', emoji: '🧧', multiplier: 10 },
      { id: 'firecracker', name: 'Bombinha', emoji: '🧨', multiplier: 5 },
      { id: 'orange', name: 'Tangerina', emoji: '🍊', multiplier: 3 }
    ];
    return {
      mascotEmoji: '🐯',
      themeGradient: 'from-amber-700 via-orange-900 to-red-950',
      bannerEmoji: '🐅',
      maxWinText: 'x2500',
      subtitle: 'O Tigre da Fortuna traz multiplicador de 10x!',
      lanternLeftText: '虎',
      lanternRightText: '發',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[6]],
        [
          { id: 'p_250', name: 'Prêmio 250', emoji: '💰', multiplier: 250, prizeValue: 250 },
          { id: 'p_10', name: 'Prêmio 10', emoji: '💰', multiplier: 10, prizeValue: 10 },
          { id: 'p_25', name: 'Prêmio 2.50', emoji: '💰', multiplier: 2.5, prizeValue: 2.5 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'O TIGRE DA FORTUNA ESTÁ RUGINDO!',
        'MULTIPLICADOR DE 10x EM TODA A TELA!',
        'RODILHOS DOURADOS GARANTEM GRANDES PRÊMIOS!',
        'GANHE ATÉ x2500 NO TIGRE DA SORTE!'
      ]
    };
  }

  // 2. FORTUNE OX
  if (normId.includes('ox') || normName.includes('ox') || normName.includes('touro')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_ox', name: 'WILD', emoji: '🐂', multiplier: 200, isWild: true },
      { id: 'ingot_ox', name: 'Lingote Ouro', emoji: '🪙', multiplier: 100 },
      { id: 'box_ox', name: 'Caixa Tesouro', emoji: '💰', multiplier: 50 },
      { id: 'envelope_ox', name: 'Envelope', emoji: '🧧', multiplier: 20 },
      { id: 'orange_ox', name: 'Laranja Sorte', emoji: '🍊', multiplier: 10 },
      { id: 'peanut_ox', name: 'Amendoim', emoji: '🥜', multiplier: 5 },
      { id: 'coin_ox', name: 'Moeda Real', emoji: '🪙', multiplier: 3 }
    ];
    return {
      mascotEmoji: '🐂',
      themeGradient: 'from-red-900 via-orange-950 to-amber-950',
      bannerEmoji: '🐂',
      maxWinText: 'x2000',
      subtitle: 'Touro da Fortuna com Respin e Multiplicador de 10x!',
      lanternLeftText: '牛',
      lanternRightText: '吉',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_200', name: 'Prêmio 200', emoji: '💰', multiplier: 200, prizeValue: 200 },
          { id: 'p_20', name: 'Prêmio 20', emoji: '💰', multiplier: 20, prizeValue: 20 },
          { id: 'p_5', name: 'Prêmio 5.00', emoji: '💰', multiplier: 5, prizeValue: 5 }
        ],
        [symbols[2], symbols[0], symbols[3]]
      ],
      marqueeMessages: [
        'O TOURO DA FORTUNA TRAZ PROSPERIDADE!',
        'RESPIN DO TOURO: RODILHOS SINCRONIZADOS!',
        'MULTIPLICADOR DE 10x ATIVADO EM TELA CHEIA!',
        'TOURO DOURADO: GANHE ATÉ x2000!'
      ]
    };
  }

  // 3. FORTUNE DRAGON
  if (normId.includes('dragon') || normName.includes('dragon') || normName.includes('dragão')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_dragon', name: 'WILD', emoji: '🐲', multiplier: 300, isWild: true },
      { id: 'orb_dragon', name: 'Orbe Dragão', emoji: '🔮', multiplier: 150 },
      { id: 'ingot_dragon', name: 'Lingote Real', emoji: '🪙', multiplier: 50 },
      { id: 'lantern_dragon', name: 'Lanterna', emoji: '🏮', multiplier: 25 },
      { id: 'envelope_dragon', name: 'Envelope', emoji: '🧧', multiplier: 10 },
      { id: 'firecracker_dragon', name: 'Fogos', emoji: '🧨', multiplier: 5 }
    ];
    return {
      mascotEmoji: '🐲',
      themeGradient: 'from-purple-900 via-red-950 to-amber-950',
      bannerEmoji: '🐉',
      maxWinText: 'x2500',
      subtitle: 'Esferas do Dragão com até 8 Rodadas da Fortuna!',
      lanternLeftText: '龍',
      lanternRightText: '祥',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_300', name: 'Prêmio 300', emoji: '🔮', multiplier: 300, prizeValue: 300 },
          { id: 'p_15', name: 'Prêmio 15', emoji: '🔮', multiplier: 15, prizeValue: 15 },
          { id: 'p_3', name: 'Prêmio 3.00', emoji: '🔮', multiplier: 3, prizeValue: 3 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'DESPERTE O PODER DO DRAGÃO DA FORTUNA!',
        'ORBE MÍSTICA MULTIPLICA ATÉ 10x!',
        '8 RODADAS DA FORTUNA COM PRÊMIOS INSTANTÂNEOS!',
        'GANHE ATÉ x2500 COM O DRAGÃO DOURADO!'
      ]
    };
  }

  // 4. FORTUNE MOUSE
  if (normId.includes('mouse') || normName.includes('mouse') || normName.includes('rato')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_mouse', name: 'WILD', emoji: '🐭', multiplier: 300, isWild: true },
      { id: 'cheese_gold', name: 'Queijo Ouro', emoji: '🧀', multiplier: 100 },
      { id: 'ingot_mouse', name: 'Lingote', emoji: '🪙', multiplier: 50 },
      { id: 'sack_mouse', name: 'Saco Ouro', emoji: '💰', multiplier: 30 },
      { id: 'envelope_mouse', name: 'Envelope', emoji: '🧧', multiplier: 15 },
      { id: 'peanut_mouse', name: 'Amendoim', emoji: '🥜', multiplier: 5 }
    ];
    return {
      mascotEmoji: '🐭',
      themeGradient: 'from-yellow-700 via-amber-900 to-red-950',
      bannerEmoji: '🧀',
      maxWinText: 'x1000',
      subtitle: 'Rato da Fortuna: Chuva de Ouro até x1000!',
      lanternLeftText: '鼠',
      lanternRightText: '富',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_100', name: 'Prêmio 100', emoji: '💰', multiplier: 100, prizeValue: 100 },
          { id: 'p_10', name: 'Prêmio 10', emoji: '💰', multiplier: 10, prizeValue: 10 },
          { id: 'p_2', name: 'Prêmio 2.00', emoji: '💰', multiplier: 2, prizeValue: 2 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'RATO DA FORTUNA: CHUVA DE OURO ATIVADA!',
        'RODILHOS CENTRAIS TRAVADOS COM WILD!',
        'GANHE ATÉ x1000 COM O RATINHO DA SORTE!'
      ]
    };
  }

  // 5. LUCKY NEKO
  if (normId.includes('neko') || normName.includes('neko') || normName.includes('gato')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_neko', name: 'WILD', emoji: '🐱', multiplier: 500, isWild: true },
      { id: 'sushi_neko', name: 'Sushi Ouro', emoji: '🍣', multiplier: 200 },
      { id: 'lantern_neko', name: 'Lanterna', emoji: '🏮', multiplier: 80 },
      { id: 'taiko_neko', name: 'Tambor', emoji: '🥁', multiplier: 40 },
      { id: 'koban_neko', name: 'Moeda Koban', emoji: '🪙', multiplier: 20 },
      { id: 'flower_neko', name: 'Cerejeira', emoji: '🌸', multiplier: 10 }
    ];
    return {
      mascotEmoji: '🐱',
      themeGradient: 'from-pink-900 via-purple-950 to-amber-950',
      bannerEmoji: '🐾',
      maxWinText: 'x20000',
      subtitle: 'Gato da Fortuna com Multiplicadores Progressivos!',
      lanternLeftText: '招',
      lanternRightText: '福',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_500', name: 'Prêmio 500', emoji: '🪙', multiplier: 500, prizeValue: 500 },
          { id: 'p_20', name: 'Prêmio 20', emoji: '🪙', multiplier: 20, prizeValue: 20 },
          { id: 'p_5', name: 'Prêmio 5.00', emoji: '🪙', multiplier: 5, prizeValue: 5 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'MANEKI NEKO: GATINHO DA SORTE ACENANDO!',
        'CADA GATO DOURADO ADICIONA +2x AO MULTIPLICADOR!',
        'MEGA WIN DE ATÉ x20000!'
      ]
    };
  }

  // 6. DRAGON HATCH
  if (normId.includes('hatch') || normName.includes('hatch')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_queen', name: 'Rainha Dragão', emoji: '🐉', multiplier: 500, isWild: true },
      { id: 'egg_gold', name: 'Ovo Dragão', emoji: '🥚', multiplier: 200 },
      { id: 'fire_dragon', name: 'Dragão Fogo', emoji: '🔥', multiplier: 100 },
      { id: 'water_dragon', name: 'Dragão Água', emoji: '💧', multiplier: 50 },
      { id: 'earth_dragon', name: 'Dragão Terra', emoji: '⚡', multiplier: 30 },
      { id: 'crystal', name: 'Cristal Mágico', emoji: '💎', multiplier: 15 }
    ];
    return {
      mascotEmoji: '🐉',
      themeGradient: 'from-red-950 via-slate-950 to-orange-950',
      bannerEmoji: '🔥',
      maxWinText: 'x15000',
      subtitle: 'Desperte os Bebês Dragões e a Rainha Dragão!',
      lanternLeftText: '炎',
      lanternRightText: '龍',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_500', name: 'Prêmio 500', emoji: '💎', multiplier: 500, prizeValue: 500 },
          { id: 'p_50', name: 'Prêmio 50', emoji: '💎', multiplier: 50, prizeValue: 50 },
          { id: 'p_5', name: 'Prêmio 5.00', emoji: '💎', multiplier: 5, prizeValue: 5 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'DESPERTE OS BEBÊS DRAGÕES E A GRANDE RAINHA!',
        'CASCATAS ELEMENTAIS MULTIPLICAM PRÊMIOS!',
        'PODER DO FOGO ATIVA VITÓRIAS EXPLOSIVAS!'
      ]
    };
  }

  // 7. WILD BANDITO
  if (normId.includes('bandito') || normName.includes('bandito')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_bandito', name: 'WILD Bandito', emoji: '💀', multiplier: 500, isWild: true },
      { id: 'guitar', name: 'Violão Mariachi', emoji: '🎸', multiplier: 200 },
      { id: 'tequila', name: 'Tequila Ouro', emoji: '🍸', multiplier: 100 },
      { id: 'maracas', name: 'Maracas', emoji: '🪇', multiplier: 50 },
      { id: 'rose', name: 'Rosa Vermelha', emoji: '🌹', multiplier: 25 },
      { id: 'coin_silver', name: 'Moeda Prata', emoji: '🪙', multiplier: 10 }
    ];
    return {
      mascotEmoji: '💀',
      themeGradient: 'from-purple-950 via-amber-950 to-slate-950',
      bannerEmoji: '🎸',
      maxWinText: 'x25000',
      subtitle: 'Bandito Fantasma com Rodadas Grátis e Multiplicadores!',
      lanternLeftText: '¡',
      lanternRightText: '!',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_500', name: 'Prêmio 500', emoji: '🪙', multiplier: 500, prizeValue: 500 },
          { id: 'p_50', name: 'Prêmio 50', emoji: '🪙', multiplier: 50, prizeValue: 50 },
          { id: 'p_5', name: 'Prêmio 5.00', emoji: '🪙', multiplier: 5, prizeValue: 5 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'O BANDITO FANTASMA DISPARA MULTIPLICADORES!',
        'RODADAS GRÁTIS COM MULTIPLICADOR CRESCENTE!',
        'VIVA LA FIESTA COM PRÊMIOS ATÉ x25000!'
      ]
    };
  }

  // 8. PIÑATA WINS
  if (normId.includes('pinata') || normName.includes('pinata') || normName.includes('piñata')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_pinata', name: 'WILD Piñata', emoji: '🪅', multiplier: 300, isWild: true },
      { id: 'skull_candy', name: 'Caveira Festiva', emoji: '💀', multiplier: 150 },
      { id: 'taco_gold', name: 'Tacos Ouro', emoji: '🌮', multiplier: 80 },
      { id: 'candies', name: 'Doces Mágicos', emoji: '🍬', multiplier: 40 },
      { id: 'cactus', name: 'Cacto Festivo', emoji: '🌵', multiplier: 20 },
      { id: 'coin_pinata', name: 'Moeda Colorida', emoji: '🪙', multiplier: 10 }
    ];
    return {
      mascotEmoji: '🪅',
      themeGradient: 'from-cyan-950 via-purple-950 to-pink-950',
      bannerEmoji: '🍬',
      maxWinText: 'x5000',
      subtitle: 'Estoure a Piñata com Multiplicadores até 100x!',
      lanternLeftText: '★',
      lanternRightText: '★',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[5]],
        [
          { id: 'p_300', name: 'Prêmio 300', emoji: '🍬', multiplier: 300, prizeValue: 300 },
          { id: 'p_30', name: 'Prêmio 30', emoji: '🍬', multiplier: 30, prizeValue: 30 },
          { id: 'p_3', name: 'Prêmio 3.00', emoji: '🍬', multiplier: 3, prizeValue: 3 }
        ],
        [symbols[2], symbols[0], symbols[4]]
      ],
      marqueeMessages: [
        'ESTOURE A PIÑATA PARA LIBERAR MULTIPLICADORES!',
        'DOCES DOURADOS PAGAM EM CASCATA!',
        'FESTA MEXICANA COM PRÊMIOS EXPLOSIVOS!'
      ]
    };
  }

  // 9. FORTUNE SNAKE
  if (normId.includes('snake') || normName.includes('snake') || normName.includes('serpente') || normName.includes('cobra')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_snake', name: 'WILD Serpente', emoji: '🐍', multiplier: 350, isWild: true },
      { id: 'emerald_gem', name: 'Gema Esmeralda', emoji: '💎', multiplier: 150 },
      { id: 'ingot_snake', name: 'Lingote Ouro', emoji: '🪙', multiplier: 70 },
      { id: 'envelope_snake', name: 'Envelope', emoji: '🧧', multiplier: 35 },
      { id: 'bamboo', name: 'Bambu da Sorte', emoji: '🎋', multiplier: 15 }
    ];
    return {
      mascotEmoji: '🐍',
      themeGradient: 'from-emerald-950 via-teal-950 to-amber-950',
      bannerEmoji: '🐍',
      maxWinText: 'x7500',
      subtitle: 'A Serpente Imperial Enrola Prêmios Dourados!',
      lanternLeftText: '蛇',
      lanternRightText: '禄',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[4]],
        [
          { id: 'p_350', name: 'Prêmio 350', emoji: '💎', multiplier: 350, prizeValue: 350 },
          { id: 'p_35', name: 'Prêmio 35', emoji: '💎', multiplier: 35, prizeValue: 35 },
          { id: 'p_3.5', name: 'Prêmio 3.50', emoji: '💎', multiplier: 3.5, prizeValue: 3.5 }
        ],
        [symbols[2], symbols[0], symbols[3]]
      ],
      marqueeMessages: [
        'SERPENTE ESMERALDA: O ANO DA PROSPERIDADE!',
        'SÍMBOLOS DE OURO TRAVADOS EM CADA GIRO!',
        'MULTIPLICADOR IMPERIAL ATÉ x7500!'
      ]
    };
  }

  // 10. MR TREASURE / TREASURE BOWL
  if (normId.includes('treasure') || normName.includes('treasure') || normName.includes('bowl')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_treasure', name: 'WILD Mágico', emoji: '🧙‍♂️', multiplier: 400, isWild: true },
      { id: 'diamond_star', name: 'Diamante', emoji: '💎', multiplier: 200 },
      { id: 'crown_ruby', name: 'Coroa Rubis', emoji: '👑', multiplier: 100 },
      { id: 'chest_gold', name: 'Baú Ouro', emoji: '💰', multiplier: 50 },
      { id: 'coin_epic', name: 'Moeda Épica', emoji: '🪙', multiplier: 20 }
    ];
    return {
      mascotEmoji: '🧙‍♂️',
      themeGradient: 'from-indigo-950 via-slate-950 to-amber-950',
      bannerEmoji: '💎',
      maxWinText: 'x10000',
      subtitle: 'Descubra o Tesouro Escondido nas Minas de Ouro!',
      lanternLeftText: '宝',
      lanternRightText: '藏',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[4]],
        [
          { id: 'p_400', name: 'Prêmio 400', emoji: '👑', multiplier: 400, prizeValue: 400 },
          { id: 'p_40', name: 'Prêmio 40', emoji: '👑', multiplier: 40, prizeValue: 40 },
          { id: 'p_4', name: 'Prêmio 4.00', emoji: '👑', multiplier: 4, prizeValue: 4 }
        ],
        [symbols[2], symbols[0], symbols[3]]
      ],
      marqueeMessages: [
        'MR. TREASURE ABRE AS MINAS DE OURO!',
        'BAÚS MÍSTICOS REVELAM PRÊMIOS INSTANTÂNEOS!',
        'MULTIPLICADOR MÁGICO DE ATÉ x10000!'
      ]
    };
  }

  // 11. DOUBLE FORTUNE
  if (normId.includes('double') || normName.includes('double')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_double', name: 'WILD Duplo', emoji: '🎎', multiplier: 400, isWild: true },
      { id: 'ring_gold', name: 'Anel de Ouro', emoji: '💍', multiplier: 150 },
      { id: 'purse_silk', name: 'Bolsa de Seda', emoji: '👛', multiplier: 80 },
      { id: 'cake_double', name: 'Bolo Nupcial', emoji: '🥮', multiplier: 40 },
      { id: 'fan_double', name: 'Leque Imperial', emoji: '🪭', multiplier: 20 }
    ];
    return {
      mascotEmoji: '🎎',
      themeGradient: 'from-rose-950 via-red-950 to-amber-950',
      bannerEmoji: '囍',
      maxWinText: 'x100000',
      subtitle: 'Double Fortune com Rodadas Duplas 8x8!',
      lanternLeftText: '雙',
      lanternRightText: '喜',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[4]],
        [
          { id: 'p_400', name: 'Prêmio 400', emoji: '💍', multiplier: 400, prizeValue: 400 },
          { id: 'p_40', name: 'Prêmio 40', emoji: '💍', multiplier: 40, prizeValue: 40 },
          { id: 'p_4', name: 'Prêmio 4.00', emoji: '💍', multiplier: 4, prizeValue: 4 }
        ],
        [symbols[2], symbols[0], symbols[3]]
      ],
      marqueeMessages: [
        'DOUBLE FORTUNE: CELEBRAÇÃO DA PROSPERIDADE!',
        'DUAS TELAS DE ROLO COM 8 RODADAS GRÁTIS!',
        'MULTIPLICADOR DUPLO DE ATÉ 10x EM CADA LINHA!'
      ]
    };
  }

  // 12. FORTUNE GODS
  if (normId.includes('gods') || normName.includes('gods') || normName.includes('deuses')) {
    const symbols: PGSymbolItem[] = [
      { id: 'wild_gods', name: 'WILD Deuses', emoji: '👑', multiplier: 300, isWild: true },
      { id: 'lion_gold', name: 'Leão Imperial', emoji: '🦁', multiplier: 150 },
      { id: 'scroll_fortune', name: 'Pergaminho', emoji: '📜', multiplier: 80 },
      { id: 'ingot_gods', name: 'Lingote dos Deuses', emoji: '🪙', multiplier: 40 },
      { id: 'envelope_gods', name: 'Envelope Divino', emoji: '🧧', multiplier: 20 }
    ];
    return {
      mascotEmoji: '👑',
      themeGradient: 'from-red-900 via-amber-900 to-yellow-950',
      bannerEmoji: '✨',
      maxWinText: 'x3600',
      subtitle: 'Os Deuses da Fortuna Abençoam com Respins!',
      lanternLeftText: '神',
      lanternRightText: '貴',
      availableSymbols: symbols,
      initialReels: [
        [symbols[1], symbols[0], symbols[4]],
        [
          { id: 'p_300', name: 'Prêmio 300', emoji: '🪙', multiplier: 300, prizeValue: 300 },
          { id: 'p_30', name: 'Prêmio 30', emoji: '🪙', multiplier: 30, prizeValue: 30 },
          { id: 'p_3', name: 'Prêmio 3.00', emoji: '🪙', multiplier: 3, prizeValue: 3 }
        ],
        [symbols[2], symbols[0], symbols[3]]
      ],
      marqueeMessages: [
        'OS DEUSES DA FORTUNA APARECEM NOS RODILHOS!',
        'TODOS OS SÍMBOLOS SE TRANSFORMAM EM WILD!',
        'RESPIN GARANTIDO COM VITÓRIAS EM AMBAS AS DIREÇÕES!'
      ]
    };
  }

  // DEFAULT: FORTUNE RABBIT (Classic 121bet flagship)
  const symbols: PGSymbolItem[] = [
    { id: 'wild', name: 'WILD', emoji: '🐰', multiplier: 200, isWild: true },
    { id: 'rabbit_gold', name: 'Coelho Ouro', emoji: '✨', multiplier: 100 },
    { id: 'ingot', name: 'Lingote', emoji: '🪙', multiplier: 50 },
    { id: 'sack', name: 'Saco Ouro', emoji: '💰', multiplier: 20 },
    { id: 'envelope', name: 'Envelope', emoji: '🧧', multiplier: 10 },
    { id: 'firecracker', name: 'Bombinha', emoji: '🧨', multiplier: 5 },
    { id: 'coin', name: 'Moeda', emoji: '🪙', multiplier: 3 },
    { id: 'carrot', name: 'Cenoura', emoji: '🥕', multiplier: 2 }
  ];

  return {
    mascotEmoji: '🐰',
    themeGradient: 'from-red-800 via-amber-900 to-red-950',
    bannerEmoji: '🐇',
    maxWinText: 'x5000',
    subtitle: '8 Rodadas da Fortuna com Símbolos de Prêmio!',
    lanternLeftText: '福',
    lanternRightText: '财',
    availableSymbols: symbols,
    initialReels: [
      [symbols[2], symbols[0], symbols[7]],
      [
        { id: 'prize_250', name: 'Prêmio 250', emoji: '💰', multiplier: 250, prizeValue: 250 },
        { id: 'prize_10', name: 'Prêmio 10', emoji: '💰', multiplier: 10, prizeValue: 10 },
        { id: 'prize_2.5', name: 'Prêmio 2.50', emoji: '💰', multiplier: 2.5, prizeValue: 2.5 }
      ],
      [symbols[2], symbols[0], symbols[4]]
    ],
    marqueeMessages: [
      '8 RODADAS DA FORTUNA COM SÍMBOLOS DE PRÊMIO',
      'GANHE ATÉ x5000 COM O COELHO DA SORTE!',
      'SÍMBOLOS DOURADOS PAGAM EM QUALQUER LINHA',
      'COELHO DA FORTUNA: MULTIPLICADOR ATIVO'
    ]
  };
}
