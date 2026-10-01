package com.dentalstack.patient.application.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Getter
@Configuration
@PropertySource("classpath:application.yml")
public class ReminderConfig {

    @Value("${schedule.wearAfterBreakfast.time}")
    private String wearAfterBreakfastTime;

    @Value("${schedule.wearAfterLunch.time}")
    private String wearAfterLunchTime;

    @Value("${schedule.wearAfterDinner.time}")
    private String wearAfterDinnerTime;

    @Value("${schedule.changeAligner.time}")
    private String changeAlignerTime;

    // Getters for the time properties

}
