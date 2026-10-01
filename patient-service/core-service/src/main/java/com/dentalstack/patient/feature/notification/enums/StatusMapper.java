package com.dentalstack.patient.feature.notification.enums;

import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderStatus;

public class StatusMapper {

    public static String mapOrderStatusToString(OrderStatus orderStatus) {
        switch (orderStatus) {
            case DRAFT:
                return "DRAFT";
            case IN_PROGRESS:
                return "IN PROGRESS";
            case IN_REVIEW:
                return "IN REVIEW";
            case ORDERED:
                return "ORDERED";
            case RE_PLAN:
                return "RE PLAN";
            case COMPLETED:
                return "COMPLETED";
            case CANCELLED:
                return "CANCELLED";
            case ON_HOLD:
                return "ON-HOLD";
            case STL_FILES_REQUESTED:
                return "STL FILES REQUESTED";
            case STL_FILES_UPLOADED:
                return "STL FILES UPLOADED";
            case APPROVED:
                return "APPROVED";
            case MANUFACTURING_STARTED:
                return "MANUFACTURING STARTED";
            case SHIPPED:
                return "SHIPPED";
            case DELIVERED:
                return "DELIVERED";
            case MANUFACTURING_PENDING:
                return "MANUFACTURING PENDING";
            case MANUFACTURING_COMPLETED:
                return "MANUFACTURING COMPLETED";
            case NEED_MORE_INFO:
                return "NEED MORE INFO";
            default:
                return orderStatus.name();
        }
    }

    public static String mapManufacturingStatusToString(ManufacturingStatus manufacturingStatus) {
        switch (manufacturingStatus) {
            case MANUFACTURING_STARTED:
                return "MANUFACTURING STARTED";
            case COMPLETED:
                return "COMPLETED";
            case SHIPPED:
                return "SHIPPED";
            case DELIVERED:
                return "DELIVERED";
            case MANUFACTURING_PENDING:
                return "MANUFACTURING PENDING";
            default:
                return manufacturingStatus.name();
        }
    }
}
