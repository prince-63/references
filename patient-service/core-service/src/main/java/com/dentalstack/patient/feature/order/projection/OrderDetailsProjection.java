package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

public interface OrderDetailsProjection {

    String getOrderId();

    Boolean getCaseSubmitted();

    Long getDoctorId();

    Long getProfileId();

    Long getOrganizationId();

    OrderType getOrderType();

    OrderStatus getStatus();

    LocalDate getDueBy();

    Boolean getIsUrgent();

    Long getAssignedLabUserId();

    String getAssignedLabUserName();

    LocalDateTime getCreatedAt();

    ZonedDateTime getOrderCreatedAt();

    LocalDateTime getUpdatedAt();

    String getNeedMoreInfoRemark();

    Boolean getIsNeedMoreInfoUpdated();

    String getCancelOrderRemark();

    LocalDateTime getCancelledOn();

    LocalDateTime getNeedMoreInfoUpdatedOn();

    Long getPatientId();

    String getPatientFirstName();

    String getPatientLastName();

    Long getOwnerProfileId();

    String getOwnerUserDisplayName();

    String getOwnerUserSalutation();

    String getOwnerUserFirstName();

    String getOwnerUserLastName();

    String getOwnerRoleNames();

    Long getTargetProfileId();

    String getTargetUserDisplayName();

    String getTargetUserSalutation();

    String getTargetUserFirstName();

    String getTargetUserLastName();

    String getParentOrderId();

    String getParentOwnerUserDisplayName();

    String getParentOwnerUserSalutation();

    String getParentOwnerUserFirstName();

    String getParentOwnerUserLastName();

    String getChildOrderId();

    String getServiceProducts();

    String getPatientGender();

    Integer getPatientAge();

    Boolean getIsClonedOrder();

    String getServiceProductType();

    String getServiceProductName();

    String getServiceProductDescription();

    String getServiceProductImage();
}
