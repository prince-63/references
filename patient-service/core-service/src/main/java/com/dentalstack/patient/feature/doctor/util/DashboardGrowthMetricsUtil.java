package com.dentalstack.patient.feature.doctor.util;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

public final class DashboardGrowthMetricsUtil {

    private DashboardGrowthMetricsUtil() {}

    public record GrowthMetricsData(
            Double sentGrowth,
            Double receivedGrowth,
            Double sentGrowthForPractice,
            Double receivedGrowthForPractice,
            Double sentGrowthForCustomer,
            Double receivedGrowthForCustomer) {}

    private record OrderCounts(Long sent, Long received) {}

    public static GrowthMetricsData calculateGrowthMetrics(Long profileId, OrderRepository orderRepository) {
        var now = ZonedDateTime.now();

        var currentEnd = now.minusDays(1).truncatedTo(ChronoUnit.DAYS);
        var currentStart = currentEnd.minusMonths(1).plusDays(1).truncatedTo(ChronoUnit.DAYS);

        var previousEnd = currentStart.minusDays(1).truncatedTo(ChronoUnit.DAYS);
        var previousStart = previousEnd.minusMonths(1).plusDays(1).truncatedTo(ChronoUnit.DAYS);

        var currentCounts = getOrderCounts(profileId, currentStart, currentEnd, null, orderRepository);
        var previousCounts = getOrderCounts(profileId, previousStart, previousEnd, null, orderRepository);

        var currentPracticeCounts = getOrderCounts(
                profileId, currentStart, currentEnd, DoctorRole.CONSULTING_ORTHODONTIST, orderRepository);
        var previousPracticeCounts = getOrderCounts(
                profileId, previousStart, previousEnd, DoctorRole.CONSULTING_ORTHODONTIST, orderRepository);

        var currentCustomerCounts =
                getOrderCounts(profileId, currentStart, currentEnd, DoctorRole.CUSTOMER, orderRepository);
        var previousCustomerCounts =
                getOrderCounts(profileId, previousStart, previousEnd, DoctorRole.CUSTOMER, orderRepository);

        return new GrowthMetricsData(
                calculateGrowthPercentage(currentCounts.sent(), previousCounts.sent()),
                calculateGrowthPercentage(currentCounts.received(), previousCounts.received()),
                calculateGrowthPercentage(currentPracticeCounts.sent(), previousPracticeCounts.sent()),
                calculateGrowthPercentage(currentPracticeCounts.received(), previousPracticeCounts.received()),
                calculateGrowthPercentage(currentCustomerCounts.sent(), previousCustomerCounts.sent()),
                calculateGrowthPercentage(currentCustomerCounts.received(), previousCustomerCounts.received()));
    }

    private static OrderCounts getOrderCounts(
            Long profileId, ZonedDateTime start, ZonedDateTime end, DoctorRole role, OrderRepository orderRepository) {
        var inclusiveEnd = end.plusDays(1);
        var counts = (role == null)
                ? orderRepository.getSentAndReceivedOrderCounts(profileId, start, inclusiveEnd)
                : orderRepository.getSentAndReceivedOrderCountsByRole(profileId, start, inclusiveEnd, role.name());

        return new OrderCounts(counts.getSentCount(), counts.getReceivedCount());
    }

    private static Double calculateGrowthPercentage(Long thisMonthCount, Long lastMonthCount) {
        if (lastMonthCount == null || lastMonthCount == 0) {
            return 0.0;
        }
        double growth = ((double) (thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
        return Math.round(growth * 10.0) / 10.0;
    }
}
