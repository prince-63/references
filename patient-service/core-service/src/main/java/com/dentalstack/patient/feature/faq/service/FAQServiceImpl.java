package com.dentalstack.patient.feature.faq.service;

import com.dentalstack.patient.feature.faq.dto.faq.AddFAQRequest;
import com.dentalstack.patient.feature.faq.entity.FAQ;
import com.dentalstack.patient.feature.faq.exception.FAQNotFoundException;
import com.dentalstack.patient.feature.faq.repository.FAQRepository;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class FAQServiceImpl implements FAQService {

    private final FAQRepository faqRepository;
    private final AmazonS3Service amazonS3Service;

    @Value("${app.cloud.amazon.s3.bucket.faq}")
    private String faqBucket;

    @Override
    @Transactional
    public FAQ addFAQ(AddFAQRequest req, @Nullable MultipartFile faqImage) {
        String imageUrl = null;
        if (faqImage != null) {
            imageUrl = "";
        }

        var faq = faqRepository.save(FAQ.from(req, imageUrl));
        return null;
    }

    public Set<String> getAllDistinctTopics() {
        return faqRepository.findAll().stream().map(FAQ::getTopic).collect(Collectors.toSet());
    }

    @Override
    public List<FAQ> getFAQs(@Nullable Long faqId, Set<String> topics, int page, int size) {
        if (faqId != null) {
            return List.of(faqRepository.findById(faqId).orElseThrow(() -> new FAQNotFoundException(faqId)));
        }
        Set<String> topicsToQuery = topics != null ? topics : getAllDistinctTopics();

        return faqRepository.findByTopicIn(topicsToQuery, PageRequest.of(page, size, Sort.by("createdAt")));
    }
}
