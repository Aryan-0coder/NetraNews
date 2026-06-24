package com.netranews.repository;
import java.util.List; import java.util.Optional; import org.springframework.data.mongodb.repository.MongoRepository; import com.netranews.model.Bookmark;
public interface BookmarkRepository extends MongoRepository<Bookmark,String> { List<Bookmark> findByUserEmail(String email); Optional<Bookmark> findByUserEmailAndNewsId(String email,String newsId); }
