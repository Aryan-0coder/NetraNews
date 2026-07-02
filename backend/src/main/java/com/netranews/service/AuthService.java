package com.netranews.service;
import java.util.NoSuchElementException; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.stereotype.Service; import com.netranews.dto.ApiDtos; import com.netranews.model.User; import com.netranews.repository.UserRepository;
@Service public class AuthService { private final UserRepository users; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(); public AuthService(UserRepository u){users=u;}
  public ApiDtos.AuthResponse register(ApiDtos.Register r){if(users.existsByEmailIgnoreCase(r.email))throw new IllegalArgumentException("Email is already registered");User u=new User();u.setFullName(r.fullName);u.setEmail(r.email.toLowerCase());u.setPasswordHash(encoder.encode(r.password));u.setInterests(r.interests);return response(users.save(u));}
  public ApiDtos.AuthResponse login(ApiDtos.Login r){User u=users.findByEmailIgnoreCase(r.email).orElseThrow(()->new NoSuchElementException("Invalid email or password"));if(!encoder.matches(r.password,u.getPasswordHash()))throw new NoSuchElementException("Invalid email or password");return response(u);}
  public ApiDtos.AuthResponse interests(String email,ApiDtos.Interests req){User u=users.findByEmailIgnoreCase(email).orElseThrow(()->new NoSuchElementException("User not found"));u.setInterests(req.interests);return response(users.save(u));}
  public User user(String email){return users.findByEmailIgnoreCase(email).orElseThrow(()->new NoSuchElementException("User not found"));}
  public void requireAdmin(String email){if(email==null||email.trim().isEmpty()||!"ADMIN".equals(users.findByEmailIgnoreCase(email).map(User::getRole).orElse(null)))throw new SecurityException("Admin access required");}
  private ApiDtos.AuthResponse response(User u){return new ApiDtos.AuthResponse(u.getId(),u.getFullName(),u.getEmail(),u.getRole(),u.getInterests());}
}
