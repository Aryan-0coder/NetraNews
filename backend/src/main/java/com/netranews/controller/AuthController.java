package com.netranews.controller;
import javax.validation.Valid; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import com.netranews.dto.ApiDtos; import com.netranews.service.AuthService;
@RestController @RequestMapping("/api/auth") public class AuthController {private final AuthService auth;public AuthController(AuthService a){auth=a;}
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public ApiDtos.AuthResponse register(@Valid @RequestBody ApiDtos.Register r){return auth.register(r);}
 @PostMapping("/login") public ApiDtos.AuthResponse login(@Valid @RequestBody ApiDtos.Login r){return auth.login(r);}
 @PutMapping("/users/{email}/interests") public ApiDtos.AuthResponse interests(@PathVariable String email,@RequestBody ApiDtos.Interests r){return auth.interests(email,r);}
}
