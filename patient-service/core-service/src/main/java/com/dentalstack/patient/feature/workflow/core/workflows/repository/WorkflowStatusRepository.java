package com.dentalstack.patient.feature.workflow.core.workflows.repository;

import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkflowStatusRepository extends JpaRepository<WorkflowStatus, Long> {
    List<WorkflowStatus> findByWorkflow_IdOrderByPositionAsc(Long workflowId);

    @Query("SELECT ws FROM WorkflowStatus ws " + "WHERE ws.workflow.id = :workflowId "
            + "AND ws.name = :statusName "
            + "AND ws.custom = false")
    Optional<WorkflowStatus> findByWorkflowIdAndStatusNameAndCustomFalse(
            @Param("workflowId") Long workflowId, @Param("statusName") String statusName);

    @Query("SELECT ws FROM WorkflowStatus ws " + "JOIN FETCH ws.workflow w " + "WHERE ws.id = :id")
    Optional<WorkflowStatus> findByIdAndCustomFalseWithWorkflow(@Param("id") Long id);

    @Modifying
    @Query("UPDATE WorkflowStatus s " + "SET s.position = s.position - 1 "
            + "WHERE s.workflow.id = :workflowId "
            + "AND s.position > :deletedPosition")
    void updatePositionsAfterDelete(
            @Param("workflowId") Long workflowId, @Param("deletedPosition") Integer deletedPosition);

    @Modifying
    @Transactional
    @Query("DELETE FROM WorkflowStatus s WHERE s.id = :id")
    void deleteWorkflowStatusById(@Param("id") Long id);
}
