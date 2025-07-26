package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Builder;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.Activity;
import ro.eduardismund.tastetrails_backend.model.Itinerary;
import ro.eduardismund.tastetrails_backend.model.ThematicType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static java.time.temporal.ChronoUnit.DAYS;

@Data
@Builder
public class ActivityResponse {
    private UUID id;
    private UUID itineraryId;
    private String description;
    private String title;
    private String coordinates;
    private ThematicType theme;
    private String startTime;
    private String endTime;
    private LocalDate activityDate;
    private String address;
    private String reasoning;
    private LocalDateTime createdAt;

    public static ActivityResponse fromActivity(Activity activity){
        return ActivityResponse.builder()
                .id(activity.getId())
                .itineraryId(activity.getItinerary() != null? activity.getItinerary().getId() : null)
                .title(activity.getTitle())
                .coordinates(activity.getCoordinates())
                .theme(activity.getTheme())
                .description(activity.getDescription())
                .startTime(extractTimeSimple(activity.getStartTime()))
                .endTime(extractTimeSimple(activity.getEndTime()))
                .activityDate(activity.getActivityDate())
                .address(activity.getAddress())
                .reasoning(activity.getReasoning())
                .createdAt(activity.getCreatedAt())
                .build();
    }

    public static String extractTimeSimple(LocalDateTime date){
        final var timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        return date.format(timeFormatter);
    }
}

