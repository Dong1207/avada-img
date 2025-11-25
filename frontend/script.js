const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL || '';

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

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showImage(imageUrl, imageId) {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const imageWrapperEl = document.getElementById('image-wrapper');
  const displayImageEl = document.getElementById('display-image');
  const imageIdEl = document.getElementById('image-id');
  const dimensionsEl = document.getElementById('image-dimensions');
  const sizeEl = document.getElementById('image-size');

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

    // Get file size from performance API (no extra request)
    if (sizeEl) {
      const entry = performance.getEntriesByName(imageUrl)[0];
      if (entry?.transferSize) {
        sizeEl.textContent = formatFileSize(entry.transferSize);
      }
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
