/**
 * FORTUNE GAMES - Catálogo Oficial dos 12 Jogos FortuneGo
 */
window.FortuneGames = [
  {
    id: 'tigre',
    title: 'Fortune Tiger',
    provider: 'PG Soft',
    category: 'hot',
    thumb: '/img/tigre.png',
    multiplier: 'x2.500',
    badge: '🔥 Em alta',
    isFav: true
  },
  {
    id: 'touro',
    title: 'Fortune Ox',
    provider: 'PG Soft',
    category: 'hot',
    thumb: '/img/touro.png',
    multiplier: 'x2.000',
    badge: '🔥 Em alta',
    isFav: false
  },
  {
    id: 'coelho',
    title: 'Fortune Rabbit',
    provider: 'PG Soft',
    category: 'hot',
    thumb: '/img/coelho.png',
    multiplier: 'x5.000',
    badge: '🔥 Em alta',
    isFav: true
  },
  {
    id: 'dragao',
    title: 'Fortune Dragon',
    provider: 'PG Soft',
    category: 'new',
    thumb: '/img/dragao.png',
    multiplier: 'x2.500',
    badge: '✨ Novo',
    isFav: false
  },
  {
    id: 'rato',
    title: 'Fortune Mouse',
    provider: 'PG Soft',
    category: 'hot',
    thumb: '/img/rato.png',
    multiplier: 'x1.000',
    badge: '🔥 Em alta',
    isFav: false
  },
  {
    id: 'panda',
    title: 'Fortune Panda',
    provider: 'PG Soft',
    category: 'new',
    thumb: '/img/panda.png',
    multiplier: 'x2.500',
    badge: '✨ Novo',
    isFav: true
  },
  {
    id: 'mina-de-ouro',
    title: 'Mina de Ouro',
    provider: 'Spribe',
    category: 'hot',
    thumb: '/img/mina-de-ouro.png',
    multiplier: 'x10.000',
    badge: '🔥 Em alta',
    isFav: true
  },
  {
    id: 'aviator',
    title: 'Aviator Crash',
    provider: 'Spribe',
    category: 'hot',
    thumb: '/img/aviator.png',
    multiplier: 'x100.00',
    badge: '🔥 Em alta',
    isFav: false
  },
  {
    id: 'roleta',
    title: 'Roleta Brasileira',
    provider: 'Evolution',
    category: 'live',
    thumb: '/img/roleta.png',
    multiplier: 'x36.00',
    badge: '🎥 Ao vivo',
    isFav: false
  },
  {
    id: 'futebol',
    title: 'Futebol Studio',
    provider: 'Evolution',
    category: 'live',
    thumb: '/img/futebol.png',
    multiplier: 'x3.00',
    badge: '🎥 Ao vivo',
    isFav: false
  },
  {
    id: 'bingo-imperial',
    title: 'Bingo Imperial',
    provider: 'Pragmatic Play',
    category: 'new',
    thumb: '/img/bingo-imperial.png',
    multiplier: 'x500.00',
    badge: '✨ Novo',
    isFav: false
  },
  {
    id: 'espaco',
    title: 'Spaceman',
    provider: 'Pragmatic Play',
    category: 'fav',
    thumb: '/img/espaco.png',
    multiplier: 'x5.000',
    badge: '❤️ Favorito',
    isFav: true
  }
];

window.renderGameGrid = function (filter = 'todos', search = '') {
  const grid = document.getElementById('gameGrid');
  const countSpan = document.getElementById('gameCount');
  if (!grid) return;

  const favList = JSON.parse(localStorage.getItem('fg_favs') || '["tigre", "mina-de-ouro", "coelho"]');

  const filtered = window.FortuneGames.filter(game => {
    if (search && !game.title.toLowerCase().includes(search.toLowerCase()) && !game.provider.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'todos') return true;
    if (filter === 'fav') return favList.includes(game.id);
    return game.category === filter;
  });

  if (countSpan) {
    countSpan.textContent = `${filtered.length} jogos`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px 10px; color: var(--text-muted)">
        <p style="font-size: 28px; margin-bottom: 8px">🔍</p>
        <p style="font-size: 14px; font-weight: 700">Nenhum jogo encontrado</p>
        <small>Tente outro termo na busca ou mude de categoria.</small>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(game => {
    const isFav = favList.includes(game.id);
    return `
      <div class="game-card" data-id="${game.id}" onclick="window.location.href='/game.html?id=${game.id}'">
        <div class="game-thumb">
          <img src="${game.thumb}" alt="${game.title}" style="width:100%;height:100%;object-fit:cover;">
          <span class="game-badge">${game.badge}</span>
          <button class="game-fav-btn ${isFav ? 'active' : ''}" 
                  onclick="event.stopPropagation(); window.toggleFavorite('${game.id}')"
                  title="Favoritar">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="game-info">
          <div class="game-title">${game.title}</div>
          <div class="game-provider">
            <span>${game.provider}</span>
            <span class="game-rtp">${game.multiplier}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.toggleFavorite = function (id) {
  let favList = JSON.parse(localStorage.getItem('fg_favs') || '["tigre", "mina-de-ouro", "coelho"]');
  if (favList.includes(id)) {
    favList = favList.filter(item => item !== id);
  } else {
    favList.push(id);
  }
  localStorage.setItem('fg_favs', JSON.stringify(favList));
  if (window.FortuneAudio) window.FortuneAudio.click();

  const activeChip = document.querySelector('.chip.on');
  const currentFilter = activeChip ? activeChip.getAttribute('data-filter') : 'todos';
  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value : '';
  window.renderGameGrid(currentFilter, query);
};
