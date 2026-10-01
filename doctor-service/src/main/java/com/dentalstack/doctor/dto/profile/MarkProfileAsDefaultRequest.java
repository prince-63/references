package com.dentalstack.doctor.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MarkProfileAsDefaultRequest {

    private long profileId;
    private long doctorId;
    private long organizationId;
}
