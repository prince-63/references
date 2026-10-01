package com.dentalstack.patient.feature.bracket.repository;

import com.dentalstack.patient.feature.bracket.entity.BracketType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BracketTypeRepository extends JpaRepository<BracketType, Long> {

    @Query("SELECT bt FROM BracketType bt LEFT JOIN FETCH bt.bracket WHERE bt.bracket.id = :bracketId")
    List<BracketType> findByBracketId(@Param("bracketId") Long bracketId);
}
