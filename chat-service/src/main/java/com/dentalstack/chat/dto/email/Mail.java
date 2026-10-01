package com.dentalstack.chat.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mail {
    private String from;
    private String fromName;
    private String body;
    private String to;
    private String cc;
    private String bcc;
    private String subject;
    private String pdfFileName;
}
