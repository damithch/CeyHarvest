# Phase 1: Mock Data Setup for Payment Gateway Development

This setup creates sample products and farmers in the database to enable payment gateway development without waiting for the farmer UI implementation.

## What's Created

### Sample Farmers
1. **John Silva** (Vegetables Specialist)
   - Email: john.silva@samplefarm.lk
   - Password: farmer123
   - Location: Nuwara Eliya
   - Specializes in: Vegetables

2. **Mary Fernando** (Fruits Specialist)
   - Email: mary.fernando@fruitgarden.lk
   - Password: farmer123
   - Location: Kandy
   - Specializes in: Fruits

3. **Kamal Perera** (Rice & Grains)
   - Email: kamal.perera@ricefarm.lk
   - Password: farmer123
   - Location: Anuradhapura
   - Specializes in: Rice and Grains

### Sample Products (15 products total)
- **Vegetables**: Carrots, Green Beans, Cabbage, Tomatoes, Lettuce
- **Fruits**: King Coconuts, Bananas, Mangoes, Papayas, Pineapples
- **Grains**: Basmati Rice, Red Rice, White Rice, Green Gram, Black Gram

## API Endpoints

### Development Endpoints (Remove in Production)
```
POST /api/dev/sample-data/create
GET  /api/dev/sample-data/products
DELETE /api/dev/sample-data/products
```

### Buyer Product Endpoints (For Payment Testing)
```
GET /api/buyer/products                    - Get all available products
GET /api/buyer/products/{id}               - Get product by ID
GET /api/buyer/products/category/{category} - Get products by category
GET /api/buyer/categories                  - Get all categories
GET /api/buyer/{email}/stats               - Get buyer statistics
```

## How to Set Up

### 1. Create Sample Data
```bash
# POST request to create sample data
curl -X POST http://localhost:8080/api/dev/sample-data/create
```

### 2. Verify Data Creation
```bash
# GET request to see all products
curl http://localhost:8080/api/dev/sample-data/products
```

### 3. Test Buyer Endpoints
```bash
# Get products for buyers
curl http://localhost:8080/api/buyer/products

# Get products by category
curl http://localhost:8080/api/buyer/products/category/Fruits

# Get available categories
curl http://localhost:8080/api/buyer/categories
```

## Frontend Integration

The BuyerDashboard has been updated to use the new `/api/buyer/products` endpoint. Products will now display with:
- Product name and description
- Farmer name (extracted from farmer email)
- Price in LKR
- Stock status
- Category information

## Payment Gateway Integration Points

With this setup, you can now develop:

1. **Cart System**: Add products to cart using product IDs
2. **Checkout Process**: Calculate totals, taxes, delivery fees
3. **Payment Processing**: Integrate with payment gateways
4. **Order Management**: Create orders after successful payment

## Cleanup

To remove sample data (products only):
```bash
curl -X DELETE http://localhost:8080/api/dev/sample-data/products
```

## Next Steps for Payment Gateway

1. **Cart Management**: Create cart entity and endpoints
2. **Order Creation**: Enhance order system with payment fields
3. **Payment Gateway**: Integrate Stripe/PayPal/Local payment provider
4. **Frontend Components**: Build cart, checkout, and payment UI

## Security Notes

- Sample farmers have simple passwords (farmer123) - for development only
- The `/api/dev/*` endpoints should be removed in production
- All sample data is clearly marked for easy identification and removal
