package com.dentalstack.doctor.repository.chargebee;

import com.dentalstack.doctor.entity.subscription.chargebee.ChargebeeEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargebeeRepository extends JpaRepository<ChargebeeEvent, Long> {
    List<ChargebeeEvent> findByEmailOrderByOccurredAtDesc(String email);

    List<ChargebeeEvent> findByEmail(String email);
}
