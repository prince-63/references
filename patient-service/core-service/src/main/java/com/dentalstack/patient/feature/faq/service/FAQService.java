package com.dentalstack.patient.feature.faq.service;

import com.dentalstack.patient.feature.faq.dto.faq.AddFAQRequest;
import com.dentalstack.patient.feature.faq.entity.FAQ;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.Set;
import org.springframework.web.multipart.MultipartFile;

public interface FAQService {

    FAQ addFAQ(AddFAQRequest req, @Nullable MultipartFile faqImage);

    List<FAQ> getFAQs(@Nullable Long faqId, Set<String> topic, int page, int size);

    Set<String> getAllDistinctTopics();
}
