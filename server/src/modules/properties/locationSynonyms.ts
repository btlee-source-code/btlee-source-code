/**
 * Bilingual (Arabic ⇄ English) location dictionary for property search.
 *
 * Each group lists equivalent names for one place — Egyptian governorates plus
 * the most-searched districts / cities — so a search in either language matches
 * listings stored in the other. e.g. searching "Maadi" finds "المعادي" and
 * searching "القاهرة" finds anything an English speaker entered as "Cairo".
 *
 * The search layer (searchHelpers.ts) detects any term of a group in the query
 * and expands the match to ALL of that group's terms across the location fields.
 * Matching itself is diacritic/letter-tolerant via arabicTolerantPattern, so
 * spelling variants of the Arabic forms don't need to be listed here.
 */
export const LOCATION_GROUPS: string[][] = [
  // ── Governorates (Arabic forms match the values stored on listings) ──
  ['القاهرة', 'cairo'],
  ['الجيزة', 'giza', 'gizah'],
  ['الإسكندرية', 'alexandria', 'alex'],
  ['الدقهلية', 'dakahlia', 'daqahliya'],
  ['البحر الأحمر', 'red sea'],
  ['البحيرة', 'beheira', 'behera'],
  ['الفيوم', 'fayoum', 'fayum', 'faiyum'],
  ['الغربية', 'gharbia', 'gharbiya'],
  ['الإسماعيلية', 'ismailia', 'ismailiya'],
  ['المنوفية', 'monufia', 'menoufia'],
  ['المنيا', 'minya', 'menia'],
  ['القليوبية', 'qalyubia', 'qaliubiya'],
  ['الوادي الجديد', 'new valley'],
  ['السويس', 'suez'],
  ['أسوان', 'aswan'],
  ['أسيوط', 'asyut', 'assiut'],
  ['بني سويف', 'beni suef', 'bani sweif'],
  ['بورسعيد', 'port said', 'portsaid'],
  ['دمياط', 'damietta', 'dumyat'],
  ['الشرقية', 'sharqia', 'sharkia'],
  ['جنوب سيناء', 'south sinai'],
  ['كفر الشيخ', 'kafr el sheikh', 'kafrelsheikh'],
  ['مطروح', 'matrouh', 'matruh'],
  ['الأقصر', 'luxor', 'loxor'],
  ['قنا', 'qena', 'qina'],
  ['شمال سيناء', 'north sinai'],
  ['سوهاج', 'sohag', 'suhag'],

  // ── Popular districts / cities ──
  ['المعادي', 'maadi'],
  ['مدينة نصر', 'nasr city'],
  ['مصر الجديدة', 'heliopolis'],
  ['الزمالك', 'zamalek'],
  ['وسط البلد', 'downtown'],
  ['الدقي', 'dokki', 'doqqi'],
  ['المهندسين', 'mohandessin', 'mohandiseen'],
  ['القاهرة الجديدة', 'new cairo'],
  ['التجمع', 'التجمع الخامس', 'tagamoa', 'fifth settlement'],
  ['السادس من أكتوبر', '6 أكتوبر', 'اكتوبر', '6th of october', '6 october', 'october'],
  ['الشيخ زايد', 'sheikh zayed', 'zayed'],
  ['العبور', 'obour', 'el obour'],
  ['الشروق', 'shorouk', 'el shorouk'],
  ['المقطم', 'mokattam', 'muqattam'],
  ['حلوان', 'helwan'],
  ['شبرا', 'shubra', 'shobra'],
  ['العاصمة الإدارية', 'new capital', 'administrative capital'],
  ['الساحل الشمالي', 'الساحل', 'north coast', 'sahel'],
  ['الغردقة', 'hurghada'],
  ['شرم الشيخ', 'شرم', 'sharm el sheikh', 'sharm'],
  ['العين السخنة', 'السخنة', 'ain sokhna', 'sokhna'],
  ['دهب', 'dahab'],
  ['مرسى علم', 'marsa alam'],
  ['مرسى مطروح', 'marsa matrouh'],
  ['رأس البر', 'ras el bar'],
  ['المنصورة', 'mansoura'],
  ['طنطا', 'tanta'],
  ['الزقازيق', 'zagazig'],
];
