package com.dentalstack.doctor.dto.practicelocation;

import com.dentalstack.doctor.entity.PracticeLocation;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PracticeLocationList {
    private List<PracticeLocationDetails> practiceLocations; // Use PracticeLocationDetails instead of PracticeLocation

    public static PracticeLocationList from(List<PracticeLocation> practiceLocations) {
        return new PracticeLocationList(
                practiceLocations.stream().map(PracticeLocationDetails::from).toList());
    }
}
