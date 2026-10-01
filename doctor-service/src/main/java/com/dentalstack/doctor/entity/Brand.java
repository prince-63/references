package com.dentalstack.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "brand")
public class Brand extends BaseEntity {

    private String brandName;

    private boolean isCommon;
}
