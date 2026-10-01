package com.dentalstack.patient.feature.calendar.dto.calendar;

import com.dentalstack.patient.feature.calendar.enums.CalendarResponseTypes;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarReminderResponse {
    private long id;
    private String title;
    private ZonedDateTime start;
    private CalendarResponseTypes calendarResponseType;
    private Header header;
    private Content content;

    public CalendarReminderResponse(
            long id, String title, ZonedDateTime start, CalendarResponseTypes calendarResponseTypes, Object details) {
        this.id = id;
        this.title = title;
        this.start = start;
        this.calendarResponseType = calendarResponseTypes;
        this.header = new Header(calendarResponseTypes, start);
        this.content = new Content(details);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Header {
        private CalendarResponseTypes calendarResponseType;
        private ZonedDateTime date;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content {
        private Object details;
    }
}
