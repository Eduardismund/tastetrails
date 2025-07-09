package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Builder;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.Itinerary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static java.time.temporal.ChronoUnit.DAYS;

@Data
@Builder
public class ItineraryResponse {
    private UUID id;
    private UUID userId;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Map<String, Object>> activities;
    private LocalDateTime createdAt;
    private int dayCount;

    public static ItineraryResponse fromItinerary(Itinerary itinerary){
        return ItineraryResponse.builder()
                .id(itinerary.getId())
                .userId(itinerary.getUser().getId())
                .destination(itinerary.getDestination())
                .startDate(itinerary.getStartDate())
                .endDate(itinerary.getEndDate())
                .activities(itinerary.getActivities())
                .createdAt(itinerary.getCreatedAt())
                .dayCount((int) DAYS.between(itinerary.getStartDate(), itinerary.getEndDate()) + 1)
                .build();
    }

}
