package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
import com.dentalstack.patient.feature.order.projection.OrderCountSummary;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.order.service.OrderResponseService;
import java.time.*;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderResponseServiceImpl implements OrderResponseService {
    private final OrderRepository orderRepository;
    private final DoctorService doctorService;

    @Transactional(readOnly = true)
    public OrdersCountResponse getReceivedOrSentOrderCount(
            Long doctorId, Long organizationId, Long profileId, boolean isSentOrder, List<String> role) {

        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();
        OrderCountSummary countSummary;
        if (isSentOrder) {
            countSummary = orderRepository.getSentOrdersCountSummary(profileId, today, currentDate);
        } else {
            if (role != null
                    && (role.contains(DoctorRole.CUSTOMER.name())
                            || role.contains(DoctorRole.ENTERPRISE_COMPANY_LAB.name()))) {
                countSummary =
                        orderRepository.getReceivedOrdersCountSummaryByRoles(profileId, today, currentDate, role);
            } else if (role != null
                    && (role.contains(DoctorRole.CONSULTING_ORTHODONTIST.name())
                            && !role.contains(DoctorRole.ENTERPRISE_COMPANY_LAB.name()))) {
                countSummary = orderRepository.getReceivedOrdersCountSummaryForPracticeCustomerByRoles(
                        profileId, today, currentDate, role);
            } else {
                countSummary = orderRepository.getReceivedOrdersCountSummary(profileId, today, currentDate);
            }
        }

        var doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        if (!isSentOrder) {
            count.setTotal(safe(countSummary.getTotalCount())
                    - (safe(countSummary.getStlFilesRequestedCount()) + safe(countSummary.getStlFilesUploadedCount())));
        } else {
            count.setTotal(countSummary.getTotalCount());
        }

        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());
        count.setUniquePatientCount(countSummary.getUniquePatientCount());
        count.setNotAddedDueByCount(countSummary.getNotAddedDueByCount());
        count.setTotalPatientCount(countSummary.getTotalPatientCount());
        count.setManufacturingPendingCount(countSummary.getManufacturingPendingCount());
        count.setNeedMoreInfo(countSummary.getNeedMoreInfoCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());
        needsAttention.setNotAddedDueBy(countSummary.getNotAddedDueByCount());

        gettingStartedDetails.setBrandAndCompanyDetailsAdded(doctorInvitationCount.isBrandAndCompanyDetailsAdded());
        gettingStartedDetails.setUserCount(doctorInvitationCount.getUserCount());
        gettingStartedDetails.setInvitedLabStaffCount(doctorInvitationCount.getInvitedLabStaffCount());
        gettingStartedDetails.setActiveLabStaffCount(doctorInvitationCount.getActiveLabStaffCount());
        gettingStartedDetails.setCustomerCount(doctorInvitationCount.getCustomerCount());
        gettingStartedDetails.setInvitedCustomerCount(doctorInvitationCount.getInvitedCustomerCount());
        gettingStartedDetails.setActiveCustomerCount(doctorInvitationCount.getActiveCustomerCount());

        long userActionPending = safe(countSummary.getOrderedCount())
                + safe(countSummary.getInProgressCount())
                + safe(countSummary.getRePlanCount())
                + safe(countSummary.getStlFilesRequestedCount());

        long customerActionPending = safe(countSummary.getInReviewCount())
                + safe(countSummary.getApprovedCount())
                + safe(countSummary.getStlFilesUploadedCount());

        gettingStartedDetails.setUserActionPending(userActionPending);
        gettingStartedDetails.setCustomerActionPending(customerActionPending);

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public OrdersCountResponse getLabStaffOrderResponse(
            Long doctorId, Long organizationId, Long profileId, List<String> roles) {

        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();
        OrderCountSummary countSummary;
        if (roles == null || roles.isEmpty()) {
            countSummary = orderRepository.getLabStaffOrdersCountSummary(profileId, today, currentDate);
        } else {
            countSummary = orderRepository.getLabStaffOrdersCountSummaryForRoles(profileId, today, currentDate, roles);
        }

        var doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        count.setTotal(countSummary.getTotalCount());
        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());
        count.setUniquePatientCount(countSummary.getUniquePatientCount());
        count.setNotAddedDueByCount(countSummary.getNotAddedDueByCount());
        count.setTotalPatientCount(countSummary.getTotalPatientCount());
        count.setManufacturingPendingCount(countSummary.getManufacturingPendingCount());
        count.setNeedMoreInfo(countSummary.getNeedMoreInfoCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());
        needsAttention.setNotAddedDueBy(countSummary.getNotAddedDueByCount());

        gettingStartedDetails.setBrandAndCompanyDetailsAdded(doctorInvitationCount.isBrandAndCompanyDetailsAdded());
        gettingStartedDetails.setUserCount(doctorInvitationCount.getUserCount());
        gettingStartedDetails.setInvitedLabStaffCount(doctorInvitationCount.getInvitedLabStaffCount());
        gettingStartedDetails.setActiveLabStaffCount(doctorInvitationCount.getActiveLabStaffCount());
        gettingStartedDetails.setCustomerCount(doctorInvitationCount.getCustomerCount());
        gettingStartedDetails.setInvitedCustomerCount(doctorInvitationCount.getInvitedCustomerCount());
        gettingStartedDetails.setActiveCustomerCount(doctorInvitationCount.getActiveCustomerCount());

        long userActionPending = safe(countSummary.getOrderedCount())
                + safe(countSummary.getInProgressCount())
                + safe(countSummary.getRePlanCount())
                + safe(countSummary.getStlFilesRequestedCount());

        long customerActionPending = safe(countSummary.getInReviewCount())
                + safe(countSummary.getApprovedCount())
                + safe(countSummary.getStlFilesUploadedCount());

        gettingStartedDetails.setUserActionPending(userActionPending);
        gettingStartedDetails.setCustomerActionPending(customerActionPending);

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public OrdersCountResponse getAssignedOrdersCountToLabs(Long doctorId, Long organizationId, Long profileId) {

        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();
        OrderCountSummary countSummary = orderRepository.getAssignedOrders(profileId, today, currentDate);

        var doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        count.setTotal(countSummary.getTotalCount());
        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());
        count.setUniquePatientCount(countSummary.getUniquePatientCount());
        count.setNotAddedDueByCount(countSummary.getNotAddedDueByCount());
        count.setTotalPatientCount(countSummary.getTotalPatientCount());
        count.setManufacturingPendingCount(countSummary.getManufacturingPendingCount());
        count.setNeedMoreInfo(countSummary.getNeedMoreInfoCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());
        needsAttention.setNotAddedDueBy(countSummary.getNotAddedDueByCount());

        gettingStartedDetails.setBrandAndCompanyDetailsAdded(doctorInvitationCount.isBrandAndCompanyDetailsAdded());
        gettingStartedDetails.setUserCount(doctorInvitationCount.getUserCount());
        gettingStartedDetails.setInvitedLabStaffCount(doctorInvitationCount.getInvitedLabStaffCount());
        gettingStartedDetails.setActiveLabStaffCount(doctorInvitationCount.getActiveLabStaffCount());
        gettingStartedDetails.setCustomerCount(doctorInvitationCount.getCustomerCount());
        gettingStartedDetails.setInvitedCustomerCount(doctorInvitationCount.getInvitedCustomerCount());
        gettingStartedDetails.setActiveCustomerCount(doctorInvitationCount.getActiveCustomerCount());

        long userActionPending = safe(countSummary.getOrderedCount())
                + safe(countSummary.getInProgressCount())
                + safe(countSummary.getRePlanCount())
                + safe(countSummary.getStlFilesRequestedCount());

        long customerActionPending = safe(countSummary.getInReviewCount())
                + safe(countSummary.getApprovedCount())
                + safe(countSummary.getStlFilesUploadedCount());

        gettingStartedDetails.setUserActionPending(userActionPending);
        gettingStartedDetails.setCustomerActionPending(customerActionPending);

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    @Override
    public OrdersCountResponse getPracticeLabAndCustomerOrders(
            Long doctorId, Long organizationId, Long profileId, DoctorRole doctorRole, DoctorRole doctorRoleForLabs) {

        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();
        OrderCountSummary countSummary = null;

        List<String> practiceOrderRole = List.of("CONSULTING_ORTHODONTIST");
        List<String> customerOrderRole = List.of("CUSTOMER");
        if (doctorRole == DoctorRole.CONSULTING_ORTHODONTIST) {
            countSummary = orderRepository.getReceivedOrdersCountSummaryByRoles(
                    profileId, today, currentDate, practiceOrderRole);
        } else if (doctorRole == DoctorRole.LAB_STAFF) {
            if (doctorRoleForLabs == DoctorRole.CONSULTING_ORTHODONTIST) {
                countSummary = orderRepository.getLabStaffOrdersCountSummaryFilterByRoles(
                        profileId,
                        today,
                        currentDate,
                        List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
            } else if (doctorRoleForLabs == DoctorRole.CUSTOMER) {
                countSummary = orderRepository.getLabStaffOrdersCountSummaryFilterByRoles(
                        profileId, today, currentDate, customerOrderRole);
            } else {
                countSummary = orderRepository.getSentOrdersCountSummary(profileId, today, currentDate);
            }
        } else if (doctorRole == DoctorRole.CUSTOMER) {
            countSummary = orderRepository.getReceivedOrdersCountSummaryByRoles(
                    profileId, today, currentDate, customerOrderRole);
        } else {
            countSummary = orderRepository.getSentOrdersCountSummary(profileId, today, currentDate);
        }

        var doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        count.setTotal(countSummary.getTotalCount());
        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());
        count.setNotAddedDueByCount(countSummary.getNotAddedDueByCount());
        count.setNeedMoreInfo(countSummary.getNeedMoreInfoCount());
        count.setTotalPatientCount(countSummary.getTotalPatientCount());
        count.setManufacturingPendingCount(countSummary.getManufacturingPendingCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());

        gettingStartedDetails.setBrandAndCompanyDetailsAdded(doctorInvitationCount.isBrandAndCompanyDetailsAdded());
        gettingStartedDetails.setUserCount(doctorInvitationCount.getUserCount());
        gettingStartedDetails.setInvitedLabStaffCount(doctorInvitationCount.getInvitedLabStaffCount());
        gettingStartedDetails.setActiveLabStaffCount(doctorInvitationCount.getActiveLabStaffCount());
        gettingStartedDetails.setCustomerCount(doctorInvitationCount.getCustomerCount());
        gettingStartedDetails.setInvitedCustomerCount(doctorInvitationCount.getInvitedCustomerCount());
        gettingStartedDetails.setActiveCustomerCount(doctorInvitationCount.getActiveCustomerCount());

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public OrdersCountResponse getCombinedOrderSummery(Long profileId) {

        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();
        OrderCountSummary countSummary = orderRepository.getCombinedOrdersCountSummary(profileId, today, currentDate);

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());
        count.setUniquePatientCount(countSummary.getUniquePatientCount());
        count.setNotAddedDueByCount(countSummary.getNotAddedDueByCount());
        count.setTotalPatientCount(countSummary.getTotalPatientCount());
        count.setManufacturingPendingCount(countSummary.getManufacturingPendingCount());
        count.setNeedMoreInfo(countSummary.getNeedMoreInfoCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());
        needsAttention.setNotAddedDueBy(countSummary.getNotAddedDueByCount());

        long userActionPending = safe(countSummary.getOrderedCount())
                + safe(countSummary.getInProgressCount())
                + safe(countSummary.getRePlanCount())
                + safe(countSummary.getStlFilesRequestedCount());

        long customerActionPending = safe(countSummary.getInReviewCount())
                + safe(countSummary.getApprovedCount())
                + safe(countSummary.getStlFilesUploadedCount());

        gettingStartedDetails.setUserActionPending(userActionPending);
        gettingStartedDetails.setCustomerActionPending(customerActionPending);

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    private long safe(Long value) {
        return Optional.ofNullable(value).orElse(0L);
    }
}
