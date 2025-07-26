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
    private Map<String, Object> artistPreferences;
    private Map<String, Object> moviePreferences;
    private Map<String, Object> bookPreferences;
    private Map<String, Object> brandPreferences;
    private Map<String, Object> videoGamePreferences;
    private Map<String, Object> tvShowPreferences;
    private Map<String, Object> podcastPreferences;
    private Map<String, Object> personPreferences;
    private LocalDateTime updatedAt;

    public static TasteProfileResponse fromTasteProfile(TasteProfile tasteProfile){
        return TasteProfileResponse.builder()
                .id(tasteProfile.getId())
                .userId(tasteProfile.getUser().getId())
                .artistPreferences(tasteProfile.getArtistPreferences())
                .moviePreferences(tasteProfile.getMoviePreferences())
                .bookPreferences(tasteProfile.getBookPreferences())
                .brandPreferences(tasteProfile.getBrandPreferences())
                .videoGamePreferences(tasteProfile.getVideoGamePreferences())
                .tvShowPreferences(tasteProfile.getTvShowPreferences())
                .podcastPreferences(tasteProfile.getPodcastPreferences())
                .personPreferences(tasteProfile.getPersonPreferences())
                .updatedAt(tasteProfile.getUpdatedAt())
                .build();
    }

}
