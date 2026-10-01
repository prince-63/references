package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.global.validator.TimeZone;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SetPaymentReminderRequest {
    private long patientId;
    private long doctorId;

    @Nullable
    private LocalDate date;

    @TimeZone
    private String timezone = "Asia/Kolkata";

    @NotNull
    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    @Nullable
    private String note;

    private float amount;
    private Long profileId;
    private Long organizationId;
}
