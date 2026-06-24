package com.netranews.model;

import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("users")
public class User {
  @Id private String id;
  @NotBlank private String fullName;
  @Email @Indexed(unique=true) private String email;
  private String passwordHash;
  private String role="USER";
  private List<String> interests=new ArrayList<>();
  public String getId(){return id;} public void setId(String v){id=v;}
  public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
  public String getEmail(){return email;} public void setEmail(String v){email=v;}
  public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
  public String getRole(){return role;} public void setRole(String v){role=v;}
  public List<String> getInterests(){return interests;} public void setInterests(List<String> v){interests=v;}
}
