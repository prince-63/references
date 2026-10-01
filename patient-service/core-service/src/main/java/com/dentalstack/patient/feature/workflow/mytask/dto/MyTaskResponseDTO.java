package com.dentalstack.patient.feature.workflow.mytask.dto;

import com.dentalstack.patient.feature.workflow.mytask.entity.MyTask;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskPriority;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import java.time.LocalDate;
import lombok.Data;

@Data
public class MyTaskResponseDTO {
    private Long myTaskId;
    private Long patientId;
    private Long addedByProfileId;
    private Long assigneeProfileId;
    private String assigneeName;
    private String title;
    private String description;
    private LocalDate dueDate;
    private MyTaskStatus status;
    private MyTaskPriority priority;

    public static MyTaskResponseDTO from(MyTask myTask) {
        MyTaskResponseDTO dto = new MyTaskResponseDTO();
        var addedByUser = myTask.getAddedBy();
        var assigneeUser = myTask.getAssignee();
        dto.setMyTaskId(myTask.getId());
        dto.setPatientId(myTask.getPatient().getId());
        dto.setAddedByProfileId(addedByUser.getId());
        dto.setAssigneeProfileId((assigneeUser != null ? assigneeUser.getId() : null));
        dto.setAssigneeName(assigneeUser != null ? assigneeUser.getUser().fullNameWithSalutation() : null);
        dto.setTitle(myTask.getTitle());
        dto.setDescription(myTask.getDescription());
        dto.setStatus(myTask.getStatus());
        dto.setPriority(myTask.getPriority());
        dto.setDueDate(myTask.getDueDate());
        return dto;
    }
}
