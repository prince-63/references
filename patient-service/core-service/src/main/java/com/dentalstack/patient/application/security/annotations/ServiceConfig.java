package com.dentalstack.patient.application.security.annotations;

public enum ServiceConfig {
    PLANNING,

    MANUFACTURING,

    FULL_SERVICE;

    public boolean matches(String configName) {
        if (configName == null) {
            return false;
        }
        return this.name().equalsIgnoreCase(configName.trim());
    }
}
