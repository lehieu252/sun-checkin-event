'use client';

import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';
import { API_URL } from '@/lib/config';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function CheckinPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
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
            Lời chúc *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Viết lời chúc của bạn..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e0d5d5] px-4 py-3 text-[#3d2b2b] outline-none focus:border-[#633236] focus:ring-2 focus:ring-[#633236]/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#3d2b2b]">
            Chọn ảnh *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[#c4b0b0] py-6 transition-colors hover:border-[#633236] hover:bg-[#faf7f5]"
          >
            {preview ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <>
                <span className="text-4xl">📷</span>
                <span className="text-sm text-[#8a7070]">
                  Chạm để chọn hoặc chụp ảnh
                </span>
              </>
            )}
          </button>
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
