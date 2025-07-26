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
    @Column(name = "artist_preferences", columnDefinition="jsonb")
    private Map<String, Object> artistPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "movie_preferences", columnDefinition="jsonb")
    private Map<String, Object> moviePreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "book_preferences", columnDefinition="jsonb")
    private Map<String, Object> bookPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "brand_preferences", columnDefinition="jsonb")
    private Map<String, Object> brandPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "video_game_preferences", columnDefinition="jsonb")
    private Map<String, Object> videoGamePreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tv_show_preferences", columnDefinition="jsonb")
    private Map<String, Object> tvShowPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "podcast_preferences", columnDefinition="jsonb")
    private Map<String, Object> podcastPreferences;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "person_preferences", columnDefinition="jsonb")
    private Map<String, Object> personPreferences;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
