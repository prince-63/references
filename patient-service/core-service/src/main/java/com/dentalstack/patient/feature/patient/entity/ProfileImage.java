package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.patient.enums.ProfileImageType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_image")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileImage extends BaseEntity {

    private String imageName;

    @Lob
    private byte[] imageData;

    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_for")
    private ProfileImageType type;
}
