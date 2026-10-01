package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface OrderResponseService {
    OrdersCountResponse getReceivedOrSentOrderCount(
            Long doctorId, Long organizationId, Long profileId, boolean isSentOrder, List<String> role);

    @Transactional
    OrdersCountResponse getLabStaffOrderResponse(Long doctorId, Long organizationId, Long profileId, List<String> role);

    @Transactional
    OrdersCountResponse getAssignedOrdersCountToLabs(Long doctorId, Long organizationId, Long profileId);

    OrdersCountResponse getPracticeLabAndCustomerOrders(
            Long doctorId, Long organizationId, Long profileId, DoctorRole doctorRole, DoctorRole doctorRoleForLabs);

    @Transactional
    OrdersCountResponse getCombinedOrderSummery(Long profileId);
}
