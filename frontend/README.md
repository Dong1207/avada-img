# Frontend - Static HTML/CSS/JS với Vite

Frontend sử dụng Vite để build, minify và obfuscate code để bảo vệ source code.

## Tính năng build

- ✅ **Minify JavaScript**: Compress và minify code
- ✅ **Obfuscate**: Làm khó đọc source code
- ✅ **Minify CSS**: Tối ưu CSS
- ✅ **Hash filenames**: Tên file có hash để cache busting
- ✅ **Xóa comments và console.log**: Làm sạch code

## Cấu trúc

```
frontend/
├── index.html          # File HTML chính
├── style.css           # CSS styles
├── script.js           # JavaScript logic
├── assets/             # Logo và assets
│   └── avada-logo.png
├── vite.config.js      # Vite config
├── package.json        # Dependencies
├── .env.example        # Environment variables example
├── _redirects          # Cloudflare Pages redirects
└── README.md
```

## Cấu hình

### Sử dụng Environment Variables

1. **Local development**: Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

2. Chỉnh sửa `.env`:
```env
VITE_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

3. **Cloudflare Pages**: Thêm environment variable trong dashboard:
- Key: `VITE_CLOUDFRONT_URL`
- Value: `https://your-cloudfront-domain.cloudfront.net`

**Lưu ý**: Vite chỉ expose env variables có prefix `VITE_` vào client code.

## Yêu cầu

- Node.js >= 20.19.0 hoặc >= 22.12.0 (Vite 7 yêu cầu)

## Cài đặt và Build

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Build production:
```bash
npm run build
```

Output sẽ ở folder `dist/` với code đã được minify và obfuscate.

3. Preview build (tùy chọn):
```bash
npm run preview
```

## Deploy lên Cloudflare Pages

1. Push code lên Git repository
2. Vào Cloudflare Dashboard > Pages
3. Connect repository
4. Build settings:
   - Framework preset: **None**
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
5. Deploy!

Code sẽ được minify và obfuscate tự động khi build.

## URL Format

Frontend sẽ nhận URL dạng:
- `https://your-domain.pages.dev/i/{imageId}` (khuyến nghị)
- `https://your-domain.pages.dev/{imageId}` (fallback)

Script sẽ tự động extract `imageId` từ URL path. Route ngắn gọn `/i/` thay vì `/image/`.

