package com.netranews.model;
import org.springframework.data.annotation.Id; import org.springframework.data.mongodb.core.index.CompoundIndex; import org.springframework.data.mongodb.core.mapping.Document;
@Document("bookmarks") @CompoundIndex(name="user_news_unique",def="{'userEmail':1,'newsId':1}",unique=true)
public class Bookmark { @Id private String id; private String userEmail; private String newsId; public String getId(){return id;} public String getUserEmail(){return userEmail;} public void setUserEmail(String v){userEmail=v;} public String getNewsId(){return newsId;} public void setNewsId(String v){newsId=v;} }
