package com.dentalstack.chat.dto.chat;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetFilesRequest {
    private List<Long> fileIds;
    private String imageUrls;
}
