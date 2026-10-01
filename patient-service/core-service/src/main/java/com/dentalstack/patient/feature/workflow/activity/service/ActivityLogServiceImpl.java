package com.dentalstack.patient.feature.workflow.activity.service;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.patient.dto.PatientCommentResponse;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.activity.dto.*;
import com.dentalstack.patient.feature.workflow.activity.dto.ActivityLogListResponse.PaginationDetails;
import com.dentalstack.patient.feature.workflow.activity.entity.ActivityLog;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityContext;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.activity.repository.ActivityRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityRepository activityRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderCommentsRepository orderCommentsRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Override
    public void createActivityLog(ActivityRequest activityRequest) {
        Optional<Patient> patient = patientRepository.findById(activityRequest.getPatientId());
        Optional<UserProfile> activityBy = userProfileRepository.findById(activityRequest.getActivityBy());

        if (patient.isPresent() && activityBy.isPresent()) {
            var activityLog = ActivityLog.from(patient.get(), activityBy.get(), activityRequest);
            activityRepository.save(activityLog);
        }
    }

    @Override
    public void internalActivityLog(InternalActivityRequest request) {
        Patient patient = request.getPatient();
        UserProfile activityBy = request.getActivityBy();

        var activityLog = ActivityLog.fromInternal(patient, activityBy, request);
        activityRepository.save(activityLog);
    }

    @Override
    public ActivityLogListResponse<ActivityResponseDTO> getActivityLogs(ActivityGetRequestDTO request) {
        Pageable pageable =
                PageRequest.of(request.getPage(), request.getSize(), Sort.by(Sort.Direction.DESC, "activityAt"));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (userProfile.getInviterProfile() != null && isAdminWithDefaultTag) {
            request.setProfileId(userProfile.getInviterProfile().getId());
        }

        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());
        ActivityContext context = resolveContext(enabledItems);

        Page<Long> activityIdPage =
                activityRepository.findActivityIdsWithScopes(request.getPatientId(), request.getProfileId(), pageable);

        List<ActivityLog> activityLogs = activityIdPage.getContent().isEmpty()
                ? List.of()
                : activityRepository.findAllActivityByIdsWithRelations(activityIdPage.getContent());

        List<ActivityResponseDTO> activities = activityLogs.stream()
                .filter(log -> shouldInclude(log, context))
                .map(ActivityResponseDTO::from)
                .toList();

        long totalCount = activities.size();
        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPage())
                .pageSize(activityIdPage.getSize())
                .totalActivities((int) totalCount)
                .totalPages(activityIdPage.getTotalPages())
                .hasNext(activityIdPage.hasNext())
                .hasPrevious(activityIdPage.hasPrevious())
                .build();

        return ActivityLogListResponse.<ActivityResponseDTO>builder()
                .content(activities)
                .paginationDetails(paginationDetails)
                .build();
    }

    private boolean shouldInclude(ActivityLog log, ActivityContext context) {
        return switch (context) {
            case NORMAL -> true;
            case PLANNING -> log.getActivityType() != ActivityType.MOVE
                    && log.getActivityType() != ActivityType.CHANGE_WORKFLOW
                    && !isVspActivity(log.getActivityType());
            case VSP_PLANNING -> isVspActivity(log.getActivityType());
        };
    }

    private boolean isVspActivity(ActivityType type) {
        return type.name().startsWith("VSP_");
    }

    private ActivityContext resolveContext(List<String> enabledItems) {
        if (enabledItems.contains("VSP PLANNING")) {
            return ActivityContext.VSP_PLANNING;
        }
        if (enabledItems.contains("PLANNING")) {
            return ActivityContext.PLANNING;
        }
        return ActivityContext.NORMAL;
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityLogListResponse<TimelineResponseDTO> getMergeCommentsAndActivities(ActivityGetRequestDTO request) {
        int halfPageSize = Math.max(1, request.getSize() / 2);

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        Long filterProfileId = request.getProfileId();

        if (userProfile.getInviterProfile() != null && isAdminWithDefaultTag) {
            var inviterUserProfile = userProfile.getInviterProfile();
            filterProfileId = inviterUserProfile.getId();
            request.setProfileId(inviterUserProfile.getId());
        }
        Pageable commentsPageable = PageRequest.of(request.getPage(), halfPageSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<OrderComments> commentPage = orderCommentsRepository.findByPatientIdAndProfileIdWithPagination(
                request.getPatientId(), filterProfileId, commentsPageable);

        int remaining = halfPageSize - commentPage.getNumberOfElements();

        List<PatientCommentResponse> patientCommentResponses = commentPage.getContent().stream()
                .map(PatientCommentResponse::from)
                .toList();

        ActivityGetRequestDTO activityRequest = ActivityGetRequestDTO.builder()
                .profileId(request.getProfileId())
                .page(request.getPage())
                .size(halfPageSize + remaining)
                .patientId(request.getPatientId())
                .build();

        ActivityLogListResponse<ActivityResponseDTO> activityResponse = getActivityLogs(activityRequest);
        List<ActivityResponseDTO> activityList = activityResponse.getContent();

        List<TimelineResponseDTO> commentTimeline = patientCommentResponses.stream()
                .map(c -> TimelineResponseDTO.builder()
                        .type("COMMENT")
                        .title("Comment from " + (c.getDisplayName() == null ? "Unknown" : c.getDisplayName()))
                        .description(c.getNotes())
                        .createdBy(c.getDisplayName())
                        .profileImageUrl(c.getProfileImageUrl())
                        .timestamp(c.getCreatedAt())
                        .files(c.getFiles() == null ? Collections.emptyList() : c.getFiles())
                        .isCustomActivity(null)
                        .build())
                .toList();

        List<TimelineResponseDTO> activityTimeline = activityList.stream()
                .map(a -> TimelineResponseDTO.builder()
                        .type("ACTIVITY")
                        .title(a.getActivityType() != null ? a.getActivityType().name() : "Activity")
                        .description(a.getActivity())
                        .createdBy(a.getActivityBy())
                        .profileImageUrl(null)
                        .timestamp(a.getActivityAt())
                        .files(Collections.emptyList())
                        .isCustomActivity(a.getIsCustomActivity())
                        .build())
                .toList();

        List<TimelineResponseDTO> mergedTimeline = Stream.concat(commentTimeline.stream(), activityTimeline.stream())
                .sorted(Comparator.comparing(
                                TimelineResponseDTO::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .toList();

        long totalElements = commentPage.getTotalElements()
                + activityResponse.getPaginationDetails().getTotalActivities();
        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPage())
                .pageSize(request.getSize())
                .totalActivities(Math.toIntExact(totalElements))
                .totalPages((int) Math.ceil((double) totalElements / request.getSize()))
                .hasNext(request.getPage() < (int) Math.ceil((double) totalElements / request.getSize()) - 1)
                .hasPrevious(request.getPage() > 0)
                .build();

        return ActivityLogListResponse.<TimelineResponseDTO>builder()
                .content(mergedTimeline)
                .paginationDetails(paginationDetails)
                .build();
    }
}
