# Backend API - Image Upload Service

Backend API service để upload, xử lý và lưu trữ ảnh lên AWS S3. Sử dụng Express.js với ES Modules (ESM), Sharp để xử lý ảnh, và AWS SDK v3.

## Tính năng

- ✅ Upload ảnh qua API endpoint
- ✅ Tự động resize và convert sang WebP format
- ✅ Upload lên AWS S3 với tên file rút gọn
- ✅ Sử dụng ES Modules (ESM)
- ✅ AWS SDK v3 (không còn maintenance mode)
- ✅ S3Service class để quản lý S3 operations
- ✅ CORS enabled
- ✅ Error handling

## Yêu cầu

- Node.js >= 18.0.0 (khuyến nghị >= 20.0.0)
- AWS Account với S3 bucket
- AWS Access Key ID và Secret Access Key

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình environment variables trong `.env`:
```env
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name
FRONTEND_URL=http://localhost:3000
```

## Chạy ứng dụng

### Development mode (với nodemon):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

### Production mode với PM2 (khuyến nghị):
```bash
# Cài đặt PM2 (nếu chưa có)
npm install -g pm2

# Start với PM2
pm2 start ecosystem.config.cjs

# Xem status
pm2 status

# Xem logs
pm2 logs a2-avada-image-backend

# Restart
pm2 restart a2-avada-image-backend

# Stop
pm2 stop a2-avada-image-backend

# Xóa khỏi PM2
pm2 delete a2-avada-image-backend

# Monitor
pm2 monit
```

Server sẽ chạy tại `http://localhost:5000` (hoặc port được cấu hình trong `.env`).

## Cấu trúc code

```
backend/
├── server.js              # Express server (ESM)
├── services/
│   └── S3Service.js       # AWS S3 service class
├── package.json
├── nodemon.json           # Nodemon config
├── ecosystem.config.cjs   # PM2 ecosystem config
├── .env.example           # Environment variables template
└── README.md
```

## API Endpoints

### POST /api/upload

Upload ảnh lên server, xử lý và upload lên S3.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (file): File ảnh cần upload

**Response (Success - 200):**
```json
{
  "success": true,
  "url": "http://localhost:3000/i/abc123.webp",
  "imageId": "abc123",
  "originalSize": 1024000,
  "processedSize": 512000
}
```

**Response (Error - 400):**
```json
{
  "error": "No image file provided"
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to upload image",
  "message": "Error details..."
}
```

**Giới hạn:**
- File size tối đa: 10MB
- Định dạng hỗ trợ: JPEG, JPG, PNG, GIF, WEBP
- Tất cả ảnh sẽ được convert sang WebP format
- Resize tối đa: 1920x1920px (giữ tỷ lệ)
- Quality: 85%
- Compression effort: 6 (tối đa)

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## S3Service Class

Class để quản lý các operations với AWS S3.

### Methods

#### `uploadFile(fileBuffer, fileName, contentType)`
Upload file lên S3.

**Parameters:**
- `fileBuffer` (Buffer): File buffer cần upload
- `fileName` (string): Tên file (key) trong S3
- `contentType` (string): Content type (default: 'image/webp')

**Returns:** `Promise<Object>` - Upload result

**Note:** ACL không được sử dụng. Đảm bảo bucket có bucket policy cho phép public read access.

#### `deleteFile(fileName)`
Xóa file từ S3.

**Parameters:**
- `fileName` (string): Tên file (key) cần xóa

**Returns:** `Promise<Object>` - Delete result

#### `getFileUrl(fileName)`
Lấy public URL của file.

**Parameters:**
- `fileName` (string): Tên file (key)

**Returns:** `string` - Public URL

#### `fileExists(fileName)`
Kiểm tra file có tồn tại trong S3 không.

**Parameters:**
- `fileName` (string): Tên file (key) cần kiểm tra

**Returns:** `Promise<boolean>`

### Ví dụ sử dụng:

```javascript
import S3Service from './services/S3Service.js';

const s3Service = new S3Service();

// Upload file
await s3Service.uploadFile(buffer, 'image.webp', 'image/webp');

// Check file exists
const exists = await s3Service.fileExists('image.webp');

// Get file URL
const url = s3Service.getFileUrl('image.webp');

// Delete file
await s3Service.deleteFile('image.webp');
```

## Công nghệ sử dụng

- **Express.js 5.1.0**: Web framework
- **Multer 2.0.2**: File upload middleware
- **Sharp 0.34.5**: Image processing library
- **AWS SDK v3**: 
  - `@aws-sdk/client-s3`: S3 client
  - `@aws-sdk/lib-storage`: Upload utility
- **ShortID**: Generate shortened file names
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variables management

## Xử lý ảnh

Tất cả ảnh được xử lý với các thông số sau:

1. **Resize**: Tối đa 1920x1920px, giữ tỷ lệ, không phóng to
2. **Convert**: Chuyển sang WebP format
3. **Quality**: 85%
4. **Compression**: Effort level 6 (tối đa)
5. **File name**: Shortened ID + `.webp` extension

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | Yes | - |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | Yes | - |
| `AWS_REGION` | AWS Region | No | `us-east-1` |
| `S3_BUCKET_NAME` | S3 Bucket name | Yes | - |
| `FRONTEND_URL` | Frontend URL for response | No | `http://localhost:3000` |

## Lưu ý

- **S3 Bucket Policy**: Đảm bảo S3 bucket có bucket policy cho phép public read access. Code không sử dụng ACL vì modern S3 buckets thường block ACLs.
- **Bucket Policy Example**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```
- AWS credentials phải có quyền upload vào S3 bucket
- File size tối đa là 10MB
- Tất cả ảnh sẽ được convert sang WebP để tối ưu dung lượng
- File name sẽ được rút gọn bằng shortid
- Backend sử dụng ES Modules (ESM), không phải CommonJS

## Troubleshooting

### Lỗi AWS credentials
- Kiểm tra `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` trong `.env`
- Đảm bảo credentials có quyền truy cập S3 bucket

### Lỗi upload
- Kiểm tra S3 bucket name đúng
- Kiểm tra bucket có bucket policy cho phép public read access
- Nếu gặp lỗi "The bucket does not allow ACLs": Đây là bình thường, bucket policy sẽ xử lý public access
- Kiểm tra file size không vượt quá 10MB

### Lỗi image processing
- Đảm bảo file là định dạng ảnh hợp lệ
- Kiểm tra Sharp đã được cài đặt đúng

## Development

### Scripts

- `npm start`: Chạy production server
- `npm run dev`: Chạy development server với nodemon (auto-reload)

### Nodemon

Nodemon được cấu hình trong `nodemon.json` để tự động restart server khi có thay đổi code.

