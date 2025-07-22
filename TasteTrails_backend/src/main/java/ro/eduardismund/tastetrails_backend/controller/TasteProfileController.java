package ro.eduardismund.tastetrails_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.eduardismund.tastetrails_backend.dtos.ApiResponse;
import ro.eduardismund.tastetrails_backend.dtos.TasteProfileRequest;
import ro.eduardismund.tastetrails_backend.dtos.TasteProfileResponse;
import ro.eduardismund.tastetrails_backend.service.TasteProfileService;

import java.util.UUID;

@RestController
@RequestMapping("/taste-profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173"})
public class TasteProfileController {
    private final TasteProfileService tasteProfileService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<TasteProfileResponse>> createOrUpdateTasteProfile(@PathVariable UUID userId, @Valid @RequestBody TasteProfileRequest request) {
        try{
            final var profile = tasteProfileService.createOrUpdateTasteProfile(
                    userId,
                    request.getArtistPreferences(),
                    request.getMoviePreferences(),
                    request.getBookPreferences()
            );

            final var response = TasteProfileResponse.fromTasteProfile(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Taste Profile saved successfully", response));
        } catch( RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<TasteProfileResponse>> getTasteProfileByUserId(@PathVariable UUID userId) {
     return tasteProfileService.findByUserId(userId)
             .map(tasteProfile -> {
                 final var response = TasteProfileResponse.fromTasteProfile(tasteProfile);
                 return ResponseEntity.ok(ApiResponse.success("Taste Profile found", response));
             }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Taste Profile not found")));
    }
    @GetMapping("/users/{userId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> checkTasteProfileExists(@PathVariable UUID userId) {

        final var exists = tasteProfileService.findByUserId(userId).isPresent();
        final var message = exists ? "Taste Profile exists" : "Taste Profile not found";

        return ResponseEntity.ok(ApiResponse.success(message, exists));
    }

}

