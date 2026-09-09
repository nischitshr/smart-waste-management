from django.db import migrations


def assign_existing_bins(apps, schema_editor):
    WasteBin = apps.get_model("bins", "WasteBin")
    Ward = apps.get_model("users", "Ward")
    ward = Ward.objects.filter(number=15).first()
    if ward is not None:
        WasteBin.objects.filter(ward__isnull=True).update(ward=ward)


class Migration(migrations.Migration):
    dependencies = [
        ("bins", "0001_initial"),
        ("users", "0003_assign_existing_drivers_to_ward_15"),
    ]

    operations = [
        migrations.RunPython(assign_existing_bins, migrations.RunPython.noop),
    ]
