package com.dentalstack.patient.feature.workflow.mytask.repository;

import com.dentalstack.patient.feature.workflow.mytask.entity.MyTask;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MyTaskRepository extends JpaRepository<MyTask, Long> {

    @Query("SELECT mt FROM MyTask mt " + "LEFT JOIN FETCH mt.addedBy ab "
            + "LEFT JOIN FETCH ab.user abu "
            + "LEFT JOIN FETCH mt.assignee a "
            + "LEFT JOIN FETCH a.user au "
            + "LEFT JOIN FETCH mt.patient p "
            + "WHERE (:patientId IS NULL OR mt.patient.id = :patientId) "
            + "AND (:assigneeProfileId IS NULL OR mt.assignee.id = :assigneeProfileId) "
            + "AND (:status IS NULL OR mt.status = :status) "
            + "ORDER BY mt.dueDate ASC, mt.status ASC, mt.id DESC")
    List<MyTask> findAllMyTasksWithJoins(
            @Param("patientId") Long patientId,
            @Param("assigneeProfileId") Long assigneeProfileId,
            @Param("status") MyTaskStatus status);

    @Query("SELECT mt FROM MyTask mt " + "LEFT JOIN FETCH mt.addedBy ab "
            + "LEFT JOIN FETCH ab.user abu "
            + "LEFT JOIN FETCH mt.assignee a "
            + "LEFT JOIN FETCH a.user au "
            + "LEFT JOIN FETCH mt.patient p "
            + "WHERE mt.id = :taskId")
    Optional<MyTask> findMyTaskByIdWithJoins(@Param("taskId") Long taskId);

    @Query("SELECT mt FROM MyTask mt " + "LEFT JOIN FETCH mt.addedBy ab "
            + "LEFT JOIN FETCH ab.user abu "
            + "LEFT JOIN FETCH mt.assignee a "
            + "LEFT JOIN FETCH a.user au "
            + "LEFT JOIN FETCH mt.patient p "
            + "WHERE mt.id = :taskId")
    Optional<MyTask> findByIdAndType(@Param("taskId") Long taskId);

    void deleteAllByPatientId(Long patientId);
}
