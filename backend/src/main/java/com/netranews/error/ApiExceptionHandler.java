package com.netranews.error;
import java.time.Instant; import java.util.*; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<Map<String,Object>> missing(Exception e){return error(HttpStatus.NOT_FOUND,e.getMessage());}
 @ExceptionHandler({IllegalArgumentException.class,MethodArgumentNotValidException.class}) ResponseEntity<Map<String,Object>> bad(Exception e){return error(HttpStatus.BAD_REQUEST,e.getMessage());}
 @ExceptionHandler(IllegalStateException.class) ResponseEntity<Map<String,Object>> unavailable(Exception e){return error(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage());}
 private ResponseEntity<Map<String,Object>> error(HttpStatus status,String message){Map<String,Object> body=new LinkedHashMap<>();body.put("timestamp",Instant.now());body.put("status",status.value());body.put("error",message);return ResponseEntity.status(status).body(body);}
}
