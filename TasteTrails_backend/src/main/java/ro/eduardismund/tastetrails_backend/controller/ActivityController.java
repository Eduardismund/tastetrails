package ro.eduardismund.tastetrails_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.eduardismund.tastetrails_backend.dtos.ActivityRequest;
import ro.eduardismund.tastetrails_backend.dtos.ActivityResponse;
import ro.eduardismund.tastetrails_backend.dtos.ApiResponse;
import ro.eduardismund.tastetrails_backend.service.ActivityService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/itineraries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping("/{itineraryId}/activities")
    public ResponseEntity<ApiResponse<ActivityResponse>> addActivity(@PathVariable UUID itineraryId, @Valid @RequestBody ActivityRequest request) {
        try{
            final var activity = activityService.createActivity(
                    itineraryId,
                    request.getTitle(),
                    request.getCoordinates(),
                    request.getDescription(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getActivityDate(),
                    request.getTheme(),
                    request.getAddress(),
                    request.getReasoning()
            );

            final var response = ActivityResponse.fromActivity(activity);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Activity created successfully", response));
        } catch( RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{itineraryId}/activities/{activityId}")
    public ResponseEntity<ApiResponse<ActivityResponse>> getActivity(@PathVariable UUID itineraryId,
                                                                     @PathVariable UUID activityId) {
     return activityService.findById(activityId)
             .map(activity -> {
                 final var response = ActivityResponse.fromActivity(activity);
                 return ResponseEntity.ok(ApiResponse.success("Activity found", response));
             }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Activity not found")));
    }

    @GetMapping("/{itineraryId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivitiesByItinerary(@PathVariable UUID itineraryId) {
        final var activities = activityService.findByItineraryId(itineraryId);
        final var responses = activities.stream().map(ActivityResponse::fromActivity)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Activities fetched successfully", responses));
    }

    @PutMapping("/{itineraryId}/activities/{activityId}")
    public ResponseEntity<ApiResponse<ActivityResponse>> updateActivity(
            @PathVariable UUID itineraryId,
            @PathVariable UUID activityId,
            @Valid @RequestBody ActivityRequest request
    ) {
        try{
            final var activity = activityService.updateActivity(
                    activityId,
                    request.getTitle(),
                    request.getCoordinates(),
                    request.getDescription(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getActivityDate(),
                    request.getTheme(),
                    request.getAddress(),
                    request.getReasoning()
            );
            final var response = ActivityResponse.fromActivity(activity);
            return ResponseEntity.ok(ApiResponse.success("Activity updated successfully", response));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

