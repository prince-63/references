package com.dentalstack.auth.entity.authstage;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.entity.BaseEntity;
import com.dentalstack.auth.entity.MobileOTPVerificationStageData;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.Objects;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "auth_stage")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AuthStage extends BaseEntity {
    @NotNull
    @ManyToOne
    @JoinColumn(name = "auth_id")
    private Auth auth;

    private int srNo;

    @Enumerated(EnumType.STRING)
    private AuthStageType stageType;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private AuthStageData data;

    @Enumerated(EnumType.STRING)
    private AuthStageStatus status;

    public void update(AuthStage stage) {
        this.srNo = stage.getSrNo();
        this.stageType = stage.getStageType();
        this.data = stage.getData();
        this.status = stage.getStatus();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        AuthStage authStage = (AuthStage) o;
        return srNo == authStage.srNo && Objects.equals(auth, authStage.auth) && stageType == authStage.stageType;
    }

    public static AuthStage newMobileOTPVerificationStage(
            String mobile, int otp, ZonedDateTime validTill, int srNo, Auth auth, String countryCode) {
        return AuthStage.builder()
                .auth(auth)
                .stageType(AuthStageType.MOBILE_OTP_VERIFICATION)
                .srNo(srNo)
                .status(AuthStageStatus.IN_PROGRESS)
                .data(new MobileOTPVerificationStageData(mobile, countryCode, otp, 1, validTill, null))
                .build();
    }

    public static AuthStage newEmailOTPVerificationStage(
            String email, int otp, ZonedDateTime validTill, int srNo, Auth auth) {
        return AuthStage.builder()
                .auth(auth)
                .stageType(AuthStageType.EMAIL_OTP_VERIFICATION)
                .srNo(srNo)
                .status(AuthStageStatus.IN_PROGRESS)
                .data(new EmailOTPVerificationStageData(email, otp, 1, validTill, null))
                .build();
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), auth, srNo, stageType);
    }
}
