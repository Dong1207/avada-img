const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL || '';

// Theme Management with View Transition API
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme(event) {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  const transitionClass = newTheme === 'dark' ? 'transition-to-dark' : 'transition-to-light';

  const x = event.clientX;
  const y = event.clientY;

  document.documentElement.style.setProperty('--x', `${x}px`);
  document.documentElement.style.setProperty('--y', `${y}px`);

  if (!document.startViewTransition) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    return;
  }

  document.documentElement.classList.add(transitionClass);

  const transition = document.startViewTransition(() => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  transition.finished.then(() => {
    document.documentElement.classList.remove(transitionClass);
  });
}

// Image Zoom with pan, wheel zoom, and toolbar
function initZoom() {
  const displayImage = document.getElementById('display-image');
  const zoomModal = document.getElementById('zoom-modal');
  const zoomWrapper = document.getElementById('zoom-wrapper');
  const zoomImage = document.getElementById('zoom-image');
  const zoomClose = document.getElementById('zoom-close');
  const zoomScaleEl = document.getElementById('zoom-scale');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomResetBtn = document.getElementById('zoom-reset');
  const zoomRotateBtn = document.getElementById('zoom-rotate');

  if (!displayImage || !zoomModal || !zoomImage || !zoomWrapper) return;

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 10;
  const SCALE_STEP = 0.5;

  let transform = { scale: 1, x: 0, y: 0, rotate: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let lastClickTime = 0;

  const updateTransform = (withTransition = false) => {
    zoomImage.classList.toggle('with-transition', withTransition);
    zoomImage.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) rotate(${transform.rotate}deg)`;
    zoomScaleEl.textContent = `${Math.round(transform.scale * 100)}%`;
    zoomWrapper.classList.toggle('zoomed-out', transform.scale <= 1);
    zoomOutBtn.disabled = transform.scale <= MIN_SCALE;
    zoomInBtn.disabled = transform.scale >= MAX_SCALE;
  };

  const resetTransform = () => {
    transform = { scale: 1, x: 0, y: 0, rotate: 0 };
    updateTransform(true);
  };

  const clampPosition = () => {
    const rect = zoomImage.getBoundingClientRect();
    const wrapperRect = zoomWrapper.getBoundingClientRect();
    const imgWidth = rect.width;
    const imgHeight = rect.height;
    const maxX = Math.max(0, (imgWidth - wrapperRect.width) / 2);
    const maxY = Math.max(0, (imgHeight - wrapperRect.height) / 2);
    transform.x = Math.max(-maxX, Math.min(maxX, transform.x));
    transform.y = Math.max(-maxY, Math.min(maxY, transform.y));
  };

  const zoomAtPoint = (delta, clientX, clientY) => {
    const rect = zoomImage.getBoundingClientRect();
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;

    const prevScale = transform.scale;
    transform.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale + delta));
    const scaleRatio = transform.scale / prevScale;

    transform.x = transform.x * scaleRatio - offsetX * (scaleRatio - 1);
    transform.y = transform.y * scaleRatio - offsetY * (scaleRatio - 1);

    if (transform.scale <= 1) {
      transform.x = 0;
      transform.y = 0;
    } else {
      clampPosition();
    }

    updateTransform(false);
  };

  // Open modal
  displayImage.addEventListener('click', () => {
    zoomImage.src = displayImage.src;
    resetTransform();
    zoomModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  const closeZoom = () => {
    zoomModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  zoomClose.addEventListener('click', closeZoom);

  // Wheel zoom
  zoomWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
    zoomAtPoint(delta, e.clientX, e.clientY);
  }, { passive: false });

  // Double click to toggle zoom
  zoomWrapper.addEventListener('click', (e) => {
    if (e.target === zoomImage || e.target === zoomWrapper) {
      const now = Date.now();
      if (now - lastClickTime < 300) {
        if (transform.scale !== 1) {
          resetTransform();
        } else {
          zoomAtPoint(1.5, e.clientX, e.clientY);
          updateTransform(true);
        }
      } else if (transform.scale <= 1 && e.target === zoomWrapper) {
        closeZoom();
      }
      lastClickTime = now;
    }
  });

  // Drag to pan
  zoomWrapper.addEventListener('mousedown', (e) => {
    if (transform.scale <= 1) return;
    isDragging = true;
    dragStart = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    zoomWrapper.classList.add('dragging');
    zoomImage.classList.remove('with-transition');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    transform.x = e.clientX - dragStart.x;
    transform.y = e.clientY - dragStart.y;
    clampPosition();
    updateTransform(false);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    zoomWrapper.classList.remove('dragging');
  });

  // Touch support
  let lastTouchDist = 0;

  zoomWrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1 && transform.scale > 1) {
      isDragging = true;
      dragStart = { x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y };
      zoomImage.classList.remove('with-transition');
    }
  }, { passive: true });

  zoomWrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = (dist - lastTouchDist) / 100;
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAtPoint(delta, centerX, centerY);
      lastTouchDist = dist;
    } else if (e.touches.length === 1 && isDragging) {
      transform.x = e.touches[0].clientX - dragStart.x;
      transform.y = e.touches[0].clientY - dragStart.y;
      clampPosition();
      updateTransform(false);
    }
  }, { passive: false });

  zoomWrapper.addEventListener('touchend', () => {
    isDragging = false;
    lastTouchDist = 0;
  });

  // Toolbar buttons
  zoomInBtn.addEventListener('click', () => {
    const rect = zoomWrapper.getBoundingClientRect();
    zoomAtPoint(SCALE_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2);
    updateTransform(true);
  });

  zoomOutBtn.addEventListener('click', () => {
    const rect = zoomWrapper.getBoundingClientRect();
    zoomAtPoint(-SCALE_STEP, rect.left + rect.width / 2, rect.top + rect.height / 2);
    updateTransform(true);
  });

  zoomResetBtn.addEventListener('click', resetTransform);

  zoomRotateBtn.addEventListener('click', () => {
    transform.rotate = (transform.rotate + 90) % 360;
    updateTransform(true);
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!zoomModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeZoom();
    if (e.key === '+' || e.key === '=') zoomInBtn.click();
    if (e.key === '-') zoomOutBtn.click();
    if (e.key === '0') resetTransform();
    if (e.key === 'r' || e.key === 'R') zoomRotateBtn.click();
  });
}

// Initialize features
initTheme();
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
document.addEventListener('DOMContentLoaded', initZoom);

function getImageIdFromUrl() {
  const path = window.location.pathname;
  const cleanPath = path.replace(/^\/|\/$/g, '');

  let imageId = null;

  if (cleanPath.startsWith('i/')) {
    imageId = cleanPath.replace('i/', '');
  } else {
    imageId = cleanPath || null;
  }

  if (imageId) {
    const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imageId);
    if (!hasExtension) {
      imageId = `${imageId}.webp`;
    }
  }

  return imageId;
}

function showError(message) {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const errorTextEl = document.getElementById('error-text');
  const imageWrapperEl = document.getElementById('image-wrapper');

  if (loadingEl) loadingEl.style.display = 'none';
  if (imageWrapperEl) imageWrapperEl.style.display = 'none';
  if (errorEl) {
    errorEl.style.display = 'block';
    if (errorTextEl) errorTextEl.textContent = message;
  }
}

function formatDimensions(width, height) {
  return `${width} × ${height}`;
}

function showImage(imageUrl, imageId) {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const imageWrapperEl = document.getElementById('image-wrapper');
  const displayImageEl = document.getElementById('display-image');
  const imageIdEl = document.getElementById('image-id');
  const dimensionsEl = document.getElementById('image-dimensions');

  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  if (!displayImageEl || !imageWrapperEl) return;

  displayImageEl.src = imageUrl;

  displayImageEl.onerror = () => {
    showError('Failed to load image. The image may not exist or there was a network error.');
  };

  displayImageEl.onload = () => {
    imageWrapperEl.style.display = 'block';

    if (imageIdEl) {
      imageIdEl.textContent = imageId;
    }

    if (dimensionsEl) {
      dimensionsEl.textContent = formatDimensions(
        displayImageEl.naturalWidth,
        displayImageEl.naturalHeight
      );
    }
  };
}

(function() {
  const imageId = getImageIdFromUrl();

  if (!imageId) {
    showError('No image ID provided in URL. Please provide a valid image path.');
    return;
  }

  if (!CLOUDFRONT_URL) {
    showError('CloudFront URL not configured. Please set VITE_CLOUDFRONT_URL in your .env file.');
    return;
  }

  const imageUrl = `${CLOUDFRONT_URL}/${imageId}`;
  showImage(imageUrl, imageId);
})();
