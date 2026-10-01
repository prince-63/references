package com.dentalstack.chat.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SuperAdminResponse {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
}
