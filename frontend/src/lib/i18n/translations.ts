import type { Locale } from './types';

const vi = {
  display: {
    odometerLabel: 'Tia sáng Mặt Trời đã được kích hoạt',
    qrTitle: 'Quét mã ngay',
    qrSub: 'Để check-in và trở thành một phần của Mặt Trời',
    qrCountdown: 'Mã QR sẽ đóng sau {seconds} giây',
    qrModalClose: 'Đóng mã QR',
    qrModalHeadline:
      'Quét mã để check-in và tiếp tục hành trình của ánh sáng',
    qrModalBody:
      'Mỗi lượt check-in được ghi nhận sẽ trở thành một đơn vị ánh sáng cho hành trình của Mặt Trời.',
    galleryEmpty: 'Quét mã QR để check-in!',
    thankYouHeadline: 'Một kết nối mới vừa được thắp lên tại',
    thankYouSunQuote: '"We are made of SUN"!',
    thankYouBody:
      'Cảm ơn {name} đã đóng góp một đơn vị ánh sáng để cùng chúng tôi nuôi dưỡng hành trình của tri thức, năng lượng và tương lai bền vững. ☀️',
    fullscreenPrompt: 'Nhấn để vào chế độ trình chiếu toàn màn hình',
    fullscreenHint: 'Hoặc nhấn F11 trên bàn phím · Esc để thoát',
    enterFullscreen: 'Toàn màn hình',
    exitFullscreen: 'Thoát toàn màn hình',
    darkRightParagraph1:
      'Mặt Trời là nơi sự sống bắt đầu - nguồn năng lượng tạo nên thế giới hữu hình và nuôi dưỡng mọi chuyển động của tương lai.',
    darkRightParagraph2:
      'Sự hiện diện của bạn tại đây là 100 đơn vị ánh sáng được thêm vào hành trình ấy, để những kết nối nhỏ cùng tạo nên thay đổi bền vững.',
    darkHeadline1: 'Mặt Trời là khởi nguồn của sự sống.',
    darkHeadline2:
      'Nhưng điều gì giúp Mặt Trời duy trì được năng lượng bền vững?',
    darkBody3Part1:
      'Đó chính là khi ngày càng nhiều nguồn sáng cùng hội tụ và tiếp tục lan tỏa năng lượng về phía trước.\n\nMỗi lượt check-in của bạn sẽ góp thêm ',
    darkBodyHighlight: '100 đơn vị',
    darkBody3Part2:
      ' ánh sáng, giúp hành trình của Mặt Trời tiếp tục được mở rộng, nuôi dưỡng sự sống, tri thức và những chuyển động hướng tới một tương lai bền vững.',
    darkCta: 'Khám phá cách tiếp thêm năng lượng cho Mặt Trời ☀️',
    slideCheckIn: 'Check in ngay',
    slideReady: 'BẠN CÓ SẴN SÀNG ?',
    darkCounterLabel: 'Đơn vị ánh sáng đã được đóng góp',
    darkPlugInSlogan: 'NHẤN KẾT NỐI - BẬT THAY ĐỔI',
  },
  checkin: {
    langTitle: 'Chọn ngôn ngữ',
    langSubtitle: 'Select your language / Chọn ngôn ngữ của bạn',
    nameLabel: 'Tên của bạn *',
    namePlaceholder: 'Nhập tên của bạn (Tối đa 30 ký tự)',
    messageLabel: 'Lời nhắn *',
    messagePlaceholder: 'Viết lời nhắn của bạn... (Tối đa 500 ký tự)',
    photoLabel: 'Ảnh của bạn *',
    takePhoto: 'Chụp ảnh',
    takePhotoHint: 'Mở camera để chụp ảnh hoặc chọn từ thư viện ảnh',
    chooseOtherPhoto: 'Chọn ảnh khác',
    submit: 'Check in',
    submitting: 'Đang gửi...',
    successTitle: 'Check-in thành công!',
    successBody: 'Cảm ơn bạn đã tham gia. Hãy nhìn lên màn hình lớn nhé!',
    exportGenerating: 'Đang tạo ảnh check-in...',
    exportDownload: 'Tải ảnh check-in',
    exportShare: 'Chia sẻ / Lưu ảnh',
    exportError: 'Không thể tạo ảnh. Vui lòng thử lại.',
    validationError: 'Vui lòng điền đầy đủ thông tin và chọn ảnh',
    profanityError:
      'Tên hoặc lời nhắn chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.',
    submitError: 'Check-in thất bại',
    genericError: 'Có lỗi xảy ra, vui lòng thử lại',
  },
} as const;

const en = {
  display: {
    odometerLabel: 'Sun rays have been activated',
    qrTitle: 'Scan now',
    qrSub: 'Check in and become part of the Sun',
    qrCountdown: 'QR code will close in {seconds} seconds',
    qrModalClose: 'Close QR code',
    qrModalHeadline:
      'Scan the code to upload your check-in photo and move the light forward',
    qrModalBody:
      'Each connection becomes a unit of light powering the Sun forward.',
    galleryEmpty: 'Scan the QR code to check in!',
    thankYouHeadline: 'A new connection has just been sparked at',
    thankYouSunQuote: '"We are made of SUN"!',
    thankYouBody:
      'Thank you, {name}, for adding a unit of light to our journey that nurtures knowledge, energy, and a more sustainable future ☀️',
    fullscreenPrompt: 'Tap to enter fullscreen display mode',
    fullscreenHint: 'Or press F11 on keyboard · Esc to exit',
    enterFullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    darkRightParagraph1:
      'The Sun is where life begins a source of energy that shapes the visible world and powers the future.',
    darkRightParagraph2:
      'Your presence here becomes 100 units of light added to that journey, where small connections come together to create sustainable change.',
    darkHeadline1: 'The Sun is the source of life.',
    darkHeadline2: 'But what keeps its energy alive and enduring?',
    darkBody3Part1:
      "It's when more and more sources of light come together - spreading energy forward.\n\nEvery check-in adds ",
    darkBodyHighlight: '100 units',
    darkBody3Part2:
      ' of light, helping the Sun\u2019s journey continue to grow - nurturing life, knowledge, and movements toward a more sustainable future.',
    darkCta: 'Discover how you can empower the Sun ☀️',
    slideCheckIn: 'Check in now',
    slideReady: 'ARE YOU READY ?',
    darkCounterLabel: 'Units of light contributed',
    darkPlugInSlogan: 'PLUG IN TO EVOLUTION',
  },
  checkin: {
    langTitle: 'Choose language',
    langSubtitle: 'Select your language / Chọn ngôn ngữ của bạn',
    nameLabel: 'Your name *',
    namePlaceholder: 'Enter your name (Max 30 characters)',
    messageLabel: 'Your message * ',
    messagePlaceholder: 'Write your message... (Max 500 characters)',
    photoLabel: 'Your photo *',
    takePhoto: 'Take photo',
    takePhotoHint: 'Open camera to take a photo or choose from your library',
    chooseOtherPhoto: 'Choose another photo',
    submit: 'Check in',
    submitting: 'Submitting...',
    successTitle: 'Check-in successful!',
    successBody: 'Thank you for joining. Look up at the big screen!',
    exportGenerating: 'Creating your check-in image...',
    exportDownload: 'Download check-in image',
    exportShare: 'Share / Save image',
    exportError: 'Could not create image. Please try again.',
    validationError: 'Please fill in all fields and select a photo',
    profanityError:
      'Your name or message contains inappropriate language. Please edit and try again.',
    submitError: 'Check-in failed',
    genericError: 'Something went wrong, please try again',
  },
} as const;

export type TranslationTree = {
  display: {
    odometerLabel: string;
    qrTitle: string;
    qrSub: string;
    qrCountdown: string;
    qrModalClose: string;
    qrModalHeadline: string;
    qrModalBody: string;
    galleryEmpty: string;
    thankYouHeadline: string;
    thankYouSunQuote: string;
    thankYouBody: string;
    fullscreenPrompt: string;
    fullscreenHint: string;
    enterFullscreen: string;
    exitFullscreen: string;
    darkRightParagraph1: string;
    darkRightParagraph2: string;
    darkHeadline1: string;
    darkHeadline2: string;
    darkBody3Part1: string;
    darkBodyHighlight: string;
    darkBody3Part2: string;
    darkCta: string;
    slideCheckIn: string;
    slideReady: string;
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
    exportGenerating: string;
    exportDownload: string;
    exportShare: string;
    exportError: string;
    validationError: string;
    profanityError: string;
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
