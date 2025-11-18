export async function onRequest(context) {
  const {request, env, params} = context;
  const imageId = params.id;

  if (!imageId) return context.next();

  const CLOUDFRONT_URL = env.VITE_CLOUDFRONT_URL || "";

  if (!CLOUDFRONT_URL) return context.next();

  // Add .webp extension if not present
  const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(imageId);
  const fullImageId = hasExtension ? imageId : `${imageId}.webp`;
  const imageUrl = `${CLOUDFRONT_URL}/${fullImageId}`;
  const pageUrl = request.url;

  // Fetch the original HTML
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  // Use HTMLRewriter to inject meta tags
  const transformed = new HTMLRewriter()
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute("content", imageUrl);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute("content", pageUrl);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute("content", imageUrl);
      },
    })
    .transform(response);

  return new Response(transformed.body, {status: transformed.status});
}
