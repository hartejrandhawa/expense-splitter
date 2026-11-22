package com.expensesplitter.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 30)
            @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "can only contain letters, numbers, . _ and -")
            String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password // bcrypt ignores bytes past 72
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            String username
    ) {}
}
