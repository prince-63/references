package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.order.dto.UpdateOrderRequest;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;

public interface OrderManagementNotificationService {
    void notificationForNewOrder(
            Patient patient, String doctorName, String email, String orderId, Long profileId, String mobileNumber);

    void notificationForTreatmentPlanApproval(
            Patient patient,
            String email,
            String orderId,
            String doctorName,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            OrgWhatsAppDetails orgWhatsAppDetails,
            String mobileNo,
            TreatmentPlanRequest request);

    void notificationForSTLFileApproved(
            TreatmentPlanRequest request,
            Patient patient,
            String email,
            String orderId,
            String doctorName,
            Long treatmentPlanId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            UserProfile userProfile);

    void notificationForTreatmentPlanFinalized(
            TreatmentPlanRequest request,
            Patient patient,
            String doctorName,
            String email,
            String orderId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo);

    void notificationForRePlanRequest(
            TreatmentPlanRequest request,
            OrgWhatsAppDetails orgWhatsAppDetails,
            Patient patient,
            String doctorName,
            String email,
            String orderId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo);

    void notificationForOrderOnHold(Patient patient, String email, String orderId);

    void notificationForOrderCancelled(Patient patient, String email, String orderId);

    void notificationForNewOrderAssigned(
            String labAdminDisplayName,
            String email,
            String orderId,
            String patientName,
            Long patientId,
            String mobileNo,
            OrderStatus orderStatus,
            OrgWhatsAppDetails orgWhatsAppDetails);

    void orgRequestedNeedMoreInfo(String email, String orderId, String patientName, Long patientId);

    void notificationForOrderCancelled(
            String orderReceiverName, String email, String orderId, String patientName, Long patientId);

    void notificationForTreatmentPlanApproved(
            TreatmentPlanRequest request,
            String customerDisplayName,
            String email,
            String treatmentPlanName,
            String orderId,
            Long id,
            Long patientId,
            String patientName,
            String patientMobileNo,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo);

    void notificationForSTLFilesRequested(
            TreatmentPlanRequest request,
            String customerDisplayName,
            String email,
            String orderId,
            Long id,
            Patient patient,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNumber);

    void notificationForSTLFilesRequested(
            UpdateOrderRequest request,
            String customerDisplayName,
            String email,
            String orderId,
            Long id,
            Patient patient,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNumber);
}
