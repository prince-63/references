package com.dentalstack.chat.dto.file;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadDetails {
    private List<FileDetails> uploadFiles = new ArrayList<>();
}
