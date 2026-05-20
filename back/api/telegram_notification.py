from api.telegram_bot import get_bot
import logging
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class Notify:
    def send_telegram_notification_order(self, order):
        """Асинхронная отправка уведомления для нового заказа (каталог)"""
        try:
            bot = get_bot()

            # Убедимся, что приложение инициализировано (lazy init)
            try:
                bot._initialize_application()
            except Exception as e:
                logger.error(f"Failed to initialize telegram application: {e}")

            # Запускаем синхронный вызов асинхронной функции
            async_to_sync(bot.send_new_order_notification)(order)

        except Exception as e:
            logger.exception(f"Error scheduling telegram notification: {e}")

    def send_telegram_notification_application(self, application):
        """Асинхронная отправка уведомления для индивидуального заказа"""
        try:
            bot = get_bot()

            # Убедимся, что приложение инициализировано (lazy init)
            try:
                bot._initialize_application()
            except Exception as e:
                logger.error(f"Failed to initialize telegram application: {e}")

            async_to_sync(bot.send_new_custom_order_notification)(application)

        except Exception as e:
            logger.exception(f"Error scheduling telegram notification: {e}")