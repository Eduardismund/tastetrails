package ro.eduardismund.tastetrails_backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ro.eduardismund.tastetrails_backend.model.ThematicType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ActivityRequest {
    @NotBlank(message="Title is mandatory")
    private String description;

    @NotBlank(message="Description is mandatory")
    private String title;

    @NotBlank(message="Coordinates are mandatory")
    private String coordinates;

    @NotNull(message="Theme is mandatory")
    private ThematicType theme;

    @NotNull(message="Start time is mandatory")
    private LocalDateTime startTime;

    @NotNull(message="End time is mandatory")
    private LocalDateTime endTime;

    @NotNull(message="Activity date is mandatory")
    private LocalDate activityDate;

    @NotBlank(message="Address is mandatory")
    private String address;

    @NotBlank(message="Reasoning is mandatory")
    private String reasoning;
}

