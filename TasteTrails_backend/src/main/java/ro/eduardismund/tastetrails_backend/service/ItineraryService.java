package ro.eduardismund.tastetrails_backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ro.eduardismund.tastetrails_backend.model.Itinerary;
import ro.eduardismund.tastetrails_backend.model.TasteProfile;
import ro.eduardismund.tastetrails_backend.repository.ItineraryRepository;
import ro.eduardismund.tastetrails_backend.repository.TasteProfileRepository;
import ro.eduardismund.tastetrails_backend.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ItineraryService {
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;

    public Itinerary createItinerary(UUID userId, String destination, LocalDate startDate, LocalDate endDate, List<Map<String, Object>> activities) {

        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        if(endDate.isBefore(startDate)){
            throw new RuntimeException("End date is before start date");
        }

        final var itinerary = Itinerary.builder()
                .user(user)
                .destination(destination)
                .startDate(startDate)
                .endDate(endDate)
                .activities(activities)
                .build();

        return itineraryRepository.save(itinerary);

    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public List<Itinerary> findByUserId(UUID userId) {
        return itineraryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public List<Itinerary> findUpcomingItineraries(UUID userId) {
        return itineraryRepository.findUpcomingItinerariesByUserId(userId, LocalDate.now());
    }
    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public Optional<Itinerary> findById(UUID itineraryId) {
        return itineraryRepository.findById(itineraryId);
    }

    public void deleteItinerary(UUID itineraryId) {
        if(!itineraryRepository.existsById(itineraryId)) {
            throw new RuntimeException("Itinerary Not Found");
        }
        itineraryRepository.deleteById(itineraryId);
    }
}
