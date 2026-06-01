from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_userprofile_cartitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='quantity',
            field=models.PositiveIntegerField(
                default=0,
                verbose_name='Количество на складе',
                help_text='Доступное количество товара для продажи',
            ),
        ),
    ]
