package jpademo.jpademo.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jpademo.jpademo.forum.model.ForumComment;
import jpademo.jpademo.forum.model.ForumPost;
import jpademo.jpademo.model.repository.ForumPostRepository;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ForumController {

    private final ForumPostRepository repo;

    public ForumController(ForumPostRepository repo) {
        this.repo = repo;
    }

    // Inner classes for request bodies
    public static class CreatePostRequest {
        private String title;
        private String content;
        private String category;
        private String authorName;
        private String authorId;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        
        public String getAuthorId() { return authorId; }
        public void setAuthorId(String authorId) { this.authorId = authorId; }
    }

    public static class CommentRequest {
        private String text;
        private String authorName;
        private String authorId;

        // Getters and Setters
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        
        public String getAuthorId() { return authorId; }
        public void setAuthorId(String authorId) { this.authorId = authorId; }
    }

    public static class ReactionRequest {
        private String userId;

        // Getter and Setter
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }

    // GET all posts
    @GetMapping("/posts")
    public List<ForumPost> getAllPosts() {
        return repo.findAllByOrderByTimestampDesc();
    }

    // CREATE new post
    @PostMapping("/posts")
    public ResponseEntity<ForumPost> createPost(@RequestBody CreatePostRequest req) {
        ForumPost post = new ForumPost();
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setCategory(req.getCategory());
        post.setAuthorName(req.getAuthorName());
        post.setAuthorId(req.getAuthorId());
        post.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(post));
    }

    // ADD comment to post
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<ForumPost> addComment(@PathVariable String id, @RequestBody CommentRequest req) {
        ForumPost post = repo.findById(id).orElseThrow(() -> 
            new RuntimeException("Post not found with id: " + id));
        
        ForumComment comment = new ForumComment();
        comment.setPost(post);
        comment.setAuthorName(req.getAuthorName());
        comment.setAuthorId(req.getAuthorId());
        comment.setText(req.getText());
        comment.setTimestamp(LocalDateTime.now());
        
        post.getComments().add(comment);
        return ResponseEntity.ok(repo.save(post));
    }

    // LIKE post
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<ForumPost> likePost(@PathVariable String id, @RequestBody ReactionRequest req) {
        ForumPost post = repo.findById(id).orElseThrow(() -> 
            new RuntimeException("Post not found with id: " + id));
        
        String userId = req.getUserId();
        boolean alreadyLiked = post.getLikedBy().contains(userId);
        boolean alreadyDisliked = post.getDislikedBy().contains(userId);

        if (alreadyLiked) {
            // Remove like
            post.getLikedBy().remove(userId);
            post.setLikes(Math.max(0, post.getLikes() - 1));
        } else {
            // Add like
            post.getLikedBy().add(userId);
            post.setLikes(post.getLikes() + 1);
            
            // Remove dislike if exists
            if (alreadyDisliked) {
                post.getDislikedBy().remove(userId);
                post.setDislikes(Math.max(0, post.getDislikes() - 1));
            }
        }
        
        return ResponseEntity.ok(repo.save(post));
    }

    // DISLIKE post
    @PostMapping("/posts/{id}/dislike")
    public ResponseEntity<ForumPost> dislikePost(@PathVariable String id, @RequestBody ReactionRequest req) {
        ForumPost post = repo.findById(id).orElseThrow(() -> 
            new RuntimeException("Post not found with id: " + id));
        
        String userId = req.getUserId();
        boolean alreadyLiked = post.getLikedBy().contains(userId);
        boolean alreadyDisliked = post.getDislikedBy().contains(userId);

        if (alreadyDisliked) {
            // Remove dislike
            post.getDislikedBy().remove(userId);
            post.setDislikes(Math.max(0, post.getDislikes() - 1));
        } else {
            // Add dislike
            post.getDislikedBy().add(userId);
            post.setDislikes(post.getDislikes() + 1);
            
            // Remove like if exists
            if (alreadyLiked) {
                post.getLikedBy().remove(userId);
                post.setLikes(Math.max(0, post.getLikes() - 1));
            }
        }
        
        return ResponseEntity.ok(repo.save(post));
    }

    // DELETE post
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id, @RequestParam String userId) {
        try {
            System.out.println("=== DELETE REQUEST ===");
            System.out.println("Post ID: " + id);
            System.out.println("User ID: " + userId);
            
            ForumPost post = repo.findById(id).orElse(null);
            
            if (post == null) {
                System.out.println("ERROR: Post not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Post not found");
            }
            
            System.out.println("Post found!");
            System.out.println("Post Author ID: " + post.getAuthorId());
            System.out.println("Requesting User ID: " + userId);
            
            // Check if the user is the author of the post
            if (!post.getAuthorId().equals(userId)) {
                System.out.println("ERROR: User is not authorized to delete this post");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own posts");
            }
            
            System.out.println("Authorization successful. Deleting post...");
            repo.deleteById(id);
            System.out.println("Post deleted successfully!");
            
            return ResponseEntity.ok().body("Post deleted successfully");
            
        } catch (Exception e) {
            System.out.println("ERROR: Exception occurred while deleting post");
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete post: " + e.getMessage());
        }
    }
}