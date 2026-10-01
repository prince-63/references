package com.dentalstack.patient.application.exception;

import com.dentalstack.patient.feature.aligner.exception.aligner.*;
import com.dentalstack.patient.feature.aligner.exception.aligner.action.AlignerActionNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.logs.ActiveSessionExistsException;
import com.dentalstack.patient.feature.aligner.exception.aligner.note.AlignerNoteNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.lab.AlignerProductionAlreadyExistsException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.lab.AlignerProductionLabNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.reminder.AlignerProductionOrderReminderNotFound;
import com.dentalstack.patient.feature.appointment.exception.*;
import com.dentalstack.patient.feature.blog.exception.BlogNotFoundException;
import com.dentalstack.patient.feature.blog.exception.FailedToParseBlogDetails;
import com.dentalstack.patient.feature.braces.exception.BracesNotFoundException;
import com.dentalstack.patient.feature.bracket.exception.BracketNameAlreadyPresentException;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordAlreadyExistsException;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordNotFoundException;
import com.dentalstack.patient.feature.consent_template.exception.ConsentTemplateNotFoundException;
import com.dentalstack.patient.feature.consent_template.exception.DefaultConsentTemplateNotFoundException;
import com.dentalstack.patient.feature.consent_template.exception.InactiveConsentTemplateException;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.exception.NoPatientAddedException;
import com.dentalstack.patient.feature.doctor.exception.PracticeLocationNotFoundException;
import com.dentalstack.patient.feature.doctorinvitation.exception.*;
import com.dentalstack.patient.feature.faq.exception.FAQNotFoundException;
import com.dentalstack.patient.feature.invitation.exception.*;
import com.dentalstack.patient.feature.material.exception.MaterialAlreadyPresentException;
import com.dentalstack.patient.feature.order.exception.ManufacturingNotFoundException;
import com.dentalstack.patient.feature.order.exception.OrderException;
import com.dentalstack.patient.feature.order.exception.ShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.patient.exception.*;
import com.dentalstack.patient.feature.patient_onboarding.exception.InvalidOnboardingTransitionException;
import com.dentalstack.patient.feature.payment.exception.IncorrectTreatmentCostException;
import com.dentalstack.patient.feature.payment.exception.PaymentNotFoundException;
import com.dentalstack.patient.feature.rbac.exception.AccessControlException;
import com.dentalstack.patient.feature.reminder.exception.*;
import com.dentalstack.patient.feature.sampledata.exception.FailToFetchSampleDataException;
import com.dentalstack.patient.feature.storage.files.exception.*;
import com.dentalstack.patient.feature.storage.gallery.exception.*;
import com.dentalstack.patient.feature.subcription.exception.OrderLimitExceededException;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.exception.SubscriptionNotFoundException;
import com.dentalstack.patient.feature.timeline.exception.EventNotFoundException;
import com.dentalstack.patient.feature.tracking.exception.SomePatientAlreadyHaveTrackingEnabledException;
import com.dentalstack.patient.feature.tracking.exception.TrackingNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.ActiveTreatmentPlanFoundException;
import com.dentalstack.patient.feature.treatment.exception.FailedToParseCreateTreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.workflow.core.task_tracker.exception.*;
import com.dentalstack.patient.feature.workflow.core.workflows.exception.WorkStatusFlowNotFoundException;
import com.dentalstack.patient.feature.workflow.core.workflows.exception.WorkflowNotFoundException;
import com.dentalstack.patient.feature.workflow.product.exception.AtLeastOneServiceProductExistsException;
import com.dentalstack.patient.global.dto.ErrorInfo;
import com.dentalstack.patient.global.exception.*;
import jakarta.validation.ConstraintViolationException;
import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Slf4j
@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    private String getRequestUri(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    private ErrorInfo buildErrorInfo(String url, String message, BusinessErrorCode errorCode, HttpStatus status) {
        return ErrorInfo.builder()
                .url(url)
                .message(message)
                .errorCode(errorCode)
                .build();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ConstraintViolationException.class)
    protected ResponseEntity<ErrorInfo> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {

        String url = getRequestUri(request);

        Map<String, String> validationErrors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String field = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            validationErrors.put(field, message);
        });

        String errorMessage = "Constraint validation failed: "
                + validationErrors.entrySet().stream()
                        .map(entry -> entry.getKey() + " - " + entry.getValue())
                        .collect(Collectors.joining(", "));

        log.warn("Constraint violation at {}: {}", url, errorMessage);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorInfo.builder()
                        .url(url)
                        .message(errorMessage)
                        .errorCode(null)
                        .build());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        String url = getRequestUri(request);

        Map<String, String> validationErrors = new HashMap<>();
        List<ObjectError> validationErrorList = ex.getBindingResult().getAllErrors();

        validationErrorList.forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String validationMsg = error.getDefaultMessage();
            validationErrors.put(fieldName, validationMsg);
        });

        String errorMessage = "Validation failed: "
                + validationErrors.entrySet().stream()
                        .map(entry -> entry.getKey() + " - " + entry.getValue())
                        .collect(Collectors.joining(", "));

        log.warn("Method argument validation failed at {}: {}", url, errorMessage);

        ErrorInfo errorInfo = ErrorInfo.builder()
                .url(url)
                .message(errorMessage)
                .errorCode(null)
                .build();

        return new ResponseEntity<>(errorInfo, HttpStatus.BAD_REQUEST);
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<ErrorInfo> handleAccessDenied(AccessDeniedException e, WebRequest req) {
        String url = getRequestUri(req);
        String message = "Access denied: " + (e.getMessage() != null ? e.getMessage() : "Insufficient permissions");

        log.warn(
                "Access denied at {}: {} - ExceptionType: {}",
                url,
                message,
                e.getClass().getSimpleName());

        ErrorInfo errorInfo =
                ErrorInfo.builder().url(url).message(message).errorCode(null).build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorInfo);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(
            value = {
                BadRequestException.class,
                BlogNotFoundException.class,
                FAQNotFoundException.class,
                PatientNotFoundException.class,
                PatientAlreadyAssignedToDoctorException.class,
                DoctorNotAssignedToPatientException.class,
                PatientAlreadyExistsException.class,
                ConsentTemplateNotFoundException.class,
                DefaultConsentTemplateNotFoundException.class,
                InactiveConsentTemplateException.class,
                FailedToParseAlignerPhotoDetails.class,
                AlignerPhotoAlreadyExistsException.class,
                PhotoNotUploadedException.class,
                PhotoMappingNotFoundException.class,
                MaxUploadSizeExceededException.class,
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
                AlignerProductionLabNotFoundException.class,
                AlignerProductionAlreadyExistsException.class,
                MaximumLimitOfResentInvitationReachedException.class,
                PatientInvitationAlreadyExistsException.class,
                ReminderAlreadyExistsException.class,
                EventNotFoundException.class,
                AlignerProductionOrderReminderNotFound.class,
                AlignerNoteNotFoundException.class,
                FailedToParseCreateAppointment.class,
                FailedToParse.class,
                AppointmentNotFoundException.class,
                AppointmentReminderNotFoundException.class,
                AppointmentAlreadyExistsException.class,
                AlreadyExistingPatientOverviewNotAvailableException.class,
                CaseRecordNotFoundException.class,
                CaseRecordAlreadyExistsException.class,
                AppointmentReminderAlreadyExistException.class,
                UserNotFoundException.class,
                NoPatientAddedException.class,
                InvitationAlreadyExistsForEmailException.class,
                InvitationAlreadyExistsForMobileException.class,
                DoctorInvitationNotFoundException.class,
                DifferentOrgException.class,
                InvitationException.class,
                BracesNotFoundException.class,
                UserAlreadyInvitedException.class,
                FailedToGenerateInvitationCodeException.class,
                InvalidInviteCodeException.class,
                PatientInvitationNotFoundException.class,
                DoctorNotFoundException.class,
                BracesPatientFoundException.class,
                OrderException.class,
                ShippingDetailsNotFoundException.class,
                InvalidFullPathException.class,
                FileAlreadyExistsException.class,
                FilesNotSupportException.class,
                ParentFileNotFoundException.class,
                InvalidFilePermissionsException.class,
                FileNotFoundException.class,
                ActiveSessionExistsException.class,
                PaymentNotFoundException.class,
                IncorrectTreatmentCostException.class,
                ReminderNotFoundException.class,
                ReminderAlreadyTriggeredException.class,
                MaterialAlreadyPresentException.class,
                BracketNameAlreadyPresentException.class,
                ActiveTreatmentPlanFoundException.class,
                TreatmentPlanNotFoundException.class,
                TreatmentNotFoundException.class,
                AlignerActionNotFoundException.class,
                TrackingNotFoundException.class,
                SubscriptionNotFoundException.class,
                OrderLimitExceededException.class,
                StorageLimitExceededException.class,
                OrgNameMismatchException.class,
                OwnerDoctorAccessDeniedException.class,
                PracticeLocationNotFoundException.class,
                ManufacturingNotFoundException.class,
                ForbiddenException.class,
                GenericException.class,
                NoTreatmentPlanAvailableException.class,
                InvalidRevisionFromClosedOrApprovedException.class,
                WorkflowNotFoundException.class,
                WorkStatusFlowNotFoundException.class,
                PatientTaskNotFoundException.class,
                PatientTaskAlreadyPresentFoundException.class,
                NoActivePlanForRevisionException.class,
                NoTreatmentPlanApprovedException.class,
                CannotMoveTaskException.class,
                NoPlansReadyForReviewException.class,
                NoPlansToReviseException.class,
                NoPlansToApproveException.class,
                SomePatientAlreadyHaveTrackingEnabledException.class,
                AtLeastOneServiceProductExistsException.class,
                InvalidOnboardingTransitionException.class,
                AccessControlException.class,
            })
    protected ResponseEntity<ErrorInfo> handleBadRequest(RuntimeException e, WebRequest req) {
        String url = getRequestUri(req);
        BusinessErrorCode errorCode = null;
        String message = e.getLocalizedMessage();

        if (e instanceof BusinessException be) {
            errorCode = be.getErrorCode();
            message = be.getMessage();
        }

        log.warn(
                "Bad request exception at {}: {} - ExceptionType: {}",
                url,
                message,
                e.getClass().getSimpleName());

        ErrorInfo errorInfo = buildErrorInfo(url, message, errorCode, HttpStatus.BAD_REQUEST);

        return ResponseEntity.badRequest().body(errorInfo);
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(
            value = {
                FailedToUploadPatientProfilePictureException.class,
                FailedToUploadAlignerPhotoException.class,
                FailedToParseBlogDetails.class,
                FailToFetchSampleDataException.class,
                FailedToScheduleReminderException.class,
                FailedToMoveFileException.class,
                FailedToDownloadFileException.class,
            })
    protected ResponseEntity<ErrorInfo> handleInternalServerError(RuntimeException e, WebRequest req) {
        String url = getRequestUri(req);
        BusinessErrorCode errorCode = null;
        String message = e.getLocalizedMessage();

        if (e instanceof BusinessException be) {
            errorCode = be.getErrorCode();
            message = be.getMessage();
        }

        log.error(
                "Internal server error at {}: {} - ExceptionType: {}",
                url,
                message,
                e.getClass().getSimpleName(),
                e);

        ErrorInfo errorInfo = buildErrorInfo(url, message, errorCode, HttpStatus.INTERNAL_SERVER_ERROR);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorInfo);
    }

    @ExceptionHandler(org.apache.catalina.connector.ClientAbortException.class)
    protected ResponseEntity<Void> handleClientAbortException(
            org.apache.catalina.connector.ClientAbortException e, WebRequest req) {
        String url = getRequestUri(req);
        log.debug("Client disconnected while processing request at {}: {}", url, e.getMessage());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorInfo> handleGenericException(Exception e, WebRequest req) {
        String url = getRequestUri(req);

        log.error(
                "Unhandled exception occurred at {}: {} - ExceptionType: {}",
                url,
                e.getMessage(),
                e.getClass().getName(),
                e);

        String errorMessage = "An unexpected error occurred: "
                + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());

        ErrorInfo errorInfo = ErrorInfo.builder()
                .url(url)
                .message(errorMessage)
                .errorCode(null)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorInfo);
    }
}
