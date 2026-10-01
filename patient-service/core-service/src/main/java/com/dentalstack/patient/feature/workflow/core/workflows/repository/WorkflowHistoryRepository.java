package com.dentalstack.patient.feature.workflow.core.workflows.repository;

import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, Long> {

    @Query(
            """
    SELECT wh FROM WorkflowHistory wh
    WHERE wh.workflow.id = :workflowId
    AND (:changeType IS NULL OR wh.changeType = :changeType)
    ORDER BY wh.createdAt DESC
""")
    Page<WorkflowHistory> findByFilters(
            @Param("workflowId") Long workflowId, @Param("changeType") String changeType, Pageable pageable);
}
