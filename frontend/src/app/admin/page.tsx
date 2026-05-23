'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '@/lib/config';
import type { NewCheckinPayload } from '@/lib/types';

export default function AdminPage() {
  const [checkins, setCheckins] = useState<NewCheckinPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCheckins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/checkins`);
      if (!res.ok) throw new Error('Không thể tải danh sách check-in');
      const data = await res.json();
      setCheckins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xoá toàn bộ lượt check-in, ảnh và danh sách? Hành động này không thể hoàn tác.',
    );
    if (!confirmed) return;

    setResetting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/checkins`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Reset thất bại');
      setCheckins([]);
      setSuccess('Đã reset toàn bộ dữ liệu check-in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN');
  };

  return (
    <main className="admin-page min-h-screen p-6 md:p-10">
      <div className="admin-container mx-auto max-w-6xl">
        <header className="admin-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="admin-title text-2xl font-bold md:text-3xl">
              Admin — Thống kê Check-in
            </h1>
            <p className="admin-subtitle mt-1 text-sm">
              Quản lý dữ liệu check-in sự kiện
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || checkins.length === 0}
            className="admin-reset-btn rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetting ? 'Đang reset...' : 'Reset toàn bộ'}
          </button>
        </header>

        <div className="admin-stat-card mb-8 rounded-2xl p-6 shadow-md">
          <p className="admin-stat-label text-sm font-medium">Tổng số người check-in</p>
          <p className="admin-stat-value mt-2 text-5xl font-bold tabular-nums">
            {loading ? '—' : checkins.length}
          </p>
        </div>

        {error && (
          <p className="admin-error mb-4 rounded-lg px-4 py-3 text-sm">{error}</p>
        )}
        {success && (
          <p className="admin-success mb-4 rounded-lg px-4 py-3 text-sm">{success}</p>
        )}

        <section className="admin-table-wrap overflow-hidden rounded-2xl shadow-md">
          <div className="admin-table-header px-6 py-4">
            <h2 className="text-lg font-bold">Danh sách check-in</h2>
          </div>

          {loading ? (
            <p className="admin-empty px-6 py-10 text-center text-sm">Đang tải...</p>
          ) : checkins.length === 0 ? (
            <p className="admin-empty px-6 py-10 text-center text-sm">
              Chưa có ai check-in.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Ảnh</th>
                    <th className="px-6 py-3">Tên</th>
                    <th className="px-6 py-3">Lời nhắn</th>
                    <th className="px-6 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((checkin, index) => (
                    <tr key={checkin.id} className="admin-table-row border-t">
                      <td className="px-6 py-4 tabular-nums">{checkins.length - index}</td>
                      <td className="px-6 py-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                          <Image
                            src={`${API_URL}${checkin.photoUrl}`}
                            alt={checkin.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{checkin.name}</td>
                      <td className="max-w-xs px-6 py-4">{checkin.message}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs">
                        {formatDate(checkin.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
