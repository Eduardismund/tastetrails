package ro.eduardismund.tastetrails_backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ro.eduardismund.tastetrails_backend.model.User;
import ro.eduardismund.tastetrails_backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String email, String name, String password) {
        if(userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email " + email + " already exists");
        }

        final var user = User.builder()
                .email(email.toLowerCase().trim())
                .name(name.trim())
                .password(passwordEncoder.encode(password))
                .build();

        return userRepository.save(user);

    }

    public User authenticateUser(String email, String password){
        final var user = findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email " + email + " does not exist"));

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        return user;
    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public void deleteUser(UUID id) {
        if(!userRepository.existsById(id)) {
            throw new RuntimeException("User with id " + id + " does not exist");
        }
        userRepository.deleteById(id);
    }
}
