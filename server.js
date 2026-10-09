/**
 * ====== سيرفر كلاسيكو الجزائر التفاعلي ======
 * سيرفر Node.js يربط بين بث تيك توك المباشر وواجهة الويب
 * باستخدام Express + Socket.io + tiktok-live-connector
 *
 * يدعم 16 نادياً من الرابطة المحترفة الأولى الجزائرية
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { getClubByKeyword, getClubById } = require('./teams-data');

// تحميل مكتبة tiktok-live-connector بشكل آمن
let WebcastPushConnection = null;
try {
    const lib = require('tiktok-live-connector');
    WebcastPushConnection = lib.WebcastPushConnection;
} catch (e) {
    console.warn('⚠️  تنبيه: مكتبة tiktok-live-connector غير مثبتة.');
    console.warn('   قم بتثبيتها عبر: npm install tiktok-live-connector');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// تقديم الملفات الثابتة
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API لإرجاع بيانات الأندية
app.get('/api/clubs', (req, res) => {
    res.json({ clubs: ALGERIAN_CLUBS });
});

// ====== إعدادات اللعبة ======
const GIFT_POINTS = {
    'Rose': 5,
    'TikTok': 10,
    'Finger Heart': 15,
    'Perfume': 20,
    'Galaxy': 50,
    'Lion': 100,
    'Crown': 75,
    'default': 20
};

// حالة الاتصال لكل عميل
const clientStates = new Map(); // socket.id -> { team1Id, team2Id, tiktokConnection }

// ====== Socket.io للأحداث من الواجهة ======
io.on('connection', (socket) => {
    console.log(`🔗 عميل متصل: ${socket.id}`);

    clientStates.set(socket.id, {
        team1Id: 'MCA',
        team2Id: 'USMA',
        tiktokConnection: null,
        recentComments: new Map()
    });

    socket.on('set-username', (data) => {
        const username = (data && data.username || '').toString().trim().replace(/^@/, '');
        const team1Id = data?.team1 || 'MCA';
        const team2Id = data?.team2 || 'USMA';

        const state = clientStates.get(socket.id);
        if (state) {
            state.team1Id = team1Id;
            state.team2Id = team2Id;
        }

        if (!username) {
            socket.emit('error', { message: 'اسم المستخدم غير صالح' });
            return;
        }

        if (!WebcastPushConnection) {
            socket.emit('error', { message: 'مكتبة tiktok-live-connector غير مثبتة على السيرفر' });
            return;
        }

        connectToTikTok(socket, username);
    });

    // تحديث الفريقين بدون إعادة الاتصال
    socket.on('update-teams', (data) => {
        const state = clientStates.get(socket.id);
        if (state && data.team1 && data.team2) {
            state.team1Id = data.team1;
            state.team2Id = data.team2;
            console.log(`🔄 تحديث الفريقين للعميل ${socket.id}: ${data.team1} vs ${data.team2}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ عميل قطع الاتصال: ${socket.id}`);
        const state = clientStates.get(socket.id);
        if (state && state.tiktokConnection) {
            try { state.tiktokConnection.disconnect(); } catch (e) {}
        }
        clientStates.delete(socket.id);
    });
});

// ====== الاتصال ببث تيك توك ======
function connectToTikTok(socket, username) {
    const state = clientStates.get(socket.id);
    if (!state) return;

    console.log(`📡 محاولة الاتصال ببث تيك توك: @${username} (للعميل ${socket.id})`);

    // قطع الاتصال السابق
    if (state.tiktokConnection) {
        try { state.tiktokConnection.disconnect(); } catch (e) {}
        state.tiktokConnection = null;
    }

    try {
        const connection = new WebcastPushConnection(username);
        state.tiktokConnection = connection;

        connection.connect().then(connState => {
            console.log(`✅ متصل ببث تيك توك: @${username} (isLive=${connState.isLive})`);
            socket.emit('status', { connected: true, username, roomInfo: connState });
        }).catch(err => {
            console.error(`❌ فشل الاتصال بـ @${username}:`, err.message);
            socket.emit('error', { message: `فشل الاتصال ببث @${username}: ${err.message}` });
        });

        // ====== التعليقات ======
        connection.on('chat', (data) => {
            try {
                const commentText = (data.comment || '').toString();
                const username = data.user?.nickname || data.uniqueId || 'مشاهد';
                const uniqueId = data.user?.uniqueId || data.uniqueId || '';

                // كشف الفريق المختار ديناميكياً
                const club = getClubByKeyword(commentText);
                let detectedTeam = null;

                if (club) {
                    if (club.id === state.team1Id) detectedTeam = state.team1Id;
                    else if (club.id === state.team2Id) detectedTeam = state.team2Id;
                }

                // حفظ آخر تعليق للمستخدم (لاستخدامه في الهدايا)
                if (uniqueId) {
                    state.recentComments.set(uniqueId, {
                        team: detectedTeam,
                        time: Date.now()
                    });
                }

                socket.emit('tiktok-event', {
                    type: 'comment',
                    username: username,
                    uniqueId: uniqueId,
                    text: commentText,
                    team: detectedTeam,
                    timestamp: Date.now()
                });
            } catch (e) {
                console.error('خطأ في معالجة التعليق:', e.message);
            }
        });

        // ====== الهدايا ======
        connection.on('gift', (data) => {
            try {
                const giftName = data.giftName || data.giftId || 'هدية';
                const points = GIFT_POINTS[giftName] || GIFT_POINTS['default'];
                const repeatCount = data.repeatCount || 1;
                const totalPoints = points * (data.repeatEnd ? repeatCount : 1);

                const username = data.user?.nickname || data.uniqueId || 'مشاهد';
                const uniqueId = data.user?.uniqueId || data.uniqueId || '';

                // محاولة كشف الفريق من آخر تعليق للمستخدم
                let team = null;
                if (uniqueId && state.recentComments.has(uniqueId)) {
                    const recent = state.recentComments.get(uniqueId);
                    if (Date.now() - recent.time < 60000) {
                        team = recent.team;
                    }
                }

                // إذا لم يُكتشف الفريق، نوزع عشوائياً بين الفريقين المختارين
                if (!team) {
                    team = Math.random() > 0.5 ? state.team1Id : state.team2Id;
                }

                socket.emit('tiktok-event', {
                    type: 'gift',
                    username: username,
                    uniqueId: uniqueId,
                    giftName: giftName,
                    points: totalPoints,
                    team: team,
                    timestamp: Date.now()
                });

                console.log(`🎁 هدية: ${username} أرسل ${giftName} (+${totalPoints}) → ${team}`);
            } catch (e) {
                console.error('خطأ في معالجة الهدية:', e.message);
            }
        });

        // ====== الإعجابات ======
        connection.on('like', (data) => {
            try {
                const uniqueId = data.uniqueId || '';
                let team = null;
                if (uniqueId && state.recentComments.has(uniqueId)) {
                    const recent = state.recentComments.get(uniqueId);
                    if (Date.now() - recent.time < 60000) {
                        team = recent.team;
                    }
                }
                if (!team) team = Math.random() > 0.5 ? state.team1Id : state.team2Id;

                socket.emit('tiktok-event', {
                    type: 'gift',
                    username: data.nickname || data.uniqueId || 'مشاهد',
                    giftName: 'إعجاب',
                    points: 1,
                    team: team,
                    timestamp: Date.now()
                });
            } catch (e) {}
        });

        // ====== عدد المشاهدين ======
        connection.on('roomUserCount', (data) => {
            try {
                socket.emit('viewer-count', { count: data.viewerCount || 0 });
            } catch (e) {}
        });

        // ====== مشاركة ======
        connection.on('share', (data) => {
            try {
                const uniqueId = data.uniqueId || '';
                let team = null;
                if (uniqueId && state.recentComments.has(uniqueId)) {
                    team = state.recentComments.get(uniqueId).team;
                }
                if (!team) team = state.team1Id;

                socket.emit('tiktok-event', {
                    type: 'gift',
                    username: data.nickname || data.uniqueId || 'مشاهد',
                    giftName: 'مشاركة',
                    points: 3,
                    team: team,
                    timestamp: Date.now()
                });
            } catch (e) {}
        });

        connection.on('streamEnd', () => {
            console.log(`🛑 انتهى البث المباشر لـ @${username}`);
            socket.emit('status', { connected: false, reason: 'stream_ended' });
        });

        connection.on('error', (err) => {
            console.error('خطأ من تيك توك:', err);
        });

    } catch (e) {
        console.error('استثناء أثناء الاتصال:', e);
        socket.emit('error', { message: e.message });
    }
}

// ====== تنظيف دوري للسجلات ======
setInterval(() => {
    const now = Date.now();
    for (const [socketId, state] of clientStates.entries()) {
        if (state.recentComments) {
            for (const [key, value] of state.recentComments.entries()) {
                if (now - value.time > 300000) {
                    state.recentComments.delete(key);
                }
            }
        }
    }
}, 60000);

// ====== تشغيل السيرفر ======
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log('  ⚽ كلاسيكو الجزائر التفاعلي - سيرفر البث المباشر');
    console.log('========================================================');
    console.log('');
    console.log(`  🌐 السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`  📡 في انتظار اتصال واجهة الويب...`);
    console.log('');
    console.log('  الأندية المدعومة (16 نادي):');
    const clubs = require('./teams-data').ALGERIAN_CLUBS;
    clubs.forEach((c, i) => {
        console.log(`    ${String(i+1).padStart(2, '0')}. ${c.short.padEnd(6)} - ${c.nameAr} (${c.city})`);
    });
    console.log('');
    console.log('  لتشغيل البث:');
    console.log('  1) افتح المتصفح على http://localhost:3000');
    console.log('  2) اختر الفريقين من القائمة المنسدلة');
    console.log('  3) أدخل اسم حساب تيك توك في حقل الإعدادات');
    console.log('  4) اضغط على زر "اتصال"');
    console.log('========================================================');
    console.log('');
});

// ====== إغلاق آمن ======
process.on('SIGINT', () => {
    console.log('\n🛑 إغلاق السيرفر...');
    for (const [socketId, state] of clientStates.entries()) {
        if (state.tiktokConnection) {
            try { state.tiktokConnection.disconnect(); } catch (e) {}
        }
    }
    server.close();
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('❌ استثناء غير معالج:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ وعد مرفوض:', err);
});
