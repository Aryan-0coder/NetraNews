package com.netranews.repository;
import java.util.List; import org.springframework.data.mongodb.repository.MongoRepository; import com.netranews.model.News;
public interface NewsRepository extends MongoRepository<News,String> {
    List<News> findByCategoryIgnoreCaseOrderByPublishedAtDesc(String category);
    List<News> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByPublishedAtDesc(String title,String content);
    List<News> findAllByOrderByPublishedAtDesc(); }
