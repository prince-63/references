package com.dentalstack.chat.service.email;

import java.io.IOException;
import org.json.JSONObject;
import org.springframework.web.multipart.MultipartFile;

public interface EmailService {
    String sendEmail(JSONObject emailContent) throws IOException;

    String sendEmail(JSONObject emailContent, boolean useSecondary);

    JSONObject createEmailJSONObject(String toAddress, JSONObject mergeInfo, String templateKey, String orgName);

    JSONObject createEmailJSONObjectForSpecificOrgName(
            String toAddress, JSONObject mergeInfo, String templateKey, String orgName);

    JSONObject addAttachment(JSONObject emailContent, MultipartFile file, String attachmentName);
}
