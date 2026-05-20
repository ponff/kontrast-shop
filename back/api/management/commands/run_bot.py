from django.core.management.base import BaseCommand
from api.telegram_bot import get_bot

class Command(BaseCommand):
    help = 'Run Telegram bot'

    def handle(self, *args, **options):
        self.stdout.write('Starting Telegram bot...')
        bot = get_bot()
        bot.run()