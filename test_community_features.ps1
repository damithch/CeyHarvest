# CeyHarvest Community Features Testing Script
# This script tests the newly implemented community/social features

Write-Host "================================" -ForegroundColor Green
Write-Host "🌾 CeyHarvest Community Features Testing" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8080"

# Test 1: Create sample community data
Write-Host "📝 Test 1: Creating sample community posts..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dev/community/create-sample-posts" -Method POST -ContentType "application/json"
    Write-Host "✅ Sample posts created successfully!" -ForegroundColor Green
    Write-Host "   Posts created: $($response.postsCreated)" -ForegroundColor White
    Write-Host "   Total comments: $($response.totalComments)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to create sample posts: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get all community posts
Write-Host "📋 Test 2: Fetching all community posts..." -ForegroundColor Cyan
try {
    $posts = Invoke-RestMethod -Uri "$baseUrl/api/community/posts" -Method GET
    Write-Host "✅ Successfully fetched community posts!" -ForegroundColor Green
    Write-Host "   Total posts: $($posts.Count)" -ForegroundColor White
    
    foreach ($post in $posts) {
        Write-Host "   📝 $($post.farmerName) from $($post.farmerLocation):" -ForegroundColor Yellow
        Write-Host "      $($post.description)" -ForegroundColor White
        Write-Host "      👍 $($post.likes) likes, 💬 $($post.comments.Count) comments" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to fetch posts: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create a new post
Write-Host "✏️ Test 3: Creating a new community post..." -ForegroundColor Cyan
try {
    $newPost = @{
        description = "Testing the new community features! The backend integration is working perfectly. 🚀"
        imageBase64 = $null
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "User-ID" = "farmer1"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/community/posts" -Method POST -Body $newPost -Headers $headers
    Write-Host "✅ New post created successfully!" -ForegroundColor Green
    Write-Host "   Post ID: $($response.id)" -ForegroundColor White
    Write-Host "   Description: $($response.description)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to create new post: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Test farmer-specific endpoints
Write-Host "👨‍🌾 Test 4: Testing farmer-specific community endpoints..." -ForegroundColor Cyan
try {
    $farmerId = "farmer1"
    
    # Get farmer's feed
    $feed = Invoke-RestMethod -Uri "$baseUrl/api/farmer/$farmerId/community/feed" -Method GET
    Write-Host "✅ Farmer's community feed retrieved!" -ForegroundColor Green
    Write-Host "   Posts in feed: $($feed.Count)" -ForegroundColor White
    
    # Get farmer's own posts
    $myPosts = Invoke-RestMethod -Uri "$baseUrl/api/farmer/$farmerId/community/posts" -Method GET
    Write-Host "✅ Farmer's own posts retrieved!" -ForegroundColor Green
    Write-Host "   Own posts: $($myPosts.Count)" -ForegroundColor White
    
    # Get community stats
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/farmer/$farmerId/community/stats" -Method GET
    Write-Host "✅ Community stats retrieved!" -ForegroundColor Green
    Write-Host "   Total posts by farmer: $($stats.totalPosts)" -ForegroundColor White
    Write-Host "   Total community posts: $($stats.totalCommunityPosts)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed farmer-specific tests: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Test interaction features (like and comment)
Write-Host "💝 Test 5: Testing post interactions (like/comment)..." -ForegroundColor Cyan
try {
    # Get first post to interact with
    $posts = Invoke-RestMethod -Uri "$baseUrl/api/community/posts" -Method GET
    if ($posts.Count -gt 0) {
        $firstPost = $posts[0]
        $postId = $firstPost.id
        
        # Test like functionality
        $headers = @{ "User-ID" = "farmer2" }
        $likedPost = Invoke-RestMethod -Uri "$baseUrl/api/community/posts/$postId/like" -Method POST -Headers $headers
        Write-Host "✅ Like functionality tested!" -ForegroundColor Green
        Write-Host "   Post now has: $($likedPost.likes) likes" -ForegroundColor White
        
        # Test comment functionality
        $comment = @{
            text = "Great post! The community features are working beautifully! 🎉"
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
            "User-ID" = "farmer2"
        }
        
        $commentedPost = Invoke-RestMethod -Uri "$baseUrl/api/community/posts/$postId/comments" -Method POST -Body $comment -Headers $headers
        Write-Host "✅ Comment functionality tested!" -ForegroundColor Green
        Write-Host "   Post now has: $($commentedPost.comments.Count) comments" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ No posts available to test interactions" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed interaction tests: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Search functionality
Write-Host "🔍 Test 6: Testing search functionality..." -ForegroundColor Cyan
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/api/community/posts/search?q=rice" -Method GET
    Write-Host "✅ Search functionality tested!" -ForegroundColor Green
    Write-Host "   Search results for 'rice': $($searchResults.Count) posts" -ForegroundColor White
} catch {
    Write-Host "❌ Failed search test: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Location-based posts
Write-Host "📍 Test 7: Testing location-based posts..." -ForegroundColor Cyan
try {
    $locationPosts = Invoke-RestMethod -Uri "$baseUrl/api/community/posts/location/Anuradhapura" -Method GET
    Write-Host "✅ Location-based posts tested!" -ForegroundColor Green
    Write-Host "   Posts from Anuradhapura: $($locationPosts.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed location test: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Final summary
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 Community Features Testing Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Backend Features Implemented:" -ForegroundColor Cyan
Write-Host "   • Crop post creation and management" -ForegroundColor White
Write-Host "   • Like/unlike functionality" -ForegroundColor White
Write-Host "   • Comment system" -ForegroundColor White
Write-Host "   • Search and filtering" -ForegroundColor White
Write-Host "   • Location-based posts" -ForegroundColor White
Write-Host "   • Farmer-specific endpoints" -ForegroundColor White
Write-Host "   • Community statistics" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Available API Endpoints:" -ForegroundColor Cyan
Write-Host "   • GET  /api/community/posts - Get all posts" -ForegroundColor White
Write-Host "   • POST /api/community/posts - Create new post" -ForegroundColor White
Write-Host "   • POST /api/community/posts/{id}/like - Like/unlike post" -ForegroundColor White
Write-Host "   • POST /api/community/posts/{id}/comments - Add comment" -ForegroundColor White
Write-Host "   • GET  /api/community/posts/search?q={query} - Search posts" -ForegroundColor White
Write-Host "   • GET  /api/community/posts/location/{location} - Posts by location" -ForegroundColor White
Write-Host "   • GET  /api/farmer/{id}/community/feed - Farmer's feed" -ForegroundColor White
Write-Host "   • GET  /api/farmer/{id}/community/stats - Community stats" -ForegroundColor White
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update frontend to use these new API endpoints" -ForegroundColor White
Write-Host "   2. Add image upload functionality" -ForegroundColor White
Write-Host "   3. Implement real-time features (WebSocket)" -ForegroundColor White
Write-Host "   4. Add user authentication to community endpoints" -ForegroundColor White
Write-Host ""
