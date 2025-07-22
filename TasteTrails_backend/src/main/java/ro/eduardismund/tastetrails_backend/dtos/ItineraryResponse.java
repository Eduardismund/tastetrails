package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Builder;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.Itinerary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ItineraryResponse {
    private UUID id;
    private UUID userId;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ActivityResponse> activities;
    private LocalDateTime createdAt;

    public static ItineraryResponse fromItinerary(Itinerary itinerary) {
        return ItineraryResponse.builder()
                .id(itinerary.getId())
                .userId(itinerary.getUser().getId())
                .destination(itinerary.getDestination())
                .startDate(itinerary.getStartDate())
                .endDate(itinerary.getEndDate())
                .activities(itinerary.getActivities()!= null ? itinerary.getActivities().stream().map(ActivityResponse::fromActivity).toList() : new ArrayList<>())
                .createdAt(itinerary.getCreatedAt())
                .build();
    }
}