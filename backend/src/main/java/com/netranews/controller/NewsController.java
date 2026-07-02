package com.netranews.controller;
import java.util.List; import javax.validation.Valid; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import com.netranews.model.News; import com.netranews.service.NewsService; import com.netranews.service.AuthService;
@RestController @RequestMapping("/api/news") public class NewsController {
  private final NewsService news;
  private final AuthService auth;
  public NewsController(NewsService n,AuthService a){
    news=n;auth=a;
  }
  @GetMapping
  public List<News> list(@RequestParam(required=false) String category, @RequestParam(required=false,name="q")String query){
    return news.list(category,query);
  }
  @GetMapping("/{id}")
  public News one(@PathVariable String id){
    return news.get(id);
  }
  @GetMapping("/feed/{email}") public List<News> feed(@PathVariable String email){
    return news.personalized(auth.user(email).getInterests());
  }
  @PostMapping @ResponseStatus(HttpStatus.CREATED) public News create(@RequestHeader(value="X-User-Email",required=false) String actor,@Valid @RequestBody News item){
    auth.requireAdmin(actor);return news.save(item);
  }
  // Allows Postman or an admin import tool to seed multiple articles in one request.
  @PostMapping("/bulk") @ResponseStatus(HttpStatus.CREATED) public List<News> createBulk(@RequestHeader(value="X-User-Email",required=false) String actor,@RequestBody List<@Valid News> items){auth.requireAdmin(actor);return news.saveAll(items);}
  @PutMapping("/{id}") public News update(@RequestHeader(value="X-User-Email",required=false) String actor,@PathVariable String id,@Valid @RequestBody News item){auth.requireAdmin(actor);news.get(id);item.setId(id);return news.save(item);}
  @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@RequestHeader(value="X-User-Email",required=false) String actor,@PathVariable String id){auth.requireAdmin(actor);news.delete(id);}
  @GetMapping("/count")
  public long count() {
    return news.list(null, null).size();
  }
}
