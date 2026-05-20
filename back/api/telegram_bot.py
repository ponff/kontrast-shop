import os
import logging
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from django.conf import settings
from asgiref.sync import sync_to_async
from api.models import Order, CustomOrder, TelegramUser

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.secret_code = getattr(settings, 'TELEGRAM_SECRET_CODE', 'DEFAULT123')
        self.application = None
        
        if not self.token:
            logger.warning("TELEGRAM_BOT_TOKEN not set in settings - bot will not be available")
            return
            
        logger.info(f"🤖 Bot initialized with token: {self.token[:10]}...")
        logger.info(f"🔐 Secret code configured")
    
    def _initialize_application(self):
        """Lazy initialization of the application - only called when needed"""
        if self.application is not None:
            return
            
        try:
            self.application = ApplicationBuilder().token(self.token).build()
            self.setup_handlers()
            logger.info("✅ Telegram bot application successfully initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Telegram bot: {e}")
            raise

    async def get_or_create_user(self, user):
        """Создает или получает пользователя"""
        try:
            telegram_user, created = await sync_to_async(TelegramUser.objects.get_or_create)(
                user_id=user.id,
                defaults={
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'notifications_enabled': True,
                    'is_approved': False
                }
            )
            return telegram_user
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None

    def setup_handlers(self):
        """Настройка обработчиков команд"""
        if self.application is None:
            logger.warning("Cannot setup handlers - application not initialized")
            return
            
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("auth", self.auth))
        self.application.add_handler(CommandHandler("notifications", self.notifications))
        self.application.add_handler(CommandHandler("orders", self.show_orders))
        self.application.add_handler(CommandHandler("custom", self.show_custom_orders))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        user = update.effective_user
        
        try:
            telegram_user = await self.get_or_create_user(user)
            if not telegram_user:
                await update.message.reply_text("❌ Ошибка при создании пользователя.")
                return
            
            if not telegram_user.is_approved:
                welcome_text = (
                    f"Привет, {user.first_name}! 👋\n\n"
                    "🔐 *Это защищенный бот для уведомлений о новых заявках.*\n\n"
                    "Для доступа к функциям бота необходимо ввести секретный код.\n\n"
                    "Используйте команду:\n"
                    "`/auth ваш_код`\n\n"
                    "*Пример:* `/auth SECRET123`\n\n"
                    "Если у вас нет кода, обратитесь к администратору."
                )
            else:
                welcome_text = (
                    f"С возвращением, {user.first_name}! ✅\n\n"
                    "Вы успешно аутентифицированы.\n\n"
                    "*Доступные команды:*\n"
                    "🔔 `/notifications` - Управление уведомлениями\n"
                    "📋`/orders` - Показать заявки из каталога\n"
                    "📋 `/custom` - Показать заказы на кастом\n"
                    "*Или используйте кнопки в меню уведомлений*"
                )
            await update.message.reply_text(welcome_text, parse_mode='Markdown')
        except Exception as e:
            logger.error(f"Error in start command: {e}")
            await update.message.reply_text("❌ Произошла ошибка. Попробуйте позже.")

    async def auth(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Аутентификация по секретному коду"""
        user = update.effective_user
        
        # Сначала создаем/получаем пользователя
        telegram_user = await self.get_or_create_user(user)
        if not telegram_user:
            await update.message.reply_text("❌ Ошибка при создании пользователя.")
            return
        
        if not context.args:
            await update.message.reply_text(
                "❌ *Неверный формат команды.*\n\n"
                "Используйте: `/auth ваш_код`\n\n"
                "*Пример:* `/auth SECRET123`\n\n",
                parse_mode='Markdown'
            )
            return

        input_code = ' '.join(context.args).strip()
        logger.info(f"User {user.id} trying to auth with code: {input_code}")
        
        try:
            if input_code == self.secret_code:
                telegram_user.is_approved = True
                await sync_to_async(telegram_user.save)()
                
                await update.message.reply_text(
                    "✅ *Аутентификация успешна!*\n\n"
                    "Теперь вам доступны все функции бота\n\n"
                    "Для начала работы используйте `/notifications`",
                    parse_mode='Markdown'
                )
            else:
                await update.message.reply_text(
                    "❌ *Неверный секретный код.*\n\n"
                    "Проверьте правильность ввода и попробуйте снова.\n\n",
                    parse_mode='Markdown'
                )
                
        except Exception as e:
            logger.error(f"Error in auth command: {e}")
            await update.message.reply_text("❌ Произошла ошибка. Попробуйте позже.")

    async def show_orders(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показать необработанные заявки (кастом)"""
        user = update.effective_user
        
        try:
            telegram_user = await self.get_or_create_user(user)
            if not telegram_user:
                await update.message.reply_text("❌ Ошибка при создании пользователя.")
                return
            
            if not telegram_user.is_approved:
                await update.message.reply_text(
                    "❌ *Доступ запрещен!*\n\n"
                    "Сначала пройдите аутентификацию с помощью `/auth ваш_код`",
                    parse_mode='Markdown'
                )
                return
            
            # Получаем заявки через sync_to_async
            pending_orders = await sync_to_async(
                lambda: list(Order.objects.filter(is_approve=False).order_by('-order_date'))
            )()
            
            
            if not pending_orders:
                await update.message.reply_text("📭 *Нет необработанных заявок из каталога*", parse_mode='Markdown')
                return
            
            
            message_text = "📋 *Необработанные заявки (каталог):*\n\n"
            
            for i, app in enumerate(pending_orders, 1):
                message_text += (
                    f"*#{i}*\n"
                    f"👤 *Имя:* {app.full_name}\n"
                    f"📞 *Телефон:* {app.phone}\n"
                    f"📧 *Email:* {app.mail or 'Не указан'}\n"
                    f"📋 *Список товаров:* {app.orders_list or 'Не указано'}\n"
                    f"💰 *Сумма заказа:* {app.summary_price or 'Не указан'}\n"
                    f"🕐 *Дата:* {app.order_date}\n"
                    f"📬 *Обработан:* {app.is_approve or 'Не указан'}\n"
                    f"────────────────────\n"
                )
                
            if len(message_text) > 4096:
                parts = []
                while message_text:
                    if len(message_text) > 4096:
                        part = message_text[:4096]
                        last_newline = part.rfind('\n')
                        if last_newline != -1:
                            parts.append(part[:last_newline])
                            message_text = message_text[last_newline+1:]
                        else:
                            parts.append(part)
                            message_text = message_text[4096:]
                    else:
                        parts.append(message_text)
                        break
                
                for part in parts:
                    await update.message.reply_text(part, parse_mode='Markdown')
            else:
                await update.message.reply_text(message_text, parse_mode='Markdown')
                
        except Exception as e:
            logger.error(f"Error showing applications: {e}")
            await update.message.reply_text("❌ Произошла ошибка при получении заявок")

    async def show_custom_orders(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показать необработанные заявки"""
        user = update.effective_user
        
        try:
            telegram_user = await self.get_or_create_user(user)
            if not telegram_user:
                await update.message.reply_text("❌ Ошибка при создании пользователя.")
                return
            
            if not telegram_user.is_approved:
                await update.message.reply_text(
                    "❌ *Доступ запрещен!*\n\n"
                    "Сначала пройдите аутентификацию с помощью `/auth ваш_код`",
                    parse_mode='Markdown'
                )
                return
            
            # Получаем заявки через sync_to_async
            pending_custom_orders = await sync_to_async(
                lambda: list(CustomOrder.objects.filter(is_approve=False).order_by('-order_date'))
            )()
            
            
            if not pending_custom_orders:
                await update.message.reply_text("📭 *Нет необработанных заявок из каталога кастом*", parse_mode='Markdown')
                return
            
            message_text = "📋 *Необработанные заявки (кастом):*\n\n"
            
            for i, app in enumerate(pending_custom_orders, 1):
                message_text += (
                    f"*#{i}*\n"
                    f"👤 *Имя:* {app.full_name}\n"
                    f"📞 *Телефон:* {app.phone}\n"
                    f"📧 *Email:* {app.mail or 'Не указан'}\n"
                    f"💬 *Пожелания клиента:* {app.comment or 'Не указано'}\n"
                    f"🕐 *Дата:* {app.order_date}\n"
                    f"📬 *Обработан:* {app.is_approve or 'Не указан'}\n"
                    f"────────────────────\n"
                )
                
            if len(message_text) > 4096:
                parts = []
                while message_text:
                    if len(message_text) > 4096:
                        part = message_text[:4096]
                        last_newline = part.rfind('\n')
                        if last_newline != -1:
                            parts.append(part[:last_newline])
                            message_text = message_text[last_newline+1:]
                        else:
                            parts.append(part)
                            message_text = message_text[4096:]
                    else:
                        parts.append(message_text)
                        break
                
                for part in parts:
                    await update.message.reply_text(part, parse_mode='Markdown')
            else:
                await update.message.reply_text(message_text, parse_mode='Markdown')
                
        except Exception as e:
            logger.error(f"Error showing applications: {e}")
            await update.message.reply_text("❌ Произошла ошибка при получении заявок")

    async def notifications(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Управление уведомлениями"""
        user = update.effective_user
        
        try:
            telegram_user = await self.get_or_create_user(user)
            if not telegram_user:
                await update.message.reply_text("❌ Ошибка при создании пользователя.")
                return
            
            if not telegram_user.is_approved:
                await update.message.reply_text(
                    "❌ *Доступ запрещен!*\n\n"
                    "Сначала пройдите аутентификацию с помощью `/auth ваш_код`",
                    parse_mode='Markdown'
                )
                return
            
            # Используем новый метод для показа клавиатуры
            await self.show_notifications_keyboard(update, telegram_user)
            
        except Exception as e:
            logger.error(f"Error in notifications command: {e}")
            await update.message.reply_text("❌ Произошла ошибка. Попробуйте позже.")

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка текстовых сообщений"""
        text = update.message.text
        user = update.effective_user
        
        try:
            telegram_user = await self.get_or_create_user(user)
            if not telegram_user:
                await update.message.reply_text("❌ Ошибка при создании пользователя.")
                return
            
            if not telegram_user.is_approved:
                await update.message.reply_text(
                    "❌ *Доступ запрещен!*\n\n"
                    "Сначала пройдите аутентификацию с помощью `/auth ваш_код`",
                    parse_mode='Markdown'
                )
                return
            
            if text == "🔔 Включить уведомления":
                telegram_user.notifications_enabled = True
                await sync_to_async(telegram_user.save)()
                await update.message.reply_text("✅ *Уведомления включены!*", parse_mode='Markdown')
                # ПОСЛЕ ИЗМЕНЕНИЯ СНОВА ПОКАЗЫВАЕМ КНОПКИ
                await self.show_notifications_keyboard(update, telegram_user)
                
            elif text == "🔕 Выключить уведомления":
                telegram_user.notifications_enabled = False
                await sync_to_async(telegram_user.save)()
                await update.message.reply_text("❌ *Уведомления выключены!*", parse_mode='Markdown')
                # ПОСЛЕ ИЗМЕНЕНИЯ СНОВА ПОКАЗЫВАЕМ КНОПКИ
                await self.show_notifications_keyboard(update, telegram_user)
                
            elif text == "📋 Посмотреть заявки (каталог)":
                # Вызываем метод показа заявок
                await self.show_orders(update, context)
                
            elif text == "📋 Посмотреть заявки (кастом)":
                # Вызываем метод показа заявок
                await self.show_custom_orders(update, context)
                
            else:
                await update.message.reply_text(
                    "Не понимаю команду. Используйте кнопки или команды:\n\n"
                    "🔔 `/notifications` - Управление уведомлениями",
                    "📋`/orders` - показать заявки из каталога",
                    "📋 `/custom` - показать заказы на кастом",
                    parse_mode='Markdown'
                )
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await update.message.reply_text("❌ Произошла ошибка. Попробуйте позже.")

    async def send_new_order_notification(self, order):
        """Отправка уведомления о новой заявке"""
        try:
            if self.application is None:
                logger.warning("Cannot send notification - bot not initialized or running")
                return
                
            # Используем sync_to_async для работы с Django ORM
            subscribed_users = await sync_to_async(
                lambda: list(TelegramUser.objects.filter(
                    notifications_enabled=True,
                    is_approved=True
                ))
            )()
            
            if not subscribed_users:
                logger.info("No subscribed users for notifications")
                return

            notification_text = (
                f"👤 *Имя:* {order.full_name}\n"
                    f"📞 *Телефон:* {order.phone}\n"
                    f"📧 *Email:* {order.mail or 'Не указан'}\n"
                    f"📋 *Список товаров:* {order.orders_list or 'Не указано'}\n"
                    f"💰 *Сумма заказа:* {order.summary_price or 'Не указан'}\n"
                    f"🕐 *Дата:* {order.order_date.strftime('%d.%m.%Y %H:%M')}\n"
            )

            sent_count = 0
            for user in subscribed_users:
                try:
                    await self.application.bot.send_message(
                        chat_id=user.user_id,
                        text=notification_text,
                        parse_mode='Markdown'
                    )
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Failed to send notification to user {user.user_id}: {e}")
                    if "bot was blocked" in str(e).lower():
                        user.notifications_enabled = False
                        await sync_to_async(user.save)()

            logger.info(f"Notification sent to {sent_count} users")
            
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def send_new_custom_order_notification(self, order):
        """Отправка уведомления о новой заявке"""
        try:
            if self.application is None:
                logger.warning("Cannot send notification - bot not initialized or running")
                return
                
            # Используем sync_to_async для работы с Django ORM
            subscribed_users = await sync_to_async(
                lambda: list(TelegramUser.objects.filter(
                    notifications_enabled=True,
                    is_approved=True
                ))
            )()
            
            if not subscribed_users:
                logger.info("No subscribed users for notifications")
                return

            notification_text = (
                f"👤 *Имя:* {order.full_name}\n"
                    f"📞 *Телефон:* {order.phone}\n"
                    f"📧 *Email:* {order.mail or 'Не указан'}\n"
                    f"💬 *Пожелания клиента:* {order.comment or 'Не указано'}\n"
                    f"🕐 *Дата:* {order.order_date.strftime('%d.%m.%Y %H:%M')}\n"
            )

            sent_count = 0
            for user in subscribed_users:
                try:
                    await self.application.bot.send_message(
                        chat_id=user.user_id,
                        text=notification_text,
                        parse_mode='Markdown'
                    )
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Failed to send notification to user {user.user_id}: {e}")
                    if "bot was blocked" in str(e).lower():
                        user.notifications_enabled = False
                        await sync_to_async(user.save)()

            logger.info(f"Notification sent to {sent_count} users")
            
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def show_notifications_keyboard(self, update: Update, telegram_user):
        """Показывает клавиатуру управления уведомлениями"""
        # Динамические кнопки в зависимости от статуса уведомлений
        if telegram_user.notifications_enabled:
            # Если уведомления включены - показываем кнопку выключить
            keyboard = [
                [KeyboardButton("🔕 Выключить уведомления")],
                [KeyboardButton("📋 Посмотреть заявки (каталог)")],
                [KeyboardButton("📋 Посмотреть заявки (кастом)")]
            ]
        else:
            # Если уведомления выключены - показываем кнопку включить
            keyboard = [
                [KeyboardButton("🔔 Включить уведомления")],
                [KeyboardButton("📋 Посмотреть заявки (каталог)")],
                [KeyboardButton("📋 Посмотреть заявки (кастом)")]
                ]
        
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        
        status_text = "включены ✅" if telegram_user.notifications_enabled else "выключены ❌"
        message = (
            f"🔔 *Управление уведомлениями*\n\n"
            f"Текущий статус: {status_text}\n\n"
            f"Выберите действие:"
        )
        
        await update.message.reply_text(message, reply_markup=reply_markup, parse_mode='Markdown')

    def run(self):
        """Запуск бота"""
        try:
            self._initialize_application()
            if self.application is None:
                logger.error("Failed to initialize bot application")
                return
                
            logger.info("🚀 Starting bot polling...")
            self.application.run_polling()
        except Exception as e:
            logger.error(f"❌ Error running bot: {e}")
            raise

# Глобальный экземпляр бота
bot_instance = None

def get_bot():
    """Получить экземпляр бота"""
    global bot_instance
    if bot_instance is None:
        bot_instance = TelegramBot()
    return bot_instance