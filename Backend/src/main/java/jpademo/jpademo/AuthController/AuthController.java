package jpademo.jpademo.AuthController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jpademo.jpademo.config.JwtUtil;
import jpademo.jpademo.model.User;
import jpademo.jpademo.model.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            // Validate input
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return createErrorResponse("Username is required", HttpStatus.BAD_REQUEST);
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return createErrorResponse("Email is required", HttpStatus.BAD_REQUEST);
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return createErrorResponse("Password is required", HttpStatus.BAD_REQUEST);
            }
            if (user.getPassword().length() < 6) {
                return createErrorResponse("Password must be at least 6 characters", HttpStatus.BAD_REQUEST);
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return createErrorResponse("Email already registered", HttpStatus.BAD_REQUEST);
            }
            
            // Encrypt password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Set default role if not provided
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }
            
            // Save user to database
            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                savedUser.getEmail(), 
                savedUser.getId(), 
                savedUser.getUsername()
            );
            
            // Return response with user data
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account created successfully!");
            response.put("token", token);
            
            // Add user object to response
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", savedUser.getId());
            userMap.put("username", savedUser.getUsername());
            userMap.put("email", savedUser.getEmail());
            userMap.put("role", savedUser.getRole());
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return createErrorResponse("Error creating account: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            // Validate input
            if (email == null || email.trim().isEmpty()) {
                return createErrorResponse("Email is required", HttpStatus.BAD_REQUEST);
            }
            if (password == null || password.trim().isEmpty()) {
                return createErrorResponse("Password is required", HttpStatus.BAD_REQUEST);
            }
            
            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return createErrorResponse("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }
            
            User user = userOpt.get();
            
            // Check password with BCrypt
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return createErrorResponse("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                user.getEmail(), 
                user.getId(), 
                user.getUsername()
            );
            
            // Return success response with user data
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            
            // Add user object to response
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return createErrorResponse("Error logging in: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Helper method to create error response
    private ResponseEntity<?> createErrorResponse(String message, HttpStatus status) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.status(status).body(response);
    }
}