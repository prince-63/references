package com.dentalstack.chat.controller.v1.email.consent;

import com.dentalstack.chat.dto.email.ConsentEmailReq;
import com.dentalstack.chat.service.email.ConsentEmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/consent/email/v1")
@RequiredArgsConstructor
@Slf4j
public class ConsentEmailController {
    private final ConsentEmailService consentEmailService;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(
            value = "/send-to-accepter",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public void sendConsentAcceptEmail(
            @RequestParam("details") String details, @RequestPart("file") MultipartFile file) {
        ConsentEmailReq req;
        try {
            req = mapper.readValue(details, ConsentEmailReq.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid request details");
        }

        consentEmailService.sendConsentAcceptEmail(req, file);
    }

    @PostMapping(
            value = "/send-copy-to-admin",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public void sendConsentCopyToAdmin(
            @RequestParam("details") String details, @RequestPart("file") MultipartFile file) {
        ConsentEmailReq req;
        try {
            req = mapper.readValue(details, ConsentEmailReq.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid request details");
        }
        consentEmailService.sendConsentCopyToAdmin(req, file);
    }
}
