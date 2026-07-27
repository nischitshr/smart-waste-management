from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdmin
from pickups.models import PickupRequest
from reports.models import DumpingReport


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        pickup_counts = (
            PickupRequest.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
        report_counts = (
            DumpingReport.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        return Response({
            'pickups_by_status': list(pickup_counts),
            'reports_by_status': list(report_counts),
            'total_pickups': PickupRequest.objects.count(),
            'total_reports': DumpingReport.objects.count(),
        })