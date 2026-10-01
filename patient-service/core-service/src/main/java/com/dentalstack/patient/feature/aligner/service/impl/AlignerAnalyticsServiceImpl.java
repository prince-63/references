package com.dentalstack.patient.feature.aligner.service.impl;

import com.dentalstack.patient.feature.aligner.dto.analytics.*;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.projection.AlignerAnalyticsCounts;
import com.dentalstack.patient.feature.aligner.projection.PatientAnalyticsSummary;
import com.dentalstack.patient.feature.aligner.projection.PatientRemindAllForAnalyticsSummary;
import com.dentalstack.patient.feature.aligner.repository.AlignerAnalyticsQueryRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerAnalyticsService;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.utils.CountryCodeMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlignerAnalyticsServiceImpl implements AlignerAnalyticsService {

    private final AlignerAnalyticsQueryRepository alignerAnalyticsQueryRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Override
    @Transactional(readOnly = true)
    public AlignerAnalyticsCountResponse getChartCountData(ChartCountForAnalyticsRequest request) {

        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();
        var profileId = request.getProfileId();
        var patientIds = getPatientIds(profileId, organizationId, doctorId, null, null);

        AlignerAnalyticsCounts counts = alignerAnalyticsQueryRepository.getAlignerAnalyticsCounts(patientIds);
        AlignerAnalyticsCounts alignerChangeCounts = alignerAnalyticsQueryRepository.getAlignerChangeCounts(patientIds);
        AlignerAnalyticsCounts perfectFitCounts = alignerAnalyticsQueryRepository.getPerfectFitCounts(patientIds);
        AlignerAnalyticsCounts issuesCounts = alignerAnalyticsQueryRepository.getIssuesCounts(patientIds);
        AlignerAnalyticsCounts reportedIssuesCounts =
                alignerAnalyticsQueryRepository.getReportedIssuesCounts(patientIds);
        Long uniquePatientsWithActionCount = alignerAnalyticsQueryRepository.countUniquePatientsWithActions(patientIds);

        AlignerAnalyticsCountResponse.PatientCompliance compliance =
                new AlignerAnalyticsCountResponse.PatientCompliance(
                        counts.getNeedsAttentionCount(),
                        counts.getAtRiskCount(),
                        counts.getOnTrackCount(),
                        calculatePercentage(counts.getOnTrackCount(), counts.getTotalPatients()));

        var totalOnTimeChanges =
                alignerChangeCounts.getOnTimeChangesCount() + alignerChangeCounts.getEarlyChangesCount();

        AlignerAnalyticsCountResponse.AlignerChanges alignerChanges =
                AlignerAnalyticsCountResponse.AlignerChanges.builder()
                        .onTime(totalOnTimeChanges)
                        .delay(alignerChangeCounts.getDelayLessThan7DaysCount())
                        .delayLessThan7Days(alignerChangeCounts.getDelayLessThan7DaysCount())
                        .delayMoreThan7Days(alignerChangeCounts.getDelayMoreThan7DaysCount())
                        .early(alignerChangeCounts.getEarlyChangesCount())
                        .onTimePercentage(
                                calculatePercentage(totalOnTimeChanges, alignerChangeCounts.getTotalAlignerChanges()))
                        .build();

        var totalCheckIns = perfectFitCounts.getPerfectFitCount() + issuesCounts.getSomeIssuesCount();
        AlignerAnalyticsCountResponse.AlignerCheckIn alignerCheckIn =
                AlignerAnalyticsCountResponse.AlignerCheckIn.builder()
                        .perfectFit(perfectFitCounts.getPerfectFitCount())
                        .someIssue(issuesCounts.getSomeIssuesCount())
                        .perfectFitPercentage(calculatePercentage(perfectFitCounts.getPerfectFitCount(), totalCheckIns))
                        .build();

        var totalIssuesCount = reportedIssuesCounts.getTotalIssuesCount();
        var totalPatients = counts.getTotalPatients();
        double issueReportedPercentage = 0.0;
        if (totalPatients > 0) {
            issueReportedPercentage = (reportedIssuesCounts.getMissingAlignerCount()
                    + reportedIssuesCounts.getBrokenAlignerCount()
                    + reportedIssuesCounts.getSharpEdgesCount()
                    + reportedIssuesCounts.getIrritationToGumsCount());
        }
        AlignerAnalyticsCountResponse.IssuesReported issuesReported =
                AlignerAnalyticsCountResponse.IssuesReported.builder()
                        .missingAligner(reportedIssuesCounts.getMissingAlignerCount())
                        .brokenAligner(reportedIssuesCounts.getBrokenAlignerCount())
                        .sharpEdges(reportedIssuesCounts.getSharpEdgesCount())
                        .irritationToGums(reportedIssuesCounts.getIrritationToGumsCount())
                        .totalIssueReportedPercentage(issueReportedPercentage)
                        .build();

        return AlignerAnalyticsCountResponse.builder()
                .patientCompliance(compliance)
                .onTrackPercentage(calculatePercentage(counts.getOnTrackCount(), counts.getTotalPatients()))
                .alignerChangesTillDate(alignerChanges)
                .alignerCheckInTillDate(alignerCheckIn)
                .issuesReportedTillDate(issuesReported)
                .totalAlignerChanges(totalIssuesCount)
                .totalAlignerCheckIns(totalCheckIns)
                .totalIssuesReported(totalIssuesCount)
                .uniquePatientWithActionCounts(uniquePatientsWithActionCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AlignerPatientAnalyticsDetailsResponse getPatientsAnalyticsDetails(
            AlignerPatientAnalyticsDetailsRequest request) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }
        var profileIds = request.getPracticeProfileIds();
        var practiceLocationIds = request.getPracticeLocationIds();
        var patientIds = getPatientIds(
                request.getProfileId(),
                request.getOrganizationId(),
                request.getDoctorId(),
                profileIds,
                practiceLocationIds);
        Set<Long> patientIdsSet = new HashSet<>(patientIds);

        List<PatientAnalyticsSummary> patientSummaries;
        int totalPatients;

        if (StringUtils.hasText(request.getSearch())) {
            patientSummaries = alignerAnalyticsQueryRepository.findAnalyticsSummariesWithSearch(
                    patientIdsSet,
                    request.getFilter() != null ? String.valueOf(request.getFilter()) : null,
                    request.getSearch(),
                    request.getDoctorId(),
                    request.getProfileId(),
                    request.getOrganizationId(),
                    request.getIsAlignerPendingUpdates(),
                    request.getPatientInvitationStatus() != null
                            ? String.valueOf(request.getPatientInvitationStatus())
                            : null,
                    request.getPageNumber(),
                    request.getPageSize());
        } else {
            patientSummaries = alignerAnalyticsQueryRepository.findAnalyticsSummariesByPatientIds(
                    patientIdsSet,
                    request.getDoctorId(),
                    request.getProfileId(),
                    request.getOrganizationId(),
                    request.getFilter() != null ? String.valueOf(request.getFilter()) : null,
                    request.getIsAlignerPendingUpdates(),
                    request.getPatientInvitationStatus() != null
                            ? String.valueOf(request.getPatientInvitationStatus())
                            : null,
                    request.getPageNumber(),
                    request.getPageSize());
        }

        totalPatients = !patientSummaries.isEmpty() ? patientSummaries.get(0).getTotalPatients() : 0;

        int totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPageNumber())
                .pageSize(request.getPageSize())
                .totalPatients(totalPatients)
                .totalPages(totalPages)
                .hasNext(request.getPageNumber() < totalPages - 1)
                .hasPrevious(request.getPageNumber() > 0)
                .build();

        List<AlignerPatientAnalyticsDetails> patientDetailsList =
                patientSummaries.stream().map(this::mapToAnalyticsDetails).toList();

        return AlignerPatientAnalyticsDetailsResponse.builder()
                .patientAnalyticsDetails(patientDetailsList)
                .paginationDetails(paginationDetails)
                .build();
    }

    private void updateToOwnerProfile(UserProfile inviterProfile, AlignerPatientAnalyticsDetailsRequest request) {
        request.setProfileId(inviterProfile.getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientRemindAllForAnalytics> getPatientForRemindAll(ChartCountForAnalyticsRequest request) {
        var organizationId = request.getOrganizationId();
        var doctorId = request.getDoctorId();
        var profileId = request.getProfileId();
        var filter = request.getFilter() != null ? String.valueOf(request.getFilter()) : null;
        var patientIds = getPatientIds(profileId, organizationId, doctorId, null, null);
        Set<Long> patientIdsSet = new HashSet<>(patientIds);

        List<PatientRemindAllForAnalyticsSummary> summaries =
                alignerAnalyticsQueryRepository.findPatientsForRemindAll(patientIdsSet, filter);

        return summaries.stream()
                .map(summary -> PatientRemindAllForAnalytics.builder()
                        .patientId(summary.getPatientId())
                        .patientFullName(summary.getPatientFullName())
                        .patientProfileUrl(summary.getPatientProfileUrl())
                        .build())
                .collect(Collectors.toList());
    }

    private AlignerPatientAnalyticsDetails mapToAnalyticsDetails(PatientAnalyticsSummary summary) {

        return AlignerPatientAnalyticsDetails.builder()
                .alignerJourneyId(summary.getAlignerJourneyId())
                .patientFullName(fullName(summary.getFirstName(), summary.getLastName()))
                .patientProfileUrl(summary.getProfilePictureUrl())
                .patientProfileImageId(summary.getProfilePictureId())
                .customerMappedId(summary.getCustomPatientId())
                .email(summary.getEmail())
                .countryCode(CountryCodeMapper.getPhoneCodeByCountryCode(summary.getCountryCode()))
                .mobile(summary.getMobile())
                .practiceLocation(summary.getPracticeLocationName())
                .currentAligner(summary.getCurrentAlignerNumber())
                .currentAlignerJawType(JawType.valueOf(summary.getCurrentAlignerJawType()))
                .totalAligners(summary.getTotalAligners())
                .compliance(mapComplianceStatus(summary.getComplianceStatus()))
                .isYourPatient(summary.getIsYourPatient())
                .alignerUpdates(summary.getTotalUnvalidatedActions())
                .patientId(summary.getPatientId())
                .assignedPractice(fullNameWithSalutation(
                        summary.getAssignedUserFirstName(),
                        summary.getAssignedUserLastName(),
                        summary.getAssignedUserSalutation()))
                .patientAppInviteStatus(summary.getMappedAppInviteStatus())
                .hasPerformedAnyAction(summary.getHasPerformedActions())
                .build();
    }

    public static String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    public static String fullNameWithSalutation(String firstName, String lastName, String salutation) {
        StringBuilder fullName = new StringBuilder();
        if (StringUtils.hasText(salutation)) {
            fullName.append(salutation).append(". ");
        }
        if (StringUtils.hasText(firstName)) {
            fullName.append(firstName);
        }
        if (StringUtils.hasText(lastName)) {
            if (!fullName.isEmpty()) {
                fullName.append(" ");
            }
            fullName.append(lastName);
        }
        return fullName.toString();
    }

    private AlignerPatientAnalyticsDetails.Compliance mapComplianceStatus(String complianceStatus) {
        if (complianceStatus == null) {
            return null;
        }

        return switch (complianceStatus) {
            case "NEED_ATTENTION" -> AlignerPatientAnalyticsDetails.Compliance.NEED_ATTENTION;
            case "AT_RISK" -> AlignerPatientAnalyticsDetails.Compliance.AT_RISK;
            case "ON_TRACK" -> AlignerPatientAnalyticsDetails.Compliance.ON_TRACK;
            default -> null;
        };
    }

    private List<Long> getPatientIds(
            Long profileId,
            Long organizationId,
            Long doctorId,
            @Nullable List<Long> profileIds,
            @Nullable List<Long> practiceLocationIds) {

        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        if (profileIds != null && !profileIds.isEmpty()) {
            return patientDoctorOrganizationRepository.findPatientIdsByOrgProfilesAndTrackingTypeWithoutArchive(
                    organizationId, profileIds, TrackingType.PATIENTAPP, practiceLocationIds);
        }

        if (isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            return patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdAndTrackingType(
                    organizationId, TrackingType.PATIENTAPP, practiceLocationIds);
        } else {
            return patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgProfileAndTrackingType(
                    doctorId, organizationId, profileId, TrackingType.PATIENTAPP, practiceLocationIds);
        }
    }

    private boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
    }

    private double calculatePercentage(Integer numerator, Integer denominator) {
        if (denominator == null || denominator == 0) {
            return 0.0;
        }
        return numerator != null ? (double) numerator / denominator * 100 : 0.0;
    }
}
