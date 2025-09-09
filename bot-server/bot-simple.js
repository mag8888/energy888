const { Telegraf, Markup } = require('telegraf');

// Токен бота
const BOT_TOKEN = '8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI';
const GAME_URL = 'https://energy8.vercel.app/';

const bot = new Telegraf(BOT_TOKEN);

// Простая база данных для хранения пользователей и рефералов
const users = new Map();

// Функция для получения или создания пользователя
function getUser(userId) {
    if (!users.has(userId)) {
        users.set(userId, {
            id: userId,
            balance: 10, // 10$ за регистрацию
            referrals: 0,
            refCode: `ref_${userId}`
        });
    }
    return users.get(userId);
}

// Функция для обработки реферала
function processReferral(userId, referrerId) {
    const user = getUser(userId);
    const referrer = getUser(referrerId);
    
    // Начисляем 10$ за регистрацию
    user.balance += 10;
    
    // Начисляем 10$ рефереру
    referrer.balance += 10;
    referrer.referrals += 1;
    
    return { user, referrer };
}

// Главное меню
const mainMenu = Markup.keyboard([
    ['📖 О проекте', '💰 Доход'],
    ['👥 Получить клиентов'],
    ['🎮 Играть', '💳 Баланс']
]).resize();

// Обработчик команды /start
bot.start((ctx) => {
    const userId = ctx.from.id;
    const startParam = ctx.message.text.split(' ')[1]; // Получаем параметр после /start
    
    // Обрабатываем реферала, если есть параметр
    if (startParam && startParam.startsWith('ref_')) {
        const referrerId = parseInt(startParam.replace('ref_', ''));
        if (referrerId && referrerId !== userId) {
            const { user, referrer } = processReferral(userId, referrerId);
            
            // Уведомляем реферера
            try {
                ctx.telegram.sendMessage(referrerId, 
                    `🎉 У вас новый реферал! Баланс пополнен на 10$. Текущий баланс: ${referrer.balance}$`
                );
            } catch (e) {
                // Игнорируем ошибки отправки уведомления
            }
        }
    }
    
    const user = getUser(userId);
    
    const welcomeText = `👋 Привет друг! 👑 (подруга)

🎉 Добро пожаловать в Энергию Денег 

✨ — пространство, где игра соединяется с реальными возможностями в квантовом поле.

🚀 Здесь ты сможешь:
• 🫂 найти друзей
• 💰 увеличить доход 
• 🤝 найти клиентов 
• 🎲 играть и развиваться 

🎯 Выбирай, что интересно прямо сейчас 👇`;

    // Пытаемся отправить фото с приветствием
    try {
        ctx.replyWithPhoto('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop&crop=center', { 
            caption: welcomeText, 
            reply_markup: mainMenu.reply_markup 
        });
    } catch (error) {
        // Если фото нет, отправляем только текст
        ctx.reply(welcomeText, mainMenu);
    }
});

// О проекте
bot.hears('📖 О проекте', (ctx) => {
    const aboutText = `🎮 «Энергия Денег» — это новая образовательная игра, созданная на основе принципов CashFlow.  

💡 Она помогает менять мышление, прокачивать навыки и открывать новые финансовые возможности.`;

    // Пытаемся отправить фото, если есть
    try {
        ctx.replyWithPhoto('https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&crop=center', { caption: aboutText });
    } catch (error) {
        // Если фото нет, отправляем только текст
        ctx.reply(aboutText);
    }
});

// Получить клиентов
bot.hears('👥 Получить клиентов', (ctx) => {
    const clientsText = `🎯 Через игру ты можешь находить новых клиентов и партнёров.  

🚀 Это современный инструмент продвижения твоего бизнеса и укрепления связей.`;

    const clientsKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('👨‍💼 Стать мастером', 'https://t.me/Aurelia_8888?text=Хочу стать мастером, расскажите подробнее о том, как получать клиентов через игру')]
    ]);

    // Пытаемся отправить фото, если есть
    try {
        ctx.replyWithPhoto('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop&crop=center', {
            caption: clientsText,
            reply_markup: clientsKeyboard.reply_markup
        });
    } catch (error) {
        // Если фото нет, отправляем только текст
        ctx.reply(clientsText, clientsKeyboard);
    }
});

// Обработчик кнопки "Оставить заявку" (оставляем для совместимости)
bot.action('leave_application', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('📝 Заявка принята! Наш менеджер свяжется с вами для обсуждения подходящего способа заработка.\n\n⏰ Время ответа: до 2 часов');
});

// Доход
bot.hears('💰 Доход', (ctx) => {
    const earnText = `💰 Хочешь зарабатывать вместе с «Энергией Денег»?  

🤝 Стань партнёром проекта и получай доход, играя и помогая другим людям развиваться.`;

    const earnKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('📱 Связаться с менеджером', 'https://t.me/Aurelia_8888?text=Хочу стать партнером, расскажите подробнее о франшизе')]
    ]);

    // Отправляем три картинки подряд
    try {
        // Первая картинка с текстом и кнопкой на менеджера
        ctx.replyWithPhoto('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center', {
            caption: earnText,
            reply_markup: earnKeyboard.reply_markup
        });
        
        // Вторая картинка с реф программой
        setTimeout(() => {
            const refText = `🔗 Ваша реф ссылка

💵 За каждого приглашенного вы получаете 10$ которые сможете потратить внутри бота`;
            
            const refKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('🔗 Получить реф ссылку', 'https://t.me/energy_m_bot?start=ref_' + ctx.from.id)]
            ]);
            
            ctx.replyWithPhoto('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center', {
                caption: refText,
                reply_markup: refKeyboard.reply_markup
            });
        }, 5000);
        
        // Третья картинка с франшизой
        setTimeout(() => {
            const franchiseText = `🏢 Купить франшизу`;
            
            const franchiseKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('💼 Купить франшизу', 'https://t.me/Aurelia_8888?text=Хочу купить франшизу, расскажите подробнее о условиях и стоимости')]
            ]);
            
            ctx.replyWithPhoto('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center', {
                caption: franchiseText,
                reply_markup: franchiseKeyboard.reply_markup
            });
        }, 10000);
        
    } catch (error) {
        // Если фото нет, отправляем только текст
        ctx.reply(earnText, earnKeyboard);
    }
});


// Играть
bot.hears('🎮 Играть', (ctx) => {
    const gameText = `🎮 Готов попробовать? 🎲  

🚀 Запускай игру прямо сейчас и прокачивай свои навыки в мире финансовых решений!`;

    const gameKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Начать игру', 'start_game')]
    ]);

    // Пытаемся отправить фото, если есть
    try {
        ctx.replyWithPhoto('https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&crop=center', {
            caption: gameText,
            reply_markup: gameKeyboard.reply_markup
        });
    } catch (error) {
        // Если фото нет, отправляем только текст
        ctx.reply(gameText, gameKeyboard);
    }
});

// Обработчик кнопки "Начать игру"
bot.action('start_game', (ctx) => {
    ctx.answerCbQuery();
    
    const gameKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('🎮 Открыть игру', GAME_URL)]
    ]);

    ctx.reply('✅ Регистрация в игре завершена!\n\n🌐 Перейдите по ссылке ниже, чтобы начать играть:', gameKeyboard);
});

// Баланс
bot.hears('💳 Баланс', (ctx) => {
    const userId = ctx.from.id;
    const user = getUser(userId);
    
    const balanceText = `💳 Ваш баланс: ${user.balance}$

👥 Количество приглашенных: ${user.referrals}

🔗 Ваша реферальная ссылка:
https://t.me/energy_m_bot?start=${user.refCode}

💰 Приглашайте друзей - вы и друг получите по 10$ на баланс!`;

    const balanceKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('🔗 Поделиться ссылкой', `https://t.me/share/url?url=https://t.me/energy_m_bot?start=${user.refCode}&text=Присоединяйся к игре Энергия Денег!`)]
    ]);

    ctx.reply(balanceText, balanceKeyboard);
});

// Обработка неизвестных сообщений
bot.on('text', (ctx) => {
    ctx.reply('🤔 Не понимаю эту команду. Используйте меню ниже для навигации! 👇', mainMenu);
});

// Запуск бота
bot.launch().then(() => {
    console.log('🤖 Бот запущен!');
    console.log('🔗 Ссылка на бота: https://t.me/energy_m_bot');
}).catch((error) => {
    console.error('❌ Ошибка запуска бота:', error);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
