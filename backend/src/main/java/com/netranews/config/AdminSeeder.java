package com.netranews.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.netranews.model.User;
import com.netranews.repository.UserRepository;
// Seeds / promotes an ADMIN account at startup from ADMIN_EMAIL + ADMIN_PASSWORD so the
// role-gated admin dashboard is reachable. No-op when either env var is blank. An existing
// user is promoted to ADMIN without changing their password; a missing one is created.
@Configuration
public class AdminSeeder implements CommandLineRunner {
  private final UserRepository users; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
  @Value("${admin.email:}") private String email; @Value("${admin.password:}") private String password;
  public AdminSeeder(UserRepository u){users=u;}
  @Override public void run(String... args){
    if(email==null||email.trim().isEmpty()||password==null||password.isEmpty())return;
    String e=email.trim().toLowerCase();
    User u=users.findByEmailIgnoreCase(e).orElseGet(User::new);
    boolean isNew=u.getId()==null;
    if(isNew){u.setFullName("NetraNews Admin");u.setEmail(e);u.setPasswordHash(encoder.encode(password));}
    u.setRole("ADMIN");
    users.save(u);
    System.out.println("[AdminSeeder] "+(isNew?"created":"promoted")+" admin user: "+e);
  }
}
