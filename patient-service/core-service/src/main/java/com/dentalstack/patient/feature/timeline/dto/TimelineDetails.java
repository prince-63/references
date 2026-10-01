package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.timeline.entity.Event;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimelineDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<LocalDate, List<EventDetails>> events;

    public static TimelineDetails from(List<Event> events) {
        Map<LocalDate, List<EventDetails>> eventsMap = new TreeMap<>(Comparator.reverseOrder());
        for (var e : events) {
            LocalDate date = e.getEventTime().toLocalDate();
            var eventsOfDate = eventsMap.getOrDefault(date, new ArrayList<>());
            eventsOfDate.add(EventDetails.from(e));
            eventsMap.put(date, eventsOfDate);
        }

        for (var ee : eventsMap.values()) {
            ee.sort(Comparator.comparing(EventDetails::getEventTime).reversed());
        }

        return new TimelineDetails(eventsMap);
    }
}
