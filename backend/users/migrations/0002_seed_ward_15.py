from django.db import migrations


def create_ward_15(apps, schema_editor):
    Ward = apps.get_model("users", "Ward")
    Ward.objects.get_or_create(number=15, defaults={"name": "Kathmandu Ward 15"})


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_ward_15, migrations.RunPython.noop),
    ]
