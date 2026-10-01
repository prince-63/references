package com.dentalstack.doctor.dto.practicelocation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PracticeLocationGetRequest {
    private long profileId;

    private long organizationId;

    private long doctorId;
}
