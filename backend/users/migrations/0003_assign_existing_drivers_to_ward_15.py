from django.db import migrations


def assign_existing_drivers(apps, schema_editor):
    User = apps.get_model("users", "User")
    Ward = apps.get_model("users", "Ward")
    ward = Ward.objects.filter(number=15).first()
    if ward is not None:
        User.objects.filter(role="driver", ward__isnull=True).update(ward=ward)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0002_seed_ward_15"),
    ]

    operations = [
        migrations.RunPython(assign_existing_drivers, migrations.RunPython.noop),
    ]
