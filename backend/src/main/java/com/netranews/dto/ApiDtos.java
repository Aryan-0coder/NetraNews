package com.netranews.dto;
import java.util.ArrayList; import java.util.List; import javax.validation.constraints.Email; import javax.validation.constraints.NotBlank;
public final class ApiDtos {
  private ApiDtos(){}
  public static class Register { @NotBlank public String fullName; @Email public String email; @NotBlank public String password; public List<String> interests=new ArrayList<>(); }
  public static class Login { @Email public String email; @NotBlank public String password; }
  public static class AuthResponse { public String id,fullName,email,role; public List<String> interests; public AuthResponse(String i,String n,String e,String r,List<String> x){id=i;fullName=n;email=e;role=r;interests=x;} }
  public static class Interests { public List<String> interests=new ArrayList<>(); }
  public static class CommentRequest { @NotBlank public String userEmail; @NotBlank public String userName; @NotBlank public String text; }
  public static class AiRequest { public String articleId; public String content; public String message; public String language="hi"; }
  public static class SummaryResponse { public String summary; public List<String> keyPoints; public SummaryResponse(String s,List<String> k){summary=s;keyPoints=k;} }
  public static class ChatResponse { public String answer; public ChatResponse(String a){answer=a;} }
}
