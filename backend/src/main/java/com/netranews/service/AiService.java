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
  @Value("${gemini.api-key:}") 
  private String apiKey; @Value("${gemini.model}") private String model;
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
      return new ApiDtos.ChatResponse(generate("Answer only from the supplied news. Say when information is unavailable. Language: "+req.language+"\nNEWS:\n"+source+"\nQUESTION: "+req.message));
    }catch(Exception e){
      if(req!=null && req.language!=null && req.language.equalsIgnoreCase("hi")){
        return new ApiDtos.ChatResponse("अभी AI सेवा उपलब्ध नहीं है। संबंधित खबर: "+(context.isEmpty()?"नहीं मिली":context.get(0).getTitle()));
      }
      return new ApiDtos.ChatResponse("AI service unavailable. Related story: "+(context.isEmpty()?"not found":context.get(0).getTitle()));
    }
  }
  public Map<String,String> translate(String id,String language){News n=news.get(id);if(apiKey.isEmpty()){Map<String,String> m=new HashMap<>();m.put("title",n.getTitle());m.put("summary",n.getSummary());m.put("content",n.getContent());return m;}try{JsonNode root=json.readTree(generate("Translate to "+language+". Return JSON only with title, summary, content:\n"+json.writeValueAsString(n)));Map<String,String> m=new HashMap<>();m.put("title",root.path("title").asText());m.put("summary",root.path("summary").asText());m.put("content",root.path("content").asText());return m;}catch(Exception e){throw new IllegalStateException("Translation service unavailable");}}
  private String generate(String prompt)throws Exception{String url="https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent?key="+apiKey;Map<String,Object> part=Collections.singletonMap("text",prompt);Map<String,Object> content=Collections.singletonMap("parts",Collections.singletonList(part));Map<String,Object> body=Collections.singletonMap("contents",Collections.singletonList(content));ResponseEntity<JsonNode> res=http.postForEntity(url,body,JsonNode.class);return res.getBody().path("candidates").path(0).path("content").path("parts").path(0).path("text").asText().replace("```json","").replace("```","").trim();}
  private ApiDtos.SummaryResponse fallbackSummary(String s,String language){
    if(language!=null && language.equalsIgnoreCase("hi")){
      return new ApiDtos.SummaryResponse(s,Arrays.asList("यह लेख वर्तमान घटनाक्रम की मुख्य जानकारी देता है।",s,"आगे के आधिकारिक अपडेट की प्रतीक्षा है।"));
    }
    return new ApiDtos.SummaryResponse(s,Arrays.asList("This article provides the main information about current events.",s,"Await official updates for more details."));
  }
  private String shorten(String s){return s==null?"Summary unavailable":s.substring(0,Math.min(240,s.length()));} private String keyword(String q){if(q==null)return "";String x=q.replaceAll("(?i)(what|show|summarize|today|news|is|the|की|खबर|दिखाएं|सार)"," ").trim();return x;}
}
