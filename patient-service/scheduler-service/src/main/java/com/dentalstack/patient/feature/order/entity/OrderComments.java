package com.dentalstack.patient.feature.order.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders_comments")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderComments extends BaseEntity {
    private String orderId;
    private Long doctorId;
    private Long profileId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
