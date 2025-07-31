package ro.eduardismund.tastetrails_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.eduardismund.tastetrails_backend.model.Itinerary;
import ro.eduardismund.tastetrails_backend.repository.ItineraryRepository;
import ro.eduardismund.tastetrails_backend.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ItineraryService {
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;

    public Itinerary createItinerary(UUID userId, String destination, String coordinates, List<String> bounds, LocalDate startDate, LocalDate endDate) {

        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        if(endDate.isBefore(startDate)){
            throw new RuntimeException("End date is before start date");
        }

        final var itinerary = Itinerary.builder()
                .user(user)
                .destination(destination)
                .coordinates(coordinates)
                .bounds(bounds)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return itineraryRepository.save(itinerary);

    }

    @Transactional(readOnly = true)
    public List<Itinerary> findByUserId(UUID userId) {
        return itineraryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<String> getAllDestinationsByUserId(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        return itineraryRepository.findAllDestinationsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Itinerary> findUpcomingItineraries(UUID userId) {
        return itineraryRepository.findUpcomingItinerariesByUserId(userId, LocalDate.now());
    }
    @Transactional(readOnly = true)
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
