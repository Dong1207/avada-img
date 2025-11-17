# Avada Image Upload Service

Dự án Node.js với Backend và Frontend để upload, xử lý và hiển thị ảnh.

## Tính năng

- **Backend**: 
  - API upload ảnh
  - Sử dụng Sharp để giảm dung lượng ảnh
  - Upload lên AWS S3
  - Tự động rút gọn tên file
  - Trả về URL để truy cập ảnh

- **Frontend**:
  - HTML/CSS/JS thuần, không cần build
  - Hiển thị ảnh với logo Avada xung quanh
  - Chỉ dùng để view image qua shorten link
  - Deploy trực tiếp lên Cloudflare Pages
  - Responsive design

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm run install-all
```

Hoặc cài đặt từng phần:

```bash
# Root
npm install

# Backend
cd backend
npm install
```

### 2. Cấu hình môi trường

#### Backend (.env)
Tạo file `backend/.env` từ `backend/.env.example`:

```env
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
Tạo file `frontend/.env` từ `frontend/.env.example`:

```env
VITE_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

**Lưu ý**: 
- Frontend sử dụng Vite 7 để build, minify và obfuscate code
- Cần chạy `npm install` và `npm run build` trước khi deploy
- Vite chỉ expose env variables có prefix `VITE_` vào client code

### 3. Thêm logo Avada

Đặt file logo Avada vào `frontend/assets/avada-logo.png`

Nếu không có logo, sẽ tự động hiển thị text "AVADA" thay thế.

### 4. Chạy ứng dụng

#### Backend:
```bash
npm run server
# hoặc
cd backend && npm run dev
```

#### Frontend:
Frontend sử dụng Vite để build và minify code:

```bash
cd frontend
npm install
npm run build
```

Output ở folder `dist/`. Deploy lên Cloudflare Pages (xem hướng dẫn trong `frontend/README.md`)

## Cấu trúc dự án

```
a2-avada-image/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html          # HTML chính
│   ├── style.css           # CSS styles
│   ├── script.js           # JavaScript logic
│   ├── config.js           # Configuration
│   ├── assets/             # Logo và assets
│   │   └── avada-logo.png
│   ├── vite.config.js      # Vite config
│   ├── package.json        # Dependencies
│   ├── _redirects         # Cloudflare Pages redirects
│   └── README.md          # Hướng dẫn deploy
├── package.json
└── README.md
```

## API Endpoints

### POST /api/upload
Upload ảnh lên server

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:3000/image/abc123.jpg",
  "imageId": "abc123",
  "originalSize": 1024000,
  "processedSize": 512000
}
```

### GET /api/health
Health check endpoint

## Sử dụng

### Upload ảnh
Upload ảnh qua API endpoint `/api/upload`:

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/your/image.jpg"
```

Response sẽ trả về URL frontend để view ảnh:
```json
{
  "success": true,
  "url": "https://your-domain.pages.dev/i/abc123.jpg",
  "imageId": "abc123",
  "originalSize": 1024000,
  "processedSize": 512000
}
```

### View ảnh
Truy cập URL được trả về từ API để xem ảnh với logo Avada xung quanh:
- `https://your-domain.pages.dev/i/{imageId}` (có thể có hoặc không có extension)
- `https://your-domain.pages.dev/i/{imageId}.webp` (tự động thêm .webp nếu không có extension)

**Lưu ý**: 
- URL format ngắn gọn: `/i/{imageId}` thay vì `/image/{imageId}`
- Nếu URL không có extension (ví dụ: `/i/techcombank`), frontend tự động thêm `.webp`
- Tất cả ảnh được convert sang WebP format để tối ưu dung lượng

## Lưu ý

- Đảm bảo S3 bucket có quyền public-read cho ảnh
- Cấu hình CloudFront distribution trỏ đến S3 bucket
- File ảnh tối đa 10MB
- Định dạng hỗ trợ upload: JPEG, JPG, PNG, GIF, WEBP
- **Tất cả ảnh được tự động convert sang WebP format** để tối ưu dung lượng
- Ảnh sẽ được resize tối đa 1920x1920px và nén với quality 85%
- Frontend tự động thêm `.webp` extension nếu URL không có extension
- Frontend sử dụng Vite 7 để build, minify và obfuscate code
- **Yêu cầu Node.js**: >= 20.19.0 hoặc >= 22.12.0 cho frontend build
- Cấu hình CloudFront URL trong `frontend/.env` file (VITE_CLOUDFRONT_URL) hoặc environment variables trên Cloudflare Pages

