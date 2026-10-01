package com.dentalstack.doctor.entity.user;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.user.ProfileImageType;
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
