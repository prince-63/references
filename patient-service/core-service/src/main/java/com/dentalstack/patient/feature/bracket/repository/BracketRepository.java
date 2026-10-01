package com.dentalstack.patient.feature.bracket.repository;

import com.dentalstack.patient.feature.bracket.entity.Bracket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BracketRepository extends JpaRepository<Bracket, Long> {}
