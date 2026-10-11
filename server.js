/**
 * ====== سيرفر كلاسيكو الجزائر - مع TikTool API ======
 * يستخدم TikTool API الصحيح والمحدث
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ====== إعدادات TikTool (تم تصحيح النطاق إلى api.tik.tools) ======
const TIKTOOL_API_KEY = process.env.TIKTOOL_API_KEY || 'tk_fce884c0faafb288fc91795e25709168f75a7f4129e6ecd4';
const TIKTOOL_BASE_URL = 'https://api.tik.tools/v1';

const GIFT_POINTS = {
    'Rose': 5, 'TikTok': 10, 'Finger Heart': 15,
    'Perfume': 20, 'Galaxy': 50, 'Lion': 100, 'Crown': 75,
    'default': 20
};

const CLUB_KEYWORDS = {
    MCA: ['mca', 'مولودية', 'مك', 'المولودية', 'mouloudia'],
    USMA: ['usma', 'اتحاد', 'اسما', 'الاتحاد', 'soustara'],
    JSK: ['jsk', 'شبيبة', 'القبائل', 'kabylie', 'تيزي'],
    CRB: ['crb', 'بلوزداد', 'شباب', 'belouizdad'],
    ESS: ['ess', 'وفاق', 'سطيف', 'setif'],
    MCO: ['mco', 'مولودية وهران', 'وهران', 'hamra', 'الحمرا']
};

const clientStates = new Map();

io.on('connection', (socket) => {
    console.log(`🔗 عميل متصل: ${socket.id}`);
    clientStates.set(socket.id, {
        team1Id: 'MCA', team2Id: 'USMA',
        username: null, pollingInterval: null,
        viewerTeams: new Map(), lastCursor: ''
    });

    socket.on('set-username', (data) => {
        const username = (data?.username || '').toString().trim().replace(/^@/, '');
        const team1Id = data?.team1 || 'MCA';
        const team2Id = data?.team2 || 'USMA';

        const state = clientStates.get(socket.id);
        if (state) {
            state.team1Id = team1Id;
            state.team2Id = team2Id;
        }

        if (!username) {
            socket.emit('error', { message: 'اسم مستخدم غير صالح' });
            return;
        }

        connectToTikTok(socket, username);
    });

    socket.on('disconnect', () => {
        const state = clientStates.get(socket.id);
        if (state?.pollingInterval) clearInterval(state.pollingInterval);
        clientStates.delete(socket.id);
    });
});

// ====== الاتصال بـ TikTool API ======
async function connectToTikTok(socket, username) {
    const state = clientStates.get(socket.id);
    if (!state) return;

    console.log(`📡 اتصال بـ @${username} عبر TikTool API...`);
    socket.emit('tiktok-event', {
        type: 'system',
        message: `📡 جاري الاتصال بـ @${username} عبر TikTool...`,
        timestamp: Date.now()
    });

    if (state.pollingInterval) clearInterval(state.pollingInterval);

    try {
        const statusResp = await axios.get(`${TIKTOOL_BASE_URL}/live/${username}`, {
            headers: { 'Authorization': `Bearer ${TIKTOOL_API_KEY}` },
            timeout: 15000
        });

        const status = statusResp.data;
        console.log(`📊 حالة البث:`, JSON.stringify(status).substring(0, 200));

        if (!status.isLive && !status.live) {
            socket.emit('tiktok-event', {
                type: 'system',
                message: `⚠️ البث غير مباشر حالياً لحساب @${username}`,
                timestamp: Date.now()
            });
            setTimeout(() => connectToTikTok(socket, username), 60000);
            return;
        }

        socket.emit('tiktok-event', {
            type: 'system',
            message: `✅ متصل بـ @${username} - البث مباشر!`,
            timestamp: Date.now()
        });

        startPolling(socket, username, state);

    } catch (err) {
        console.error(`❌ خطأ في TikTool:`, err.response?.data || err.message);
        socket.emit('tiktok-event', {
            type: 'system',
            message: `❌ خطأ في الاتصال: ${err.response?.data?.message || err.message}`,
            timestamp: Date.now()
        });

        setTimeout(() => connectToTikTok(socket, username), 10000);
    }
}

// ====== استطلاع التعليقات والهدايا ======
function startPolling(socket, username, state) {
    let lastCommentId = null;
    let lastGiftId = null;

    state.pollingInterval = setInterval(async () => {
        try {
            const commentsResp = await axios.get(`${TIKTOOL_BASE_URL}/live/${username}/comments`, {
                headers: { 'Authorization': `Bearer ${TIKTOOL_API_KEY}` },
                params: { cursor: state.lastCursor || '' },
                timeout: 10000
            });

            const data = commentsResp.data;
            if (data.comments && Array.isArray(data.comments)) {
                data.comments.forEach(comment => {
                    const commentId = comment.id || comment.comment_id || Date.now();
                    if (commentId !== lastCommentId) {
                        lastCommentId = commentId;
                        handleComment(socket, state, comment);
                    }
                });
            }
            if (data.cursor) state.lastCursor = data.cursor;

            try {
                const giftsResp = await axios.get(`${TIKTOOL_BASE_URL}/live/${username}/gifts`, {
                    headers: { 'Authorization': `Bearer ${TIKTOOL_API_KEY}` },
                    params: { cursor: state.lastGiftCursor || '' },
                    timeout: 10000
                });

                const giftData = giftsResp.data;
                if (giftData.gifts && Array.isArray(giftData.gifts)) {
                    giftData.gifts.forEach(gift => {
                        const giftId = gift.id || gift.timestamp || Date.now();
                        if (giftId !== lastGiftId) {
                            lastGiftId = giftId;
                            handleGift(socket, state, gift);
                        }
                    });
                }
                if (giftData.cursor) state.lastGiftCursor = giftData.cursor;
            } catch (e) {}

            try {
                const viewResp = await axios.get(`${TIKTOOL_BASE_URL}/live/${username}/viewers`, {
                    headers: { 'Authorization': `Bearer ${TIKTOOL_API_KEY}` },
                    timeout: 5000
                });
                if (viewResp.data.viewerCount) {
                    socket.emit('viewer-count', { count: viewResp.data.viewerCount });
                }
            } catch (e) {}

        } catch (err) {
            console.log(`⚠️ خطأ في الاستطلاع:`, err.message);
        }
    }, 2000);
}

// ====== معالجة التعليقات ======
function handleComment(socket, state, comment) {
    const text = (comment.text || comment.comment || '').toString();
    const username = comment.user?.nickname || comment.username || comment.nickname || 'مشاهد';
    const uniqueId = comment.user?.unique_id || comment.uniqueId || username;

    const team = detectTeamFromText(text, state.team1Id, state.team2Id);
    let side = null;
    if (team === state.team1Id) side = 't1';
    else if (team === state.team2Id) side = 't2';

    if (uniqueId) {
        let viewer = state.viewerTeams.get(uniqueId);
        if (!viewer) {
            viewer = { team: null, lastTime: Date.now() };
            state.viewerTeams.set(uniqueId, viewer);
        }
        viewer.lastTime = Date.now();
        if (side) viewer.team = side;
    }

    socket.emit('tiktok-event', {
        type: 'comment',
        username, uniqueId, text, team: side,
        timestamp: Date.now()
    });
}

// ====== معالجة الهدايا ======
function handleGift(socket, state, gift) {
    const giftName = gift.name || gift.giftName || gift.gift_name || 'هدية';
    const diamondCount = gift.diamondCount || gift.diamonds || gift.coins || 0;
    const repeatCount = gift.repeatCount || 1;
    const username = gift.user?.nickname || gift.username || gift.nickname || 'مشاهد';
    const uniqueId = gift.user?.unique_id || gift.uniqueId || username;

    let points = GIFT_POINTS[giftName] || GIFT_POINTS['default'];
    points *= repeatCount;

    if (diamondCount > 0 && diamondCount * repeatCount > 100) {
        points = diamondCount * repeatCount;
    }

    let side = null;
    if (uniqueId && state.viewerTeams.has(uniqueId)) {
        const viewer = state.viewerTeams.get(uniqueId);
        if (Date.now() - viewer.lastTime < 1800000) {
            side = viewer.team;
        }
    }

    if (!side) side = Math.random() > 0.5 ? 't1' : 't2';

    socket.emit('tiktok-event', {
        type: 'gift',
        username, uniqueId, giftName, points, team: side,
        timestamp: Date.now()
    });
}

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

setInterval(() => {
    const now = Date.now();
    for (const state of clientStates.values()) {
        if (state.viewerTeams) {
            for (const [key, value] of state.viewerTeams.entries()) {
                if (now - value.lastTime > 1800000) {
                    state.viewerTeams.delete(key);
                }
            }
        }
    }
}, 60000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('========================================================');
    console.log('  ⚽ كلاسيكو الجزائر - سيرفر TikTool API (محدث)');
    console.log('========================================================');
    console.log(`  🌐 http://localhost:${PORT}`);
    console.log(`  🔑 TikTool API: ${TIKTOOL_API_KEY.substring(0, 20)}...`);
    console.log('========================================================');
    console.log('');
});
