// Get CloudFront URL from Vite environment variables
// Set VITE_CLOUDFRONT_URL in .env file or environment variables
const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL || '';

// Get imageId from URL path
// URL format: /i/{imageId} or /{imageId}
// If no extension, automatically add .webp
function getImageIdFromUrl() {
  const path = window.location.pathname;
  
  // Remove leading and trailing slashes
  const cleanPath = path.replace(/^\/|\/$/g, '');
  
  let imageId = null;
  
  // If path starts with 'i/', extract the part after it
  if (cleanPath.startsWith('i/')) {
    imageId = cleanPath.replace('i/', '');
  } else {
    // Otherwise, return the whole path as imageId
    imageId = cleanPath || null;
  }
  
  // If imageId exists and has no extension, add .webp
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

function showImage(imageUrl) {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const imageWrapperEl = document.getElementById('image-wrapper');
  const displayImageEl = document.getElementById('display-image');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  
  if (displayImageEl && imageWrapperEl) {
    displayImageEl.src = imageUrl;
    displayImageEl.onerror = function() {
      showError('Failed to load image');
    };
    displayImageEl.onload = function() {
      imageWrapperEl.style.display = 'flex';
    };
  }
}

// Initialize
(function() {
  const imageId = getImageIdFromUrl();
  
  if (!imageId) {
    showError('No image ID provided in URL');
    return;
  }
  
  if (!CLOUDFRONT_URL) {
    showError('CloudFront URL not configured. Please set VITE_CLOUDFRONT_URL in your .env file.');
    return;
  }
  
  // Construct CloudFront URL
  const imageUrl = `${CLOUDFRONT_URL}/${imageId}`;
  showImage(imageUrl);
})();

