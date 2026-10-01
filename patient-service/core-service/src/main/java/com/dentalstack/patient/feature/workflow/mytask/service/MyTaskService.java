package com.dentalstack.patient.feature.workflow.mytask.service;

import com.dentalstack.patient.feature.workflow.mytask.dto.*;
import java.util.List;

public interface MyTaskService {

    void addMyTask(MyTaskRequestDTO request);

    void updateMyTask(MyTaskUpdateRequest request);

    MyTaskResponseDTO getTaskById(MyTaskGetRequestDTO request);

    List<MyTaskResponseDTO> getAllMyTasks(MyTaskGetRequestByFilterDTO request);

    void deleteByTaskId(Long taskId);
}
