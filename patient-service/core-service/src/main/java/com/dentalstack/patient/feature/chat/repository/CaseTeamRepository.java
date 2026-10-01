package com.dentalstack.patient.feature.chat.repository;

import com.dentalstack.patient.feature.chat.entity.CaseTeam;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseTeamRepository extends JpaRepository<CaseTeam, Long> {

    @Query("SELECT ct FROM CaseTeam ct " + "WHERE ct.createdBy.id = :userProfileId "
            + "AND ct.isActive = true "
            + "ORDER BY ct.createdAt DESC")
    Page<CaseTeam> findByCreatedByIdAndIsActiveTrue(@Param("userProfileId") Long userProfileId, Pageable pageable);

    @Query("SELECT ct FROM CaseTeam ct " + "JOIN ct.members m "
            + "WHERE m.id = :userProfileId "
            + "AND ct.isActive = true "
            + "ORDER BY ct.createdAt DESC")
    Page<CaseTeam> findTeamsByMemberId(@Param("userProfileId") Long userProfileId, Pageable pageable);

    @Query("SELECT ct FROM CaseTeam ct " + "WHERE ct.teamName LIKE %:searchTerm% "
            + "AND ct.isActive = true "
            + "ORDER BY ct.createdAt DESC")
    Page<CaseTeam> searchByTeamName(@Param("searchTerm") String searchTerm, Pageable pageable);

    Optional<CaseTeam> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " + "FROM CaseTeam ct JOIN ct.members m "
            + "WHERE ct.id = :teamId "
            + "AND m.id = :userProfileId")
    boolean isMemberOfTeam(@Param("teamId") Long teamId, @Param("userProfileId") Long userProfileId);
}
