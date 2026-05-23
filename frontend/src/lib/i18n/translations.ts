import type { Locale } from './types';

const vi = {
  display: {
    odometerLabel: 'Tia sáng Mặt Trời đã được kích hoạt',
    qrTitle: 'Quét mã ngay',
    qrSub: 'Để check-in và trở thành một phần của Mặt Trời',
    galleryEmpty: 'Quét mã QR để check-in!',
    celebrationThanks: 'Cảm ơn {name} đã trở thành một phần của Mặt Trời',
    celebrationOrder: 'Bạn là tia sáng Mặt Trời thứ {count} được kích hoạt',
    fullscreenPrompt: 'Nhấn để vào chế độ trình chiếu toàn màn hình',
    fullscreenHint: 'Hoặc nhấn F11 trên bàn phím · Esc để thoát',
    enterFullscreen: 'Toàn màn hình',
    exitFullscreen: 'Thoát toàn màn hình',
    darkRightParagraph1:
      'Mặt Trời là nơi sự sống bắt đầu - nguồn năng lượng tạo nên thế giới hữu hình và nuôi dưỡng mọi chuyển động của tương lai.',
    darkRightParagraph2:
      'Sự hiện diện của bạn tại đây là một đơn vị ánh sáng được thêm vào hành trình ấy, để những kết nối nhỏ cùng tạo nên thay đổi bền vững.',
    slideCheckIn: 'Check in ngay',
    darkCounterLabel: 'Đơn vị ánh sáng đã được đóng góp',
    darkPlugInSlogan: 'NHẤN KẾT NỐI BẬT THAY ĐỔI',
  },
  checkin: {
    langTitle: 'Chọn ngôn ngữ',
    langSubtitle: 'Select your language / Chọn ngôn ngữ của bạn',
    nameLabel: 'Tên của bạn *',
    namePlaceholder: 'Nhập tên của bạn',
    messageLabel: 'Lời nhắn *',
    messagePlaceholder: 'Viết lời nhắn của bạn...',
    photoLabel: 'Ảnh của bạn *',
    takePhoto: 'Chụp ảnh',
    takePhotoHint: 'Mở camera để chụp ảnh hoặc chọn từ thư viện ảnh',
    chooseOtherPhoto: 'Chọn ảnh khác',
    submit: 'Check in',
    submitting: 'Đang gửi...',
    successTitle: 'Check-in thành công!',
    successBody: 'Cảm ơn bạn đã tham gia. Hãy nhìn lên màn hình lớn nhé!',
    validationError: 'Vui lòng điền đầy đủ thông tin và chọn ảnh',
    submitError: 'Check-in thất bại',
    genericError: 'Có lỗi xảy ra, vui lòng thử lại',
  },
} as const;

const en = {
  display: {
    odometerLabel: 'Sun rays have been activated',
    qrTitle: 'Scan now',
    qrSub: 'Check in and become part of the Sun',
    galleryEmpty: 'Scan the QR code to check in!',
    celebrationThanks: 'Thank you {name} for becoming part of the Sun',
    celebrationOrder: 'You are the {count}th sun ray activated',
    fullscreenPrompt: 'Tap to enter fullscreen display mode',
    fullscreenHint: 'Or press F11 on keyboard · Esc to exit',
    enterFullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    darkRightParagraph1:
      'The Sun is where life begins a source of energy that shapes the visible world and powers the future.',
    darkRightParagraph2:
      'Your presence here becomes a unit of light added to that journey, where small connections come together to create sustainable change.',
    slideCheckIn: 'Check in now',
    darkCounterLabel: 'Units of light contributed',
    darkPlugInSlogan: 'PLUG IN TO EVOLUTION',
  },
  checkin: {
    langTitle: 'Choose language',
    langSubtitle: 'Select your language / Chọn ngôn ngữ của bạn',
    nameLabel: 'Your name *',
    namePlaceholder: 'Enter your name',
    messageLabel: 'Your message *',
    messagePlaceholder: 'Write your message...',
    photoLabel: 'Your photo *',
    takePhoto: 'Take photo',
    takePhotoHint: 'Open camera to take a photo or choose from your library',
    chooseOtherPhoto: 'Choose another photo',
    submit: 'Check in',
    submitting: 'Submitting...',
    successTitle: 'Check-in successful!',
    successBody: 'Thank you for joining. Look up at the big screen!',
    validationError: 'Please fill in all fields and select a photo',
    submitError: 'Check-in failed',
    genericError: 'Something went wrong, please try again',
  },
} as const;

export type TranslationTree = {
  display: {
    odometerLabel: string;
    qrTitle: string;
    qrSub: string;
    galleryEmpty: string;
    celebrationThanks: string;
    celebrationOrder: string;
    fullscreenPrompt: string;
    fullscreenHint: string;
    enterFullscreen: string;
    exitFullscreen: string;
    darkRightParagraph1: string;
    darkRightParagraph2: string;
    slideCheckIn: string;
    darkCounterLabel: string;
    darkPlugInSlogan: string;
  };
  checkin: {
    langTitle: string;
    langSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    photoLabel: string;
    takePhoto: string;
    takePhotoHint: string;
    chooseOtherPhoto: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    validationError: string;
    submitError: string;
    genericError: string;
  };
};

export const translations: Record<Locale, TranslationTree> = { vi, en };

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
        : Prefix extends '' ? K : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationTree>;

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const parts = key.split('.');
  let value: unknown = translations[locale];

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') return key;

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [param, replacement]) =>
      text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement)),
    value,
  );
}
