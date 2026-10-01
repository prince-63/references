package com.dentalstack.patient.feature.events.repository;

import com.dentalstack.patient.feature.events.entity.ChargebeeEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargebeeRepository extends JpaRepository<ChargebeeEvent, Long> {
    List<ChargebeeEvent> findByEmail(String email);
}
