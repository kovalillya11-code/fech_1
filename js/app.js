const API_URL = 'https://jsonplaceholder.typicode.com/posts/';
const PAGE_SIZE = 12;

const el = {
  search: document.getElementById('search'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  empty: document.getElementById('empty'),
  grid: document.getElementById('grid'),
  loadMore: document.getElementById('load-more'),
  retry: document.getElementById('retry'),
};

let allPosts = [];
let filtered = [];
let visibleCount = PAGE_SIZE;


// Стани

function showState(state) {
  el.loading.classList.toggle('hidden', state !== 'loading');
  el.error.classList.toggle('hidden', state !== 'error');
  el.empty.classList.toggle('hidden', state !== 'empty');
  el.grid.classList.toggle('hidden', state !== 'content');

  if (state !== 'content') {
    el.loadMore.classList.add('hidden');
  }
}

// Допоміжні

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const number = document.createElement('span');
  number.className = 'post-number';
  number.textContent = `#${post.id}`;

  const title = document.createElement('h2');
  title.className = 'post-title';
  title.textContent = capitalize(post.title);

  const body = document.createElement('p');
  body.className = 'post-body';
  body.textContent = post.body;

  card.append(number, title, body);
  return card;
}

// Рендер

function render() {
  showState('content');
  el.grid.innerHTML = '';

  if (filtered.length === 0) {
    const message = document.createElement('p');
    message.className = 'no-results';
    message.textContent = 'Нічого не знайдено за запитом';
    el.grid.appendChild(message);
    el.loadMore.classList.add('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.slice(0, visibleCount).forEach((post) => {
    fragment.appendChild(createCard(post));
  });
  el.grid.appendChild(fragment);

  el.loadMore.classList.toggle('hidden', visibleCount >= filtered.length);
}

function applyFilter() {
  const query = el.search.value.trim().toLowerCase();

  filtered = query
    ? allPosts.filter((post) => post.title.toLowerCase().includes(query))
    : allPosts;

  visibleCount = PAGE_SIZE;
  render();
}

// Запит

async function fetchPosts() {
  showState('loading');

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Некоректний формат даних');
    }

    allPosts = data;

    if (allPosts.length === 0) {
      showState('empty');
      return;
    }

    applyFilter();
  } catch (err) {
    console.error('Помилка завантаження:', err);
    showState('error');
  }
}

// Події

el.search.addEventListener('input', applyFilter);

el.loadMore.addEventListener('click', () => {
  visibleCount += PAGE_SIZE;
  render();
});

el.retry.addEventListener('click', fetchPosts);

fetchPosts();