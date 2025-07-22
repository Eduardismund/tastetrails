package ro.eduardismund.tastetrails_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.eduardismund.tastetrails_backend.dtos.ApiResponse;
import ro.eduardismund.tastetrails_backend.dtos.CreateItineraryRequest;
import ro.eduardismund.tastetrails_backend.dtos.ItineraryResponse;
import ro.eduardismund.tastetrails_backend.service.ItineraryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/itineraries")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173"})
public class ItineraryController {
    private final ItineraryService itineraryService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<ItineraryResponse>> createItinerary(@PathVariable UUID userId, @Valid @RequestBody CreateItineraryRequest request) {
        try{
            final var itinerary = itineraryService.createItinerary(
                    userId,
                    request.getDestination(),
                    request.getStartDate(),
                    request.getEndDate()
            );

            final var response = ItineraryResponse.fromItinerary(itinerary);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Itinerary created successfully", response));
        } catch( RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<ItineraryResponse>> getItineraryById(@PathVariable UUID itineraryId) {
     return itineraryService.findById(itineraryId)
             .map(itinerary -> {
                 final var response = ItineraryResponse.fromItinerary(itinerary);
                 return ResponseEntity.ok(ApiResponse.success("Itinerary found", response));
             }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Itinerary not found")));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<ItineraryResponse>>> getAllItineraries(@PathVariable UUID userId) {
        final var itineraries = itineraryService.findByUserId(userId);
        final var responses = itineraries.stream().map(ItineraryResponse::fromItinerary)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Itineraries fetched successfully", responses));
    }

    @GetMapping("/users/{userId}/upcoming")
    public ResponseEntity<ApiResponse<List<ItineraryResponse>>> getUpcomingItineraries(@PathVariable UUID userId) {
        final var itineraries = itineraryService.findUpcomingItineraries(userId);
        final var responses = itineraries.stream().map(ItineraryResponse::fromItinerary)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Upcoming itineraries fetched successfully", responses));
    }
    @GetMapping("/users/{userId}/count")
    public ResponseEntity<ApiResponse<Long>> getItineraryCount(@PathVariable UUID userId) {
        long count = itineraryService.findByUserId(userId).size();
        return ResponseEntity.ok(ApiResponse.success("Itinerary count fetched ", count));
    }

    @DeleteMapping("/{itineraryId}")
    public ResponseEntity<ApiResponse<Void>> deleteItinerary(@PathVariable UUID itineraryId) {
        try{
            itineraryService.deleteItinerary(itineraryId);
            return ResponseEntity.ok(ApiResponse.success("Itinerary deleted successfully", null));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

