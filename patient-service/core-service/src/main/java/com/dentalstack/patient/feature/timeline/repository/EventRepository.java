package com.dentalstack.patient.feature.timeline.repository;

import com.dentalstack.patient.feature.timeline.entity.Event;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.user.enums.UserType;
import feign.Param;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByUserIdAndUserTypeAndActive(Long userId, UserType userType, boolean active);

    List<Event> findByUserIdAndUserType(Long userId, UserType userType);

    List<Event> findByForUserIdAndForUserTypeAndActive(Long forUserId, UserType forUserType, boolean active);

    List<Event> findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
            Long userId, UserType userType, Long forUserId, UserType forUserType, boolean active, EventType type);

    List<Event> findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndType(
            Long userId, UserType userType, Long forUserId, UserType forUserType, EventType type);

    List<Event> findByForUserIdAndForUserType(Long forUserId, UserType forUserType);

    List<Event> findByUserIdAndUserTypeAndTypeAndActiveTrue(Long userId, UserType userType, EventType eventType);

    List<Event> findByUserIdAndUserTypeAndType(Long userId, UserType userType, EventType eventType);

    @Modifying
    @Query("DELETE FROM Event e WHERE e.userId = ?1 AND e.userType = ?2")
    void deleteAllByUserIdAndUserType(Long userId, UserType userType);

    @Modifying
    @Query("DELETE FROM Event e WHERE e.forUserId = ?1 AND e.userId = ?2 AND e.userType = ?3")
    void deleteAllByForUserIdAndUserIdAndUserType(Long addedByUserId, Long patientId, UserType userType);

    @Query(
            "SELECT e.id FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.type IN :eventTypes AND e.active = true AND e.read = false")
    List<Long> findActiveEventIdsByForUserIdAndForUserType(
            Long forUserId, UserType forUserType, List<EventType> eventTypes);

    @Query(
            "SELECT e.id FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.type IN :eventTypes AND e.active = true AND e.read = false AND e.userId = :userId")
    List<Long> findActiveEventIdsByForUserIdAndForUserTypeAndUserId(
            Long forUserId, UserType forUserType, List<EventType> eventTypes, Long userId);

    @Query(
            "SELECT e.id FROM Event e WHERE e.userId = :userId AND e.userType = :userType AND e.type IN :eventTypes AND e.active = true AND e.read = false")
    List<Long> findActiveEventIdsByUserIdAndUserType(Long userId, UserType userType, List<EventType> eventTypes);

    @Query("SELECT e FROM Event e WHERE e.userId = :userId AND e.userType = :userType AND e.type IN :eventTypes")
    Page<Event> findAllByUserIdAndUserTypeWithEventTypes(
            Long userId, UserType userType, List<EventType> eventTypes, Pageable pageable);

    @Query(
            "SELECT e FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.type IN :eventTypes")
    Page<Event> findAllByForUserIdAndForUserTypeWithEventTypes(
            Long forUserId, UserType forUserType, List<EventType> eventTypes, Pageable pageable);

    @Query(
            "SELECT e FROM Event e WHERE e.userId = :userId AND e.userType = :userType AND e.active = :active AND e.type IN :eventTypes")
    Page<Event> findAllByUserIdAndUserTypeAndActiveWithEventTypes(
            Long userId, UserType userType, boolean active, List<EventType> eventTypes, Pageable pageable);

    @Query(
            "SELECT e FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.active = :active AND e.type IN :eventTypes")
    Page<Event> findAllByForUserIdAndForUserTypeAndActiveWithEventTypes(
            Long forUserId, UserType forUserType, boolean active, List<EventType> eventTypes, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.userId = :userId AND e.userType = :userType AND e.type IN :eventTypes")
    List<Event> findAllByUserIdAndUserTypeAndTypeIn(Long userId, UserType userType, List<EventType> eventTypes);

    @Query(
            "SELECT e FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.type IN :eventTypes")
    List<Event> findAllByForUserIdAndForUserTypeAndTypeIn(
            Long forUserId, UserType forUserType, List<EventType> eventTypes);

    @Query(
            "SELECT e FROM Event e WHERE e.userId = :userId AND e.userType = :userType AND e.active = :active AND e.type IN :eventTypes")
    List<Event> findAllByUserIdAndUserTypeAndActiveAndTypeIn(
            Long userId, UserType userType, boolean active, List<EventType> eventTypes);

    @Query(
            "SELECT e FROM Event e WHERE e.forUserId = :forUserId AND e.forUserType = :forUserType AND e.active = :active AND e.type IN :eventTypes")
    List<Event> findAllByForUserIdAndForUserTypeAndActiveAndTypeIn(
            Long forUserId, UserType forUserType, boolean active, List<EventType> eventTypes);

    @Query(
            value = "SELECT e.* FROM event e " + "WHERE e.user_id = :forUserId "
                    + "AND e.user_type = :forUserType "
                    + "AND e.type = :eventType "
                    + "AND CAST(metadata->'alignerJourneyDetails'->>'alignerJourneyId' AS bigint) = :alignerJourneyId "
                    + "AND EXISTS (SELECT 1 FROM jsonb_array_elements(metadata->'alignerChanges') as alignerChange "
                    + "      WHERE CAST(alignerChange->>'alignerNumber' AS integer) = :alignerNumber) "
                    + "ORDER BY e.event_time DESC",
            nativeQuery = true)
    List<Event> findWearDaysUpdateEventsByUserAlignerJourneyAndAlignerNumber(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") String forUserType,
            @Param("eventType") String eventType,
            @Param("alignerJourneyId") Long alignerJourneyId,
            @Param("alignerNumber") Integer alignerNumber);

    @Query(
            value = "SELECT e.* FROM event e " + "WHERE e.user_id = :patientId "
                    + "AND e.user_type = :forUserType "
                    + "AND e.type = :eventType "
                    + "AND CAST(metadata->>'alignerSrNo' AS integer) = :alignerSrNo",
            nativeQuery = true)
    List<Event> findReminderSentEventsByPatientIdAndAlignerNumber(
            @Param("patientId") Long patientId,
            @Param("forUserType") String forUserType,
            @Param("eventType") String eventType,
            @Param("alignerSrNo") Integer alignerSrNo);

    @Query(
            value = "SELECT e.* FROM event e " + "WHERE e.for_user_id = :forUserId "
                    + "AND e.for_user_type = :forUserType "
                    + "AND e.type = :eventType "
                    + "AND CAST(metadata->>'previousAlignerNo' AS integer) = :previousAlignerNo "
                    + "AND CAST(metadata->>'alignerJourneyId' AS bigint) = :alignerJourneyId "
                    + "ORDER BY e.event_time DESC",
            nativeQuery = true)
    List<Event> findAlignerChangeEventsByUserAndPreviousAlignerNo(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") String forUserType,
            @Param("eventType") String eventType,
            @Param("previousAlignerNo") Integer previousAlignerNo,
            @Param("alignerJourneyId") Long alignerJourneyId);

    @Query(
            value = "SELECT e.* FROM event e " + "WHERE e.user_id = :userId "
                    + "AND e.user_type = :userType "
                    + "AND e.type = :eventType "
                    + "AND CAST(metadata->>'previousAlignerNo' AS integer) = :previousAlignerNo "
                    + "AND CAST(metadata->>'alignerJourneyId' AS bigint) = :alignerJourneyId "
                    + "ORDER BY e.event_time DESC",
            nativeQuery = true)
    List<Event> findAlignerChangeEventsByDoctorAndPreviousAlignerNo(
            @Param("userId") Long userId,
            @Param("userType") String userType,
            @Param("eventType") String eventType,
            @Param("previousAlignerNo") Integer previousAlignerNo,
            @Param("alignerJourneyId") Long alignerJourneyId);

    @Query(
            """
    SELECT e FROM Event e
    WHERE e.userType = :userType
    AND e.active = :active
    AND e.type IN :eventTypes
   AND e.read = false
    AND e.userProfile.id = :profileId
    """)
    Page<Event> findPageByUserIdAndUserTypeAndActiveWithEventTypesForProfile(
            UserType userType, boolean active, List<EventType> eventTypes, Long profileId, Pageable pageable);

    @Query(
            """
    SELECT e FROM Event e
    WHERE e.forUserType = :userType
    AND e.active = :active
    AND e.type IN :eventTypes
    AND e.read = false
    AND e.userProfile.id = :profileId
    """)
    Page<Event> findPageByForUserIdAndForUserTypeAndActiveWithEventTypesAndProfile(
            UserType userType, boolean active, List<EventType> eventTypes, Long profileId, Pageable pageable);

    long countByUserIdAndUserTypeAndTypeInAndReadFalseAndActiveTrueAndOrganizationId(
            Long userId, UserType userType, List<EventType> eventTypes, Long organizationId);

    @Query(
            """
        SELECT COUNT(e) FROM Event e
        WHERE e.userId = :doctorId
        AND e.organization.id = :organizationId
        AND e.userType = :userType
        AND e.type IN :eventTypes
        AND e.active = true
        AND e.read = false
        AND FUNCTION('jsonb_extract_path_text', e.metadata, 'type') IN :metadataTypes
        AND FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate') IN
            (CAST(CURRENT_DATE AS text), CAST(CURRENT_DATE + 1 AS text))
    """)
    long countTreatmentStartingEventsForDoctorAndOrganizationId(
            @Param("doctorId") Long doctorId,
            @Param("userType") UserType userType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("metadataTypes") List<String> metadataTypes,
            @Param("organizationId") Long organizationId);

    @Query("SELECT COUNT(e) " + "FROM Event e "
            + "WHERE e.forUserId = :forUserId "
            + "AND e.forUserType = :forUserType "
            + "AND e.type IN :eventTypes "
            + "AND e.read = false "
            + "AND e.active = true "
            + "AND e.organization.id = :organizationId")
    long countByForUserIdAndForUserTypeAndIsReadAndOrganizationId(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") UserType forUserType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT COUNT(e) FROM Event e
    WHERE e.forUserId = :forUserId
    AND e.forUserType = :forUserType
    AND e.type IN :eventTypes
    AND e.active = true
    AND e.read = false
    AND e.userProfile.id = :profileId
""")
    Long countByForUserIdAndForUserTypeAndProfile(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") UserType forUserType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT COUNT(e) FROM Event e
    WHERE e.userId = :userId
    AND e.userType = :userType
    AND e.type IN :eventTypes
    AND e.active = true
    AND e.read = false
    AND e.userProfile.id = :profileId
""")
    Long countByUserIdAndUserTypeAndTypeInAndActiveTrueAndProfile(
            @Param("userId") Long userId,
            @Param("userType") UserType userType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT COUNT(e) FROM Event e
    WHERE e.userId = :doctorId
    AND e.userType = :userType
    AND e.type IN :eventTypes
    AND e.active = true
    AND e.read = false
    AND e.userProfile.id = :profileId
    AND FUNCTION('jsonb_extract_path_text', e.metadata, 'type') IN :metadataTypes
    AND FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate') IN
        (CAST(CURRENT_DATE AS text), CAST(CURRENT_DATE + 1 AS text))
""")
    long countTreatmentStartingEventsForDoctorAndProfile(
            @Param("doctorId") Long doctorId,
            @Param("userType") UserType userType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("metadataTypes") List<String> metadataTypes,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT COUNT(e) FROM Event e
    WHERE e.forUserId = :forUserId
    AND e.forUserType = :forUserType
    AND e.type IN :eventTypes
    AND e.active = true
    AND e.read = false
    AND e.organization.id = :organizationId
""")
    Long countByForUserIdAndForUserTypeAndOrg(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") UserType forUserType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT COUNT(e) FROM Event e
    WHERE e.userId = :userId
    AND e.userType = :userType
    AND e.type IN :eventTypes
    AND e.active = true
    AND e.read = false
    AND e.organization.id = :organizationId
""")
    Long countByUserIdAndUserTypeAndTypeInAndActiveTrueAndOrg(
            @Param("userId") Long userId,
            @Param("userType") UserType userType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("organizationId") Long organizationId);

    @Query(
            """
            SELECT COUNT(e) FROM Event e
            WHERE e.forUserId = :doctorId
            AND e.forUserType = :userType
            AND e.type IN :eventTypes
            AND e.active = true
            AND e.read = false
            AND e.organization.id = :organizationId
            AND FUNCTION('jsonb_extract_path_text', e.metadata, 'type') IN :metadataTypes
            AND (
                FUNCTION('make_date',
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '0') AS integer),
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '1') AS integer),
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '2') AS integer)
                ) = CURRENT_DATE
                OR
                FUNCTION('make_date',
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '0') AS integer),
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '1') AS integer),
                    CAST(FUNCTION('jsonb_extract_path_text', e.metadata, 'alignerJourneyDetails', 'firstAlignerStartDate', '2') AS integer)
                ) = CURRENT_DATE + 1
            )
        """)
    long countTreatmentStartingEventsForDoctorAndOrg(
            @Param("doctorId") Long doctorId,
            @Param("userType") UserType userType,
            @Param("eventTypes") List<EventType> eventTypes,
            @Param("metadataTypes") List<String> metadataTypes,
            @Param("organizationId") Long organizationId);

    @Query(
            value = "SELECT e.* FROM event e " + "WHERE e.for_user_id = :forUserId "
                    + "AND e.for_user_type = :forUserType "
                    + "AND e.type = :eventType "
                    + "AND CAST(metadata->'alignerJourneyDetails'->>'alignerJourneyId' AS bigint) = :alignerJourneyId "
                    + "ORDER BY e.event_time DESC",
            nativeQuery = true)
    List<Event> findTreatmentPauseResumedEventsByUserAndAlignerJourney(
            @Param("forUserId") Long forUserId,
            @Param("forUserType") String forUserType,
            @Param("eventType") String eventType,
            @Param("alignerJourneyId") Long alignerJourneyId);

    @Query(
            "SELECT e.id FROM Event e WHERE e.userProfile.id = :profileId AND e.forUserType = :forUserType AND e.type IN :eventTypes AND e.active = true AND e.read = false")
    List<Long> findActiveEventIdsByForUserTypeAndProfile(
            Long profileId, UserType forUserType, List<EventType> eventTypes);

    @Query(
            "SELECT e.id FROM Event e WHERE e.userProfile.id = :profileId AND e.userType = :userType AND e.type IN :eventTypes AND e.active = true AND e.read = false")
    List<Long> findActiveEventIdsByUserTypeAndProfile(Long profileId, UserType userType, List<EventType> eventTypes);

    @Query(
            value =
                    """
SELECT *
FROM event
WHERE
(
    (user_id = :userId AND user_type = :userType)
    OR
    (for_user_id = :userId AND for_user_type = :userType)
)
AND (:onlyActive = false OR active = true)
AND type IN (
'ALIGNER_CHANGE',
'MANUAL_ALIGNER_CHANGE',
'FORCE_ALIGNER_CHANGE',
'UPCOMING_ALIGNER_CHANGE',
'MISSED_ALIGNER_CHANGED_DATE',
'ALIGNER_CHECK_IN',
'ALIGNER_CHECK_IN_FOR_DOCTOR',
'ALIGNER_CHANGE_FEEDBACK_ADDED',
'ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR',
'ALIGNER_CHANGE_VALIDATED',
'WEAR_DAYS_UPDATED',
'WEAR_DAY_EDIT',
'ISSUE_REPORTED',
'TREATMENT_STARTING',
'TREATMENT_STARTING_TOMORROW',
'TREATMENT_SETUP',
'TREATMENT_PLAN_APPROVED_BY_PATIENT',
'TREATMENT_PLAN_SENT_FOR_APPROVAL_TO_PATIENT',
'TREATMENT_PLAN_ADDED',
'WEAR_DAYS_UPDATED'
)
ORDER BY event_time DESC
""",
            nativeQuery = true)
    List<Event> findTimelineEvents(
            @Param("userId") Long userId, @Param("userType") String userType, @Param("onlyActive") Boolean onlyActive);

    @Query(
            value =
                    """
    SELECT e.* FROM event e
    WHERE (e.for_user_id = :forUserId OR e.user_id = :doctorId)
    AND e.type = 'ALIGNER_CHECK_IN'
    AND e.active = true
    AND (:patientId IS NULL OR CAST(e.metadata->>'patientId' AS bigint) = :patientId)
    ORDER BY e.event_time DESC
    LIMIT :limit
    """,
            nativeQuery = true)
    List<Event> findRecentAlignerCheckInEvents(
            @Param("forUserId") Long forUserId,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("limit") int limit);
}
