package com.dentalstack.patient.feature.flag.dto;

import com.dentalstack.patient.feature.flag.entity.Flag;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlagDetailsResponse {
    private Long id;
    private Long profileId;
    private boolean isShow;
    private String content;
    private String location;

    public static FlagDetailsResponse from(Flag flag) {
        return FlagDetailsResponse.builder()
                .id(flag.getId())
                .profileId(flag.getUserProfile().getId())
                .isShow(flag.isShow())
                .content(flag.getContent())
                .location(flag.getLocation())
                .build();
    }
}
