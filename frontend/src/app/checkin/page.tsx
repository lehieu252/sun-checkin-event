'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { CheckinLanguagePicker } from '@/components/CheckinLanguagePicker';
import { API_URL } from '@/lib/config';
import { generateCheckinExportImage } from '@/lib/generateCheckinExportImage';
import {
  isMobileExportDevice,
  saveCheckinExportImage,
} from '@/lib/saveCheckinExportImage';
import { useLanguage } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type CheckinStep = 'language' | 'form';
type ExportStatus = 'idle' | 'loading' | 'ready' | 'error';

export default function CheckinPage() {
  const { t, locale, setLocale } = useLanguage();
  const [step, setStep] = useState<CheckinStep>('language');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [exportUsesShare, setExportUsesShare] = useState(false);

  const handleLanguageSelect = (selectedLocale: Locale) => {
    setLocale(selectedLocale);
    setStep('form');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setInputKey((k) => k + 1);
  };

  useEffect(() => {
    if (status !== 'success' || !photo || !name.trim()) return;

    let cancelled = false;
    setExportStatus('loading');
    setExportUrl(null);
    setExportBlob(null);

    generateCheckinExportImage({
      photo,
      name: name.trim(),
      locale,
    })
      .then((blob) => {
        if (cancelled) return;
        setExportBlob(blob);
        setExportUrl(URL.createObjectURL(blob));
        setExportStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setExportStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [status, photo, name, locale]);

  useEffect(() => {
    setExportUsesShare(isMobileExportDevice());
  }, []);

  useEffect(() => {
    return () => {
      if (exportUrl) URL.revokeObjectURL(exportUrl);
    };
  }, [exportUrl]);

  const handleExportSave = async () => {
    if (!exportBlob) return;

    try {
      await saveCheckinExportImage(exportBlob, downloadFileName);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !photo) {
      setErrorMsg(t('checkin.validationError'));
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
        throw new Error(text || t('checkin.submitError'));
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : t('checkin.genericError'),
      );
    }
  };

  const downloadFileName = `checkin-${name.trim().replace(/\s+/g, '-') || 'sun'}.png`;

  if (step === 'language') {
    return <CheckinLanguagePicker onSelect={handleLanguageSelect} />;
  }

  if (status === 'success') {
    return (
      <main className="checkin-page checkin-page--dark flex min-h-screen justify-center p-6">
        <div className="checkin-page-bg" aria-hidden="true">
          <Image
            src="/background_dark.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="checkin-success flex w-full max-w-sm flex-col gap-5 p-6 text-center">
          {/* <div className="checkin-success-icon flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white">
            ✓
          </div> */}
          <h1 className="checkin-success-title text-2xl font-bold">
            {t('checkin.successTitle')}
          </h1>
          <p className="checkin-success-body">{t('checkin.successBody')}</p>

          {exportStatus === 'loading' && (
            <p className="checkin-export-status">{t('checkin.exportGenerating')}</p>
          )}

          {exportStatus === 'error' && (
            <p className="checkin-export-error">{t('checkin.exportError')}</p>
          )}

          {exportStatus === 'ready' && exportUrl && (
            <div className="checkin-export w-full">
              <div className="checkin-export-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exportUrl}
                  alt=""
                  className="checkin-export-preview w-full rounded-2xl shadow-lg"
                />
              </div>
              <div className="checkin-export-download-wrap">
                <button
                  type="button"
                  onClick={handleExportSave}
                  className="checkin-export-download-btn"
                  aria-label={
                    exportUsesShare
                      ? t('checkin.exportShare')
                      : t('checkin.exportDownload')
                  }
                  title={
                    exportUsesShare
                      ? t('checkin.exportShare')
                      : t('checkin.exportDownload')
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 1.5a.75.75 0 0 1 .75.75v5.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V2.25A.75.75 0 0 1 8 1.5z" />
                    <path d="M3 11.75a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="checkin-page checkin-page--dark checkin-page--form flex min-h-screen p-4">
      <div className="checkin-page-bg" aria-hidden="true">
        <Image
          src="/background_dark.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="checkin-form flex w-full max-w-md flex-col gap-5 p-4 md:p-8"
      >
        <div className="checkin-header">
          <Image
            src="/we_are_made_of_sun_mobile.png"
            alt="We are made of sun"
            width={980}
            height={875}
            className="checkin-sun-img"
            priority
          />
        </div>

        <div>
          <label className="checkin-label mb-1 block text-sm font-medium">
            {t('checkin.nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('checkin.namePlaceholder')}
            className="checkin-input w-full rounded-xl border px-4 py-3 outline-none"
            required
          />
        </div>

        <div>
          <label className="checkin-label mb-1 block text-sm font-medium">
            {t('checkin.messageLabel')}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('checkin.messagePlaceholder')}
            rows={3}
            className="checkin-input w-full resize-none rounded-xl border px-4 py-3 outline-none"
            required
          />
        </div>

        <div>
          <label className="checkin-label mb-1 block text-sm font-medium">
            {t('checkin.photoLabel')}
          </label>

          <input
            key={inputKey}
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />

          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <div className="checkin-photo-ring h-36 w-36 overflow-hidden rounded-full border-4 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="photo-input"
                className="checkin-btn-secondary flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2 text-sm"
              >
                <span>🔄</span> {t('checkin.chooseOtherPhoto')}
              </label>
            </div>
          ) : (
            <label
              htmlFor="photo-input"
              className="checkin-camera-btn flex w-full cursor-pointer flex-col items-center rounded-2xl active:opacity-80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                <path
                  fillRule="evenodd"
                  d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold">{t('checkin.takePhoto')}</span>
              <span className="checkin-camera-btn-sub text-xs">
                {t('checkin.takePhotoHint')}
              </span>
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
          className="checkin-btn-primary rounded-xl py-4 text-lg font-semibold disabled:opacity-60"
        >
          {status === 'submitting' ? t('checkin.submitting') : t('checkin.submit')}
        </button>
      </form>
    </main>
  );
}
