package com.dentalstack.patient.feature.feedback.service;

import com.dentalstack.patient.feature.feedback.dto.feedback.AddFeedbackRequest;
import com.dentalstack.patient.feature.feedback.entity.Feedback;
import com.dentalstack.patient.feature.feedback.repository.FeedbackRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final PatientRepository patientRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    public Feedback addFeedback(AddFeedbackRequest request) {
        Long patientId = request.getPatientId();
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        return feedbackRepository.save(Feedback.from(request, patient));
    }

    @Override
    public List<Feedback> getAllFeedbacksByPatient(Long id) {
        return feedbackRepository.findAllById(List.of(id));
    }

    @Override
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }
}
