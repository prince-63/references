package com.dentalstack.chat.dto.file;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RemoveFilesAndImagesRequest {
    private List<Long> fileIds;
    private List<String> imageUrls;
}
