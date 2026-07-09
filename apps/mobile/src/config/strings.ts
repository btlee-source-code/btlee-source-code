/**
 * Arabic UI strings for the mobile app. The web uses next-intl (`ar.json`),
 * which doesn't port to RN; these mirror the relevant keys plus the strings the
 * web hardcodes inline. Default language is Arabic (matches the web).
 */
export const S = {
  appName: 'Bt Lee',

  // Currency / units (from property.* keys)
  currency: 'ج.م',
  perMonth: '/ شهرياً',
  priceOnRequest: 'السعر عند التواصل',
  areaUnit: 'م²',
  in: 'في',

  // Card badges
  featured: 'مميز',
  new: 'جديد',

  // Tabs
  tabHome: 'الرئيسية',
  tabProperties: 'العقارات',
  tabWishlist: 'المفضلة',
  tabProfile: 'حسابي',

  // Home
  heroTitle: 'لاقي بيتك الجديد',
  heroSubtitle: 'آلاف العقارات للبيع والإيجار في مكان واحد',
  startSearch: 'ابدأ البحث',
  exploreByType: 'استكشف حسب النوع',
  featuredTitle: 'عقارات مميزة',
  latestTitle: 'أحدث العقارات',
  viewAll: 'عرض الكل',

  // Properties list
  searchPlaceholder: 'ابحث عن مدينة، منطقة، أو نوع عقار...',
  resultsCount: (n: number) => `${n} نتيجة`,
  loading: 'جارٍ التحميل',
  noResultsTitle: 'لا نتائج',
  noResultsDesc: 'جرّب تعديل كلمة البحث',
  errorTitle: 'حصل خطأ',
  errorDesc: 'تعذّر تحميل العقارات، حاول تاني',
  retry: 'إعادة المحاولة',

  // Detail
  contactOwner: 'تواصل مع صاحب العقار',
  viewOnMap: 'عرض على الخريطة',
  descriptionLabel: 'الوصف',
  detailsLabel: 'التفاصيل',
  bedrooms: 'غرف نوم',
  bathrooms: 'حمامات',
  floor: 'الدور',
  area: 'المساحة',
  finishingLabel: 'التشطيب',
  elevator: 'أسانسير',
  garage: 'جراج',
  servicesLabel: 'الخدمات المتوفرة',
  depositLabel: 'التأمين المطلوب',
  listingNumber: 'رقم الإعلان',
  views: 'مشاهدة',

  // Auth
  signInTitle: 'تسجيل الدخول',
  signInSubtitle: 'أهلاً بعودتك إلى بيت لي',
  registerTitle: 'إنشاء حساب جديد',
  registerSubtitle: 'انضم إلى بيت لي وابدأ رحلتك العقارية',
  nameLabel: 'الاسم',
  emailOrPhoneLabel: 'البريد الإلكتروني أو رقم الهاتف',
  emailLabel: 'البريد الإلكتروني',
  phoneLabel: 'رقم الهاتف',
  passwordLabel: 'كلمة المرور',
  signInBtn: 'دخول',
  createAccountBtn: 'إنشاء حساب',
  noAccount: 'ليس لديك حساب؟',
  hasAccount: 'لديك حساب؟',
  logout: 'تسجيل الخروج',
  // Validation
  required: 'هذا الحقل مطلوب',
  invalidEmail: 'البريد الإلكتروني غير صحيح',
  invalidPhone: 'أدخل رقم هاتف مصري صحيح (مثال: 01012345678)',
  passwordMin: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  loginFailed: 'بيانات الدخول غير صحيحة',

  // Placeholders (features coming next)
  wishlistEmptyTitle: 'مفيش عقارات محفوظة',
  wishlistEmptyDesc: 'احفظ العقارات اللي عجباك وهتلاقيها هنا',
  profileGuestTitle: 'أهلاً بيك في Bt Lee',
  profileGuestDesc: 'سجّل دخولك عشان تحفظ عقارات وتضيف إعلانك',
  comingSoon: 'قريباً',
  loginToSave: 'سجل دخولك أولاً لحفظ العقارات',
  genericError: 'حدث خطأ، حاول مرة أخرى',
};
