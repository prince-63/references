package com.dentalstack.patient.feature.payment.service.impl;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerProductionLabRepository;
import com.dentalstack.patient.feature.calendar.dto.calendar.details.PaymentCalendarDetails;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.dto.*;
import com.dentalstack.patient.feature.payment.dto.DeletePaymentRequest;
import com.dentalstack.patient.feature.payment.dto.FilteredTreatmentPaymentsRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterPaymentRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterTreatmentCostRequest;
import com.dentalstack.patient.feature.payment.dto.UpdatePaymentRequest;
import com.dentalstack.patient.feature.payment.dto.payments.FilteredTreatmentPaymentsDetails;
import com.dentalstack.patient.feature.payment.entity.Payment;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.payment.exception.IncorrectTreatmentCostException;
import com.dentalstack.patient.feature.payment.exception.PaymentNotFoundException;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.reminder.entity.PaymentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.PushNotificationReminderChannelMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.PaymentReminderEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentRepository;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final TreatmentRepository treatmentRepository;
    private final PatientRepository patientRepository;
    private final ReminderRepository reminderRepository;
    private final TimelineService timelineService;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerProductionLabRepository alignerProductionLabRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment registerTreatmentCost(RegisterTreatmentCostRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var cost = request.getCost();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var treatmentOpt = patient.getTreatments().stream()
                .filter(treatment -> treatment.getDoctorId() == doctorId)
                .findFirst();
        Treatment treatment;
        if (treatmentOpt.isPresent()) {
            treatment = treatmentOpt.get();
            var amountPaid = treatment.amountPaid();
            if (cost < amountPaid) {
                throw new IncorrectTreatmentCostException(treatment.getId());
            }

            treatment.setCost(cost);
        } else {
            treatment = Treatment.newTreatment(patient, cost, doctorId);
            patient.getTreatments().add(treatment);
        }

        patientRepository.save(patient);

        log.info("The cost of the treatment is set for patient {} by doctor {}", patientId, doctorId);
        return treatment;
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment registerPayment(RegisterPaymentRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var amount = request.getAmount();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var treatment = patient.getTreatments().stream()
                .findAny()
                .filter(t -> t.getDoctorId() == doctorId)
                .orElseThrow(() -> new BadRequestException("Treatment cost not set"));
        if (treatment.balancePayment() < amount) {
            throw new BadRequestException("Payment amount be more than balance payment amount");
        }

        treatment.getPayments().add(Payment.fromPatient(treatment, request));

        log.info("Registered a new payment of patient {} by doctor {}", patientId, doctorId);
        return treatmentRepository.save(treatment);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment updatePayment(UpdatePaymentRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var paymentId = request.getPaymentId();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var treatment = patient.getTreatments().stream()
                .findAny()
                .filter(t -> t.getDoctorId() == doctorId)
                .orElseThrow(() -> new BadRequestException("Treatment cost not set"));
        var payment = treatment.getPayments().stream()
                .filter(p -> p.getId().equals(paymentId) && p.getStatus().equals(Status.ACTIVE))
                .findAny()
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        if (treatment.balancePayment() + payment.getAmount() - request.getAmount() < 0) {
            throw new BadRequestException("New payment amount cannot make the balance payment negative.");
        }

        payment.setPaymentName(request.getName());
        payment.setAmount(request.getAmount());
        payment.setDate(request.getDate());

        log.info("Update payment with id {}", paymentId);
        return treatmentRepository.save(treatment);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment deletePayment(DeletePaymentRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var paymentId = request.getPaymentId();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var treatment = patient.getTreatments().stream()
                .findAny()
                .filter(t -> t.getDoctorId() == doctorId)
                .orElseThrow(() -> new BadRequestException("Treatment cost not set"));
        var payment = treatment.getPayments().stream()
                .filter(p -> p.getId().equals(paymentId) && p.getStatus().equals(Status.ACTIVE))
                .findAny()
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        payment.setStatus(Status.DELETED);

        log.info("Deleted payment with id {}", paymentId);
        return treatmentRepository.save(treatment);
    }

    @Transactional(readOnly = true)
    @Override
    public Treatment getTreatment(long patientId, long doctorId) {
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(patientId, doctorId);
        if (patientDoctorOrganization == null) {
            throw new PatientNotFoundException("Patient with ID " + patientId + " not found.");
        }
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        return patient.getTreatments().stream()
                .filter(t -> t.getDoctorId() == doctorId)
                .findAny()
                .orElseThrow(() -> new TreatmentNotFoundException(patientId, doctorId));
    }

    @Transactional(readOnly = true)
    @Override
    public Treatment getTreatment(long patientId) {
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        return patient.getTreatments().stream()
                .filter(t -> t.getDoctorId() == patient.getAddedByUserId())
                .findAny()
                .orElse(null);
    }

    @Override
    public void paymentReminder() {
        LocalDate today = LocalDate.now();
        var reminders = reminderRepository.findByDateAndPurpose(today, ReminderPurpose.PAYMENTS_PENDING);
        for (Reminder reminder : reminders) {
            var metadata = (PushNotificationReminderChannelMetadata) reminder.getChannelMetadata();

            var patient = patientRepository.findById(metadata.getPatientId());

            patient.ifPresent(value -> timelineService.addEvent(
                    value.getId(),
                    UserType.PATIENT,
                    value.getAddedByUserId(),
                    UserType.DOCTOR,
                    EventType.PAYMENT_REMINDER,
                    new PaymentReminderEventMetadata(value.getId())));
        }
    }

    @Transactional(readOnly = true)
    @Override
    public FilteredTreatmentPaymentsDetails getFilteredPayments(FilteredTreatmentPaymentsRequest request) {

        List<PatientSummary> patientSummaries;

        List<Long> patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());

        if (StringUtils.hasText(request.getPatientSearch())) {
            patientSummaries =
                    patientRepository.findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedIdForPatientSummary(
                            request.getPatientSearch(), patientIds);
        } else {
            patientSummaries = patientRepository.findByPatientIdsWithSummary(patientIds);
        }

        List<Treatment> treatments = treatmentRepository.findTreatmentsByPatientIds(patientIds);

        Set<Long> filteredPatientId =
                patientSummaries.stream().map(PatientSummary::getPatientId).collect(Collectors.toSet());

        Stream<PatientSummary> filteredPatientStream = patientSummaries.stream()
                .filter(patientSummary -> filteredPatientId.contains(patientSummary.getPatientId()));

        treatments = treatments.stream()
                .filter(treatment ->
                        filteredPatientId.contains(treatment.getPatient().getId()))
                .collect(Collectors.toList());

        if (!CollectionUtils.isEmpty(request.getCheckedTreatmentList())) {
            boolean showBraces = request.getCheckedTreatmentList().contains("SHOW_BRACES_TREATMENTS");
            boolean showAligners = request.getCheckedTreatmentList().contains("SHOW_ALIGNERS_TREATMENTS");
            boolean showUnassigned = request.getCheckedTreatmentList().contains("UNASSIGNED");

            filteredPatientStream = filteredPatientStream.filter(patient -> {
                List<ProductTypeName> productTypes = patient.getProductTypeNames();

                if (CollectionUtils.isEmpty(productTypes)
                        || (!productTypes.contains(ProductTypeName.BRACES)
                                && !productTypes.contains(ProductTypeName.ALIGNERS))) {
                    return showUnassigned;
                }

                return (showBraces && productTypes.contains(ProductTypeName.BRACES))
                        || (showAligners && productTypes.contains(ProductTypeName.ALIGNERS));
            });
        }

        boolean showUnassigned = request.getCheckedTreatmentList().contains("UNASSIGNED");

        if (!CollectionUtils.isEmpty(request.getCheckedBrandList())) {
            List<String> selectedBrandNames = request.getCheckedBrandList().stream()
                    .map(FilteredTreatmentPaymentsRequest.BrandOption::getValue)
                    .map(brandId -> alignerProductionLabRepository
                            .findById(brandId)
                            .map(AlignerProductionLab::getName)
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .toList();
            if (!selectedBrandNames.isEmpty()) {
                Set<Long> patientIdsWithMatchingBrands =
                        new HashSet<>(treatmentPlanRepository.findPatientIdsByBrandNamesAndPatientIds(
                                selectedBrandNames, patientIds));

                if (showUnassigned) {
                    treatmentPlanRepository.findPatientIdsWithNoActiveTreatmentPlansWithPatientId(patientIds);

                    patientIdsWithMatchingBrands.addAll(
                            treatmentPlanRepository.findPatientIdsWithNoActiveTreatmentPlansWithPatientId(patientIds));
                }

                filteredPatientStream = filteredPatientStream.filter(
                        patient -> patientIdsWithMatchingBrands.contains(patient.getPatientId()));
            }
        }

        if (!CollectionUtils.isEmpty(request.getCheckedPracticeLocationList())) {
            List<FilteredTreatmentPaymentsRequest.PracticeLocationOption> selectedLocations =
                    request.getCheckedPracticeLocationList();

            boolean includeUnassigned =
                    selectedLocations.stream().anyMatch(location -> "UNASSIGNED".equalsIgnoreCase(location.getLabel()));

            if (!(includeUnassigned && selectedLocations.size() == 1)) {

                List<Long> selectedLocationIds = selectedLocations.stream()
                        .filter(location -> !"UNASSIGNED".equalsIgnoreCase(location.getLabel()))
                        .map(FilteredTreatmentPaymentsRequest.PracticeLocationOption::getValue)
                        .toList();

                filteredPatientStream = filteredPatientStream.filter(patient -> {
                    Long patientLocationId = getPracticeLocationId(patient);

                    if (patientLocationId == null) {

                        return includeUnassigned;
                    } else {

                        return selectedLocationIds.contains(patientLocationId);
                    }
                });
            }
        }

        if (request.getFilterByPaymentDate() != null
                        && request.getFilterByPaymentDate().getFromDate() != null
                || request.getFilterByPaymentDate() != null
                        && request.getFilterByPaymentDate().getToDate() != null) {
            List<Payment> filteredPayments = getFilteredPayments(treatments, request);

            Set<Long> patientIdsWithPaymentsInDateRange = filteredPayments.stream()
                    .map(payment -> payment.getTreatment().getPatient().getId())
                    .collect(Collectors.toSet());

            filteredPatientStream = filteredPatientStream.filter(
                    patient -> patientIdsWithPaymentsInDateRange.contains(patient.getPatientId()));
        }

        Set<Treatment> treatmentsWithReminders = new HashSet<>();
        Set<Treatment> treatmentsWithoutReminders = new HashSet<>();

        if (!request.getFilterByReminder().equalsIgnoreCase("ALL")) {
            for (Treatment treatment : treatments) {
                if (hasValidFutureReminder(treatment)) {
                    treatmentsWithReminders.add(treatment);
                } else {
                    treatmentsWithoutReminders.add(treatment);
                }
            }

            List<Treatment> filteredTreatmentsOfPatient;

            String reminderStatus = request.getFilterByReminder() != null
                    ? request.getFilterByReminder().toUpperCase()
                    : "ALL";

            switch (reminderStatus) {
                case "ALL" -> filteredTreatmentsOfPatient = new ArrayList<>(treatments);
                case "ADDED" -> filteredTreatmentsOfPatient = new ArrayList<>(treatmentsWithReminders);
                case "NOT_ADDED" -> filteredTreatmentsOfPatient = new ArrayList<>(treatmentsWithoutReminders);
                default -> filteredTreatmentsOfPatient = new ArrayList<>(treatments);
            }

            Set<Long> patientIdsWithReminders = filteredTreatmentsOfPatient.stream()
                    .map(t -> t.getPatient().getId())
                    .collect(Collectors.toSet());

            filteredPatientStream =
                    filteredPatientStream.filter(patient -> patientIdsWithReminders.contains(patient.getPatientId()));
        }

        List<PatientSummary> filteredPatients = filteredPatientStream.toList();

        List<Long> filteredPatientIds =
                filteredPatients.stream().map(PatientSummary::getPatientId).toList();
        List<Treatment> filteredTreatments = treatmentRepository.findTreatmentsByPatientIds(filteredPatientIds);

        List<FilteredTreatmentPaymentsDetails.PatientDetail> patientDetails = filteredPatients.stream()
                .map(patient -> {
                    List<Treatment> patientTreatments = filteredTreatments.stream()
                            .filter(treatment -> treatment.getPatient().getId().equals(patient.getPatientId()))
                            .toList();

                    if (patientTreatments.isEmpty()) {
                        var brandName = treatmentPlanRepository.findLatestAlignerJourneyBrandNameByPatientId(
                                patient.getPatientId());
                        List<String> treatmentsName = new ArrayList<>();

                        brandName.ifPresent(treatmentsName::add);

                        if (patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
                            treatmentsName.add(ProductTypeName.BRACES.name());
                        }
                        return FilteredTreatmentPaymentsDetails.PatientDetail.builder()
                                .patientName(fullName(patient.getFirstName(), patient.getLastName()))
                                .patientId(patient.getPatientId())
                                .profileUrl(patient.getProfilePictureUrl())
                                .profileImageId(patient.getProfilePictureId())
                                .patientCreatedOn(patient.getCreatedAt())
                                .treatments(treatmentsName)
                                .practiceLocationId(patient.getPracticeLocationId())
                                .practiceLocationName(patient.getPracticeLocationName())
                                .treatmentCost(0.0)
                                .balancePayment(0.0)
                                .doctorId(request.getDoctorId())
                                .lastPaymentReceived(null)
                                .paymentReminderDetails(null)
                                .patientStatus(patient.getPatientStatus())
                                .build();
                    } else {
                        return convertToPatientDetail(patientTreatments.get(0));
                    }
                })
                .collect(Collectors.toList());

        if (request.getSortBy() != null) {
            Comparator<FilteredTreatmentPaymentsDetails.PatientDetail> comparator = null;

            if ("PATIENT_CREATED_ON".equals(request.getSortBy().getType())) {
                if ("NEWEST_TO_OLDEST".equals(request.getSortBy().getSort())) {
                    comparator = Comparator.comparing(
                                    FilteredTreatmentPaymentsDetails.PatientDetail::getPatientCreatedOn)
                            .reversed();
                } else if ("OLDEST_TO_NEWEST".equals(request.getSortBy().getSort())) {
                    comparator =
                            Comparator.comparing(FilteredTreatmentPaymentsDetails.PatientDetail::getPatientCreatedOn);
                }
            }

            if ("PATIENT_NAME".equals(request.getSortBy().getType())) {
                comparator = Comparator.comparing(FilteredTreatmentPaymentsDetails.PatientDetail::getPatientName);
                if ("REVERSE_ALPHABETICALLY".equals(request.getSortBy().getSort())) {
                    comparator = comparator.reversed();
                }
            }

            if ("BALANCE_PAYMENT".equals(request.getSortBy().getType())) {
                comparator = Comparator.comparing(FilteredTreatmentPaymentsDetails.PatientDetail::getBalancePayment);
                if ("DESCENDING".equals(request.getSortBy().getSort())) {
                    comparator = comparator.reversed();
                }
            }

            if ("LAST_PAYMENT_RECEIVED".equals(request.getSortBy().getType())) {
                comparator = Comparator.comparing(
                        patientDetail -> patientDetail.getLastPaymentReceived() != null
                                ? patientDetail.getLastPaymentReceived().getReceivedOn()
                                : null,
                        Comparator.nullsFirst(Comparator.naturalOrder()));
                if ("NEWEST_TO_OLDEST".equals(request.getSortBy().getSort())) {
                    comparator = comparator.reversed();
                }
            }

            if (comparator != null) {
                patientDetails.sort(comparator);
            }
        }

        List<Payment> filteredPayments = getFilteredPayments(filteredTreatments, request);
        double totalOutstandingFiltered = filteredTreatments.stream()
                .mapToDouble(Treatment::totalOutstanding)
                .sum();
        double balanceReceivedFiltered =
                filteredPayments.stream().mapToDouble(Payment::getAmount).sum();
        if (request.getCheckedTreatmentList().isEmpty()
                && request.getCheckedBrandList().isEmpty()
                && request.getCheckedPracticeLocationList().isEmpty()) {
            totalOutstandingFiltered = 0.0;
            balanceReceivedFiltered = 0.0;
        }
        List<Payment> payments = getFilteredPayments(treatments, request);

        double balanceReceived =
                payments.stream().mapToDouble(Payment::getAmount).sum();
        double totalOutstanding =
                treatments.stream().mapToDouble(Treatment::totalOutstanding).sum();
        double receivedThisMonth = payments.stream()
                .filter(totalPayment -> isInCurrentMonth(totalPayment.getDate()))
                .mapToDouble(Payment::getAmount)
                .sum();

        int pageNumber = request.getPageNumber();
        int pageSize = request.getPageSize();

        int startIndex = pageNumber * pageSize;

        int totalElements = patientDetails.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        List<FilteredTreatmentPaymentsDetails.PatientDetail> paginatedPatients =
                patientDetails.stream().skip(startIndex).limit(pageSize).collect(Collectors.toList());

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalPatients(totalElements)
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .build();

        return FilteredTreatmentPaymentsDetails.builder()
                .billingAndPayments(FilteredTreatmentPaymentsDetails.BillingAndPayments.builder()
                        .totalOutstanding(totalOutstanding)
                        .receivedThisMonth(receivedThisMonth)
                        .dueThisMonth(calculateDueThisMonth(treatments))
                        .compareToLastMonth(calculateReceivedThisMonth(payments))
                        .totalOutstandingByFilter(totalOutstandingFiltered)
                        .balanceReceivedByFilter(balanceReceivedFiltered)
                        .totalBalanceReceived(balanceReceived)
                        .patientDetails(paginatedPatients)
                        .totalRemainingCost(totalOutstanding - balanceReceived)
                        .build())
                .pagination(paginationDetails)
                .build();
    }

    private Long getPracticeLocationId(PatientSummary patient) {
        return patient.getPracticeLocationId();
    }

    private String fullName(String firstName, String lastName) {
        String fullName;

        if (lastName != null) {
            fullName = (firstName != null) ? firstName + " " + lastName : lastName;
        } else {
            fullName = (firstName != null) ? firstName : "";
        }
        return fullName;
    }

    private boolean isReminderAdded(PatientSummary patient) {

        if (patient.getTreatments() != null && !patient.getTreatments().isEmpty()) {

            Optional<Treatment> latestTreatment =
                    patient.getTreatments().stream().max(Comparator.comparing(Treatment::getCreatedAt));

            if (latestTreatment.isPresent()) {
                Treatment treatment = latestTreatment.get();

                return treatment.getReminders() != null
                        && !treatment.getReminders().isEmpty();
            }
        }

        return false;
    }

    private boolean hasValidFutureReminder(Treatment treatment) {

        if (treatment.getReminders() == null || treatment.getReminders().isEmpty()) {
            return false;
        }

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        for (Reminder reminder : treatment.getReminders()) {
            LocalDate reminderDate = reminder.getDate();
            LocalTime reminderTime = reminder.getTime();

            if (reminderDate == null || reminderTime == null) {
                continue;
            }

            if (reminderDate.isBefore(today)) {
                continue;
            }

            if (reminderDate.isEqual(today) && reminderTime.isBefore(currentTime)) {
                continue;
            }

            return true;
        }

        return false;
    }

    private List<Payment> getFilteredPayments(List<Treatment> treatments, FilteredTreatmentPaymentsRequest request) {
        return treatments.stream()
                .flatMap(treatment -> treatment.getPayments().stream())
                .filter(payment -> payment.getStatus().equals(Status.ACTIVE))
                .filter(payment -> {
                    if (request.getFilterByPaymentDate() != null) {
                        FilteredTreatmentPaymentsRequest.DateRange dateRange = request.getFilterByPaymentDate();
                        if (dateRange.getFromDate() != null && payment.getDate().isBefore(dateRange.getFromDate())) {
                            return false;
                        }
                        return dateRange.getToDate() == null
                                || !payment.getDate().isAfter(dateRange.getToDate());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private FilteredTreatmentPaymentsDetails.PatientDetail convertToPatientDetail(Treatment treatment) {
        Payment lastPayment = treatment.getPayments().stream()
                .filter(p -> p.getStatus().equals(Status.ACTIVE))
                .max(Comparator.comparing(Payment::getDate))
                .orElse(null);

        var brandName = treatmentPlanRepository.findLatestAlignerJourneyBrandNameByPatientId(
                treatment.getPatient().getId());
        List<String> treatmentsName = new ArrayList<>();

        brandName.ifPresent(treatmentsName::add);

        if (treatment.getPatient().getProductTypeNames().contains(ProductTypeName.BRACES)) {
            treatmentsName.add(ProductTypeName.BRACES.name());
        }

        return FilteredTreatmentPaymentsDetails.PatientDetail.builder()
                .patientName(treatment.getPatient().fullName())
                .patientId(treatment.getPatient().getId())
                .patientCreatedOn(treatment.getPatient().getCreatedAt())
                .practiceLocationName(treatment.getPatient().getPracticeLocationName())
                .practiceLocationId(treatment.getPatient().getPracticeLocationId())
                .treatments(treatmentsName)
                .patientStatus(treatment.getPatient().getPatientStatus())
                .treatmentCost((double) treatment.getCost())
                .balancePayment((double) treatment.balancePayment())
                .doctorId(treatment.getDoctorId())
                .lastPaymentReceived(lastPayment != null ? convertToLastPaymentReceived(lastPayment) : null)
                .paymentReminderDetails(convertToPaymentReminder(treatment.getReminders()))
                .build();
    }

    private FilteredTreatmentPaymentsDetails.LastPaymentReceived convertToLastPaymentReceived(Payment payment) {
        return FilteredTreatmentPaymentsDetails.LastPaymentReceived.builder()
                .amount((double) payment.getAmount())
                .receivedOn(payment.getDate())
                .paymentId(payment.getId())
                .build();
    }

    private boolean isInCurrentMonth(LocalDate date) {
        LocalDate now = LocalDate.now();
        return date.getMonth() == now.getMonth() && date.getYear() == now.getYear();
    }

    private double calculateDueThisMonth(List<Treatment> treatments) {
        double dueThisMonth = 0;

        for (Treatment treatment : treatments) {
            for (Reminder reminder : treatment.getReminders()) {
                if (reminder.getMetadata() instanceof PaymentReminderMetadata metadata) {
                    if (metadata.getPatientDetails() != null && metadata.getAmount() != null) {
                        if (reminder.getDate() != null
                                && reminder.getDate().getMonth()
                                        == LocalDate.now().getMonth()) {
                            dueThisMonth += metadata.getAmount();
                        }
                    }
                }
            }
        }

        return dueThisMonth;
    }

    private Double calculateReceivedThisMonth(List<Payment> payments) {
        double thisMonthReceived = payments.stream()
                .filter(payment -> isInCurrentMonth(payment.getDate()))
                .mapToDouble(Payment::getAmount)
                .sum();

        double lastMonthReceived = payments.stream()
                .filter(payment -> {
                    LocalDate paymentDate = payment.getDate();
                    LocalDate firstDayOfLastMonth =
                            LocalDate.now().minusMonths(1).withDayOfMonth(1);
                    LocalDate lastDayOfLastMonth =
                            LocalDate.now().withDayOfMonth(1).minusDays(1);
                    return !paymentDate.isBefore(firstDayOfLastMonth) && !paymentDate.isAfter(lastDayOfLastMonth);
                })
                .mapToDouble(Payment::getAmount)
                .sum();

        double percentageValue = 0.0;
        if (lastMonthReceived > 0) {
            double change = thisMonthReceived - lastMonthReceived;
            percentageValue = (change / lastMonthReceived) * 100;
        }
        return percentageValue;
    }

    private PaymentCalendarDetails convertToPaymentReminder(List<Reminder> reminders) {
        if (reminders == null || reminders.isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        Reminder closestReminder = null;
        long minimumDaysDifference = Long.MAX_VALUE;
        Long alignerJourneyId = null;

        for (Reminder reminder : reminders) {
            if (reminder.getMetadata() instanceof PaymentReminderMetadata metadata) {
                if (metadata.getPatientDetails() == null) {
                    continue;
                }
                var patientId = metadata.getPatientDetails().getId();
                if (patientId != null) {
                    var id = alignerJourneyRepository.findLatestAlignerJourneyIdByPatientId(patientId);
                    if (id.isPresent()) {
                        alignerJourneyId = id.get();
                    }
                }
                LocalDate reminderDate = reminder.getDate();
                LocalTime reminderTime = reminder.getTime();

                if (reminderDate == null || reminderTime == null) {
                    continue;
                }

                if (reminderDate.isBefore(today)) {
                    continue;
                }

                if (reminderDate.isEqual(today) && reminderTime.isBefore(currentTime)) {
                    continue;
                }

                long daysDifference = ChronoUnit.DAYS.between(today, reminderDate);

                if (daysDifference < minimumDaysDifference) {
                    minimumDaysDifference = daysDifference;
                    closestReminder = reminder;
                }
            }
        }

        return closestReminder != null ? PaymentCalendarDetails.from(closestReminder, alignerJourneyId) : null;
    }
}
