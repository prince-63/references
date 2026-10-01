package com.dentalstack.patient.feature.order.entity;

import com.dentalstack.patient.feature.order.constant.OrderConstant;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.OrderCommentType;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
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

    private String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_profile_id")
    private UserProfile addedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_added_for_profile_id")
    private UserProfile commentAddedFor;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "patient_comment_file")
    @ToString.Exclude
    private List<File> files = new ArrayList<>();

    private Long taskId;

    @Enumerated(EnumType.STRING)
    @Column(name = "comment_type")
    private OrderCommentType commentType;

    public static OrderComments from(Order order) {

        return OrderComments.builder()
                .orderId(order.getId())
                .doctorId(order.getDoctorId())
                .profileId(order.getProfileId())
                .notes(String.format(
                        OrderConstant.TIMELINE_PLAN_CREATED,
                        capitalize(order.getStatus().toString())))
                .commentType(OrderCommentType.ORDER_COMMENT)
                .build();
    }

    public static OrderComments requestedNeedMoreInfo(Order order) {
        var orgProfile = order.getTargetProfile();
        return OrderComments.builder()
                .orderId(order.getId())
                .doctorId(order.getDoctorId())
                .profileId(orgProfile.getId())
                .notes(String.format(
                        "%s updated order status from Ordered to Need more info",
                        orgProfile.getUser().displayName()))
                .remark(order.getNeedMoreInfoRemark())
                .commentType(OrderCommentType.ORDER_COMMENT)
                .build();
    }

    public static OrderComments orderCancelled(Order order) {
        var orgProfile = order.getTargetProfile();
        return OrderComments.builder()
                .orderId(order.getId())
                .doctorId(order.getTargetProfileDoctorId())
                .profileId(order.getTargetProfileId())
                .notes(String.format(
                        "%s updated order status from %s to Cancelled",
                        orgProfile.getUser().displayName(),
                        capitalize(order.getStatus().toString())))
                .commentType(OrderCommentType.ORDER_COMMENT)
                .build();
    }

    public static OrderComments practiceUpdatedNeedMoreInfoToOrdered(Order order) {
        var practiceProfile = order.getOwnerProfile();
        return OrderComments.builder()
                .orderId(order.getId())
                .doctorId(order.getTargetProfileDoctorId())
                .profileId(practiceProfile.getId())
                .notes(String.format(
                        "%s updated order status from Need more info to Ordered",
                        practiceProfile.getUser().fullName()))
                .commentType(OrderCommentType.ORDER_COMMENT)
                .build();
    }

    private static String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }

        str = str.replace("_", "-");

        String[] parts = str.split("-");
        StringBuilder capitalized = new StringBuilder();

        for (String part : parts) {
            if (!part.isEmpty()) {
                capitalized
                        .append(part.substring(0, 1).toUpperCase())
                        .append(part.substring(1).toLowerCase())
                        .append("-");
            }
        }

        return capitalized.substring(0, capitalized.length() - 1);
    }
}
