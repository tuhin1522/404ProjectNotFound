import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annotations', '0002_annotationimage_annotations_user_id_53a4b7_idx_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add label_position to Polygon
        migrations.AddField(
            model_name='polygon',
            name='label_position',
            field=models.JSONField(
                blank=True,
                null=True,
                help_text='Offset {x, y} for draggable label badge relative to polygon.',
            ),
        ),
        # Create AnnotationLabel model
        migrations.CreateModel(
            name='AnnotationLabel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=100)),
                ('color', models.CharField(default='#6366f1', max_length=20)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='annotation_labels',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='annotationlabel',
            unique_together={('user', 'name')},
        ),
    ]
