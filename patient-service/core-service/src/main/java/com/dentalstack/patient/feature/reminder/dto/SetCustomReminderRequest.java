package com.dentalstack.patient.feature.reminder.dto;

import com.dentalstack.patient.feature.reminder.enums.ReminderCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SetCustomReminderRequest {
    private Long patientId;
    private long doctorId;

    @Nullable
    private LocalDate date;

    @NotNull
    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    @Nullable
    private Float amount;

    private String title;

    private ReminderCategory reminderCategory;
    private String notes;
    private Long profileId;
    private Long organizationId;
    private Long treatmentPlanId;
}
