package com.dentalstack.patient.application.security.annotations;

public enum UserRole {
    ENTERPRISE,

    PRACTICE,

    IN_HOUSE_MANUFACTURING_LAB,

    INTERNAL_USER,

    DOCTOR,

    PATIENT,

    ADMIN;

    public static UserRole fromDoctorRole(String doctorRoleName) {
        return switch (doctorRoleName) {
            case "ENTERPRISE_COMPANY_LAB" -> ENTERPRISE;
            case "IN_OFFICE_MANUFACTURER" -> IN_HOUSE_MANUFACTURING_LAB;
            case "INTERNAL_USER" -> INTERNAL_USER;
            case "CONSULTING_ORTHODONTIST" -> PRACTICE;
            default -> DOCTOR;
        };
    }
}
