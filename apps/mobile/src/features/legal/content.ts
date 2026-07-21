/**
 * Localized legal/static page content. Arabic and English mirror the web legal
 * copy so users see the same policy on every platform.
 */
import { getLocale } from '@/config/locale';

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalArticleData {
  title: string;
  intro: string;
  updated?: string;
  highlight?: string;
  sections?: LegalSection[];
  steps?: string[];
  note?: string;
  contactTitle?: string;
  contactBody?: string;
}

const PRIVACY_AR: LegalArticleData = {
  title: 'سياسة الخصوصية',
  intro:
    'توضّح هذه السياسة البيانات التي تجمعها منصة بيت لي وكيفية استخدامها وحقوقك بشأنها. باستخدامك للمنصة فإنك توافق على هذه السياسة.',
  updated: 'آخر تحديث: يونيو 2026',
  highlight:
    'نجمع فقط البيانات اللازمة لتشغيل المنصة وربطك بأصحاب العقارات مباشرةً. ولا نبيع بياناتك الشخصية لأي طرف خارجي إطلاقاً.',
  sections: [
    {
      title: 'البيانات التي نجمعها',
      body: 'عند إنشاء حساب نجمع اسمك وبريدك الإلكتروني و/أو رقم هاتفك، وأي إعلانات عقارية تنشرها (تشمل الصور والسعر والموقع ورقم التواصل). وإذا سجّلت الدخول عبر جوجل فإننا نستلم اسمك وبريدك وصورة ملفك الشخصي من جوجل فقط — لا أكثر. نحن لا نصل إلى جهات اتصالك أو منشوراتك أو قائمة أصدقائك.',
    },
    {
      title: 'تسجيل الدخول عبر جوجل',
      body: 'تسجيل الدخول عبر جوجل اختياري ويُستخدم فقط للتحقق من هويتك وإنشاء حسابك. نطلب صلاحيات الملف الشخصي الأساسي والبريد الإلكتروني فقط. ولا ننشر أي شيء نيابةً عنك، ولا نحتفظ بكلمة مرور حسابك على جوجل.',
    },
    {
      title: 'كيفية استخدام بياناتك',
      body: 'نستخدم بياناتك من أجل: إنشاء حسابك وتأمينه، ونشر إعلاناتك، وتمكين المهتمين من التواصل معك، وإرسال رسائل متعلقة بالخدمة (مثل إعادة تعيين كلمة المرور)، وتحسين المنصة. يظهر رقم هاتفك/واتساب على إعلاناتك أنت فقط ليتمكن المشترون من التواصل معك مباشرةً.',
    },
    {
      title: 'مشاركة البيانات',
      body: 'نحن لا نبيع بياناتك الشخصية. بيانات التواصل التي تختار نشرها في إعلان تكون ظاهرة للمستخدمين الآخرين بطبيعة الحال. ونستعين بمزوّدي خدمات موثوقين (مثل الاستضافة السحابية وتخزين الصور) لتشغيل المنصة فقط.',
    },
    {
      title: 'ملفات تعريف الارتباط والجلسات',
      body: 'نستخدم ملفات تعريف ارتباط آمنة (httpOnly) لإبقائك مسجّلاً للدخول. وهي ضرورية للمصادقة فقط ولا تُستخدم للإعلانات أو التتبّع عبر المواقع.',
    },
    {
      title: 'الاحتفاظ بالبيانات وحذفها',
      body: 'نحتفظ ببياناتك طالما حسابك نشط. يمكنك حذف حسابك وبياناتك المرتبطة به في أي وقت — راجع صفحة حذف البيانات لمعرفة الخطوات.',
    },
    {
      title: 'حقوقك',
      body: 'يحق لك الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها، وسحب موافقتك على تسجيل الدخول الاجتماعي في أي وقت عبر التواصل معنا أو حذف حسابك.',
    },
    {
      title: 'تعديل هذه السياسة',
      body: 'قد نقوم بتحديث هذه السياسة من وقت لآخر. ويُعدّ استمرارك في استخدام المنصة بعد التعديل موافقةً على النسخة المحدّثة.',
    },
  ],
  contactTitle: 'تواصل معنا',
  contactBody:
    'لأي استفسار يخص الخصوصية أو طلبات البيانات، تواصل معنا عبر واتساب على 01066001035.',
};

const DISCLAIMER_AR: LegalArticleData = {
  title: 'إخلاء المسؤولية',
  intro:
    'يرجى قراءة إخلاء المسؤولية التالي بعناية قبل استخدام منصة بيت لي. باستخدامك للمنصة فإنك تقرّ بموافقتك على ما ورد فيه.',
  updated: 'آخر تحديث: يونيو 2026',
  highlight:
    'بيت لي مجرد وسيلة عرض تربط أصحاب العقارات بالمهتمين مباشرةً، وليست طرفاً في أي صفقة. كل المعاملات تتم بين المستخدمين وعلى مسؤوليتهم الكاملة.',
  sections: [
    {
      title: 'طبيعة المنصة',
      body: 'بيت لي منصة عقارية إلكترونية تتيح لأصحاب العقارات عرض إعلاناتهم والتواصل المباشر مع المهتمين دون أي وسيط. المنصة ليست وسيطاً عقارياً ولا سمساراً ولا طرفاً في أي صفقة تتم بين المستخدمين، ويقتصر دورها على عرض الإعلانات التي ينشرها المستخدمون أنفسهم.',
    },
    {
      title: 'إخلاء المسؤولية عن المعاملات',
      body: 'بيت لي غير مسؤولة عن أي معاملات مالية أو إدارية أو تجارية تتم بين المستخدمين، سواء كانت بين المالك والمشتري أو بين المالك والمستأجر أو أي أطراف أخرى. أي اتفاق أو تعاقد أو دفع يتم على مسؤولية طرفيه وحدهما.',
    },
    {
      title: 'دقة المعلومات',
      body: 'جميع بيانات الإعلانات (السعر، المساحة، الموقع، الصور، الوصف، ووسيلة التواصل) يدخلها المعلنون بأنفسهم. لا تضمن بيت لي صحة أو اكتمال أو تحديث هذه البيانات، وعلى المستخدم التحقق منها بنفسه قبل اتخاذ أي قرار أو دفع أي مبلغ.',
    },
    {
      title: 'المعاينة والتحقق',
      body: 'ننصح المستخدم بمعاينة العقار على الطبيعة، والتأكد من مستندات الملكية وصحة بيانات الطرف الآخر وهويته، قبل توقيع أي عقد أو سداد أي مقدّم أو عربون.',
    },
    {
      title: 'المدفوعات والاحتيال',
      body: 'لا تتلقى بيت لي أي مدفوعات بين المستخدمين ولا تتوسط فيها. لا تدفع أي مبلغ قبل التأكد الكامل من العقار ومن الطرف الآخر. المنصة غير مسؤولة عن أي خسارة ناتجة عن عمليات احتيال أو نصب، ونحثك على توخّي الحذر والإبلاغ عن أي إعلان مشبوه.',
    },
    {
      title: 'مسؤولية المحتوى المنشور',
      body: 'المعلن وحده مسؤول مسؤولية كاملة عن قانونية ودقة المحتوى الذي ينشره. يحق لبيت لي إزالة أي إعلان يخالف الشروط أو القانون دون إشعار مسبق، لكنها لا تتحمل مسؤولية ما ينشره المستخدمون.',
    },
    {
      title: 'عدم الضمان',
      body: 'لا تتبنّى بيت لي أو ترشّح أي عقار أو معلن بعينه، ولا تقدّم أي ضمان بشأن حالة العقار أو وضعه القانوني أو ملاءمته لغرض معيّن.',
    },
    {
      title: 'الأطراف الخارجية',
      body: 'قد تحتوي المنصة على وسائل تواصل أو روابط لأطراف خارجية (مثل واتساب). بيت لي غير مسؤولة عن خدمات أو محتوى أي طرف خارجي.',
    },
    {
      title: 'تعديل إخلاء المسؤولية',
      body: 'يحق لبيت لي تعديل أو تحديث إخلاء المسؤولية في أي وقت، ويُعدّ استمرارك في استخدام المنصة موافقةً على النسخة المحدّثة.',
    },
  ],
};

const DATA_DELETION_AR: LegalArticleData = {
  title: 'تعليمات حذف البيانات',
  intro: 'يمكنك حذف حسابك على بيت لي وكل البيانات المرتبطة به في أي وقت. إليك الطريقة:',
  steps: [
    'سجّل الدخول إلى حسابك على بيت لي.',
    'اذهب إلى صفحة الحساب الشخصي / الإعدادات.',
    'اختر "حذف الحساب" وأكّد العملية.',
    'أو راسلنا على واتساب على 01066001035 مرفقاً البريد الإلكتروني أو رقم الهاتف المسجّل بحسابك واطلب الحذف.',
  ],
  note: 'بمجرد التأكيد، يُحذف حسابك وإعلاناتك وبياناتك الشخصية نهائياً من أنظمتنا. كما يتم فصل البيانات المشاركة عبر الأطراف الخارجية (مثل جوجل).',
};

const PRIVACY_EN: LegalArticleData = {
  title: 'Privacy Policy',
  intro:
    'This policy explains what information Btlee collects, how we use it, and your rights. By using the platform you agree to this policy.',
  updated: 'Last updated: June 2026',
  highlight:
    'We only collect the data needed to run the platform and connect you with property owners. We never sell your personal data to third parties.',
  sections: [
    {
      title: 'Information we collect',
      body: 'When you create an account we collect your name, email address, and/or phone number, and any property listings you publish (including images, price, location, and a contact number). If you sign in with Google, we receive your name, email, and profile picture from Google — nothing else. We do not access your contacts, posts, or friends list.',
    },
    {
      title: 'Social sign-in (Google)',
      body: 'Signing in with Google is optional and only used to authenticate you and create your account. We request the basic profile and email scopes only. We do not post anything on your behalf and do not store your Google password.',
    },
    {
      title: 'How we use your data',
      body: 'We use your data to: create and secure your account, publish your listings, let interested users contact you, send service-related emails (such as password reset), and improve the platform. Your phone/WhatsApp number is shown on your own listings so buyers can reach you directly.',
    },
    {
      title: 'Data sharing',
      body: 'We do not sell your personal data. Contact details you choose to publish on a listing are visible to other users by design. We use trusted service providers (e.g. cloud hosting and image storage) solely to operate the platform.',
    },
    {
      title: 'Cookies & sessions',
      body: 'We use secure, httpOnly cookies to keep you signed in. These are essential for authentication and are not used for advertising or cross-site tracking.',
    },
    {
      title: 'Data retention & deletion',
      body: 'We keep your data while your account is active. You can delete your account and associated data at any time — see our Data Deletion page for instructions.',
    },
    {
      title: 'Your rights',
      body: 'You may access, correct, or delete your personal data, and withdraw consent for social sign-in at any time by contacting us or deleting your account.',
    },
    {
      title: 'Changes to this policy',
      body: 'We may update this policy from time to time. Continued use of the platform after changes constitutes acceptance of the updated policy.',
    },
  ],
  contactTitle: 'Contact us',
  contactBody:
    'For any privacy questions or data requests, reach us on WhatsApp at 01066001035.',
};

const DISCLAIMER_EN: LegalArticleData = {
  title: 'Disclaimer',
  intro:
    'Please read the following disclaimer carefully before using the Btlee platform. By using the platform, you acknowledge your agreement to its terms.',
  updated: 'Last updated: June 2026',
  highlight:
    'Btlee is only a listing medium that connects property owners directly with interested users — it is not a party to any deal. All transactions take place between users and at their sole responsibility.',
  sections: [
    {
      title: 'Nature of the platform',
      body: 'Btlee is an online real estate platform that lets property owners publish their listings and communicate directly with interested users, without any intermediary. The platform is not a real estate broker or agent and is not a party to any deal between users; its role is limited to displaying the listings that users themselves post.',
    },
    {
      title: 'No responsibility for transactions',
      body: 'Btlee is not responsible for any financial, administrative, or commercial transactions between users — whether between an owner and a buyer, an owner and a tenant, or any other parties. Any agreement, contract, or payment is the sole responsibility of the parties involved.',
    },
    {
      title: 'Accuracy of information',
      body: 'All listing data (price, area, location, images, description, and contact method) is entered by the advertisers themselves. Btlee does not guarantee the accuracy, completeness, or timeliness of this data, and users must verify it independently before making any decision or payment.',
    },
    {
      title: 'Inspection and verification',
      body: 'We advise users to inspect the property in person and to verify the ownership documents and the identity and details of the other party before signing any contract or paying any deposit.',
    },
    {
      title: 'Payments and fraud',
      body: 'Btlee does not receive or mediate any payments between users. Do not pay any amount before fully verifying the property and the other party. The platform is not liable for any loss resulting from fraud or scams, and we urge you to be cautious and to report any suspicious listing.',
    },
    {
      title: 'Responsibility for posted content',
      body: 'Advertisers are solely and fully responsible for the legality and accuracy of the content they publish. Btlee may remove any listing that violates these terms or the law without prior notice, but is not responsible for content posted by users.',
    },
    {
      title: 'No warranty',
      body: "Btlee does not endorse or recommend any specific property or advertiser, and provides no warranty regarding a property's condition, legal status, or fitness for any particular purpose.",
    },
    {
      title: 'Third parties',
      body: 'The platform may contain contact methods or links to third parties (such as WhatsApp). Btlee is not responsible for the services or content of any third party.',
    },
    {
      title: 'Changes to this disclaimer',
      body: 'Btlee may amend or update this disclaimer at any time. Your continued use of the platform constitutes acceptance of the updated version.',
    },
  ],
};

const DATA_DELETION_EN: LegalArticleData = {
  title: 'Data Deletion Instructions',
  intro: "You can delete your Btlee account and all associated data at any time. Here's how:",
  steps: [
    'Sign in to your Btlee account.',
    'Go to your Profile / Account settings.',
    'Choose "Delete account" and confirm.',
    'Alternatively, message us on WhatsApp at 01066001035 with the email or phone number on your account and request deletion.',
  ],
  note: 'Once confirmed, your account, listings, and personal data are permanently removed from our systems. Data shared via third parties (e.g. Google) is also disconnected.',
};

/**
 * Read the active locale lazily. The navigator remounts after a language switch,
 * and the proxy also keeps direct reads correct without duplicating page routes.
 */
function localizedArticle(
  arabic: LegalArticleData,
  english: LegalArticleData
): LegalArticleData {
  return new Proxy(arabic, {
    get(target, property, receiver) {
      const source = getLocale() === 'en' ? english : target;
      return Reflect.get(source, property, receiver);
    },
  });
}

export const PRIVACY = localizedArticle(PRIVACY_AR, PRIVACY_EN);
export const DISCLAIMER = localizedArticle(DISCLAIMER_AR, DISCLAIMER_EN);
export const DATA_DELETION = localizedArticle(DATA_DELETION_AR, DATA_DELETION_EN);
