package ro.eduardismund.tastetrails_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Builder
@Entity
@Table(name = "activities")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", referencedColumnName = "id")
    @ToString.Exclude
    private Itinerary itinerary;

    @NotBlank(message = "Title is mandatory")
    @Column(name = "title", nullable=false)
    private String title;

    @NotBlank(message = "Title is mandatory")
    @Column(name = "coordinates", nullable=false)
    private String coordinates;

    @NotBlank(message = "Description is mandatory")
    @Column(name = "description", nullable=false, length = 2000)
    private String description;

    @NotNull(message = "Theme is mandatory")
    @Column(name = "theme", nullable=false)
    @Enumerated(EnumType.STRING)
    private ThematicType theme;

    @NotNull(message = "Start time is mandatory")
    @Column(name = "start_time", nullable=false)
    private LocalDateTime startTime;

    @NotNull(message = "End time is mandatory")
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @NotNull(message = "Activity date is mandatory")
    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @NotBlank(message = "Address is mandatory")
    @Column(name = "address", nullable = false)
    private String address;


    @NotBlank(message = "Reasoning is mandatory")
    @Column(name = "reasoning", nullable = false)
    private String reasoning;

    @CreationTimestamp
    @Column(name = "created_at", nullable=false, updatable = false)
    private LocalDateTime createdAt;
}
