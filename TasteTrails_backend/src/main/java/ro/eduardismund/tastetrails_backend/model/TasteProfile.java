package ro.eduardismund.tastetrails_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Builder
@Entity
@Table(name = "taste_profiles")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class TasteProfile {
    @Id
    @EqualsAndHashCode.Include  // ← ADD THIS!
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "music_preferences", columnDefinition="jsonb")
    private Map<String, Object> musicPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "movie_preferences", columnDefinition="jsonb")
    private Map<String, Object> moviePreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "food_preferences", columnDefinition="jsonb")
    private Map<String, Object> foodPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "activity_preferences", columnDefinition="jsonb")
    private Map<String, Object> activityPreferences;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
