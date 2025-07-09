package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Builder;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean hasTasteProfile;
    private int itineraryCount;

    public static UserResponse fromUser(User user){
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .hasTasteProfile(user.getTasteProfile() != null)
                .itineraryCount(user.getItineraries() != null ? user.getItineraries().size() : 0)
                .build();
    }

}
