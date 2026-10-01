package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.dto.summary.RewardOrderSummary;
import com.dentalstack.patient.feature.rewards.entity.RewardOrder;
import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RewardOrderRepository extends JpaRepository<RewardOrder, Long> {

    Optional<RewardOrder> findByIdAndPatientId(Long orderId, Long patientId);

    Page<RewardOrder> findByPatientId(Long patientId, Pageable pageable);

    Page<RewardOrder> findByPatientIdAndStatus(Long patientId, OrderStatus orderStatus, Pageable pageable);

    @Query(
            """
        SELECT DISTINCT ro FROM RewardOrder ro
        LEFT JOIN FETCH ro.orderItems oi
        LEFT JOIN FETCH ro.orderItem oi2
        LEFT JOIN FETCH ro.patient p
        LEFT JOIN FETCH ro.userProfile up
        WHERE ro.patient.id = :patientId
        AND (:status IS NULL OR ro.status = :status)
        ORDER BY ro.createdAt DESC
        """)
    List<RewardOrder> findByPatientIdAndOptionalStatus(
            @Param("patientId") Long patientId, @Param("status") OrderStatus status);

    Page<RewardOrder> findByUserProfileId(Long userProfileId, Pageable pageable);

    Optional<RewardOrder> findByIdAndUserProfileId(Long orderId, Long userProfileId);

    @Query(
            value =
                    """
    SELECT
        ro.order_number as orderNumber,
        ro.id as rewardOrderId,
        p.id as patientId,
        p.first_name as firstName,
        p.last_name as lastName,
        p.email as email,
        p.customer_mapped_id as customerMappedId,
        p.uuid as uuid,
        p.profile_picture_url as profilePictureUrl,
        p.profile_image_id as profilePictureId,
        COALESCE(rpc.product_name, '') as productName,
        ro.total_coins as coinValue,
        ro.created_at as orderDate,
        CAST(ro.status AS text) as status
    FROM reward_order ro
    JOIN patient p ON ro.patient_id = p.id
    LEFT JOIN reward_order_item roi ON ro.order_item_id = roi.id
    LEFT JOIN reward_product_config rpc ON roi.reward_product_config_id = rpc.id
    WHERE ro.user_profile_id = :userProfileId
    AND (:status IS NULL OR ro.status = CAST(:status AS text))
    AND (
        :searchText IS NULL OR :searchText = '' OR
        LOWER(ro.order_number) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
    )
    ORDER BY ro.created_at DESC
    """,
            countQuery =
                    """
    SELECT COUNT(*)
    FROM reward_order ro
    JOIN patient p ON ro.patient_id = p.id
    LEFT JOIN reward_order_item roi ON ro.order_item_id = roi.id
    LEFT JOIN reward_product_config rpc ON roi.reward_product_config_id = rpc.id
    WHERE ro.user_profile_id = :userProfileId
    AND (:status IS NULL OR ro.status = CAST(:status AS text))
    AND (
        :searchText IS NULL OR :searchText = '' OR
        LOWER(ro.order_number) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchText, '%')) OR
        LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :searchText, '%'))
    )
    """,
            nativeQuery = true)
    Page<RewardOrderSummary> findOrdersByUserProfileIdWithSearch(
            @Param("userProfileId") Long userProfileId,
            @Param("status") String status,
            @Param("searchText") String searchText,
            Pageable pageable);
}
