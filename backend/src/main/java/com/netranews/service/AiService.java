package com.netranews.service;
import java.util.*; 
import org.springframework.beans.factory.annotation.Value; 
import org.springframework.http.*; 
import org.springframework.stereotype.Service; 
import org.springframework.web.client.RestTemplate; 
import com.fasterxml.jackson.databind.*; 
import com.netranews.dto.ApiDtos; 
import com.netranews.model.News;
@Service public class AiService {
  private final NewsService news; 
  private final RestTemplate http=new RestTemplate(); 
  private final ObjectMapper json=new ObjectMapper();
  @Value("${llm.api-key:}") private String apiKey;
  @Value("${llm.model}") private String model;
  @Value("${llm.base-url}") private String baseUrl;
  public AiService(NewsService n){news=n;}
  public ApiDtos.SummaryResponse summarize(ApiDtos.AiRequest req){
    News item=req.articleId==null?null:news.get(req.articleId);
    String content=item!=null?item.getTitle()+"\n"+item.getContent():req.content;
    String fallback=item!=null&&item.getSummary()!=null?item.getSummary():shorten(content);
    if(apiKey.isEmpty())return fallbackSummary(fallback, req.language);
    try{
      String prompt="Return valid JSON only: {\"summary\":\"short summary\",\"keyPoints\":[\"3 to 5 points\"]}. Language: "+req.language+"\nSummarize this news:\n"+content;
      JsonNode root=json.readTree(generate(prompt));
      List<String> points=new ArrayList<>();
      root.path("keyPoints").forEach(p->points.add(p.asText()));
      return new ApiDtos.SummaryResponse(root.path("summary").asText(fallback),points);
    }catch(Exception e){
      return fallbackSummary(fallback, req.language);
    }
  }
  
  public ApiDtos.ChatResponse chat(ApiDtos.AiRequest req){
    List<News> context=news.list(null,keyword(req.message));
    if(context.isEmpty())context=news.list(null,null);
    context=context.subList(0,Math.min(5,context.size()));
    StringBuilder source=new StringBuilder();
    for(News n:context) source.append("TITLE: ").append(n.getTitle()).append("\n").append(n.getSummary()).append("\n");

    // Language-aware offline fallback when API key is missing
    if(apiKey.isEmpty()){ 
      if(req!=null && req.language!=null && req.language.equalsIgnoreCase("hi")){
        return new ApiDtos.ChatResponse(context.isEmpty()?"No matching news found.":"प्रमुख खबरें: "+context.get(0).getTitle());
      }
      return new ApiDtos.ChatResponse(context.isEmpty()?"No matching news found.":"Top stories: "+context.get(0).getTitle());
    }

    try{
      // Hybrid: prefer the supplied NetraNews articles, but fall back to the model's own knowledge when they don't cover the question.
      String prompt="You are NetraBot, a helpful news assistant. Prefer the supplied NetraNews articles when they are relevant. If they do not cover the question, answer from your general knowledge and briefly note that it is not from NetraNews's articles. You have no live internet access, so for 'today'/'latest' style questions add a short caveat that your information may be out of date. Reply only in this language: "+req.language+".\nNEWS:\n"+source+"\nQUESTION: "+req.message;
      return new ApiDtos.ChatResponse(generate(prompt));
    }catch(Exception e){
      if(req!=null && req.language!=null && req.language.equalsIgnoreCase("hi")){
        return new ApiDtos.ChatResponse("अभी AI सेवा उपलब्ध नहीं है। संबंधित खबर: "+(context.isEmpty()?"नहीं मिली":context.get(0).getTitle()));
      }
      return new ApiDtos.ChatResponse("AI service unavailable. Related story: "+(context.isEmpty()?"not found":context.get(0).getTitle()));
    }
  }
  public Map<String,String> translate(String id,String language){News n=news.get(id);if(apiKey.isEmpty()){Map<String,String> m=new HashMap<>();m.put("title",n.getTitle());m.put("summary",n.getSummary());m.put("content",n.getContent());return m;}try{JsonNode root=json.readTree(generate("Translate to "+language+". Return JSON only with title, summary, content:\n"+json.writeValueAsString(n)));Map<String,String> m=new HashMap<>();m.put("title",root.path("title").asText());m.put("summary",root.path("summary").asText());m.put("content",root.path("content").asText());return m;}catch(Exception e){throw new IllegalStateException("Translation service unavailable");}}
  // OpenAI-compatible chat completions (Groq, OpenRouter, Mistral, Ollama, LM Studio, ...). Provider is set via llm.base-url / llm.model.
  private String generate(String prompt)throws Exception{
    String url=baseUrl+"/chat/completions";
    Map<String,Object> message=new HashMap<>();message.put("role","user");message.put("content",prompt);
    Map<String,Object> body=new HashMap<>();body.put("model",model);body.put("messages",Collections.singletonList(message));body.put("temperature",0.3);
    HttpHeaders headers=new HttpHeaders();headers.setContentType(MediaType.APPLICATION_JSON);headers.setBearerAuth(apiKey);
    ResponseEntity<JsonNode> res=http.postForEntity(url,new HttpEntity<>(body,headers),JsonNode.class);
    return res.getBody().path("choices").path(0).path("message").path("content").asText().replace("```json","").replace("```","").trim();
  }
  // Offline/no-key fallback. Without the LLM we cannot translate the (Hindi) source summary `s`,
  // so for non-Hindi we return fully localized generic text instead of presenting Hindi as English/French/Spanish.
  private ApiDtos.SummaryResponse fallbackSummary(String s,String language){
    String lang=language==null?"hi":language.toLowerCase();
    switch(lang){
      case "en": return new ApiDtos.SummaryResponse("An AI summary is unavailable right now; here are the key points.",Arrays.asList("This article covers the main information about current events.","The development may affect the related sector.","Await official updates for more details."));
      case "fr": return new ApiDtos.SummaryResponse("Le résumé IA est indisponible pour le moment ; voici les points clés.",Arrays.asList("Cet article présente les principales informations sur l'actualité.","Cet événement pourrait affecter le secteur concerné.","Attendez les mises à jour officielles pour plus de détails."));
      case "es": return new ApiDtos.SummaryResponse("El resumen con IA no está disponible ahora; estos son los puntos clave.",Arrays.asList("Este artículo presenta la información principal sobre la actualidad.","El acontecimiento podría afectar al sector relacionado.","Espere actualizaciones oficiales para más detalles."));
      default: return new ApiDtos.SummaryResponse(s,Arrays.asList("यह लेख वर्तमान घटनाक्रम की मुख्य जानकारी देता है।",s,"आगे के आधिकारिक अपडेट की प्रतीक्षा है।"));
    }
  }
  private String shorten(String s){return s==null?"Summary unavailable":s.substring(0,Math.min(240,s.length()));} private String keyword(String q){if(q==null)return "";String x=q.replaceAll("(?i)(what|show|summarize|today|news|is|the|की|खबर|दिखाएं|सार)"," ").trim();return x;}
}
