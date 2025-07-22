package ro.eduardismund.tastetrails_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.eduardismund.tastetrails_backend.dtos.*;
import ro.eduardismund.tastetrails_backend.service.UserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173"})
public class UserController {
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        try{
            final var user = userService.createUser(
                    request.getEmail(),
                    request.getName(),
                    request.getPassword()
            );

            final var response = UserResponse.fromUser(user);
            final var apiResponse = ApiResponse.success("User Created Successfully", response);

            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        } catch( RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId) {
     return userService.findById(userId)
             .map(user -> {
                 final var response = UserResponse.fromUser(user);
                 return ResponseEntity.ok(ApiResponse.success("User found", response));
             }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found")));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try{
            final var user = userService.authenticateUser(request.getEmail(), request.getPassword());

            final var loginResponse = LoginResponse.builder().
                    user(UserResponse.fromUser(user))
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
        } catch( RuntimeException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        final var users = userService.getAllUsers();
        final var responses = users.stream().map(UserResponse::fromUser)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", responses));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists( @RequestParam String email) {
        boolean exists = userService.findByEmail(email).isPresent();
        String message = exists ? "Email already exists" : "Email is available";

        return ResponseEntity.ok(ApiResponse.success(message, exists));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getUserCount() {
        final long count = userService.getAllUsers().size();
        return ResponseEntity.ok(ApiResponse.success("User count fetched", count));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        try{
            userService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

