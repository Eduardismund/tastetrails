package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Builder;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.TasteProfile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class TasteProfileResponse {
    private UUID id;
    private UUID userId;
    private Map<String, Object> musicPreferences;
    private Map<String, Object> moviePreferences;
    private Map<String, Object> foodPreferences;
    private Map<String, Object> activityPreferences;
    private LocalDateTime updatedAt;

    public static TasteProfileResponse fromTasteProfile(TasteProfile tasteProfile){
        return TasteProfileResponse.builder()
                .id(tasteProfile.getId())
                .userId(tasteProfile.getUser().getId())
                .musicPreferences(tasteProfile.getMusicPreferences())
                .moviePreferences(tasteProfile.getMoviePreferences())
                .foodPreferences(tasteProfile.getFoodPreferences())
                .activityPreferences(tasteProfile.getActivityPreferences())
                .updatedAt(tasteProfile.getUpdatedAt())
                .build();
    }

}
