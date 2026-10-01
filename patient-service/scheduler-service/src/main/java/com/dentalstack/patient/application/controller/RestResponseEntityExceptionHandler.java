package com.dentalstack.patient.application.controller;

import com.dentalstack.patient.feature.appointment.exception.*;
import com.dentalstack.patient.feature.billing.exception.IncorrectTreatmentCostException;
import com.dentalstack.patient.feature.billing.exception.PaymentNotFoundException;
import com.dentalstack.patient.feature.blog.exception.BlogNotFoundException;
import com.dentalstack.patient.feature.blog.exception.FailedToParseBlogDetails;
import com.dentalstack.patient.feature.bracket.exception.BracketNameAlreadyPresentException;
import com.dentalstack.patient.feature.doctor.exception.*;
import com.dentalstack.patient.feature.doctor.exception.PracticeLocationNotFoundException;
import com.dentalstack.patient.feature.events.exception.EventNotFoundException;
import com.dentalstack.patient.feature.faq.exception.FAQNotFoundException;
import com.dentalstack.patient.feature.material.exception.MaterialAlreadyPresentException;
import com.dentalstack.patient.feature.patient.exception.*;
import com.dentalstack.patient.feature.reminder.exception.*;
import com.dentalstack.patient.feature.storage.exception.*;
import com.dentalstack.patient.feature.tracking.exception.TrackingNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.*;
import com.dentalstack.patient.feature.treatment.exception.ActiveTreatmentPlanFoundException;
import com.dentalstack.patient.feature.treatment.exception.BracesNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.FailedToParseCreateTreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.action.AlignerActionNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.note.AlignerNoteNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.production.lab.AlignerProductionAlreadyExistsException;
import com.dentalstack.patient.feature.treatment.exception.production.lab.AlignerProductionLabNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.production.reminder.AlignerProductionOrderReminderNotFound;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.global.dto.ErrorInfo;
import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import com.dentalstack.patient.global.exception.FailToFetchSampleDataException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
            value = {
                BadRequestException.class,

                // Blog related
                BlogNotFoundException.class,

                // FAQ related
                FAQNotFoundException.class,

                // Patient related
                PatientNotFoundException.class,
                PatientAlreadyAssignedToDoctorException.class,
                DoctorNotAssignedToPatientException.class,
                PatientAlreadyExistsException.class,

                // Gallery related
                FailedToParseAlignerPhotoDetails.class,
                AlignerPhotoAlreadyExistsException.class,
                PhotoNotUploadedException.class,
                PhotoMappingNotFoundException.class,
                MaxUploadSizeExceededException.class,

                // Aligner related
                NoActiveAlignerJourneyFoundException.class,
                TreatmentNotStartedException.class,
                AlignerJourneyNotFoundException.class,
                AlignerJourneyPausedException.class,
                InvalidPatientInvitationException.class,
                AlignerNotFoundException.class,
                CurrentAlignerNotSetException.class,
                InvalidAddWearTimeRequestException.class,
                DefaultReminderNotFoundException.class,
                CustomReminderNotFoundException.class,
                FailedToParseChangeAlignerDetails.class,
                AlignersNotSetForAlignerJourneyException.class,
                DoctorTreatmentStartDateNotSetException.class,
                InvalidTreatmentCreationRequestException.class,
                AlignerJourneyCreationNotCompleteException.class,
                InvalidAttemptToSetWearTime.class,
                FailedToParseCreateTreatmentPlan.class,
                ActiveAlignerJourneyFoundException.class,
                AlignerJourneyDeactivatedException.class,

                // Aligner production lab related
                AlignerProductionLabNotFoundException.class,
                NoActiveAlignerJourneyFoundException.class,
                AlignerProductionAlreadyExistsException.class,

                // Invitation related
                MaximumLimitOfResentInvitationReachedException.class,
                PatientInvitationAlreadyExistsException.class,

                // Reminder related
                ReminderAlreadyExistsException.class,

                // Timeline related
                EventNotFoundException.class,

                // Aligner production reminder related
                AlignerProductionOrderReminderNotFound.class,

                // Aligner note related
                AlignerNoteNotFoundException.class,

                // Appointment related
                FailedToParseCreateAppointment.class,
                AppointmentNotFoundException.class,
                AppointmentReminderNotFoundException.class,
                AppointmentAlreadyExistsException.class,
                AppointmentReminderAlreadyExistException.class,

                // user
                UserNotFoundException.class,
                NoPatientAddedException.class,

                // braces related
                BracesNotFoundException.class,

                // Invitation related
                UserAlreadyInvitedException.class,
                FailedToGenerateInvitationCodeException.class,
                InvalidInviteCodeException.class,
                PatientInvitationNotFoundException.class,
                DoctorNotFoundException.class,
                BracesPatientFoundException.class,

                // Files related
                InvalidFullPathException.class,
                FileAlreadyExistsException.class,
                FilesNotSupportException.class,
                ParentFileNotFoundException.class,
                InvalidFilePermissionsException.class,
                FileNotFoundException.class,

                // Payments related
                PaymentNotFoundException.class,
                IncorrectTreatmentCostException.class,

                // Reminder related
                ReminderNotFoundException.class,
                ReminderAlreadyTriggeredException.class,
                DoctorNotFoundException.class,

                // Material related
                MaterialAlreadyPresentException.class,

                // Bracket related
                BracketNameAlreadyPresentException.class,

                // TreatmentPlan related
                ActiveTreatmentPlanFoundException.class,
                TreatmentPlanNotFoundException.class,
                TreatmentNotFoundException.class,

                // aligner action related
                AlignerActionNotFoundException.class,

                // Tracking related
                TrackingNotFoundException.class,

                // Practice location related
                PracticeLocationNotFoundException.class
            })
    protected ResponseEntity<ErrorInfo> handleBadRequest(RuntimeException e, WebRequest req) {
        BusinessErrorCode errorCode = null;
        if (e instanceof BusinessException be) errorCode = be.getErrorCode();

        return ResponseEntity.badRequest()
                .body(ErrorInfo.builder()
                        .url(((ServletWebRequest) req).getRequest().getRequestURI())
                        .message(e.getLocalizedMessage())
                        .errorCode(errorCode)
                        .build());
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(
            value = {
                // Patient related
                FailedToUploadPatientProfilePictureException.class,

                // Gallery related
                FailedToUploadAlignerPhotoException.class,

                // Blogs related
                FailedToParseBlogDetails.class,

                // Sample data related
                FailToFetchSampleDataException.class,

                // Reminder related
                FailedToScheduleReminderException.class,
                FailToFetchSampleDataException.class,

                // File related
                FailedToMoveFileException.class,
                FailedToDownloadFileException.class,
            })
    protected ResponseEntity<ErrorInfo> handleInternalServerError(RuntimeException e, WebRequest req) {
        BusinessErrorCode errorCode = null;
        if (e instanceof BusinessException be) errorCode = be.getErrorCode();

        return ResponseEntity.badRequest()
                .body(ErrorInfo.builder()
                        .url(((ServletWebRequest) req).getRequest().getRequestURI())
                        .message(e.getLocalizedMessage())
                        .errorCode(errorCode)
                        .build());
    }
}
