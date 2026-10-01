package com.dentalstack.doctor.dto.practicelocation;

import com.dentalstack.doctor.entity.PracticeLocation;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PracticeLocationAllResponse {
    private List<PracticeLocationDetails> practiceLocationList;
    private int size;

    public static PracticeLocationAllResponse from(List<PracticeLocation> allPracticeLocations) {
        List<PracticeLocationDetails> practiceLocationDetailsList =
                allPracticeLocations.stream().map(PracticeLocationDetails::from).collect(Collectors.toList());

        int size = practiceLocationDetailsList.size();

        return new PracticeLocationAllResponse(practiceLocationDetailsList, size);
    }

    public static PracticeLocationAllResponse fromPaginated(
            List<PracticeLocation> paginatedPracticeLocations, long totalElements) {
        List<PracticeLocationDetails> practiceLocationDetailsList = paginatedPracticeLocations.stream()
                .map(PracticeLocationDetails::from)
                .collect(Collectors.toList());

        int size = (int) totalElements;

        return new PracticeLocationAllResponse(practiceLocationDetailsList, size);
    }
}
