package com.dentalstack.patient.feature.bracket.repository;

import com.dentalstack.patient.feature.bracket.entity.BracketSubType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BracketSubTypeRepository extends JpaRepository<BracketSubType, Long> {

    @Query(
            "SELECT bst FROM BracketSubType bst LEFT JOIN FETCH bst.bracketType bt LEFT JOIN FETCH bt.bracket WHERE bst.bracketType.id = :bracketTypeId")
    List<BracketSubType> findByBracketTypeId(@Param("bracketTypeId") Long bracketTypeId);
}
