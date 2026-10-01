package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.user.enums.UserType;

public interface AlignerPhotoProjection {
    Long getId();

    String getImageName();

    boolean isWithAligner();

    String getImageUrl();

    String getDescription();

    UserType getUploaderUserType();

    Long getUploadedBy();

    int getAlignerSrNo();

    JawType getJawType();
}
