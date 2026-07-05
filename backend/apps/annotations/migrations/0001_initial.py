import apps.annotations.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnnotationImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('image', models.ImageField(upload_to=apps.annotations.models.image_upload_path)),
                ('name', models.CharField(
                    blank=True,
                    help_text='Human-readable label; defaults to the original filename.',
                    max_length=255,
                )),
                ('order', models.PositiveIntegerField(
                    default=0,
                    help_text='Client-controlled display order in the image strip.',
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='annotation_images',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Annotation Image',
                'verbose_name_plural': 'Annotation Images',
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='Polygon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('points', models.JSONField(
                    help_text='List of {x, y} dicts with relative coordinates (0.0–1.0).',
                )),
                ('label', models.CharField(blank=True, default='', max_length=100)),
                ('color', models.CharField(blank=True, default='#6366f1', max_length=20)),
                ('image', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='polygons',
                    to='annotations.annotationimage',
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='polygons',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Polygon',
                'verbose_name_plural': 'Polygons',
                'ordering': ['created_at'],
            },
        ),
    ]
