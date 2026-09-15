# Paryatanam (पर्यटनम) — Admin Portal REST API & Route Specification

Welcome to the **Master Admin Portal Specification** for **Paryatanam Bharati** (India's Digital Tourism, Heritage & Marketplace Platform). 

This document serves as an exhaustive blueprint designed for **AI coding agents** and **Frontend Engineers** to build the complete, production-grade **Admin Management Console / Dashboard**.

---

## 🔑 Global API Specifications & Security

- **Base Endpoint URL**: `http://localhost:8000/api/v1` (or `https://api.paryatanam.gov.in/api/v1`)
- **Authentication**: JWT Bearer Token via Request Headers:
  ```http
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Access Control**: All endpoints in this specification strictly enforce the `ADMIN` role (`require_role("ADMIN")`). Requests from non-admin users return `403 Forbidden`.
- **Standard Pagination Schema**:
  ```json
  {
    "page": 1,
    "limit": 20,
    "total_records": 150,
    "total_pages": 8
  }
  ```
- **Standard Error Response Structure**:
  ```json
  {
    "detail": "Error description or validation message",
    "error_code": "ERR_PERMISSION_DENIED",
    "timestamp": "2026-09-15T18:00:00Z"
  }
  ```

---

## 🗂 Admin Modules Sitemap

```
Admin Portal Dashboard
├── 1. User & Access Governance (/auth/admin)
├── 2. Dynamic SDUI Home Screen (/admin/home)
├── 3. GoAmrit Shop & Product Moderation (/admin/marketplace)
├── 4. Travel & Destination Expeditions (/admin/travel)
├── 5. Divine Prasad Shrines & Offerings (/admin/prasad)
└── 6. Wellness & Skill Training Academy (/admin/wellness)
```

---

## 1. User & Access Governance (`/auth/admin`)

### 1.1 List All Platform Users & Profiles
- **HTTP Method**: `GET`
- **Path**: `/auth/admin/users`
- **UI Element**: `UserManagementTable` (with Role filter dropdown, Status pills, Search bar)
- **Query Parameters**:
  - `page` (integer, optional, default: `1`)
  - `limit` (integer, optional, default: `20`)
  - `role` (string, optional: `USER`, `ADMIN`, `OPERATOR`, `VENDOR`, `COORDINATOR`)
  - `search` (string, optional: search name/email)
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "auth_user_id": "11111111-1111-1111-1111-111111111111",
        "name": "Bharat Expeditions & Heritage Tours",
        "email": "operator@bharatexpeditions.com",
        "phone": "+919876543210",
        "status": "active",
        "roles": ["OPERATOR", "VENDOR"],
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_records": 45,
      "total_pages": 3
    }
  }
  ```

### 1.2 Assign Roles to User
- **HTTP Method**: `PUT`
- **Path**: `/auth/admin/users/{user_id}/roles`
- **UI Element**: `RoleAssignmentModal` (Checkboxes for USER, OPERATOR, VENDOR, COORDINATOR, ADMIN)
- **Request Body**:
  ```json
  {
    "roles": ["USER", "VENDOR", "OPERATOR"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "User roles updated successfully.",
    "user_id": "11111111-1111-1111-1111-111111111111",
    "updated_roles": ["USER", "VENDOR", "OPERATOR"]
  }
  ```

### 1.3 Update User Account Status (Block/Activate)
- **HTTP Method**: `PATCH`
- **Path**: `/auth/admin/users/{user_id}/status`
- **UI Element**: `UserStatusToggleSwitch` (Active / Suspended)
- **Request Body**:
  ```json
  {
    "status": "suspended"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "User profile status updated to suspended.",
    "user_id": "11111111-1111-1111-1111-111111111111",
    "status": "suspended"
  }
  ```

---

## 2. Dynamic SDUI Home Screen Governance (`/admin/home`)

### 2.1 List All Home Layout Sections
- **HTTP Method**: `GET`
- **Path**: `/admin/home/sections`
- **UI Element**: `SectionOrderManager` (Drag & drop list of SDUI layout blocks)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "3ebbe638-e8a3-4032-9612-d78c21222407",
      "section_type": "HERO_CAROUSEL",
      "title": "Discover Incredible India",
      "subtitle": "Curated cultural, spiritual, and adventure expeditions across Bharat.",
      "display_order": 1,
      "is_visible": true,
      "is_published": true,
      "carousel_items": [
        {
          "id": "cd7475cf-ff01-4aa0-b5a8-4648d56a15bc",
          "title": "Taj Mahal & Mughal Heritage Circuit",
          "subtitle": "Discover iconic ivory-white marble architecture in Agra.",
          "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523",
          "action_type": "DESTINATION",
          "action_target": "/travel/destinations/taj-mahal-agra",
          "display_order": 1
        }
      ]
    }
  ]
  ```

### 2.2 Create New Home Section
- **HTTP Method**: `POST`
- **Path**: `/admin/home/sections`
- **UI Element**: `CreateSectionForm`
- **Request Body**:
  ```json
  {
    "section_type": "PROMOTIONS",
    "title": "Government Tourism Initiatives",
    "subtitle": "National schemes for pilgrimage and eco-tourism",
    "display_order": 3,
    "is_visible": true,
    "is_published": true
  }
  ```
- **Response `201 Created`**: Returns created `HomeSection` object.

### 2.3 Reorder Home Sections
- **HTTP Method**: `PATCH`
- **Path**: `/admin/home/sections/reorder`
- **UI Element**: `SaveOrderButton`
- **Request Body**:
  ```json
  {
    "section_orders": [
      {"id": "3ebbe638-e8a3-4032-9612-d78c21222407", "display_order": 1},
      {"id": "e0ff1c88-1faf-4891-b44d-9fa339dbd2df", "display_order": 2}
    ]
  }
  ```
- **Response `200 OK`**: `{"message": "Section order updated successfully."}`

### 2.4 Add Item to Section Card Grid
- **HTTP Method**: `POST`
- **Path**: `/admin/home/sections/{section_id}/items`
- **UI Element**: `AddSectionItemModal`
- **Request Body**:
  ```json
  {
    "title": "PRASHAD Scheme",
    "subtitle": "Pilgrimage Rejuvenation And Spiritual Augmentation Drive",
    "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
    "action_type": "EXTERNAL_URL",
    "action_target": "https://tourism.gov.in/prashad-scheme",
    "display_order": 1,
    "is_visible": true,
    "is_published": true
  }
  ```
- **Response `201 Created`**: Returns created `HomeSectionItem` object.

### 2.5 Add Slide to Hero Banner Carousel
- **HTTP Method**: `POST`
- **Path**: `/admin/home/sections/{section_id}/carousel-items`
- **UI Element**: `AddCarouselSlideModal`
- **Request Body**:
  ```json
  {
    "title": "Serene Kerala Backwaters",
    "subtitle": "Glide through tranquil palm-shaded lagoons.",
    "caption": "Book Kerala Backwater Bliss",
    "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    "action_type": "TOUR",
    "action_target": "/travel/tours/kerala-backwater-bliss",
    "display_order": 2,
    "is_visible": true,
    "is_published": true
  }
  ```
- **Response `201 Created`**: Returns created `HomeCarouselItem` object.

---

## 3. GoAmrit Shop & Product Moderation (`/admin/marketplace`)

### 3.1 List Pending Vendor Products for Approval
- **HTTP Method**: `GET`
- **Path**: `/admin/marketplace/products/pending`
- **UI Element**: `VendorModerationQueue` (Review cards with Vendor name, Stock, Certification request, and Approve/Reject buttons)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "b37b201b-6d3d-4875-bc57-894749692446",
      "vendor_id": "11111111-1111-1111-1111-111111111111",
      "name": "Royal Rajasthani Thali Gourmet Spice Kit",
      "slug": "royal-rajasthani-thali-kit",
      "price": 350.0,
      "compare_at_price": 450.0,
      "stock_quantity": 100,
      "status": "PENDING_REVIEW",
      "certification_status": "NONE",
      "primary_image": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4",
      "created_at": "2026-09-15T12:00:00Z"
    }
  ]
  ```

### 3.2 Moderate Product (Approve / Reject Vendor Item)
- **HTTP Method**: `POST`
- **Path**: `/admin/marketplace/products/{product_id}/moderate`
- **UI Element**: `ApproveRejectModal` (With reason input field for rejections)
- **Request Body**:
  ```json
  {
    "action": "APPROVED",
    "rejection_reason": null
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "product_id": "b37b201b-6d3d-4875-bc57-894749692446",
    "status": "APPROVED",
    "message": "Product approved and published to GoAmrit Marketplace."
  }
  ```

### 3.3 Grant / Revoke GoAmrit Organic Certification
- **HTTP Method**: `POST`
- **Path**: `/admin/marketplace/products/{product_id}/certify`
- **UI Element**: `OrganicCertificationBadgeToggle`
- **Request Body**:
  ```json
  {
    "certification_status": "CERTIFIED"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "product_id": "b37b201b-6d3d-4875-bc57-894749692446",
    "certification_status": "CERTIFIED",
    "message": "Product certified as GoAmrit Authentic Organic."
  }
  ```

### 3.4 Manage Shop Categories (CRUD)
- **HTTP Method**: `GET` | `POST` | `PUT` | `DELETE`
- **Path**: `/admin/marketplace/categories` | `/admin/marketplace/categories/{category_id}`
- **UI Element**: `ShopCategoryManager`
- **Request Body (POST / PUT)**:
  ```json
  {
    "name": "Regional Culinary & Spices",
    "slug": "regional-culinary-spices",
    "description": "Authentic regional Indian spice blends and thali kits.",
    "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
    "display_order": 1,
    "is_active": true
  }
  ```

---

## 4. Travel & Destination Governance (`/admin/travel`)

### 4.1 Create New Destination
- **HTTP Method**: `POST`
- **Path**: `/admin/travel/destinations`
- **UI Element**: `DestinationEditorModal` (State dropdown, Image URL uploader, Season tags)
- **Request Body**:
  ```json
  {
    "name": "Hampi UNESCO Ruins",
    "slug": "hampi-unesco-ruins",
    "description": "Ancient capital of Vijayanagara Empire featuring stone chariot monuments.",
    "short_description": "Stone chariot & ruins of Vijayanagara Empire.",
    "state": "Karnataka",
    "country": "India",
    "location": "Hampi, Karnataka",
    "primary_image_url": "https://images.unsplash.com/photo-1600100397608-f010e423b971",
    "is_published": true,
    "is_active": true
  }
  ```
- **Response `201 Created`**: Returns created `Destination` object.

### 4.2 Update Existing Destination
- **HTTP Method**: `PUT`
- **Path**: `/admin/travel/destinations/{destination_id}`
- **UI Element**: `EditDestinationForm`

### 4.3 Approve Tour Operator Packages
- **HTTP Method**: `POST`
- **Path**: `/admin/travel/tours/{tour_id}/moderate`
- **UI Element**: `TourModerationCard`
- **Request Body**:
  ```json
  {
    "is_published": true,
    "is_active": true
  }
  ```

---

## 5. Divine Prasad Shrines & Offerings Governance (`/admin/prasad`)

### 5.1 Create Temple Shrine
- **HTTP Method**: `POST`
- **Path**: `/admin/prasad/temples`
- **UI Element**: `AddShrineForm` (GPS Latitude/Longitude picker, Opening/Closing hours, Address inputs)
- **Request Body**:
  ```json
  {
    "name": "Golden Temple (Sri Harmandir Sahib)",
    "slug": "golden-temple-amritsar",
    "short_description": "Sacred central gurdwara of Sikhism surrounded by Amrit Sarovar lake.",
    "description": "The holiest gurdwara of Sikhism, famous for its gilded gold foil facade.",
    "address": "Golden Temple Road, Amritsar, Punjab 143006",
    "city": "Amritsar",
    "state": "Punjab",
    "country": "India",
    "region": "NORTH_INDIA",
    "latitude": 31.6200,
    "longitude": 74.8765,
    "open_time": "03:00:00",
    "close_time": "23:00:00",
    "is_featured": true,
    "is_published": true,
    "is_active": true
  }
  ```

### 5.2 Add Prasadam Offering to Temple
- **HTTP Method**: `POST`
- **Path**: `/admin/prasad/temples/{temple_id}/offerings`
- **UI Element**: `AddOfferingModal`
- **Request Body**:
  ```json
  {
    "name": "Amritsar Karah Prasad Pack & Rumala Sahib",
    "short_description": "Blessed pure wheat & desi ghee Karah Prasad with sacred Rumala cloth.",
    "price": 150.0,
    "items_count": 2,
    "daily_capacity": 250,
    "image_url": "https://images.unsplash.com/photo-1609840114035-3c981b782dfe",
    "is_featured": true,
    "is_published": true,
    "is_active": true
  }
  ```

### 5.3 View All Platform Prasad Orders
- **HTTP Method**: `GET`
- **Path**: `/admin/prasad/orders`
- **UI Element**: `PrasadamOrderFulfillmentTable` (Filters: PENDING, DISPATCHED, DELIVERED)

---

## 6. Wellness & Skill Training Academy Governance (`/admin/wellness`)

### 6.1 Create Wellness Provider / Skill Center
- **HTTP Method**: `POST`
- **Path**: `/admin/wellness/providers`
- **UI Element**: `AddWellnessCenterForm`
- **Request Body**:
  ```json
  {
    "name": "Paryatanam Skill & Heritage Academy",
    "slug": "ananda-himalayan-sanctuary-rishikesh",
    "short_description": "Certified tourism skill development and holistic wellness institute.",
    "address": "Badrinath Road, Tapovan, Rishikesh, Uttarakhand 249192",
    "city": "Rishikesh",
    "state": "Uttarakhand",
    "country": "India",
    "pincode": "249192",
    "phone": "+919812345678",
    "cover_image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
    "is_featured": true,
    "is_published": true
  }
  ```

### 6.2 Add Student Skill Certification Course
- **HTTP Method**: `POST`
- **Path**: `/admin/wellness/services`
- **UI Element**: `AddCourseModal`
- **Request Body**:
  ```json
  {
    "provider_id": "ce17ca18-b569-4c87-a98c-f90c4205205d",
    "category_id": "e9e9e88d-1180-4b2c-870c-28f733c89f98",
    "name": "Certified Tourist Guide Skill Development Program",
    "slug": "certified-tourist-guide-skill-development",
    "short_description": "6-Week comprehensive skill course for aspiring regional tourist guides.",
    "description": "Covers art history, monument interpretation, guest safety & digital apps.",
    "price": 4999.0,
    "duration_minutes": 240,
    "is_featured": true,
    "is_published": true
  }
  ```

---

## 🎨 Admin Portal UI Component Architecture Blueprint

When building the Admin Frontend (React / Tailwind CSS / Next.js):

1. **Sidebar Navigation**:
   - `📊 Dashboard Overview`
   - `👥 User & Access Control` (`/auth/admin/users`)
   - `🖼️ SDUI Home Layout Manager` (`/admin/home/sections`)
   - `🛍️ GoAmrit Vendor Moderation` (`/admin/marketplace/products/pending`)
   - `🗺️ Destinations & Tour Approvals` (`/admin/travel/destinations`)
   - `🛕 Temple Shrines & Prasad` (`/admin/prasad/temples`)
   - `🧘 Wellness & Skill Academy` (`/admin/wellness/providers`)

2. **Shared UI Modal Primitives**:
   - `ConfirmationModal`: Quick action for Blocking Users, Deleting Items, or Approving Vendor Submissions.
   - `StatusBadge`: Color-coded pills (`APPROVED`: Green, `PENDING_REVIEW`: Amber, `REJECTED`: Red, `CERTIFIED`: Emerald Glow).
   - `ImagePreviewUpload`: Drag-and-drop file uploader with direct Unsplash image URL fallback support.

---
*Created on 2026-09-15 for Paryatanam Bharati Platform Administration.*
