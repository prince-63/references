package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.sampledata.GenerateSampleChatRequest;

public interface SampleDataService {
    void generateSampleChats(GenerateSampleChatRequest request);
}
