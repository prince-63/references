package com.dentalstack.chat.service.email;

import com.dentalstack.chat.dto.email.ConsentEmailReq;
import org.springframework.web.multipart.MultipartFile;

public interface ConsentEmailService {
    void sendConsentAcceptEmail(ConsentEmailReq req, MultipartFile file);

    void sendConsentCopyToAdmin(ConsentEmailReq req, MultipartFile file);
}
