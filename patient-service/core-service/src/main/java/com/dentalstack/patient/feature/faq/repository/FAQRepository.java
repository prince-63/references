package com.dentalstack.patient.feature.faq.repository;

import com.dentalstack.patient.feature.faq.entity.FAQ;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FAQRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findByTopicIn(Set<String> topics, PageRequest pageRequest);
}
