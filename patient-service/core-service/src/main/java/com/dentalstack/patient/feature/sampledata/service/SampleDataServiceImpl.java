package com.dentalstack.patient.feature.sampledata.service;

import static com.dentalstack.patient.feature.aligner.enums.aligner.JawType.*;
import static com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFittingFeedback.Fitting.LOOSE_AT_FRONT;
import static com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFittingFeedback.Fitting.PERFECT_FIT;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.entity.*;
import com.dentalstack.patient.feature.aligner.enums.aligner.*;
import com.dentalstack.patient.feature.aligner.repository.AlignerFeedbackRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.GenerateSampleChatRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientKYC;
import com.dentalstack.patient.feature.patient.entity.PatientLogin;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.sampledata.dto.SampleDataIds;
import com.dentalstack.patient.feature.sampledata.exception.FailToFetchSampleDataException;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AlignerChangeEventEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.NotWearingForRecommendedHoursEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentSetupEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.feedback.*;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.Address;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SampleDataServiceImpl implements ApplicationRunner, SampleDataService {

    private final DoctorService doctorService;
    private final ChatService chatService;

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerFeedbackRepository alignerFeedbackRepository;
    private final PatientRepository patientRepository;
    private final EventRepository eventRepository;

    private final Environment environment;

    private static final String SAMPLE_PATIENT_UUID = "P32457892";
    private static final String SAMPLE_PATIENT_MOBILE = "8169723642";
    private static final String SAMPLE_PATIENT_EMAIL = "rishang1.jain@outlook.com";
    private static final LocalDate TREATMENT_CREATION_DATE = LocalDate.of(2023, 11, 2);

    @Override
    public void run(ApplicationArguments args) {
        if (!environment.acceptsProfiles(Profiles.of("local"))) {}
    }

    private void generateIfRequired() {

        var optionalPatient = patientRepository.findByUUID(SAMPLE_PATIENT_UUID);
        if (optionalPatient.isPresent()) {
            return;
        }
        var patient = saveSamplePatient();
        var alignerJourney = saveSampleAlignerJourney(patient);
        var doctor = doctorService.getSampleDoctor(patient.getId(), alignerJourney.getId());

        patient.setDoctorId(doctor.getDoctorId());
        patient = patientRepository.saveAndFlush(patient);

        alignerJourney.setDoctorId(doctor.getDoctorId());
        alignerJourney = alignerJourneyRepository.saveAndFlush(alignerJourney);

        alignerJourney = addFeedbacks(alignerJourney);

        addEvents(alignerJourney);

        chatService.generateSampleChats(GenerateSampleChatRequest.builder()
                .doctorName(doctor.fullName())
                .doctorId(doctor.getDoctorId())
                .patientName(patient.fullName())
                .patientId(patient.getId())
                .build());

        log.info(
                "Successfully generated the sample data. Patient id: {}, aligner journey id: {}, doctor id: {}",
                patient.getId(),
                alignerJourney.getId(),
                doctor.getDoctorId());
    }

    private void addPhotosByPatient(AlignerJourney alignerJourney) {
        var patientId = alignerJourney.getPatient().getId();

        var aligner1 = alignerJourney.getAligners().get(0);
        var aligner2 = alignerJourney.getAligners().get(1);
        var aligner3 = alignerJourney.getAligners().get(2);

        List<String> imageNames = List.of("without_aligners_1.jpg", "without_aligners_2.jpg", "without_aligners_3.jpg");
        var baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_1_to_2/without_aligners";
        for (var name : imageNames) {
            addPhotoByPatient(aligner1, patientId, false, baseUrl, name);
        }

        imageNames = List.of("aligner1_1.jpg", "aligner1_2.jpg", "aligner1_3.jpg");
        baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_1_to_2/aligner_1";
        for (var name : imageNames) {
            addPhotoByPatient(aligner1, patientId, true, baseUrl, name);
        }

        imageNames = List.of("aligner_2.jpg");
        baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_1_to_2/aligner_2";
        for (var name : imageNames) {
            addPhotoByPatient(aligner2, patientId, false, baseUrl, name);
        }

        imageNames = List.of("without_aligners_1.jpg", "without_aligners_2.jpg", "without_aligners_3.jpg");
        baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_2_to_3/without_aligners";
        for (var name : imageNames) {
            addPhotoByPatient(aligner2, patientId, false, baseUrl, name);
        }

        imageNames = List.of("aligner1_1.jpg", "aligner1_2.jpg", "aligner1_3.jpg");
        baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_2_to_3/aligner_2";
        for (var name : imageNames) {
            addPhotoByPatient(aligner2, patientId, true, baseUrl, name);
        }

        imageNames = List.of("aligner_2.jpg");
        baseUrl =
                "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/aligner_change_photos/aligner_2_to_3/aligner_3";
        for (var name : imageNames) {
            addPhotoByPatient(aligner3, patientId, true, baseUrl, name);
        }
    }

    private void addPhotoByPatient(
            Aligner aligner, Long patientId, boolean withAligner, String baseUrl, String imageName) {
        var url = String.join("/", baseUrl, imageName);
        var photo = AlignerPhoto.builder()
                .imageUrl(url)
                .withAligner(withAligner)
                .imageName(imageName)
                .uploaderUserType(UserType.PATIENT)
                .uploadedBy(patientId)
                .aligner(aligner)
                .build();
        aligner.getPhotos().add(photo);
    }

    private AlignerJourney addFeedbacks(AlignerJourney alignerJourney) {
        var patientId = alignerJourney.getPatient().getId();
        var doctorId = alignerJourney.getDoctorId();

        var aligner1FeedbackStartTime = ZonedDateTime.of(2023, 11, 1, 12, 6, 10, 0, ZoneId.systemDefault());
        var aligner1 = alignerJourney.getAligners().get(0);
        var f1a1 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.ALIGNER_CHANGE)
                .feedback(AlignerChangeFeedbackDetails.builder()
                        .alignerFittingFeedback(new AlignerFittingFeedback(Set.of(LOOSE_AT_FRONT)))
                        .alignerChangingFeedback(new AlignerChangingFeedback())
                        .otherIssues("Upper aligners are a little loose at front")
                        .build())
                .aligner(aligner1)
                .build();
        f1a1.setCreatedAt(aligner1FeedbackStartTime);
        f1a1 = alignerFeedbackRepository.save(f1a1);
        aligner1.getFeedbacks().add(f1a1);

        var f2a1 = AlignerFeedback.builder()
                .feedbackerUserId(doctorId)
                .feedbackerUserType(UserType.DOCTOR)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage(
                                "Let's try using chewies to help with that. Chew on them for a few minutes, focusing on the front.")
                        .build())
                .aligner(aligner1)
                .build();
        f2a1.setCreatedAt(aligner1FeedbackStartTime.plusMinutes(30));
        f2a1 = alignerFeedbackRepository.save(f2a1);
        aligner1.getFeedbacks().add(f2a1);

        var f3a1 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage("Sure, I'll give it a try. How often should I use them? ")
                        .build())
                .aligner(aligner1)
                .build();
        f3a1.setCreatedAt(aligner1FeedbackStartTime.plusMinutes(34));
        f3a1 = alignerFeedbackRepository.save(f3a1);
        aligner1.getFeedbacks().add(f3a1);

        var f4a1 = AlignerFeedback.builder()
                .feedbackerUserId(doctorId)
                .feedbackerUserType(UserType.DOCTOR)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage(
                                "Use the chewies as needed, especially during the first few days of each aligner set. Let me know if it helps.")
                        .build())
                .aligner(aligner1)
                .build();
        f4a1.setCreatedAt(aligner1FeedbackStartTime.plusMinutes(40));
        f4a1 = alignerFeedbackRepository.save(f4a1);
        aligner1.getFeedbacks().add(f4a1);

        var f5a1 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage("Will do, Doc. Thanks for the tip!")
                        .build())
                .aligner(aligner1)
                .build();
        f5a1.setCreatedAt(aligner1FeedbackStartTime.plusMinutes(55));
        f5a1 = alignerFeedbackRepository.save(f5a1);
        aligner1.getFeedbacks().add(f5a1);

        var aligner2FeedbackStartTime = ZonedDateTime.of(2023, 11, 15, 16, 33, 9, 34, ZoneId.systemDefault());
        var aligner2 = alignerJourney.getAligners().get(1);
        var f1a2 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.ALIGNER_CHANGE)
                .feedback(AlignerChangeFeedbackDetails.builder()
                        .alignerFittingFeedback(new AlignerFittingFeedback(Set.of(PERFECT_FIT)))
                        .alignerChangingFeedback(new AlignerChangingFeedback(
                                List.of(AlignerChangingFeedback.AlignerChangingIssue.SHARP_EDGES)))
                        .otherIssues(
                                "I've noticed some sharp edges on the right side of my upper aligner, and it's irritating my gum.")
                        .build())
                .aligner(aligner2)
                .build();
        f1a2.setCreatedAt(aligner2FeedbackStartTime);
        f1a2 = alignerFeedbackRepository.save(f1a2);
        aligner2.getFeedbacks().add(f1a2);

        var f2a2 = AlignerFeedback.builder()
                .feedbackerUserId(doctorId)
                .feedbackerUserType(UserType.DOCTOR)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage(
                                "I'm sorry to hear that. Could you try using a nail file to gently smooth out the edges? Let me know if it helps.")
                        .build())
                .aligner(aligner2)
                .build();
        f2a2.setCreatedAt(aligner2FeedbackStartTime.plusMinutes(30));
        f2a2 = alignerFeedbackRepository.save(f2a2);
        aligner2.getFeedbacks().add(f2a2);

        var f3a2 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage("Sure, I'll give it a try. How often should I do that?")
                        .build())
                .aligner(aligner2)
                .build();
        f3a2.setCreatedAt(aligner2FeedbackStartTime.plusMinutes(34));
        f3a2 = alignerFeedbackRepository.save(f3a2);
        aligner2.getFeedbacks().add(f3a2);

        var f4a2 = AlignerFeedback.builder()
                .feedbackerUserId(doctorId)
                .feedbackerUserType(UserType.DOCTOR)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage(
                                "Just as needed, whenever you feel any discomfort. If it persists or worsens, let me know, and we'll explore other solutions.")
                        .build())
                .aligner(aligner2)
                .build();
        f4a2.setCreatedAt(aligner2FeedbackStartTime.plusMinutes(40));
        f4a2 = alignerFeedbackRepository.save(f4a2);
        aligner2.getFeedbacks().add(f4a2);

        var f5a2 = AlignerFeedback.builder()
                .feedbackerUserId(patientId)
                .feedbackerUserType(UserType.PATIENT)
                .feedbackType(AlignerFeedbackType.MISC)
                .feedback(MiscAlignerFeedbackDetails.builder()
                        .feedbackMessage("Okay, thanks Doctor! I appreciate your help.")
                        .build())
                .aligner(aligner2)
                .build();
        f5a2.setCreatedAt(aligner2FeedbackStartTime.plusMinutes(55));
        f5a2 = alignerFeedbackRepository.save(f5a2);
        aligner2.getFeedbacks().add(f5a2);

        return alignerJourneyRepository.saveAndFlush(alignerJourney);
    }

    private void addEvents(AlignerJourney alignerJourney) {
        var alignerJourneyId = alignerJourney.getId();
        var patientId = alignerJourney.getPatient().getId();
        var doctorId = alignerJourney.getDoctorId();

        var treatmentCreation = LocalDateTime.of(TREATMENT_CREATION_DATE, LocalTime.now());
        var event = Event.builder()
                .type(EventType.TREATMENT_SETUP)
                .userId(doctorId)
                .userType(UserType.DOCTOR)
                .forUserId(patientId)
                .forUserType(UserType.PATIENT)
                .eventTime(treatmentCreation)
                .metadata(TreatmentSetupEventMetadata.builder()
                        .alignerJourneyDetails(AlignerJourneyDetails.from(alignerJourney))
                        .build())
                .active(true)
                .build();
        event.setCreatedAt(ZonedDateTime.of(treatmentCreation, ZoneId.systemDefault()));
        eventRepository.saveAndFlush(event);

        var aligner1 = alignerJourney.getAligner(1);
        var aligner2 = alignerJourney.getAligner(2);
        var aligner3 = alignerJourney.getAligner(3);

        event = Event.builder()
                .type(EventType.ALIGNER_CHANGE)
                .userId(patientId)
                .userType(UserType.PATIENT)
                .forUserId(doctorId)
                .eventTime(LocalDateTime.of(2023, 11, 11, 14, 2, 4))
                .metadata(AlignerChangeEventEventMetadata.builder()
                        .previousAlignerNo(1)
                        .previousAlignerJawType(UPPER)
                        .newAlignerNo(2)
                        .newAlignerJawType(UPPER)
                        .alignerJourneyId(alignerJourneyId)
                        .previousAlignerStartDate(LocalDate.of(2023, 11, 2))
                        .previousAlignerEndDate(LocalDate.of(2023, 11, 11))
                        .previousAlignerChangeDate(LocalDate.of(2023, 11, 11))
                        .previousAlignerChangeStatus(AlignerChangeStatus.ON_TIME)
                        .previousAlignerCompliance(Compliance.POOR)
                        .previousAlignerAvgWearTimeInSecs(Optional.ofNullable(aligner1.avgWearTimeInSecs(true, true))
                                .orElse(0f))
                        .previousAlignerFeedbacks(aligner1.getFeedbacks().stream()
                                .map(AlignerFeedbackDetails::from)
                                .toList())
                        .previousAlignerPhotos(aligner1.getPhotos().stream()
                                .map(AlignerPhotoDetails::from)
                                .toList())
                        .newAlignerPhotos(aligner2.getPhotos().stream()
                                .map(AlignerPhotoDetails::from)
                                .toList())
                        .validated(true)
                        .validatedAt(ZonedDateTime.of(2023, 11, 11, 16, 2, 4, 0, ZoneId.systemDefault()))
                        .build())
                .forUserType(UserType.DOCTOR)
                .active(true)
                .build();
        event.setCreatedAt(ZonedDateTime.of(2023, 11, 11, 5, 5, 12, 0, ZoneId.systemDefault()));
        eventRepository.saveAndFlush(event);

        event = Event.builder()
                .type(EventType.ALIGNER_CHANGE)
                .userId(patientId)
                .userType(UserType.PATIENT)
                .forUserId(doctorId)
                .eventTime(LocalDateTime.of(2023, 11, 20, 14, 2, 4))
                .metadata(AlignerChangeEventEventMetadata.builder()
                        .previousAlignerNo(2)
                        .previousAlignerJawType(UPPER)
                        .newAlignerNo(3)
                        .newAlignerJawType(BOTH)
                        .alignerJourneyId(alignerJourneyId)
                        .previousAlignerStartDate(LocalDate.of(2023, 11, 11))
                        .previousAlignerEndDate(LocalDate.of(2023, 11, 20))
                        .previousAlignerChangeDate(LocalDate.of(2023, 11, 20))
                        .previousAlignerChangeStatus(AlignerChangeStatus.ON_TIME)
                        .previousAlignerCompliance(Compliance.AVERAGE)
                        .previousAlignerAvgWearTimeInSecs(Optional.ofNullable(aligner2.avgWearTimeInSecs(true, true))
                                .orElse(0f))
                        .previousAlignerFeedbacks(aligner2.getFeedbacks().stream()
                                .map(AlignerFeedbackDetails::from)
                                .toList())
                        .previousAlignerPhotos(aligner2.getPhotos().stream()
                                .map(AlignerPhotoDetails::from)
                                .toList())
                        .newAlignerPhotos(aligner3.getPhotos().stream()
                                .map(AlignerPhotoDetails::from)
                                .toList())
                        .validated(true)
                        .validatedAt(ZonedDateTime.of(2023, 11, 20, 16, 2, 4, 0, ZoneId.systemDefault()))
                        .build())
                .forUserType(UserType.DOCTOR)
                .active(true)
                .build();
        eventRepository.saveAndFlush(event);

        event = Event.builder()
                .eventTime(LocalDateTime.of(2023, 11, 29, 9, 2, 4))
                .type(EventType.NOT_WEARING_FOR_RECOMMENDED_HOURS)
                .userId(patientId)
                .userType(UserType.PATIENT)
                .forUserId(doctorId)
                .forUserType(UserType.DOCTOR)
                .metadata(NotWearingForRecommendedHoursEventMetadata.builder()
                        .patientDetails(PatientDetails.from(alignerJourney.getPatient()))
                        .currentAlignerNo(3)
                        .avgWearTimeInSecs(aligner3.avgWearTimeInSecs(true, true))
                        .compliance(Compliance.POOR)
                        .noOfDaysWorn(5L)
                        .build())
                .build();
        eventRepository.saveAndFlush(event);
    }

    @Override
    public SampleDataIds generateSampleDateIfRequired() {
        generateIfRequired();
        return getSampleDataIds();
    }

    @Override
    public SampleDataIds getSampleDataIds() {
        var patient = patientRepository
                .findByUUID(SAMPLE_PATIENT_UUID)
                .orElseThrow(() -> new FailToFetchSampleDataException("Failed to fetch sample patient"));
        var alignerJourney = alignerJourneyRepository.findByPatientId(patient.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new FailToFetchSampleDataException("Failed to fetch sample aligner journey"));
        var doctor = doctorService.getSampleDoctor(patient.getId(), alignerJourney.getId());

        return new SampleDataIds(patient.getId(), doctor.getDoctorId(), alignerJourney.getId());
    }

    @Override
    @Transactional
    public void deleteSampleData() {
        var patient = patientRepository
                .findByUUID(SAMPLE_PATIENT_UUID)
                .orElseThrow(() -> new FailToFetchSampleDataException("Failed to fetch sample patient"));
        var alignerJourney = alignerJourneyRepository.findByPatientId(patient.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new FailToFetchSampleDataException("Failed to fetch sample aligner journey"));
        var doctor = doctorService.getSampleDoctor(patient.getId(), alignerJourney.getId());

        var patientId = patient.getId();
        var doctorId = doctor.getDoctorId();
        var events = eventRepository.findByUserIdAndUserType(patientId, UserType.PATIENT);
        events.addAll(eventRepository.findByForUserIdAndForUserType(patientId, UserType.PATIENT));
        events.addAll(eventRepository.findByUserIdAndUserType(doctorId, UserType.DOCTOR));
        events.addAll(eventRepository.findByForUserIdAndForUserType(doctorId, UserType.DOCTOR));

        alignerJourneyRepository.delete(alignerJourney);
        patientRepository.delete(patient);
        eventRepository.deleteAll(events);
    }

    public Patient saveSamplePatient() {
        var patient = Patient.builder()
                .firstName("Rishang")
                .lastName("Jain")
                .profilePictureUrl(
                        "https://dev-patient-gallery.s3.ap-south-1.amazonaws.com/sampledata/profile_photo/Emily+Johnson+Profile+photo.png")
                .age(28)
                .mobileNo(SAMPLE_PATIENT_MOBILE)
                .countryCode(CountryCode.IND)
                .patientStatus(PatientStatus.ACTIVE)
                .email(SAMPLE_PATIENT_EMAIL)
                .isEmailVerified(true)
                .UUID(SAMPLE_PATIENT_UUID)
                .build();

        var login = PatientLogin.builder()
                .mobileNo(SAMPLE_PATIENT_MOBILE)
                .countryCode(CountryCode.IND)
                .lastLoginAt(ZonedDateTime.now())
                .patient(patient)
                .build();
        var kyc = PatientKYC.builder()
                .patient(patient)
                .mobileVerified(true)
                .emailVerified(true)
                .build();
        var address = Address.builder()
                .line1("A-Sample apartment, Sample street")
                .city("Mumbai")
                .state("Maharastra")
                .country("India")
                .pincode(567898)
                .active(true)
                .patient(patient)
                .build();

        patient.setPatientLogin(login);
        patient.setAddresses(Collections.singletonList(address));

        return patientRepository.saveAndFlush(patient);
    }

    private AlignerJourney saveSampleAlignerJourney(Patient patient) {
        assert patient != null;

        var firstAlignerStartDate = TREATMENT_CREATION_DATE;
        var doctorTreatmentStartDate = TREATMENT_CREATION_DATE;
        var treatmentEndDate = LocalDate.of(2023, 11, 22);
        var totalAligners = 10;
        var noOfDaysToWearEachAligner = 10;
        var daysWornList = List.of(10, 10);
        var currentAlignerDaysWorn = 8;
        var jawTypeList = List.of(UPPER, UPPER, BOTH, BOTH, BOTH, BOTH, BOTH, LOWER, LOWER, LOWER);
        assert jawTypeList.size() == totalAligners;

        var alignerJourney = AlignerJourney.builder()
                .patient(patient)
                .treatmentType("Clear Aligners")
                .treatmentSubType("Clear Aligners")
                .brand("SureSmile")
                .treatmentStage(TreatmentStage.MID)
                .creationStatus(CreationStatus.DONE)
                .progressStatus(ProgressStatus.DEACTIVATED)
                .daysToWearEachAligner(noOfDaysToWearEachAligner)
                .recommendedHoursToWearAligners(22)
                .currentAlignerNo(3)
                .startAlignerNo(3)
                .doctorTreatmentStartDate(doctorTreatmentStartDate)
                .patientTreatmentStartDate(doctorTreatmentStartDate)
                .doctorTreatmentEndDate(treatmentEndDate)
                .build();
        var aligners = new ArrayList<Aligner>();

        var start = firstAlignerStartDate;
        for (int i = 0; i < totalAligners; ++i) {
            var endDate = start.plusDays(noOfDaysToWearEachAligner - 1);
            LocalDate changeDate = null;
            if (i < daysWornList.size()) {
                changeDate = start.plusDays(daysWornList.get(i) - 1);
            }

            var aligner = Aligner.builder()
                    .alignerJourney(alignerJourney)
                    .srNo(i + 1)
                    .startDate(start)
                    .endDate(endDate)
                    .changeDate(changeDate)
                    .jawType(jawTypeList.get(i))
                    .noOfDaysToWear(noOfDaysToWearEachAligner)
                    .build();
            aligners.add(aligner);

            if (i < daysWornList.size()) {
                start = changeDate;
            } else {
                start = endDate;
            }
        }
        alignerJourney.setAligners(aligners);

        fillDailyWearTimeRecords(
                aligners.get(0),
                List.of(11, 18, 14, 17, 19, 21, 12, 11, 14, 14),
                daysWornList.get(0),
                firstAlignerStartDate);

        fillDailyWearTimeRecords(
                aligners.get(1),
                List.of(6, 18, 18, 18, 20, 18, 20, 22, 20, 20, 20),
                daysWornList.get(1),
                aligners.get(1).getStartDate());

        fillDailyWearTimeRecords(
                aligners.get(2),
                List.of(15, 6, 21, 20, 17, 21, 11, 19),
                currentAlignerDaysWorn,
                aligners.get(2).getStartDate());

        addPhotosByPatient(alignerJourney);

        return alignerJourneyRepository.save(alignerJourney);
    }

    private void fillDailyWearTimeRecords(
            Aligner aligner, List<Integer> wearTimeHours, Integer daysWorn, LocalDate startDate) {
        assert wearTimeHours.size() == daysWorn;
        var date = startDate;
        for (int i = 0; i < daysWorn; i++) {
            var record = DailyAlignerWearTime.newRecord(date, aligner);
            record.updateStatus(wearTimeHours.get(i) * 3600L);
            date = date.plusDays(1);
            aligner.getDailyWearTimeRecords().add(record);
        }
    }
}
