package com.dentalstack.patient.feature.workflow.mytask.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.mytask.dto.*;
import com.dentalstack.patient.feature.workflow.mytask.entity.MyTask;
import com.dentalstack.patient.feature.workflow.mytask.repository.MyTaskRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MyTaskServiceImpl implements MyTaskService {

    private final MyTaskRepository myTaskRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    public void addMyTask(MyTaskRequestDTO request) {
        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getProfileId()));
        MyTask myTask = MyTask.fromMyTask(request);

        if (request.getAssigneeProfileId() != null) {
            UserProfile assigneeProfile = userProfileRepository
                    .findById(request.getAssigneeProfileId())
                    .orElse(null);
            myTask.setAssignee(assigneeProfile);
        }

        myTask.setPatient(patient);
        myTask.setAddedBy(userProfile);
        myTaskRepository.save(myTask);
    }

    @Override
    public void updateMyTask(MyTaskUpdateRequest request) {
        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getProfileId()));

        Optional<UserProfile> assigneeProfile = Optional.empty();
        if (request.getAssigneeProfileId() != null) {
            assigneeProfile = userProfileRepository.findById(request.getAssigneeProfileId());
        }

        var myTask = myTaskRepository
                .findByIdAndType(request.getMyTaskId())
                .orElseThrow(() -> new GenericException("Task not found"));

        myTask.setAddedBy(userProfile);
        myTask.setAssignee(assigneeProfile.orElse(null));
        Optional.ofNullable(request.getStatus()).ifPresent(myTask::setStatus);
        Optional.ofNullable(request.getPriority()).ifPresent(myTask::setPriority);
        Optional.ofNullable(request.getTitle()).ifPresent(myTask::setTitle);
        Optional.ofNullable(request.getDescription()).ifPresent(myTask::setDescription);
        Optional.ofNullable(request.getDueDate()).ifPresent(myTask::setDueDate);

        myTaskRepository.save(myTask);
    }

    @Override
    public MyTaskResponseDTO getTaskById(MyTaskGetRequestDTO request) {
        MyTask myTasks = myTaskRepository
                .findMyTaskByIdWithJoins(request.getMyTaskId())
                .orElseThrow(() -> new GenericException("Task not found"));
        return MyTaskResponseDTO.from(myTasks);
    }

    @Override
    public List<MyTaskResponseDTO> getAllMyTasks(MyTaskGetRequestByFilterDTO request) {
        List<MyTask> myTasks;

        myTasks = myTaskRepository.findAllMyTasksWithJoins(
                request.getPatientId(), request.getAssigneeProfileId(), request.getFilter());

        return myTasks.stream().map(MyTaskResponseDTO::from).collect(Collectors.toList());
    }

    @Override
    public void deleteByTaskId(Long taskId) {
        myTaskRepository.deleteById(taskId);
    }
}
