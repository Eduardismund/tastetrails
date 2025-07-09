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
@Table(name = "itineraries")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class Itinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @NotBlank(message = "Destination is mandatory")
    @Column(nullable=false)
    private String destination;

    @NotNull(message = "Start date is mandatory")
    @Column(name = "start_date", nullable=false)
    private LocalDate startDate;

    @NotNull(message = "End date is mandatory")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name="activities", columnDefinition = "jsonb")
    private List<Map<String, Object>> activities;

    @CreationTimestamp
    @Column(name = "created_at", nullable=false, updatable = false)
    private LocalDateTime createdAt;
}
