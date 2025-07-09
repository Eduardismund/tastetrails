package ro.eduardismund.tastetrails_backend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class CreateItineraryRequest {
    @NotBlank(message = "Destination is mandatory")
    private String destination;

    @NotNull(message = "Start date is mandatory")
    private LocalDate startDate;

    @NotNull(message = "End date is mandatory")
    private LocalDate endDate;

    private List<Map<String, Object>> activities;
}
