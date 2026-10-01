package com.dentalstack.patient.feature.dailywins.service;

import com.dentalstack.patient.feature.dailywins.dto.DailyTaskResponse;
import com.dentalstack.patient.feature.dailywins.entity.DailyWins;
import com.dentalstack.patient.feature.dailywins.entity.PatientDailyWins;
import com.dentalstack.patient.feature.dailywins.repository.DailyTaskRepository;
import com.dentalstack.patient.feature.dailywins.repository.PatientDailyTaskRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DailyTaskService {

    private final PatientRepository patientRepo;
    private final DailyTaskRepository taskRepo;
    private final PatientDailyTaskRepository patientTaskRepo;

    @Transactional
    public List<DailyTaskResponse> getTodayTasks(Long patientId) {
        Patient patient = patientRepo.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));
        LocalDate today = LocalDate.now();
        List<DailyWins> tasks = taskRepo.findAll();
        List<DailyTaskResponse> responseList = new ArrayList<>();
        for (DailyWins task : tasks) {
            PatientDailyWins patientTask = patientTaskRepo
                    .findByPatientAndDailyTaskAndTaskDate(patient, task, today)
                    .orElseGet(() -> patientTaskRepo.save(PatientDailyWins.builder()
                            .patient(patient)
                            .dailyTask(task)
                            .taskDate(today)
                            .completed(false)
                            .build()));
            responseList.add(new DailyTaskResponse(
                    task.getId(),
                    task.getCode(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getPoints(),
                    patientTask.getCompleted()));
        }

        return responseList;
    }

    @Transactional
    public void completeTask(Long patientId, String code) {
        Patient patient = patientRepo.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));
        DailyWins task = taskRepo.findByCode(code).orElseThrow(() -> new RuntimeException("Invalid task code"));
        PatientDailyWins patientTask = patientTaskRepo
                .findByPatientAndDailyTaskAndTaskDate(patient, task, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Task not initialized"));
        if (!patientTask.getCompleted()) {
            patientTask.setCompleted(true);
            patientTask.setCompletedAt(LocalDateTime.now());
        }
    }
}
