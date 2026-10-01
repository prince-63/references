package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.entity.OrderComments;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderCommentsRepository extends JpaRepository<OrderComments, Long> {
    List<OrderComments> findByOrderId(String orderId);

    @Query("SELECT oc FROM OrderComments oc " + "LEFT JOIN FETCH oc.addedBy ab "
            + "LEFT JOIN FETCH ab.user "
            + "LEFT JOIN FETCH oc.files f "
            + "WHERE oc.id = :id")
    Optional<OrderComments> findByIdWithUserProfile(@Param("id") Long id);

    @Query("SELECT oc FROM OrderComments oc " + "LEFT JOIN FETCH oc.addedBy ab "
            + "LEFT JOIN FETCH ab.user u "
            + "LEFT JOIN FETCH oc.patient p "
            + "LEFT JOIN FETCH oc.files f "
            + "WHERE oc.patient.id = :patientId "
            + "ORDER BY oc.id DESC")
    List<OrderComments> findByPatientIdWithUserProfile(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT oc FROM OrderComments oc
        LEFT JOIN FETCH oc.addedBy ab
        LEFT JOIN FETCH ab.user u
        LEFT JOIN FETCH oc.patient p
        WHERE oc.patient.id = :patientId
        ORDER BY oc.id DESC
    """,
            countQuery =
                    """
        SELECT COUNT(oc) FROM OrderComments oc
        WHERE oc.patient.id = :patientId
    """)
    Page<OrderComments> findByPatientIdWithUserProfileWithPagination(
            @Param("patientId") Long patientId, Pageable pageable);

    List<OrderComments> findByTaskIdIn(List<Long> taskIds);

    @Query("SELECT oc FROM OrderComments oc " + "LEFT JOIN FETCH oc.addedBy ab "
            + "LEFT JOIN FETCH oc.commentAddedFor caf "
            + "LEFT JOIN FETCH oc.files f "
            + "WHERE oc.patient.id = :patientId "
            + "AND (ab.id = :profileId OR caf.id = :profileId)")
    List<OrderComments> findByPatientIdAndProfileId(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
            SELECT oc FROM OrderComments oc
            LEFT JOIN FETCH oc.addedBy ab
            LEFT JOIN FETCH ab.user u
            LEFT JOIN FETCH oc.commentAddedFor caf
            LEFT JOIN FETCH oc.patient p
            WHERE oc.patient.id = :patientId
            AND (ab.id = :profileId OR caf.id = :profileId OR caf IS NULL)
            ORDER BY oc.id DESC
        """,
            countQuery =
                    """
            SELECT COUNT(oc) FROM OrderComments oc
            LEFT JOIN oc.addedBy ab
            LEFT JOIN oc.commentAddedFor caf
            WHERE oc.patient.id = :patientId
            AND (ab.id = :profileId OR caf.id = :profileId OR caf IS NULL)
        """)
    Page<OrderComments> findByPatientIdAndProfileIdWithPagination(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId, Pageable pageable);

    void deleteAllByPatientId(Long patientId);

    @Query(
            """
    SELECT oc.notes
    FROM OrderComments oc
    WHERE oc.profileId = :profileId
    ORDER BY oc.createdAt DESC
""")
    List<String> findLatestCommentByProfileId(@Param("profileId") Long profileId);

    Optional<OrderComments> findTopByTaskIdIsNotNullAndPatientIdOrderByCreatedAtDesc(Long patientId);
}
