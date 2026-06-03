# Thomas Store API Documentation

## Overview

Thomas Store is a B2C store application built with Next.js, Prisma, and PostgreSQL. The API routes live under `apps/web/src/app/api` and are used by the Thomas Store web app for customer authentication, cart operations, checkout, customer purchase history, and admin features.

The API uses JSON request and response bodies. It is intended for this B2C store application and is not designed as a public third-party API.

Example base URLs:

- Local development: `http://localhost:3001`
- Production: `https://thomasdangstore.vercel.app/products`

Public product listing, product search/filtering, and product detail pages are server-rendered pages. They use Prisma database helpers directly and are not exposed through a separate `/api/products` route.

## Authentication and Sessions

Thomas Store uses session-based authentication.

- Cookie name: `customer_session_id`
- Cookie type: HTTP-only
- Session table: `CustomerSession`
- User table: `User`
- Role field: `User.role`
- Supported roles: `CUSTOMER`, `ADMIN`

When a customer registers or logs in, the API creates a `CustomerSession` row and sets the `customer_session_id` cookie. The browser sends this cookie with later requests. API routes then use the session id to find the current user.

Public registration always creates a normal `CUSTOMER` user. Admin access requires an existing user with `role: "ADMIN"`.

## Endpoint Summary

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/customer-auth/register` | `POST` | Public | Register a customer account |
| `/api/customer-auth/login` | `POST` | Public | Log in a customer or admin |
| `/api/customer-auth/logout` | `POST` | Logged-in user if present | Log out and clear session cookies |
| `/api/customer-auth/me` | `GET` | Logged-in user | Return the current logged-in user |
| `/api/cart` | `GET` | Logged-in customer | Return the current user's cart |
| `/api/cart/items` | `POST` | Logged-in customer | Add a product to cart |
| `/api/cart/items` | `PATCH` | Logged-in customer | Update a cart item quantity |
| `/api/cart/items` | `DELETE` | Logged-in customer | Remove a cart item |
| `/api/checkout` | `POST` | Logged-in customer | Complete mock checkout |
| `/api/purchases` | `GET` | Logged-in customer | Return the current user's purchase history |
| `/api/admin/products` | `POST` | Admin only | Create a product |
| `/api/admin/products/{id}` | `PATCH` | Admin only | Update a product |
| `/api/admin/purchases` | `GET` | Admin only | Return all purchase records |
| `/api/seed` | `GET` | E2E environment only | Reset and seed the database for tests |

## Customer Authentication API

### Register Customer

**Endpoint:** `POST /api/customer-auth/register`

**Purpose:** Creates a new customer account, hashes the password, creates a session, and sets the `customer_session_id` cookie.

**Authentication:** Public / guest.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Trimmed before saving |
| `email` | string | Yes | Trimmed and lowercased |
| `password` | string | Yes | Must be at least 6 characters |

**Example request:**

```json
{
  "name": "Thomas Customer",
  "email": "customer@example.com",
  "password": "secret123"
}
```

**Example success response: `201 Created`**

```json
{
  "user": {
    "id": 12,
    "name": "Thomas Customer",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "createdAt": "2026-06-04T00:00:00.000Z"
  }
}
```

**Example error responses:**

```json
{
  "message": "Name, email, and a 6 character password are required."
}
```

Status: `400 Bad Request`

```json
{
  "message": "An account already exists for this email."
}
```

Status: `409 Conflict`

**Database tables affected:**

- Reads `User` to check duplicate email.
- Writes `User`.
- Writes `CustomerSession`.

**Limitations and constraints:**

- Public users cannot choose a role.
- Registered users are always created with `role: "CUSTOMER"`.
- Passwords are hashed before storage.
- The response does not include `passwordHash`.

### Login

**Endpoint:** `POST /api/customer-auth/login`

**Purpose:** Verifies email/password credentials, creates a session, and sets the `customer_session_id` cookie.

**Authentication:** Public / guest.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `email` | string | Yes | Trimmed and lowercased |
| `password` | string | Yes | Compared with stored password hash |

**Example request:**

```json
{
  "email": "customer@example.com",
  "password": "secret123"
}
```

**Example success response: `200 OK`**

```json
{
  "user": {
    "id": 12,
    "name": "Thomas Customer",
    "email": "customer@example.com",
    "role": "CUSTOMER",
    "createdAt": "2026-06-04T00:00:00.000Z"
  }
}
```

**Example error responses:**

```json
{
  "message": "Email and password are required."
}
```

Status: `400 Bad Request`

```json
{
  "message": "Invalid email or password."
}
```

Status: `401 Unauthorized`

**Database tables affected:**

- Reads `User`.
- Writes `CustomerSession`.

**Limitations and constraints:**

- The response does not include `passwordHash`.
- The same login route is used by customers and admins.
- Admin permission is controlled later by checking `User.role`.

### Logout

**Endpoint:** `POST /api/customer-auth/logout`

**Purpose:** Deletes the current customer session if one exists and clears session cookies.

**Authentication:** Can be called by a logged-in user. If no valid session exists, it still returns success.

**Required body:** None.

**Example request:**

```json
{}
```

**Example success response: `200 OK`**

```json
{
  "success": true
}
```

**Database tables affected:**

- Deletes matching row from `CustomerSession` when a session cookie exists.

**Limitations and constraints:**

- Clears `customer_session_id`.
- Also clears the old cart session cookie if present.
- Does not delete the user account.

### Current User

**Endpoint:** `GET /api/customer-auth/me`

**Purpose:** Returns the currently logged-in safe user data.

**Authentication:** Logged-in customer or admin.

**Required body:** None.

**Example success response: `200 OK`**

```json
{
  "user": {
    "id": 12,
    "name": "Thomas Customer",
    "email": "customer@example.com",
    "role": "CUSTOMER"
  }
}
```

**Example error response: `401 Unauthorized`**

```json
{
  "user": null
}
```

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- May delete expired or orphaned `CustomerSession` rows during session lookup.

**Limitations and constraints:**

- Does not return `passwordHash`.
- Does not return the raw session token.

## Cart API

Guests can browse products and product detail pages, but guests cannot add products to a cart. Cart API routes require a valid `customer_session_id` cookie.

The cart is database-backed and linked to the logged-in user's `userId`. It does not use `localStorage`.

### Get Cart

**Endpoint:** `GET /api/cart`

**Purpose:** Returns the logged-in customer's current cart summary.

**Authentication:** Logged-in customer.

**Required body:** None.

**Example success response: `200 OK`**

```json
{
  "sessionId": null,
  "userId": 12,
  "items": [
    {
      "id": 31,
      "productId": 1,
      "quantity": 2,
      "unitPrice": 199.99,
      "subtotal": 399.98,
      "product": {
        "id": 1,
        "name": "Smart Fitness Watch",
        "description": "Fitness watch with activity tracking.",
        "price": 199.99,
        "imageUrl": "https://example.com/watch.jpg",
        "category": "Electronics",
        "stock": 8,
        "active": true,
        "createdAt": "2026-06-04T00:00:00.000Z"
      }
    }
  ],
  "itemCount": 2,
  "total": 399.98
}
```

**Example error response: `401 Unauthorized`**

```json
{
  "message": "Unauthorized"
}
```

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads `Cart`.
- Reads `CartItem`.
- Reads `Product`.

**Limitations and constraints:**

- Only returns the cart for the logged-in user.
- User A cannot load User B's cart because lookup is by `userId`.

### Add Product To Cart

**Endpoint:** `POST /api/cart/items`

**Purpose:** Adds an active product to the logged-in user's cart. If the product is already in the cart, quantity is increased by 1.

**Authentication:** Logged-in customer.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `productId` | number | Yes | Must be a positive integer |

**Example request:**

```json
{
  "productId": 1
}
```

**Example success response: `200 OK`**

Returns the updated cart summary.

```json
{
  "sessionId": null,
  "userId": 12,
  "items": [
    {
      "id": 31,
      "productId": 1,
      "quantity": 1,
      "unitPrice": 199.99,
      "subtotal": 199.99,
      "product": {
        "id": 1,
        "name": "Smart Fitness Watch",
        "price": 199.99,
        "category": "Electronics",
        "stock": 8,
        "active": true
      }
    }
  ],
  "itemCount": 1,
  "total": 199.99
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Invalid product id"
}
```

Status: `400 Bad Request`

```json
{
  "message": "Product not found"
}
```

Status: `404 Not Found`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads or writes `Cart`.
- Reads `Product`.
- Writes or updates `CartItem`.

**Limitations and constraints:**

- Only active products can be added.
- Guests receive `401 Unauthorized`.
- Quantity is increased atomically when the item already exists.

### Update Cart Item Quantity

**Endpoint:** `PATCH /api/cart/items`

**Purpose:** Sets the quantity for one cart item.

**Authentication:** Logged-in customer.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `productId` | number | Yes | Must be a positive integer |
| `quantity` | number | Yes | Must be a positive integer |

**Example request:**

```json
{
  "productId": 1,
  "quantity": 3
}
```

**Example success response: `200 OK`**

Returns the updated cart summary.

```json
{
  "sessionId": null,
  "userId": 12,
  "items": [
    {
      "productId": 1,
      "quantity": 3,
      "unitPrice": 199.99,
      "subtotal": 599.97
    }
  ],
  "itemCount": 3,
  "total": 599.97
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Invalid cart item"
}
```

Status: `400 Bad Request`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads or writes `Cart`.
- Updates `CartItem`.
- Reads `Product` when returning the cart summary.

**Limitations and constraints:**

- Quantity cannot be below 1.
- The route updates only the logged-in user's cart.

### Remove Cart Item

**Endpoint:** `DELETE /api/cart/items`

**Purpose:** Removes one product from the logged-in user's cart.

**Authentication:** Logged-in customer.

**Required body or query parameter:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `productId` | number | Yes | Can be sent in JSON body or query string |

**Example request body:**

```json
{
  "productId": 1
}
```

**Alternative query example:**

```text
DELETE /api/cart/items?productId=1
```

**Example success response: `200 OK`**

Returns the updated cart summary.

```json
{
  "sessionId": null,
  "userId": 12,
  "items": [],
  "itemCount": 0,
  "total": 0
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Invalid product id"
}
```

Status: `400 Bad Request`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads or writes `Cart`.
- Deletes matching `CartItem`.

**Limitations and constraints:**

- Removes only from the logged-in user's cart.
- Removing a missing item still returns the current cart summary.

## Checkout API

Checkout uses a mock payment gateway. No real card payment is processed.

Accepted success card number:

```text
4242 4242 4242 4242
```

The API also accepts the same number without spaces:

```text
4242424242424242
```

Any other card number is treated as declined.

### Complete Checkout

**Endpoint:** `POST /api/checkout`

**Purpose:** Validates mock payment details, creates a purchase from the logged-in user's cart, reduces stock, and clears the cart.

**Authentication:** Logged-in customer.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Checkout customer name |
| `email` | string | Yes | Checkout customer email |
| `cardNumber` | string | Yes | Must be the accepted mock card for success |
| `expiry` | string | Yes | Required for form completeness |
| `cvv` | string | Yes | Required for form completeness |

**Example request:**

```json
{
  "name": "Thomas Customer",
  "email": "customer@example.com",
  "cardNumber": "4242 4242 4242 4242",
  "expiry": "12/30",
  "cvv": "123"
}
```

**Example success response: `200 OK`**

```json
{
  "purchaseId": 45,
  "totalAmount": 399.98
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Please complete all checkout fields."
}
```

Status: `400 Bad Request`

```json
{
  "message": "Payment declined by mock gateway."
}
```

Status: `402 Payment Required`

```json
{
  "code": "EMPTY_CART",
  "message": "Your cart is empty."
}
```

Status: `400 Bad Request`

Other checkout error codes can include:

- `INSUFFICIENT_STOCK`
- `PRODUCT_INACTIVE`
- `USER_NOT_FOUND`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads `Cart`.
- Reads `CartItem`.
- Reads `Product`.
- Writes `Purchase`.
- Writes `PurchaseItem`.
- Updates `Product.stock`.
- Deletes purchased `CartItem` rows.

**Limitations and constraints:**

- Payment is a mock flow only.
- The backend calculates `totalAmount` from database product prices.
- Client-supplied totals are not trusted.
- Checkout is wrapped in a Prisma transaction so purchase creation, stock reduction, and cart clearing succeed or fail together.
- If payment is declined, no purchase is created and the cart is not cleared.
- If stock is insufficient or a product is inactive, checkout is rejected.

## Purchase API

### Customer Purchase History

**Endpoint:** `GET /api/purchases`

**Purpose:** Returns purchase history for the currently logged-in customer only.

**Authentication:** Logged-in customer.

**Required body:** None.

**Example success response: `200 OK`**

```json
{
  "purchases": [
    {
      "id": 45,
      "customerName": "Thomas Customer",
      "customerEmail": "customer@example.com",
      "totalAmount": 399.98,
      "createdAt": "2026-06-04T00:00:00.000Z",
      "items": [
        {
          "id": 80,
          "productId": 1,
          "quantity": 2,
          "unitPrice": 199.99,
          "subtotal": 399.98,
          "product": {
            "id": 1,
            "name": "Smart Fitness Watch",
            "category": "Electronics",
            "imageUrl": "https://example.com/watch.jpg",
            "price": 199.99
          }
        }
      ]
    }
  ]
}
```

**Example error response: `401 Unauthorized`**

```json
{
  "message": "Unauthorized"
}
```

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads `Purchase`.
- Reads `PurchaseItem`.
- Reads `Product`.

**Limitations and constraints:**

- Purchases are filtered by the logged-in user's `userId`.
- User A cannot see User B's purchase history.

## Admin Product API

Admin product list pages are server-rendered. The API routes in this section are for creating and editing products.

### Create Product

**Endpoint:** `POST /api/admin/products`

**Purpose:** Creates a new product.

**Authentication:** Admin only.

**Required body:**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | Yes | Cannot be empty |
| `description` | string | Yes | Cannot be empty |
| `imageUrl` | string | Yes | Cannot be empty |
| `category` | string | Yes | Cannot be empty |
| `price` | number | Yes | Must be greater than 0 |
| `stock` | number | Yes | Must be a whole number greater than or equal to 0 |
| `active` | boolean | Yes | Controls public visibility |

**Example request:**

```json
{
  "name": "Wireless Keyboard",
  "description": "Compact wireless keyboard for everyday work.",
  "imageUrl": "https://example.com/keyboard.jpg",
  "category": "Electronics",
  "price": 89.95,
  "stock": 15,
  "active": true
}
```

**Example success response: `201 Created`**

```json
{
  "product": {
    "id": 20,
    "name": "Wireless Keyboard",
    "description": "Compact wireless keyboard for everyday work.",
    "imageUrl": "https://example.com/keyboard.jpg",
    "category": "Electronics",
    "price": 89.95,
    "stock": 15,
    "active": true,
    "createdAt": "2026-06-04T00:00:00.000Z"
  }
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Admin access required."
}
```

Status: `403 Forbidden`

```json
{
  "message": "Price must be greater than 0."
}
```

Status: `400 Bad Request`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Writes `Product`.

**Limitations and constraints:**

- Guests cannot create products.
- Normal customers cannot create products.
- Active products appear on public product pages.
- Inactive products remain hidden from public product pages but visible in admin product management.

### Update Product

**Endpoint:** `PATCH /api/admin/products/{id}`

**Purpose:** Updates an existing product.

**Authentication:** Admin only.

**Required route parameter:**

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | number | Yes | Must be a positive integer |

**Required body:**

Same fields and validation rules as `POST /api/admin/products`.

**Example request:**

```json
{
  "name": "Wireless Keyboard Pro",
  "description": "Updated wireless keyboard with quiet keys.",
  "imageUrl": "https://example.com/keyboard-pro.jpg",
  "category": "Electronics",
  "price": 99.95,
  "stock": 20,
  "active": true
}
```

**Example success response: `200 OK`**

```json
{
  "product": {
    "id": 20,
    "name": "Wireless Keyboard Pro",
    "description": "Updated wireless keyboard with quiet keys.",
    "imageUrl": "https://example.com/keyboard-pro.jpg",
    "category": "Electronics",
    "price": 99.95,
    "stock": 20,
    "active": true,
    "createdAt": "2026-06-04T00:00:00.000Z"
  }
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Admin access required."
}
```

Status: `403 Forbidden`

```json
{
  "message": "Invalid product id."
}
```

Status: `400 Bad Request`

```json
{
  "message": "Product not found."
}
```

Status: `404 Not Found`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads `Product`.
- Updates `Product`.

**Limitations and constraints:**

- Guests cannot update products.
- Normal customers cannot update products.
- Setting `active` to `false` hides the product from public product pages.
- Setting `active` to `true` makes the product visible publicly again.

## Admin Purchase API

### All Purchase Records

**Endpoint:** `GET /api/admin/purchases`

**Purpose:** Returns all purchase records for admin review.

**Authentication:** Admin only.

**Required body:** None.

**Example success response: `200 OK`**

```json
{
  "purchases": [
    {
      "id": 45,
      "userId": 12,
      "customerName": "Thomas Customer",
      "customerEmail": "customer@example.com",
      "totalAmount": 399.98,
      "createdAt": "2026-06-04T00:00:00.000Z",
      "user": {
        "id": 12,
        "name": "Thomas Customer",
        "email": "customer@example.com",
        "role": "CUSTOMER"
      },
      "items": [
        {
          "id": 80,
          "productId": 1,
          "quantity": 2,
          "unitPrice": 199.99,
          "subtotal": 399.98,
          "product": {
            "id": 1,
            "name": "Smart Fitness Watch",
            "category": "Electronics",
            "imageUrl": "https://example.com/watch.jpg",
            "price": 199.99
          }
        }
      ]
    }
  ]
}
```

**Example error responses:**

```json
{
  "message": "Unauthorized"
}
```

Status: `401 Unauthorized`

```json
{
  "message": "Admin access required."
}
```

Status: `403 Forbidden`

**Database tables affected:**

- Reads `CustomerSession`.
- Reads `User`.
- Reads `Purchase`.
- Reads `PurchaseItem`.
- Reads `Product`.

**Limitations and constraints:**

- Guests cannot access this endpoint.
- Normal customers cannot access this endpoint.
- Admins can see purchase records from all customers.
- Password hashes and session tokens are not returned.

## Development and Test Utility API

### Seed Database

**Endpoint:** `GET /api/seed`

**Purpose:** Runs the database seed function during E2E testing.

**Authentication:** Not session-authenticated. It is controlled by the `E2E` environment variable.

**Example success response: `200 OK`**

```json
{
  "message": "Seeded"
}
```

**Example unavailable response: `501 Not Implemented`**

```text
Not Available
```

**Database tables affected:**

- Resets and seeds test data through the project seed function.
- Affects products, users, sessions, carts, cart items, purchases, and purchase items depending on the seed implementation.

**Limitations and constraints:**

- Intended for automated E2E tests only.
- Should not be enabled for normal production use.
- It depends on the `E2E` environment variable being set.

## Error Handling

Most API errors return JSON with a `message` field.

Common status codes:

| Status | Meaning |
| --- | --- |
| `200 OK` | Request succeeded |
| `201 Created` | Resource created |
| `400 Bad Request` | Missing or invalid request data |
| `401 Unauthorized` | User is not logged in or session is invalid |
| `402 Payment Required` | Mock payment was declined |
| `403 Forbidden` | User is logged in but is not an admin |
| `404 Not Found` | Requested product was not found |
| `409 Conflict` | Duplicate registration email |
| `500 Internal Server Error` | Unexpected server failure |
| `501 Not Implemented` | Seed route unavailable outside E2E mode |

Example generic error:

```json
{
  "message": "Unauthorized"
}
```

Checkout errors can also include a `code` field:

```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock for Smart Fitness Watch."
}
```

## Limitations and Constraints

- Guests can browse products and product detail pages, but they must log in before adding items to cart.
- Cart data is stored in the database and linked to `userId`; it is not stored in `localStorage`.
- User A cannot see User B's cart because cart lookup uses the logged-in user's id.
- User A cannot see User B's purchases because customer purchase lookup filters by `userId`.
- Admin-only actions require `User.role` to be `ADMIN`.
- Public product pages only show products where `active` is `true`.
- Admin product management can show and update both active and inactive products.
- Checkout uses a mock payment flow only.
- The accepted mock card number is `4242 4242 4242 4242`.
- Other card numbers are treated as declined.
- The backend calculates cart totals and checkout totals using database product prices.
- The API does not expose real payment processing.
- The API does not expose database credentials, Neon URLs, environment variable values, password hashes, or session tokens.
