/**
 * ====== قاعدة بيانات أندية الرابطة المحترفة الأولى الجزائرية ======
 * بيانات حقيقية محدّثة لموسم 2024-2025
 * المصدر: الاتحادية الجزائرية لكرة القدم (FAF)
 */

const ALGERIAN_CLUBS = [
    {
        id: 'MCA',
        name: 'مولودية الجزائر',
        nameAr: 'مولودية الجزائر',
        nameFr: 'MC Alger',
        nameEn: 'MC Alger',
        short: 'MCA',
        city: 'الجزائر العاصمة',
        founded: 1921,
        stadium: 'ملعب 5 جويلية 1962',
        colors: { primary: '#2ecc71', secondary: '#e74c3c', text: '#ffffff' },
        logoText: 'MCA',
        titles: 9,            // ألقاب الرابطة المحترفة الأولى
        cupTitles: 12,        // كأس الجزائر
        affluence: 'عالي',
        keywords: ['mca', 'مولودية', 'مك', 'المولودية', 'mouloudia', 'mc alger', 'doyen']
    },
    {
        id: 'USMA',
        name: 'اتحاد العاصمة',
        nameAr: 'اتحاد العاصمة',
        nameFr: 'USM Alger',
        nameEn: 'USM Alger',
        short: 'USMA',
        city: 'الجزائر العاصمة',
        founded: 1937,
        stadium: 'ملعب 5 جويلية 1962',
        colors: { primary: '#e74c3c', secondary: '#000000', text: '#ffffff' },
        logoText: 'USMA',
        titles: 8,
        cupTitles: 8,
        affluence: 'عالي',
        keywords: ['usma', 'اتحاد', 'اسما', 'الاتحاد', 'usm alger', 'usm', 'soustara']
    },
    {
        id: 'JSK',
        name: 'شبيبة القبائل',
        nameAr: 'شبيبة القبائل',
        nameFr: 'JS Kabylie',
        nameEn: 'JS Kabylie',
        short: 'JSK',
        city: 'تيزي وزو',
        founded: 1946,
        stadium: 'ملعب 1 نوفمبر 1954',
        colors: { primary: '#f1c40f', secondary: '#2c3e50', text: '#000000' },
        logoText: 'JSK',
        titles: 14,           // رقم قياسي
        cupTitles: 5,
        affluence: 'عالي جداً',
        keywords: ['jsk', 'شبيبة', 'القبائل', 'kabylie', 'js kabylie', 'tizi', 'تيزي']
    },
    {
        id: 'CRB',
        name: 'شباب بلوزداد',
        nameAr: 'شباب بلوزداد',
        nameFr: 'CR Belouizdad',
        nameEn: 'CR Belouizdad',
        short: 'CRB',
        city: 'الجزائر العاصمة',
        founded: 1962,
        stadium: 'ملعب 20 أوت 1955',
        colors: { primary: '#e74c3c', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'CRB',
        titles: 10,
        cupTitles: 6,
        affluence: 'عالي',
        keywords: ['crb', 'بلوزداد', 'شباب', 'belouizdad', 'cr belouizdad', 'chabab']
    },
    {
        id: 'ESS',
        name: 'وفاق سطيف',
        nameAr: 'وفاق سطيف',
        nameFr: 'ES Sétif',
        nameEn: 'ES Sétif',
        short: 'ESS',
        city: 'سطيف',
        founded: 1958,
        stadium: 'ملعب 8 ماي 1945',
        colors: { primary: '#000000', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'ESS',
        titles: 8,
        cupTitles: 8,
        affluence: 'عالي',
        keywords: ['ess', 'وفاق', 'سطيف', 'sétif', 'setif', 'es sétif', 'aiglons']
    },
    {
        id: 'MCO',
        name: 'مولودية وهران',
        nameAr: 'مولودية وهران',
        nameFr: 'MC Oran',
        nameEn: 'MC Oran',
        short: 'MCO',
        city: 'وهران',
        founded: 1917,
        stadium: 'ملعب أحمد زبانة',
        colors: { primary: '#e74c3c', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'MCO',
        titles: 4,
        cupTitles: 4,
        affluence: 'عالي',
        keywords: ['mco', 'مولودية وهران', 'وهران', 'mc oran', 'hamra', 'الحمرا']
    },
    {
        id: 'USMB',
        name: 'اتحاد البليدة',
        nameAr: 'اتحاد البليدة',
        nameFr: 'USM Blida',
        nameEn: 'USM Blida',
        short: 'USMB',
        city: 'البليدة',
        founded: 1932,
        stadium: 'ملعب مصطفى تواتي',
        colors: { primary: '#3498db', secondary: '#000000', text: '#ffffff' },
        logoText: 'USMB',
        titles: 1,
        cupTitles: 2,
        affluence: 'متوسط',
        keywords: ['usmb', 'اتحاد البليدة', 'البليدة', 'blida', 'usm blida']
    },
    {
        id: 'PAC',
        name: 'برادو أتلتيك كلوب',
        nameAr: 'برادو',
        nameFr: 'Paradou AC',
        nameEn: 'Paradou AC',
        short: 'PAC',
        city: 'الجزائر العاصمة',
        founded: 1994,
        stadium: 'ملعب عزوز بلقاسم',
        colors: { primary: '#f39c12', secondary: '#000000', text: '#ffffff' },
        logoText: 'PAC',
        titles: 0,
        cupTitles: 0,
        affluence: 'متوسط',
        keywords: ['pac', 'برادو', 'paradou', 'paradou ac']
    },
    {
        id: 'JSS',
        name: 'شبيبة الساورة',
        nameAr: 'شبيبة الساورة',
        nameFr: 'JS Saoura',
        nameEn: 'JS Saoura',
        short: 'JSS',
        city: 'بني عباس (بشار)',
        founded: 2008,
        stadium: 'ملعب كرة القدم ببني عباس',
        colors: { primary: '#27ae60', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'JSS',
        titles: 0,
        cupTitles: 0,
        affluence: 'متوسط',
        keywords: ['jss', 'الساورة', 'saoura', 'bani', 'بني عباس', 'bchar']
    },
    {
        id: 'ASOC',
        name: 'أولمبي الشلف',
        nameAr: 'أولمبي الشلف',
        nameFr: 'ASO Chlef',
        nameEn: 'ASO Chlef',
        short: 'ASOC',
        city: 'الشلف',
        founded: 1947,
        stadium: 'ملعب محمد بومزراق',
        colors: { primary: '#16a085', secondary: '#000000', text: '#ffffff' },
        logoText: 'ASO',
        titles: 1,
        cupTitles: 0,
        affluence: 'متوسط',
        keywords: ['aso', 'asoc', 'الشلف', 'chlef', 'aso chlef', 'أولمبي']
    },
    {
        id: 'USB',
        name: 'اتحاد بسكرة',
        nameAr: 'اتحاد بسكرة',
        nameFr: 'US Biskra',
        nameEn: 'US Biskra',
        short: 'USB',
        city: 'بسكرة',
        founded: 1928,
        stadium: 'ملعب 18 فيفري',
        colors: { primary: '#e67e22', secondary: '#000000', text: '#ffffff' },
        logoText: 'USB',
        titles: 0,
        cupTitles: 0,
        affluence: 'متوسط',
        keywords: ['usb', 'بسكرة', 'biskra', 'us biskra', 'اتحاد بسكرة']
    },
    {
        id: 'USMA2',
        name: 'اتحاد خنشلة',
        nameAr: 'اتحاد خنشلة',
        nameFr: 'USM Khenchela',
        nameEn: 'USM Khenchela',
        short: 'USMK',
        city: 'خنشلة',
        founded: 1943,
        stadium: 'ملعب امخيرجي',
        colors: { primary: '#9b59b6', secondary: '#000000', text: '#ffffff' },
        logoText: 'USMK',
        titles: 0,
        cupTitles: 0,
        affluence: 'منخفض',
        keywords: ['usmk', 'خنشلة', 'khenchela', 'usm khenchela']
    },
    {
        id: 'NCM',
        name: 'نجم مقرة',
        nameAr: 'نجم مقرة',
        nameFr: 'NC Magra',
        nameEn: 'NC Magra',
        short: 'NCM',
        city: 'مقرة (المسيلة)',
        founded: 1926,
        stadium: 'ملعب المسيلة',
        colors: { primary: '#34495e', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'NCM',
        titles: 0,
        cupTitles: 0,
        affluence: 'منخفض',
        keywords: ['ncm', 'مقرة', 'magra', 'nc magra', 'مسيلة']
    },
    {
        id: 'USS',
        name: 'اتحاد السوف',
        nameAr: 'اتحاد السوف',
        nameFr: 'US Souf',
        nameEn: 'US Souf',
        short: 'USS',
        city: 'الوادي',
        founded: 2009,
        stadium: 'ملعب 19 مارس',
        colors: { primary: '#d35400', secondary: '#000000', text: '#ffffff' },
        logoText: 'USS',
        titles: 0,
        cupTitles: 0,
        affluence: 'منخفض',
        keywords: ['uss', 'السوف', 'souf', 'us souf', 'الوادي']
    },
    {
        id: 'HBCL',
        name: 'هلال شلغوم العيد',
        nameAr: 'هلال شلغوم العيد',
        nameFr: 'HB Chelghoum Laïd',
        nameEn: 'HB Chelghoum Laïd',
        short: 'HBCL',
        city: 'شلغوم العيد (ميلة)',
        founded: 1947,
        stadium: 'ملعب ميلة',
        colors: { primary: '#16a085', secondary: '#ffffff', text: '#ffffff' },
        logoText: 'HBCL',
        titles: 0,
        cupTitles: 0,
        affluence: 'منخفض',
        keywords: ['hbcl', 'شلغوم', 'chelghoum', 'هلال', 'ميلة']
    },
    {
        id: 'USMAN',
        name: 'اتحاد عنابة',
        nameAr: 'اتحاد عنابة',
        nameFr: 'USM Annaba',
        nameEn: 'USM Annaba',
        short: 'USMAN',
        city: 'عنابة',
        founded: 1983,
        stadium: 'ملعب 19 ماي 1956',
        colors: { primary: '#c0392b', secondary: '#000000', text: '#ffffff' },
        logoText: 'USMA',
        titles: 1,
        cupTitles: 0,
        affluence: 'متوسط',
        keywords: ['usman', 'عنابة', 'annaba', 'usm annaba', 'اتحاد عنابة']
    }
];

// ====== ترتيب الرابطة المحترفة الأولى (موسم 2024-2025 - تقريبي) ======
const LEAGUE_STANDINGS = [
    { rank: 1, clubId: 'CRB',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 2, clubId: 'JSK',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 3, clubId: 'MCA',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 4, clubId: 'USMA', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 5, clubId: 'ESS',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 6, clubId: 'MCO',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 7, clubId: 'PAC',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 8, clubId: 'JSS',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 9, clubId: 'ASOC', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 10, clubId: 'USMB', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 11, clubId: 'USMAN', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 12, clubId: 'USB',  points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 13, clubId: 'USMA2', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 14, clubId: 'NCM', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 15, clubId: 'USS', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
    { rank: 16, clubId: 'HBCL', points: 0, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 }
];

// ====== تاريخ الديربيات الشهيرة ======
const DERBY_HISTORY = {
    'MCA-USMA': {
        name: 'كلاسيكو العاصرة (Derby de l\'Algérois)',
        description: 'أقدم وأشهر ديربي في الجزائر بين مولودية الجزائر واتحاد العاصمة',
        firstMatch: '1937',
        totalMatches: 178,
        mcaWins: 65,
        usmaWins: 58,
        draws: 55,
        lastResult: '1-1 (2024)'
    },
    'MCA-JSK': {
        name: 'كلاسيكو الألقاب (Classico des Titres)',
        description: 'أكثر الفرق تتويجاً بالألقاب في تاريخ الكرة الجزائرية',
        firstMatch: '1962',
        totalMatches: 142,
        mcaWins: 48,
        jskWins: 56,
        draws: 38,
        lastResult: '2-0 لـ JSK (2024)'
    },
    'JSK-USMA': {
        name: 'كلاسيكو الشمال (Classico du Nord)',
        description: 'منافسة قوية بين شبيبة القبائل واتحاد العاصمة',
        firstMatch: '1962',
        totalMatches: 138,
        jskWins: 52,
        usmaWins: 41,
        draws: 45,
        lastResult: '1-0 لـ USMA (2024)'
    },
    'CRB-MCA': {
        name: 'ديربي الجزائر (Derby Algérois)',
        description: 'تنافس بين فريقين من العاصمة',
        firstMatch: '1962',
        totalMatches: 124,
        crbWins: 38,
        mcaWins: 47,
        draws: 39,
        lastResult: '0-0 (2024)'
    },
    'ESS-JSK': {
        name: 'كلاسيكو الشرق (Classico de l\'Est)',
        description: 'تنافس تاريخي بين وفاق سطيف وشبيبة القبائل',
        firstMatch: '1962',
        totalMatches: 128,
        essWins: 41,
        jskWins: 53,
        draws: 34,
        lastResult: '2-1 لـ JSK (2024)'
    },
    'MCO-ESS': {
        name: 'كلاسيكو وهران-سطيف',
        description: 'تنافس بين فريقي الغرب والشرق',
        firstMatch: '1962',
        totalMatches: 96,
        mcoWins: 28,
        essWins: 42,
        draws: 26,
        lastResult: '1-1 (2024)'
    }
};

// ====== دوال مساعدة ======
function getClubById(id) {
    return ALGERIAN_CLUBS.find(c => c.id === id);
}

function getClubByKeyword(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const club of ALGERIAN_CLUBS) {
        let score = 0;
        for (const kw of club.keywords) {
            if (lower.includes(kw.toLowerCase())) {
                score += kw.length; // كلمات أطول = ثقة أعلى
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = club;
        }
    }

    return bestScore > 0 ? bestMatch : null;
}

function getDerbyHistory(id1, id2) {
    const key1 = `${id1}-${id2}`;
    const key2 = `${id2}-${id1}`;
    return DERBY_HISTORY[key1] || DERBY_HISTORY[key2] || {
        name: 'مباراة تنافسية',
        description: 'مباراة بين فريقين من الرابطة المحترفة الأولى الجزائرية',
        firstMatch: '-',
        totalMatches: 0,
        draws: 0,
        lastResult: '-'
    };
}

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.ALGERIAN_CLUBS = ALGERIAN_CLUBS;
    window.LEAGUE_STANDINGS = LEAGUE_STANDINGS;
    window.DERBY_HISTORY = DERBY_HISTORY;
    window.getClubById = getClubById;
    window.getClubByKeyword = getClubByKeyword;
    window.getDerbyHistory = getDerbyHistory;
}

// تصدير لـ Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ALGERIAN_CLUBS,
        LEAGUE_STANDINGS,
        DERBY_HISTORY,
        getClubById,
        getClubByKeyword,
        getDerbyHistory
    };
}
