package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.ActionDetailCategorizedResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.ChangeAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CheckInAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CommentOnAlignerActionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.ReportAlignerIssueRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface AlignerActionService {
    AlignerJourney reportIssue(ReportAlignerIssueRequest request);

    void checkIn(CheckInAlignerRequest request, MultipartFile[] photos);

    void commentOnAction(CommentOnAlignerActionRequest request);

    void changeAligner(ChangeAlignerRequest request);

    ActionDetailCategorizedResponse getAlignerActionDetails(
            AlignerActionType enumActionType, Boolean isActive, Long doctorId, Long organizationId);

    Map<AlignerActionType, Integer> getAlignerActionCounts(Long doctorId, Boolean isActive);

    void inactivateActions(List<Long> actionsIds, long doctorId);
}
