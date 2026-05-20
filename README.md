# Sun Check-in Event

Hệ thống check-in sự kiện với màn hình lớn hiển thị real-time và form check-in trên mobile.

## Tính năng

- **Màn hình lớn** (`/`): Hiển thị số lượt check-in (odometer), mã QR, và spotlight người vừa check-in (fade in/out 10 giây)
- **Form check-in** (`/checkin`): Nhập tên, lời chúc, chọn ảnh — cập nhật real-time qua WebSocket

## Tech stack

- **Backend**: NestJS, TypeORM, SQLite, Socket.IO, Multer
- **Frontend**: Next.js, Tailwind CSS, qrcode.react, socket.io-client

## Cài đặt

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Backend chạy tại `http://localhost:3001`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3000`

## Biến môi trường

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `PORT` | Port backend | `3001` |
| `FRONTEND_URL` | URL frontend (CORS) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL API backend | `http://localhost:3001` |
| `NEXT_PUBLIC_BASE_URL` | URL công khai cho QR code | `http://localhost:3000` |

## API

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/checkins` | Tạo check-in (multipart: name, message, photo) |
| `GET` | `/checkins/count` | Lấy tổng số lượt check-in |
| Static | `/uploads/:filename` | Ảnh đã upload |

## WebSocket

- Kết nối tới backend URL (cùng host với API)
- Event `new-checkin`: `{ id, name, message, photoUrl }`

## Triển khai sự kiện

1. Mở `http://localhost:3000` trên màn hình lớn / projector
2. Đặt `NEXT_PUBLIC_BASE_URL` thành URL công khai (ngrok, domain thật) để QR code hoạt động trên điện thoại
3. Khách quét QR → vào `/checkin` → điền form → hiện lên màn hình lớn trong ~10 giây
