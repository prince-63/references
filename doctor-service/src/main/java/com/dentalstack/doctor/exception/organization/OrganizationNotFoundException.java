package com.dentalstack.doctor.exception.organization;

public class OrganizationNotFoundException extends RuntimeException {

    public OrganizationNotFoundException(Long organizationId) {
        super(String.format("Organization not found with id %d", organizationId));
    }
}
