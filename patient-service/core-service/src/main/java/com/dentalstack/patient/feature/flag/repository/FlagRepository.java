package com.dentalstack.patient.feature.flag.repository;

import com.dentalstack.patient.feature.flag.entity.Flag;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FlagRepository extends JpaRepository<Flag, Long> {

    @Query("SELECT f FROM Flag f WHERE f.userProfile.id = :profileId")
    List<Flag> findByUserProfileId(@Param("profileId") Long profileId);

    @Modifying
    @Transactional
    @Query(
            "UPDATE Flag f SET f.isShow = CASE WHEN f.isShow = true THEN false ELSE true END WHERE f.userProfile.id = :profileId AND f.id = :flagId")
    void toggleFlag(@Param("profileId") Long profileId, @Param("flagId") Long flagId);
}
