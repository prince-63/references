package com.dentalstack.chat.dto.sms;

import lombok.Data;

@Data
public class SmsRequest {

    private String messageBody;

    private String mobile;
}
