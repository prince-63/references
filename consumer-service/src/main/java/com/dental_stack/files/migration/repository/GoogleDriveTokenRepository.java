package com.dental_stack.files.migration.repository;

import com.dental_stack.files.migration.entity.GoogleDriveToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleDriveTokenRepository extends JpaRepository<GoogleDriveToken, Long> {

    @Query("SELECT g FROM GoogleDriveToken g WHERE g.profileId = :profileId")
    Optional<GoogleDriveToken> findByProfileId(@Param("profileId") Long profileId);

    @Modifying
    @Query("DELETE FROM GoogleDriveToken g WHERE g.profileId = :profileId")
    void deleteByProfileId(@Param("profileId") Long profileId);

    boolean existsByProfileId(Long profileId);
}
