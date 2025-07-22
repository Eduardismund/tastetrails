package ro.eduardismund.tastetrails_backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private UserResponse user;

}
