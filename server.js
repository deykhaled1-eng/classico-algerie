/**
 * ====== سيرفر كلاسيكو الجزائر التفاعلي (الإصدار 2) ======
 * يدعم:
 * - اختيار كل مشاهد لفريقه المفضل
 * - توجيه الهدايا للفريق المختار من قبل المشاهد
 * - إحصاءات الإعلام لكل فريق
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

let WebcastPushConnection = null;
try {
    const lib = require('tiktok-live-connector');
    WebcastPushConnection = lib.WebcastPushConnection;
} catch (e) {
    console.warn('⚠️  tiktok-live-connector غير مثبتة. شغّل: npm install tiktok-live-connector');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const GIFT_POINTS = {
    'Rose': 5, 'TikTok': 10, 'Finger Heart': 15,
    'Perfume': 20, 'Galaxy': 50, 'Lion': 100, 'Crown': 75,
    'default': 20
};

// ====== دالة احتساب الهدايا ======
// الهدايا فوق 100 تُحتسب بنقاطها الفعلية كأهداف
// مثال: هدية بـ 150 نقطة = 150 هدف، هدية بـ 200 = 200 هدف
// الهدايا حتى 100 تُحتسب بنقاطها المحددة في GIFT_POINTS
function calculateGiftPoints(giftName, repeatCount, repeatEnd, diamondCount) {
    let basePoints = GIFT_POINTS[giftName] || GIFT_POINTS['default'];
    let totalPoints = basePoints * (repeatEnd ? repeatCount : 1);
    
    // إذا كانت الهدية فوق 100 نقطة، نحتسبها بقيمتها الفعلية كأهداف
    // diamondCount: عدد الماسات (القيمة الفعلية للهدية في تيك توك)
    if (diamondCount && diamondCount > 0) {
        const actualValue = diamondCount * (repeatEnd ? repeatCount : 1);
        if (actualValue > 100) {
            // الهدية فوق 100 → تحتسب بقيمتها الفعلية كأهداف
            totalPoints = actualValue;
        }
    }
    
    return totalPoints;
}

// قاعدة بيانات الأندية (للكشف عن الفريق)
const CLUB_KEYWORDS = {
    MCA: ['mca', 'مولودية', 'مك', 'المولودية', 'mouloudia'],
    USMA: ['usma', 'اتحاد', 'اسما', 'الاتحاد', 'soustara'],
    JSK: ['jsk', 'شبيبة', 'القبائل', 'kabylie', 'تيزي'],
    CRB: ['crb', 'بلوزداد', 'شباب', 'belouizdad'],
    ESS: ['ess', 'وفاق', 'سطيف', 'setif'],
    MCO: ['mco', 'وهران', 'hamra', 'الحمرا']
};

// حالة كل عميل
const clientStates = new Map();

io.on('connection', (socket) => {
    console.log(`🔗 عميل متصل: ${socket.id}`);

    clientStates.set(socket.id, {
        team1Id: 'MCA', team2Id: 'USMA',
        tiktokConnection: null,
        // خريطة: userId -> { team: 't1'|'t2', lastComment: string, lastTime: Date }
        viewerTeams: new Map()
    });

    socket.on('set-username', (data) => {
        const username = (data?.username || '').toString().trim().replace(/^@/, '');
        const team1Id = data?.team1 || 'MCA';
        const team2Id = data?.team2 || 'USMA';
        const myTeam = data?.myTeam || 't1'; // فريق المشاهد صاحب الموقع

        const state = clientStates.get(socket.id);
        if (state) {
            state.team1Id = team1Id;
            state.team2Id = team2Id;
            state.myTeam = myTeam;
        }

        if (!username || !WebcastPushConnection) {
            socket.emit('error', { message: !username ? 'اسم مستخدم غير صالح' : 'مكتبة tiktok غير مثبتة' });
            return;
        }

        connectToTikTok(socket, username);
    });

    // مشاهد اختار فريقه المفضل (من الواجهة)
    socket.on('viewer-choose-team', (data) => {
        const state = clientStates.get(socket.id);
        if (!state) return;
        const viewerId = data?.viewerId || socket.id;
        const team = data?.team; // 't1' أو 't2'
        if (team === 't1' || team === 't2') {
            state.viewerTeams.set(viewerId, { team, lastTime: Date.now() });
            console.log(`🎯 مشاهد ${viewerId} اختار: ${team}`);
        }
    });

    socket.on('disconnect', () => {
        const state = clientStates.get(socket.id);
        if (state?.tiktokConnection) {
            try { state.tiktokConnection.disconnect(); } catch (e) {}
        }
        clientStates.delete(socket.id);
    });
});

function connectToTikTok(socket, username) {
    const state = clientStates.get(socket.id);
    if (!state) return;

    console.log(`📡 اتصال بـ @${username}...`);

    if (state.tiktokConnection) {
        try { state.tiktokConnection.disconnect(); } catch (e) {}
    }

    if (!WebcastPushConnection) {
        socket.emit('error', { message: 'مكتبة tiktok-live-connector غير مثبتة على السيرفر' });
        console.error('❌ WebcastPushConnection غير متوفرة - المكتبة غير مثبتة');
        return;
    }

    // ====== نظام إعادة المحاولة التلقائي ======
    // TikTok غالباً يرفض الاتصال الأول (403)، لكنه ينجح في المحاولات اللاحقة
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 3000; // 3 ثواني بين المحاولات
    let retryCount = 0;
    let connectionSuccess = false;

    function tryConnect() {
        if (retryCount >= MAX_RETRIES || connectionSuccess) return;

        retryCount++;
        console.log(`🔄 محاولة ${retryCount}/${MAX_RETRIES} للاتصال بـ @${username}...`);

        if (state.tiktokConnection) {
            try { state.tiktokConnection.disconnect(); } catch (e) {}
        }

        try {
            const connection = new WebcastPushConnection(username, {
                enableExtendedGiftInfo: true,
                processInitialData: false,
                enableWebsocketUpgrade: true,
                requestPollingIntervalMs: 2000,
                clientParams: {
                    agent: process.env.HTTPS_PROXY || undefined,
                    appId: 1988,
                    lang: 'en-US'
                },
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': 'https://www.tiktok.com/',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-site'
                    },
                    timeout: 10000
                },
                websocketOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Origin': 'https://www.tiktok.com'
                    }
                }
            });
            state.tiktokConnection = connection;
            setupEventHandlers(connection, socket, username, state);

            socket.emit('tiktok-event', {
                type: 'system',
                message: `محاولة ${retryCount}/${MAX_RETRIES} للاتصال...`,
                timestamp: Date.now()
            });

            connection.connect().then(s => {
                connectionSuccess = true;
                console.log(`✅ متصل بـ @${username} - isLive: ${s.isLive}, roomId: ${s.roomId}`);
                socket.emit('status', { connected: true, username, roomInfo: s });
                socket.emit('tiktok-event', {
                    type: 'system',
                    message: `🎉 متصل بنجاح بـ @${username} - البث مباشر: ${s.isLive ? 'نعم' : 'لا'}`,
                    timestamp: Date.now()
                });
            }).catch(err => {
                console.error(`❌ فشل الاتصال (محاولة ${retryCount}/${MAX_RETRIES}):`, err.message.substring(0, 200));

                if (retryCount < MAX_RETRIES && !connectionSuccess) {
                    socket.emit('tiktok-event', {
                        type: 'system',
                        message: `⚠️ فشل محاولة ${retryCount}, إعادة المحاولة بعد 3 ثواني...`,
                        timestamp: Date.now()
                    });
                    setTimeout(tryConnect, RETRY_DELAY);
                } else {
                    socket.emit('error', { message: `فشل الاتصال بعد ${MAX_RETRIES} محاولات: ${err.message}` });
                    socket.emit('tiktok-event', {
                        type: 'system',
                        message: `❌ فشل الاتصال بعد ${MAX_RETRIES} محاولات. تأكد أن البث مباشر على TikTok.`,
                        timestamp: Date.now()
                    });
                }
            });
        } catch (e) {
            console.error('استثناء أثناء الاتصال:', e.message);
            if (retryCount < MAX_RETRIES) {
                setTimeout(tryConnect, RETRY_DELAY);
            }
        }
    }

    tryConnect();
}

// ====== معالجات الأحداث ======
function setupEventHandlers(connection, socket, username, state) {

        // إضافة سجل لكل الأحداث للتشخيص
        const logEvent = (eventName) => {
            connection.on(eventName, (...args) => {
                console.log(`📨 حدث ${eventName} من @${username}`);
            });
        };
        ['streamEnd', 'disconnected', 'error', 'websocketConnected'].forEach(logEvent);

        // ====== التعليقات ======
        // خريطة: userId -> { team: 't1'|'t2', commentCount: number, lastTime: Date, history: [{text, team, time}] }
        // نحفظ سجل كل التعليقات لكل مشاهد
        connection.on('chat', (data) => {
            try {
                const text = (data.comment || '').toString();
                const username = data.user?.nickname || data.uniqueId || 'مشاهد';
                const uniqueId = data.user?.uniqueId || data.uniqueId || '';

                // كشف الفريق من النص
                const team = detectTeamFromText(text, state.team1Id, state.team2Id);
                let side = null;
                if (team === state.team1Id) side = 't1';
                else if (team === state.team2Id) side = 't2';

                // حفظ/تحديث سجل المشاهد
                if (uniqueId) {
                    let viewer = state.viewerTeams.get(uniqueId);
                    if (!viewer) {
                        viewer = { team: null, commentCount: 0, totalPoints: 0, lastTime: Date.now(), history: [] };
                        state.viewerTeams.set(uniqueId, viewer);
                    }
                    viewer.commentCount++;
                    viewer.lastTime = Date.now();
                    if (side) {
                        viewer.team = side; // آخر فريق ذكره
                    }
                    // إضافة لسجل التعليقات (آخر 20 تعليق فقط لتوفير الذاكرة)
                    viewer.history.push({ text, team: side, time: Date.now() });
                    if (viewer.history.length > 20) viewer.history.shift();
                }

                // نرسل الحدث دائماً - حتى لو لم يذكر فريقاً (التعليق العادي يُعرض)
                socket.emit('tiktok-event', {
                    type: 'comment',
                    username, uniqueId, text,
                    team: side,
                    commentCount: uniqueId && state.viewerTeams.has(uniqueId)
                        ? state.viewerTeams.get(uniqueId).commentCount
                        : 1,
                    timestamp: Date.now()
                });

                console.log(`💬 ${username}: "${text}" ${side ? '→ ' + side : ''}`);
            } catch (e) {}
        });

        // ====== الهدايا ======
        connection.on('gift', (data) => {
            try {
                const giftName = data.giftName || data.giftId || 'هدية';
                const repeatCount = data.repeatCount || 1;
                // محاولة استخراج قيمة الماسات من بيانات الهدية
                // تيك توك يرسل معلومات مختلفة باختلاف الإصدار
                const diamondCount = data.diamondCount || data.coins || data.giftId || 0;
                
                // استخدام دالة الاحتساب الجديدة
                const totalPoints = calculateGiftPoints(
                    giftName, repeatCount, data.repeatEnd, diamondCount
                );

                const username = data.user?.nickname || data.uniqueId || 'مشاهد';
                const uniqueId = data.user?.uniqueId || data.uniqueId || '';

                // تحديد فريق المشاهد المرسل:
                // 1) من سجله المحفوظ (آخر فريق ذكره في أي تعليق)
                // 2) افتراضياً: نوزع عشوائياً بين الفريقين (للمشاهدين الذين لم يذكروا فريقاً)
                let side = null;
                let source = 'default';
                if (uniqueId && state.viewerTeams.has(uniqueId)) {
                    const viewer = state.viewerTeams.get(uniqueId);
                    // صالح لمدة 30 دقيقة (30 * 60 * 1000 = 1800000 مللي ثانية)
                    if (viewer.team && Date.now() - viewer.lastTime < 1800000) {
                        side = viewer.team;
                        source = 'recent_comment';
                        // تحديث نقاط المشاهد
                        viewer.totalPoints = (viewer.totalPoints || 0) + totalPoints;
                    }
                }

                // إذا لم يذكر المشاهد فريقاً قط، نوزع عشوائياً
                // هذا يحافظ على العدالة ولا يفضل فريقاً على آخر
                if (!side) {
                    side = Math.random() > 0.5 ? 't1' : 't2';
                    source = 'random';
                }

                socket.emit('tiktok-event', {
                    type: 'gift',
                    username, uniqueId,
                    giftName,
                    points: totalPoints,
                    team: side,
                    source: source, // لمعرفة مصدر القرار
                    timestamp: Date.now()
                });

                console.log(`🎁 ${username} أرسل ${giftName} (+${totalPoints}) → ${side} (${source})`);
            } catch (e) {}
        });

        connection.on('like', (data) => {
            try {
                const uniqueId = data.uniqueId || '';
                let side = null;
                if (uniqueId && state.viewerTeams.has(uniqueId)) {
                    const viewer = state.viewerTeams.get(uniqueId);
                    if (viewer.team && Date.now() - viewer.lastTime < 1800000) {
                        side = viewer.team;
                    }
                }
                if (!side) side = Math.random() > 0.5 ? 't1' : 't2';

                socket.emit('tiktok-event', {
                    type: 'gift',
                    username: data.nickname || data.uniqueId || 'مشاهد',
                    giftName: 'إعجاب',
                    points: 1,
                    team: side,
                    timestamp: Date.now()
                });
            } catch (e) {}
        });

        connection.on('roomUserCount', (data) => {
            try { socket.emit('viewer-count', { count: data.viewerCount || 0 }); } catch (e) {}
        });

        connection.on('share', (data) => {
            try {
                let side = state.myTeam || 't1';
                socket.emit('tiktok-event', {
                    type: 'gift',
                    username: data.nickname || data.uniqueId || 'مشاهد',
                    giftName: 'مشاركة',
                    points: 3, team: side, timestamp: Date.now()
                });
            } catch (e) {}
        });

        connection.on('streamEnd', () => {
            socket.emit('status', { connected: false, reason: 'stream_ended' });
            socket.emit('tiktok-event', {
                type: 'system',
                message: '🔴 انتهى البث المباشر على TikTok',
                timestamp: Date.now()
            });
        });

        connection.on('disconnected', () => {
            console.log(`🔌 انقطع الاتصال بـ @${username}`);
            socket.emit('tiktok-event', {
                type: 'system',
                message: '🔌 انقطع الاتصال، جاري إعادة المحاولة...',
                timestamp: Date.now()
            });
        });
}

// كشف الفريق من النص
function detectTeamFromText(text, team1Id, team2Id) {
    if (!text) return null;
    const lower = text.toLowerCase();
    let team1Score = 0, team2Score = 0;

    (CLUB_KEYWORDS[team1Id] || []).forEach(kw => {
        if (lower.includes(kw.toLowerCase())) team1Score++;
    });
    (CLUB_KEYWORDS[team2Id] || []).forEach(kw => {
        if (lower.includes(kw.toLowerCase())) team2Score++;
    });

    if (team1Score > team2Score) return team1Id;
    if (team2Score > team1Score) return team2Id;
    return null;
}

// تنظيف دوري
setInterval(() => {
    const now = Date.now();
    for (const state of clientStates.values()) {
        if (state.viewerTeams) {
            for (const [key, value] of state.viewerTeams.entries()) {
                if (now - value.lastTime > 1800000) { // 30 دقيقة
                    state.viewerTeams.delete(key);
                }
            }
        }
    }
}, 60000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('');
    console.log('========================================================');
    console.log('  ⚽ كلاسيكو الجزائر - سيرفر البث (إصدار 2)');
    console.log('========================================================');
    console.log(`  🌐 http://localhost:${PORT}`);
    console.log('  ✨ مميزات الإصدار 2:');
    console.log('     - اختيار كل مشاهد لفريقه المفضل');
    console.log('     - توجيه الهدايا للفريق المختار');
    console.log('     - إحصاءات الإعلام');
    console.log('========================================================');
    console.log('');
});

process.on('SIGINT', () => {
    for (const state of clientStates.values()) {
        if (state.tiktokConnection) try { state.tiktokConnection.disconnect(); } catch (e) {}
    }
    server.close();
    process.exit(0);
});
