import { CAR_MAKES, type CarMake } from '@btlee/shared';

import { getLocale, type Locale } from '@/config/locale';

const ARABIC_MAKE_LABELS: Record<CarMake, string> = {
  Abarth: 'أبارث',
  'Alfa Romeo': 'ألفا روميو',
  Audi: 'أودي',
  BAIC: 'بايك',
  Bentley: 'بنتلي',
  Bestune: 'بيستون',
  BMW: 'بي إم دبليو',
  Brilliance: 'بريليانس',
  BYD: 'بي واي دي',
  Cadillac: 'كاديلاك',
  Changan: 'شانجان',
  Chery: 'شيري',
  Chevrolet: 'شيفروليه',
  Citroën: 'سيتروين',
  Cupra: 'كوبرا',
  Daewoo: 'دايو',
  Daihatsu: 'دايهاتسو',
  DFSK: 'دي إف إس كيه',
  Dodge: 'دودج',
  Dongfeng: 'دونج فينج',
  Exeed: 'إكسيد',
  Fiat: 'فيات',
  Ford: 'فورد',
  Foton: 'فوتون',
  GAC: 'جي إيه سي',
  Geely: 'جيلي',
  'Great Wall': 'جريت وول',
  Haval: 'هافال',
  Honda: 'هوندا',
  Hongqi: 'هونشي',
  Hyundai: 'هيونداي',
  Infiniti: 'إنفينيتي',
  Isuzu: 'إيسوزو',
  JAC: 'جاك',
  Jaguar: 'جاكوار',
  Jeep: 'جيب',
  Jetour: 'جيتور',
  Kaiyi: 'كايي',
  KGM: 'كيه جي إم',
  Kia: 'كيا',
  Lada: 'لادا',
  'Land Rover': 'لاند روفر',
  Lexus: 'لكزس',
  Mazda: 'مازدا',
  'Mercedes-Benz': 'مرسيدس بنز',
  MG: 'إم جي',
  MINI: 'ميني',
  Mitsubishi: 'ميتسوبيشي',
  Nissan: 'نيسان',
  Opel: 'أوبل',
  Peugeot: 'بيجو',
  Porsche: 'بورشه',
  Proton: 'بروتون',
  Renault: 'رينو',
  SEAT: 'سيات',
  Skoda: 'سكودا',
  Soueast: 'سوإيست',
  Subaru: 'سوبارو',
  Suzuki: 'سوزوكي',
  Tesla: 'تسلا',
  Toyota: 'تويوتا',
  Volkswagen: 'فولكس فاجن',
  Volvo: 'فولفو',
  Zeekr: 'زيكر',
};

const MAKE_ALIASES: Partial<Record<CarMake, string>> = {
  BAIC: 'بيك',
  Citroën: 'ستروين citroen',
  'Land Rover': 'رينج روفر range rover',
  'Mercedes-Benz': 'مرسيدس mercedes benz',
  Mitsubishi: 'متسوبيشي',
  Peugeot: 'بيجو peugeot',
  Volkswagen: 'فولكس واجن vw',
};

export const POPULAR_CAR_MAKES: readonly CarMake[] = [
  'Toyota',
  'Hyundai',
  'Kia',
  'Nissan',
  'Chevrolet',
  'Renault',
  'MG',
  'Chery',
];

export const CAR_MAKE_OPTIONS = CAR_MAKES;

export function getCarMakeLabel(make: string, locale: Locale = getLocale()): string {
  const canonical = CAR_MAKES.find((item) => item.toLocaleLowerCase() === make.toLocaleLowerCase());
  if (!canonical || locale === 'en') return canonical ?? make;
  return ARABIC_MAKE_LABELS[canonical];
}

export function getCarMakeSearchText(make: CarMake): string {
  return `${make} ${ARABIC_MAKE_LABELS[make]} ${MAKE_ALIASES[make] ?? ''}`;
}

export function normalizeCarMakeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}
