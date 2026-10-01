package com.dentalstack.patient.global.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.ZoneId;

public class TimeZoneValidator implements ConstraintValidator<TimeZone, String> {

    @Override
    public boolean isValid(String timezone, ConstraintValidatorContext context) {
        return timezone != null && ZoneId.getAvailableZoneIds().contains(timezone);
    }
}
