import { Bot } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// Обработка команды /start с токеном
bot.command('start', async (ctx) => {
  const token = ctx.message.text.split(' ')[1]; // Получаем токен из команды
  
  if (!token) {
    await ctx.reply('👋 Привет! Используйте ссылку из игры для входа.');
    return;
  }

  // Отправляем данные пользователя на сервер
  try {
    const user = ctx.from;
    const response = await fetch(`${process.env.SOCKET_URL || 'http://localhost:4000'}/tg/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BOT_TOKEN}`
      },
      body: JSON.stringify({
        token,
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      await ctx.reply('✅ Вход выполнен! Теперь вы можете играть в Energy of Money!');
    } else {
      await ctx.reply('❌ Ошибка входа. Попробуйте снова.');
    }
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка других команд
bot.command('help', async (ctx) => {
  await ctx.reply('🎮 Energy of Money Bot\n\nИспользуйте ссылку из игры для входа.');
});

// Запуск бота
bot.start();
console.log('🤖 Telegram бот запущен!');
