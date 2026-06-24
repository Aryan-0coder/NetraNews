package com.netranews.service;
import java.util.*; 
import java.util.stream.Collectors; 
import org.springframework.stereotype.Service; 
import com.netranews.model.News; 
import com.netranews.repository.NewsRepository;
@Service public class NewsService {
  private final NewsRepository news; public NewsService(NewsRepository n){
    news=n;
  }
  public List<News> list(String category,String query){
    if(query!=null&&!query.trim().isEmpty())
      return news.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByPublishedAtDesc(query,query);
    if(category!=null&&!category.trim().isEmpty())
      return news.findByCategoryIgnoreCaseOrderByPublishedAtDesc(category);
    return news.findAll();
  }
  public News get(String id){return news.findById(id).orElseThrow(()->new NoSuchElementException("Article not found"));}
  public News save(News item){
    return news.save(item);
  }
  public void delete(String id){
    if(!news.existsById(id))throw new NoSuchElementException("Article not found");
    news.deleteById(id);
  }
  public List<News> saveAll(List<News> items){return news.saveAll(items);}
  // Stable sorting keeps chronological order inside preferred and non-preferred groups.
  public List<News> personalized(List<String> interests)
  {
    Set<String> preferred=new HashSet<>(interests==null?Collections.emptyList():interests);
    return news.findAll().stream().sorted(Comparator.comparing((News n)->!preferred.contains(n.getCategory()))).collect(Collectors.toList());
  }
}
