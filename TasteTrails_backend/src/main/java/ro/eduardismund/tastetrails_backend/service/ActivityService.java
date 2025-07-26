package ro.eduardismund.tastetrails_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.eduardismund.tastetrails_backend.model.Activity;
import ro.eduardismund.tastetrails_backend.model.ThematicType;
import ro.eduardismund.tastetrails_backend.repository.ActivityRepository;
import ro.eduardismund.tastetrails_backend.repository.ItineraryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;

    public Activity createActivity(UUID itineraryId, String title, String coordinates, String description, LocalDateTime startTime,
                                   LocalDateTime endTime, LocalDate activityDate, ThematicType theme, String address, String reasoning) {

        final var itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary Not Found"));

        if (endTime.isBefore(startTime)) {
            throw new RuntimeException("End Time is before start Time");
        }

        if(activityDate.isBefore(itinerary.getStartDate()) || activityDate.isAfter(itinerary.getEndDate())) {
            throw new RuntimeException("Activity Date must be between the start and end date");
        }

        final var activity = Activity.builder()
                .itinerary(itinerary)
                .title(title)
                .coordinates(coordinates)
                .description(description)
                .theme(theme)
                .address(address)
                .reasoning(reasoning)
                .startTime(startTime)
                .endTime(endTime)
                .activityDate(activityDate)
                .build();

        return activityRepository.save(activity);

    }

    @Transactional(readOnly = true)
    public Optional<Activity> findById(UUID activityId) {
        return activityRepository.findById(activityId);
    }

    @Transactional(readOnly = true)
    public List<Activity> findByItineraryId(UUID itineraryId) {
        return activityRepository.findByItineraryIdOrderByActivityDateAsc(itineraryId);
    }

    public Activity updateActivity(UUID activityId, String title, String coordinates, String description, LocalDateTime startTime,
                                   LocalDateTime endTime, LocalDate activityDate, ThematicType theme, String address, String reasoning) {
        final var activity = activityRepository.findById(activityId).orElseThrow(() -> new RuntimeException("Activity Not Found"));

        if(endTime.isBefore(startTime)) {
            throw new RuntimeException("End Time is before start Time");
        }

        activity.setTitle(title);
        activity.setCoordinates(coordinates);
        activity.setDescription(description);
        activity.setTheme(theme);
        activity.setAddress(address);
        activity.setStartTime(startTime);
        activity.setEndTime(endTime);
        activity.setActivityDate(activityDate);
        activity.setReasoning(reasoning);

        return activityRepository.save(activity);
    }


}
