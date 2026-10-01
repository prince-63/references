package com.dentalstack.doctor.dto.practicelocation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivePracticeLocationRequest {

    private Long doctorId;
    private Long organizationId;
    private Long profileId;
}
