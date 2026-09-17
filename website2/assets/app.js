const select = document.querySelector('#daySelect');
const dayView = document.querySelector('#day-view');
const cards = [...document.querySelectorAll('.day')];
const status = document.querySelector('#viewStatus');
const prev = document.querySelector('#prevDay');
const next = document.querySelector('#nextDay');
const expand = document.querySelector('#expandAll');
const order = ['day1', 'day2', 'day3', 'day4'];
const labels = {all:'全部四天',day1:'1/21 第一天',day2:'1/22 第二天',day3:'1/23 第三天',day4:'1/24 第四天'};

function showDay(value, shouldScroll = true) {
  const valid = value === 'all' || order.includes(value) ? value : 'all';
  select.value = valid;
  cards.forEach(card => {
    card.hidden = valid !== 'all' && card.id !== valid;
    card.classList.remove('is-focus');
  });
  status.textContent = valid === 'all' ? '顯示全部四天' : `目前顯示：${labels[valid]}`;
  const index = order.indexOf(valid);
  prev.disabled = valid === 'all' || index === 0;
  next.disabled = valid === 'all' || index === order.length - 1;
  // iPhone Safari 直接從「檔案」開啟網頁時，replaceState 可能因 file://
  // 權限限制拋出 SecurityError。網址更新失敗不應中斷後續的圖片燈箱。
  try {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      history.replaceState(null, '', valid === 'all' ? location.pathname : `#${valid}`);
    }
  } catch (error) {
    console.warn('無法更新目前行程網址：', error);
  }
  if (shouldScroll) {
    dayView.scrollIntoView({behavior:'smooth', block:'start'});
    const active = document.querySelector(valid === 'all' ? '#day1' : `#${valid}`);
    requestAnimationFrame(() => active?.classList.add('is-focus'));
  }
}

select.addEventListener('change', () => showDay(select.value));
prev.addEventListener('click', () => { const i=order.indexOf(select.value); if(i>0) showDay(order[i-1]); });
next.addEventListener('click', () => { const i=order.indexOf(select.value); if(i>=0&&i<order.length-1) showDay(order[i+1]); });
if (expand) {
  expand.addEventListener('click', () => {
    const visible = cards.filter(card => !card.hidden);
    const details = visible
      .map(card => card.querySelector('details'))
      .filter(Boolean);
    const shouldOpen = details.some(item => !item.open);

    details.forEach(item => {
      item.open = shouldOpen;
    });

    expand.textContent = shouldOpen ? '收合說明' : '展開說明';
  });
}
window.addEventListener('hashchange', () => showDay(location.hash.slice(1) || 'all', false));
showDay(location.hash.slice(1) || 'all', false);

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');
const galleryFigures = [...document.querySelectorAll('.gallery figure')];
let currentImage = 0;

function setLightboxImage(index) {
  currentImage = (index + galleryFigures.length) % galleryFigures.length;
  const figure = galleryFigures[currentImage];
  const image = figure.querySelector('img');
  const caption = figure.querySelector('figcaption')?.textContent || image.alt;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = caption;
}

function openLightbox(index) {
  setLightboxImage(index);
  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  } else {
    lightbox.setAttribute('open', '');
  }
}

galleryFigures.forEach((figure, index) => {
  figure.tabIndex = 0;
  figure.setAttribute('role', 'button');
  figure.setAttribute('aria-label', `放大圖片：${figure.querySelector('figcaption')?.textContent || ''}`);
  figure.addEventListener('click', () => openLightbox(index));
  figure.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

document.querySelector('#lightboxClose').addEventListener('click', () => lightbox.close());
document.querySelector('#lightboxPrev').addEventListener('click', () => setLightboxImage(currentImage - 1));
document.querySelector('#lightboxNext').addEventListener('click', () => setLightboxImage(currentImage + 1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') setLightboxImage(currentImage - 1);
  if (event.key === 'ArrowRight') setLightboxImage(currentImage + 1);
});
