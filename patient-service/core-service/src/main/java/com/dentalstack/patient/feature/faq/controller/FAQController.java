package com.dentalstack.patient.feature.faq.controller;

import com.dentalstack.patient.feature.faq.service.FAQService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "FAQ", description = "FAQ APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/faq/v1")
public class FAQController {

    private final FAQService faqService;
}
