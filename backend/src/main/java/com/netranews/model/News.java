package com.netranews.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("news")
public class News {
  @Id private String id;
  @NotBlank @TextIndexed(weight=3) private String title;
  @NotBlank @TextIndexed private String content;
  @TextIndexed private String summary;
  @NotBlank private String category;
  private String imageUrl;
  private String author;
  private Instant publishedAt=Instant.now();
  private List<String> tags=new ArrayList<>();
  public String getId(){return id;} public void setId(String v){id=v;}
  public String getTitle(){return title;} public void setTitle(String v){title=v;}
  public String getContent(){return content;} public void setContent(String v){content=v;}
  public String getSummary(){return summary;} public void setSummary(String v){summary=v;}
  public String getCategory(){return category;} public void setCategory(String v){category=v;}
  public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;}
  public String getAuthor(){return author;} public void setAuthor(String v){author=v;}
  public Instant getPublishedAt(){return publishedAt;} public void setPublishedAt(Instant v){publishedAt=v;}
  public List<String> getTags(){return tags;} public void setTags(List<String> v){tags=v;}
}
