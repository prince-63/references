package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.order.dto.*;
import com.dentalstack.patient.feature.order.dto.v2.CloneOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.CreateOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.MinimumOrderDetailResponse;
import com.dentalstack.patient.global.exception.BusinessException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface OrderService {
    CreateOrderResponse createOrder(CreateOrderRequest orderRequest);

    @Transactional(rollbackFor = {BusinessException.class})
    CreateOrderResponse createOrderV2(CreateOrderRequestV2 orderRequest);

    void updateOrder(UpdateOrderRequest updateOrderRequest);

    OrderResponse getOrder(OrderRequest orderRequest);

    FilteredOrderDetails getFilteredOrdersV2(FilteredOrderRequest request);

    List<PatientOrderDetails> getPatientOrderDetails(PatientOrderRequest request);

    PatientOrderDetailsWithPagination getOrderDetailsWithPagination(PatientOrderRequest request);

    OrdersCountResponse getOrdersCount(Long doctorId, Long organizationId, Long profileId);

    void addComments(OrderCommentsDTO orderCommentsDTO);

    List<OrderCommentsResponse> getAllComments(String orderId);

    UserOrdersCountResponseWithPagination getUserOrdersCountWithPagination(
            Long doctorId, Long organizationId, Long profileId, int pageNumber, int pageSize, DoctorRole filterByRole);

    ClonedOrderResponse cloneOrder(CloneOrderRequest request);

    ClonedOrderResponse cloneOrderV2(CloneOrderRequestV2 request);

    EnterpriseDashboardOrdersResponse getEnterpriseOrderDashboardResponse(BaseRequest request);

    void dismissZipFile(String orderId);

    OrderResponse updateToCancelledOrNeedMoreInfo(UpdateToCancelledOrNeedMoreInfoRequest updateOrderRequest);

    MinimumOrderDetailResponse getMinimumOrderDetails(Long patientId);
}
