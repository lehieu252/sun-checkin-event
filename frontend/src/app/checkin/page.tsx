'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/config';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function CheckinPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [inputKey, setInputKey] = useState(0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    // Increment key so the same file can be re-selected next time
    setInputKey((k) => k + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !photo) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin và chọn ảnh');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('message', message.trim());
    formData.append('photo', photo);

    try {
      const res = await fetch(`${API_URL}/checkins`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { message?: string | string[] }).message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg;
        throw new Error(text || 'Check-in thất bại');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại',
      );
    }
  };

  if (status === 'success') {
    return (
      <main className="checkin-page flex min-h-screen items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center gap-6 rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#633236] text-4xl text-white">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[#633236]">
            Check-in thành công!
          </h1>
          <p className="text-[#5a4545]">
            Cảm ơn bạn đã tham gia. Hãy nhìn lên màn hình lớn nhé!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkin-page flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-xl md:p-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#633236]">Check-in Sự kiện</h1>
          <p className="mt-1 text-sm text-[#8a7070]">
            Điền thông tin để tham gia sự kiện
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3d2b2b]">
            Tên của bạn *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên của bạn"
            className="w-full rounded-xl border border-[#e0d5d5] px-4 py-3 text-[#3d2b2b] outline-none focus:border-[#633236] focus:ring-2 focus:ring-[#633236]/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3d2b2b]">
            Lời nhắn *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Viết lời nhắn của bạn..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e0d5d5] px-4 py-3 text-[#3d2b2b] outline-none focus:border-[#633236] focus:ring-2 focus:ring-[#633236]/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3d2b2b]">
            Ảnh của bạn *
          </label>

          {/* Không dùng capture="user" để iOS Safari hiển thị menu Photo Library / Take Photo */}
          <input
            key={inputKey}
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />

          {preview ? (
            /* Preview + nút chụp lại */
            <div className="flex flex-col items-center gap-3">
              <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-[#633236] shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="photo-input"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#c4b0b0] px-5 py-2 text-sm text-[#633236] transition-colors hover:border-[#633236] hover:bg-[#faf7f5]"
              >
                <span>🔄</span> Chọn ảnh khác
              </label>
            </div>
          ) : (
            /* Nút mở camera — dùng <label> để kích hoạt input an toàn trên mọi trình duyệt */
            <label
              htmlFor="photo-input"
              className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl bg-[#633236] py-7 text-white shadow-md transition-opacity hover:opacity-90 active:opacity-80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-10 w-10"
              >
                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                <path
                  fillRule="evenodd"
                  d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-base font-semibold">Chụp ảnh</span>
              <span className="text-xs text-white/70">Mở camera để chụp ảnh của bạn</span>
            </label>
          )}
        </div>

        {status === 'error' && errorMsg && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-xl bg-[#633236] py-4 text-lg font-semibold text-white transition-colors hover:bg-[#7a3f44] disabled:opacity-60"
        >
          {status === 'submitting' ? 'Đang gửi...' : 'Check-in ngay'}
        </button>
      </form>
    </main>
  );
}
