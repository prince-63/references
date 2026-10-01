package com.dentalstack.patient.feature.notification.client.errordecoder;

import com.dentalstack.patient.feature.notification.exception.ChatServiceAPIFailedException;
import com.dentalstack.patient.global.dto.ErrorInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.codec.ErrorDecoder;
import java.io.IOException;
import java.io.InputStream;
import org.apache.commons.io.IOUtils;

public class ChatServiceClientErrorDecoder implements ErrorDecoder {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Exception decode(String methodKey, Response response) {
        ErrorInfo error;
        try (InputStream bodyIs = response.body().asInputStream()) {
            var body = IOUtils.toByteArray(bodyIs);

            error = mapper.readValue(body, ErrorInfo.class);
        } catch (IOException e) {
            return new Exception(e.getMessage());
        }

        return new ChatServiceAPIFailedException(error, response.request().url());
    }
}
