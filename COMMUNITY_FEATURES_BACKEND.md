# CeyHarvest Community Features - Backend API Documentation

## 🌾 Overview

The CeyHarvest Community Features provide a social platform for farmers to share crop updates, connect with fellow farmers, and build an agricultural community. This document covers the complete backend implementation.

## 📋 Features Implemented

### ✅ Core Features
- **Post Creation**: Farmers can create posts with text and images
- **Social Interactions**: Like/unlike posts and add comments
- **Community Feed**: View all posts from the farming community
- **Search & Filter**: Search posts by content and filter by location
- **User Management**: Track post ownership and user interactions
- **Statistics**: Community engagement metrics

### ✅ Technical Features
- **RESTful API**: Complete REST API for all operations
- **MongoDB Integration**: Persistent data storage
- **Image Support**: Base64 image encoding for crop photos
- **Error Handling**: Comprehensive error responses
- **Cross-Origin Support**: CORS enabled for frontend integration

## 🗄️ Database Schema

### CropPost Collection
```javascript
{
  "_id": "ObjectId",
  "farmerId": "String",
  "farmerName": "String",
  "farmerLocation": "String",
  "description": "String",
  "imageBase64": "String", // Base64 encoded image
  "likes": "Number",
  "likedByUserIds": ["String"],
  "comments": [CropComment],
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### CropComment Schema
```javascript
{
  "id": "String",
  "userId": "String",
  "userName": "String",
  "text": "String",
  "createdAt": "LocalDateTime"
}
```

## 🌐 API Endpoints

### 📝 Community Posts API (`/api/community`)

#### Get All Posts
```http
GET /api/community/posts
Response: CropPost[]
```

#### Create New Post
```http
POST /api/community/posts
Headers: User-ID: {farmerId}
Body: {
  "description": "String",
  "imageBase64": "String" // Optional
}
Response: CropPost
```

#### Get Specific Post
```http
GET /api/community/posts/{postId}
Response: CropPost
```

#### Like/Unlike Post
```http
POST /api/community/posts/{postId}/like
Headers: User-ID: {userId}
Response: CropPost (updated)
```

#### Add Comment
```http
POST /api/community/posts/{postId}/comments
Headers: User-ID: {userId}
Body: {
  "text": "String"
}
Response: CropPost (updated)
```

#### Delete Post
```http
DELETE /api/community/posts/{postId}
Headers: User-ID: {farmerId}
Response: {"message": "Post deleted successfully"}
```

#### Search Posts
```http
GET /api/community/posts/search?q={searchQuery}
Response: CropPost[]
```

#### Get Posts by Location
```http
GET /api/community/posts/location/{location}
Response: CropPost[]
```

#### Get Farmer Statistics
```http
GET /api/community/farmer/{farmerId}/stats
Response: {
  "totalPosts": Number
}
```

### 👨‍🌾 Farmer-Specific API (`/api/farmer/{farmerId}/community`)

#### Get Community Feed
```http
GET /api/farmer/{farmerId}/community/feed
Response: CropPost[]
```

#### Get My Posts
```http
GET /api/farmer/{farmerId}/community/posts
Response: CropPost[]
```

#### Create Post (Farmer-specific)
```http
POST /api/farmer/{farmerId}/community/posts
Body: {
  "description": "String",
  "imageBase64": "String" // Optional
}
Response: CropPost
```

#### Like Post (Farmer-specific)
```http
POST /api/farmer/{farmerId}/community/posts/{postId}/like
Response: CropPost
```

#### Add Comment (Farmer-specific)
```http
POST /api/farmer/{farmerId}/community/posts/{postId}/comments
Body: {
  "text": "String"
}
Response: CropPost
```

#### Delete Post (Farmer-specific)
```http
DELETE /api/farmer/{farmerId}/community/posts/{postId}
Response: {"message": "Post deleted successfully"}
```

#### Get Community Stats
```http
GET /api/farmer/{farmerId}/community/stats
Response: {
  "totalPosts": Number,
  "totalCommunityPosts": Number
}
```

### 🧪 Development/Testing API (`/api/dev/community`)

#### Create Sample Data
```http
POST /api/dev/community/create-sample-posts
Response: {
  "message": "Sample community posts created successfully",
  "postsCreated": Number,
  "totalComments": Number
}
```

#### Get Development Stats
```http
GET /api/dev/community/stats
Response: {
  "totalPosts": Number,
  "status": "Community features are working"
}
```

#### Clear All Data
```http
DELETE /api/dev/community/clear-all
Response: {
  "message": "All community data cleared successfully"
}
```

## 🏗️ Architecture

### Backend Components

1. **Documents (`com.ceyharvest.ceyharvest.document`)**
   - `CropPost.java` - Main post entity
   - `CropComment.java` - Comment entity

2. **Repositories (`com.ceyharvest.ceyharvest.repository`)**
   - `CropPostRepository.java` - Data access layer

3. **Services (`com.ceyharvest.ceyharvest.service`)**
   - `CropPostService.java` - Business logic layer

4. **Controllers (`com.ceyharvest.ceyharvest.controller`)**
   - `social/CropPostController.java` - General community API
   - `farmer/FarmerCommunityController.java` - Farmer-specific API
   - `dev/CommunityTestDataController.java` - Development tools

5. **DTOs (`com.ceyharvest.ceyharvest.dto`)**
   - `CreatePostRequest.java` - Post creation request
   - `AddCommentRequest.java` - Comment addition request

## 🔧 Integration Guide

### Frontend Integration

1. **Update API Calls**: Replace mock data with real API endpoints
2. **Authentication**: Add user headers to requests
3. **Error Handling**: Implement proper error responses
4. **Image Upload**: Convert images to base64 before sending

### Example Frontend Integration:
```javascript
// Create a new post
const createPost = async (description, imageFile) => {
  const formData = {
    description: description,
    imageBase64: imageFile ? await convertToBase64(imageFile) : null
  };
  
  const response = await fetch('/api/community/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-ID': user.id
    },
    body: JSON.stringify(formData)
  });
  
  return response.json();
};

// Get community feed
const getCommunityFeed = async (farmerId) => {
  const response = await fetch(`/api/farmer/${farmerId}/community/feed`);
  return response.json();
};
```

## 🧪 Testing

### Run Tests
```powershell
# Run the comprehensive test script
.\test_community_features.ps1
```

### Manual Testing
1. Start the backend server
2. Create sample data: `POST /api/dev/community/create-sample-posts`
3. Test endpoints using the provided PowerShell script
4. Verify data in MongoDB

## 🚀 Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live feed updates
2. **Advanced Search**: Full-text search with MongoDB Atlas Search
3. **Image Storage**: Integration with cloud storage services
4. **Notifications**: Push notifications for interactions
5. **User Relationships**: Follow/unfollow farmers
6. **Content Moderation**: Admin tools for community management
7. **Expert Integration**: Verified expert farmers and advice
8. **Regional Groups**: Location-based community groups

### Performance Optimizations
1. **Pagination**: Implement pagination for large feeds
2. **Caching**: Redis integration for frequently accessed data
3. **Image Optimization**: Compress and resize images
4. **Database Indexing**: Optimize MongoDB queries

## 🔒 Security Considerations

### Current Implementation
- ✅ User ID validation
- ✅ Post ownership verification
- ✅ Input sanitization
- ✅ Error message sanitization

### Recommended Additions
- JWT token validation
- Rate limiting
- Content filtering
- Image validation
- HTTPS enforcement

## 📊 Monitoring & Analytics

### Metrics to Track
- Post creation rate
- User engagement (likes, comments)
- Community growth
- Popular content topics
- Regional activity

### Logging
- All API requests
- Error occurrences
- User interactions
- Performance metrics

## 🤝 Contributing

When extending the community features:

1. Follow the established naming conventions
2. Add comprehensive error handling
3. Update this documentation
4. Add appropriate tests
5. Consider scalability implications

## 📞 Support

For questions or issues with the community features:
- Check the test script output for common issues
- Verify MongoDB connection
- Ensure all dependencies are installed
- Review error logs for detailed information

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Status**: Production Ready
