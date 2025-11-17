export async function onRequest(context) {
  const { request, env, params } = context;
  const imageId = params.id;

  console.log('[Function] Triggered for imageId:', imageId);
  console.log('[Function] CLOUDFRONT_URL:', env.VITE_CLOUDFRONT_URL);

  if (!imageId) {
    console.log('[Function] No imageId, passing through');
    return context.next();
  }

  const CLOUDFRONT_URL = env.VITE_CLOUDFRONT_URL || '';

  if (!CLOUDFRONT_URL) {
    console.log('[Function] No CLOUDFRONT_URL configured, passing through');
    return context.next();
  }

  // Add .webp extension if not present
  const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imageId);
  const fullImageId = hasExtension ? imageId : `${imageId}.webp`;
  const imageUrl = `${CLOUDFRONT_URL}/${fullImageId}`;
  const pageUrl = request.url;

  console.log('[Function] Image URL:', imageUrl);
  console.log('[Function] Page URL:', pageUrl);

  // Fetch the original HTML
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  console.log('[Function] Response content-type:', contentType);

  if (!contentType.includes('text/html')) {
    console.log('[Function] Not HTML, returning as-is');
    return response;
  }

  console.log('[Function] Processing HTML with HTMLRewriter');

  // Use HTMLRewriter to inject meta tags
  const transformed = new HTMLRewriter()
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', imageUrl);
      }
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', pageUrl);
      }
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', imageUrl);
      }
    })
    .transform(response);

  const headers = new Headers(transformed.headers);
  headers.set('X-Function-Processed', 'true');
  headers.set('X-Image-URL', imageUrl);

  return new Response(transformed.body, {
    status: transformed.status,
    headers: headers
  });
}
