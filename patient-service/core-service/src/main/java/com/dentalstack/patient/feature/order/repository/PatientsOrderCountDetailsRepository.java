package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.entity.Order;
import feign.Param;
import jakarta.annotation.Nullable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientsOrderCountDetailsRepository extends JpaRepository<Order, Long> {

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE op.id IN (:profileIds)
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        """)
    long countSentOrdersByProfileId(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE tp.id IN (:profileIds)
        AND o.status != 'DRAFT'
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND r.name IN :roles
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        """)
    long countReceivedOrdersByProfileIdAndRoles(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("roles") List<String> roles,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT COUNT(*) FROM (
            SELECT o.id
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
            LEFT JOIN role tr ON tr.id = tpr.role_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id

            WHERE op.id IN (:profileIds)
            AND o.status != 'DRAFT'
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            GROUP BY o.id
        ) AS filtered_orders
    """)
    Long countReceivedOrdersByProfileId(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
            LEFT JOIN role tr ON tr.id = tpr.role_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id

            WHERE o.assigned_lab_user_id = :profileId
            AND o.status != 'DRAFT'
            AND r.name IN :roles
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            """)
    Long countReceivedOrdersByProfileIdForLabStaffFilterByRoles(
            @Param("profileId") Long profileId,
            @Param("roles") List<String> roles,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE o.assigned_lab_user_id = :profileId
        AND o.status != 'DRAFT'
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        """)
    long countReceivedOrdersByProfileIdForLabStaff(
            @Param("profileId") Long profileId,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search);
}
