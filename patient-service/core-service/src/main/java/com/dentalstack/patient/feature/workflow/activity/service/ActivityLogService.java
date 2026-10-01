package com.dentalstack.patient.feature.workflow.activity.service;

import com.dentalstack.patient.feature.workflow.activity.dto.*;

public interface ActivityLogService {

    void createActivityLog(ActivityRequest activityRequest);

    void internalActivityLog(InternalActivityRequest request);

    ActivityLogListResponse<ActivityResponseDTO> getActivityLogs(ActivityGetRequestDTO request);

    ActivityLogListResponse<TimelineResponseDTO> getMergeCommentsAndActivities(ActivityGetRequestDTO request);
}
