/**
 * قاعدة بيانات أندية الرابطة المحترفة الأولى الجزائرية
 * مع شعارات SVG بسيطة (أعلام) لكل نادي
 */

const ALGERIAN_CLUBS = [
    {
        id: 'MCA', name: 'مولودية الجزائر', nameAr: 'مولودية الجزائر',
        short: 'MCA', city: 'الجزائر العاصمة', founded: 1921,
        titles: 9, cupTitles: 12, color: '#2ecc71', color2: '#e74c3c',
        keywords: ['mca', 'مولودية', 'مك', 'المولودية', 'mouloudia'],
        flag: '🟢🔴' // علم بسيط بالألوان
    },
    {
        id: 'USMA', name: 'اتحاد العاصمة', nameAr: 'اتحاد العاصمة',
        short: 'USMA', city: 'الجزائر العاصمة', founded: 1937,
        titles: 8, cupTitles: 8, color: '#e74c3c', color2: '#000000',
        keywords: ['usma', 'اتحاد', 'اسما', 'الاتحاد', 'soustara'],
        flag: '🔴⚫'
    },
    {
        id: 'JSK', name: 'شبيبة القبائل', nameAr: 'شبيبة القبائل',
        short: 'JSK', city: 'تيزي وزو', founded: 1946,
        titles: 14, cupTitles: 5, color: '#f1c40f', color2: '#2c3e50',
        keywords: ['jsk', 'شبيبة', 'القبائل', 'kabylie', 'تيزي'],
        flag: '🟡🔵'
    },
    {
        id: 'CRB', name: 'شباب بلوزداد', nameAr: 'شباب بلوزداد',
        short: 'CRB', city: 'الجزائر العاصمة', founded: 1962,
        titles: 10, cupTitles: 6, color: '#e74c3c', color2: '#ffffff',
        keywords: ['crb', 'بلوزداد', 'شباب', 'belouizdad'],
        flag: '🔴⚪'
    },
    {
        id: 'ESS', name: 'وفاق سطيف', nameAr: 'وفاق سطيف',
        short: 'ESS', city: 'سطيف', founded: 1958,
        titles: 8, cupTitles: 8, color: '#2c3e50', color2: '#ffffff',
        keywords: ['ess', 'وفاق', 'سطيف', 'setif'],
        flag: '⚫⚪'
    },
    {
        id: 'MCO', name: 'مولودية وهران', nameAr: 'مولودية وهران',
        short: 'MCO', city: 'وهران', founded: 1917,
        titles: 4, cupTitles: 4, color: '#e74c3c', color2: '#ffffff',
        keywords: ['mco', 'مولودية وهران', 'وهران', 'hamra', 'الحمرا'],
        flag: '🔴⚪'
    }
];

function getClubById(id){return ALGERIAN_CLUBS.find(c=>c.id===id)}
function getClubByKeyword(text){
if(!text)return null;const lower=text.toLowerCase();
let best=null,bestScore=0;
ALGERIAN_CLUBS.forEach(c=>{let s=0;c.keywords.forEach(k=>{if(lower.includes(k.toLowerCase()))s+=k.length});if(s>bestScore){bestScore=s;best=c}});
return bestScore>0?best:null;
}

if(typeof window!=='undefined'){window.ALGERIAN_CLUBS=ALGERIAN_CLUBS;window.getClubById=getClubById;window.getClubByKeyword=getClubByKeyword;}
if(typeof module!=='undefined'&&module.exports){module.exports={ALGERIAN_CLUBS,getClubById,getClubByKeyword};}
