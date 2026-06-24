package com.netranews.controller;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import com.netranews.dto.ApiDtos;
import com.netranews.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiController {
  private final AiService ai;

  public AiController(AiService a){ai=a;}

  @PostMapping("/summarize")
  public ApiDtos.SummaryResponse summary(@RequestBody ApiDtos.AiRequest req){
    return ai.summarize(req);
  }

  @PostMapping("/chat")
  public ApiDtos.ChatResponse chat(@RequestBody ApiDtos.AiRequest req){
    return ai.chat(req);
  }

  @GetMapping("/translate/{id}/{language}")
  public Map<String,String> translate(@PathVariable String id,@PathVariable String language){
    return ai.translate(id,language);
  }
}
