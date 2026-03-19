# 📘 EaseShopping API Documentation - Frontend Integration Guide

> **للفريق Frontend:** هذا الملف يحتوي على كل ما تحتاجونه للتكامل مع الـ Backend API

---

## 🔗 معلومات أساسية

### Base URL

| البيئة          | Backend API                                                            | Frontend                    |
| --------------- | ---------------------------------------------------------------------- | --------------------------- |
| **Development** | `http://localhost:8000/api/v1`                                         | `http://localhost:3000`     |
| **Production**  | `https://backend-easeshopping-system-production.up.railway.app/api/v1` | `https://easeshopping.tech` |

### الصور والملفات الثابتة

```
الوضع الحالي (March 2026):
- الصور الجديدة تُرفع على Cloudinary مباشرة (وليس داخل uploads المحلي).
- أي حقل صورة في الـ API يرجع كرابط كامل جاهز للعرض (absolute URL).
- لا تعمل prepend لـ BASE_URL قبل روابط الصور.

أمثلة:
https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/cover.webp
https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/users/profile.jpg
```

> ملاحظة: قد توجد بيانات قديمة بروابط محلية من `uploads/` في بعض السجلات القديمة فقط.

### Headers المطلوبة

```javascript
// لكل الطلبات
{
  "Content-Type": "application/json"
}

// للطلبات المحمية (تحتاج تسجيل دخول)
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

// لرفع الصور
{
  "Content-Type": "multipart/form-data",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

## 🖼️ تحديثات الصور (Breaking Changes - March 2026)

### ملخص التغيير

- تم استبدال التخزين المحلي للصور بنظام رفع مباشر إلى Cloudinary.
- الـ Backend يحفظ ويعيد روابط Cloudinary داخل نفس حقول الصورة (مثل: `imageCover`, `images`, `image`, `profileImg`).
- أي endpoint فيه رفع صورة لازم يكون `multipart/form-data`.

### قيود ومعالجة الصور

- الامتدادات المسموحة: `jpg`, `jpeg`, `png`, `webp`
- أي ملف ليس `image/*` يتم رفضه بخطأ `400`.
- الصور تُرفع داخل مجلدات:
`e-commerce/products`, `e-commerce/categories`, `e-commerce/brands`, `e-commerce/users`
- Cloudinary transformation الافتراضية:
`width: 1000`, `height: 1000`, `crop: limit`

### حقول الرفع المعتمدة لكل endpoint

| Endpoint | Method | نوع الطلب | حقول الصور |
| --- | --- | --- | --- |
| `/products` | `POST` | `multipart/form-data` | `imageCover` (1 ملف - required), `images` (حتى 5 ملفات - optional) |
| `/products/:id` | `PUT` | `multipart/form-data` | `imageCover` (اختياري), `images` (اختياري حتى 5) |
| `/categories` | `POST` | `multipart/form-data` | `image` (1 ملف - required) |
| `/categories/:id` | `PUT` | `multipart/form-data` | `image` (1 ملف - optional) |
| `/brands` | `POST` | `multipart/form-data` | `image` (1 ملف - required) |
| `/brands/:id` | `PUT` | `multipart/form-data` | `image` (1 ملف - optional) |
| `/users` | `POST` | `multipart/form-data` | `profileImg` (1 ملف - optional) |
| `/users/:id` | `PUT` | `multipart/form-data` | `profileImg` (1 ملف - optional) |
| `/users/updateMe` | `PUT` | `multipart/form-data` | `profileImg` (1 ملف - optional) |

### مثال Frontend (FormData)

```javascript
const formData = new FormData();
formData.append("title", "iPhone 15 Pro");
formData.append("description", "وصف طويل للمنتج...");
formData.append("quantity", 50);
formData.append("price", 50000);
formData.append("category", "<category_id>");
formData.append("imageCover", coverFile); // ملف واحد

for (const file of galleryFiles) {
  formData.append("images", file); // نفس المفتاح يتكرر
}

await API.post("/products", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### ملاحظة مهمة في تحديث المنتجات

عند إرسال `PUT /products/:id` كـ `multipart/form-data`، الحقول اللي مش موجودة في الـ request مش هتتأثر. يعني لو عايزين تعدلوا الـ `title` بس بدون ما تلمسوا الصور، ابعتوا `title` فقط.

---

## 🔐 Authentication (المصادقة)

> ⚠️ **تغيير مهم (March 2026):** تم تحديث نظام المصادقة بالكامل:
> - التسجيل يتطلب **تأكيد البريد الإلكتروني** قبل تسجيل الدخول
> - الـ Login بيرجع **Access Token** (في الـ response) + **Refresh Token** (كـ HttpOnly cookie)
> - Rate Limiting: **20 طلب / 15 دقيقة** على كل auth endpoints

### التدفق الكامل للتسجيل:

```
1. POST /auth/signup          → إنشاء حساب + إرسال كود تأكيد (6 أرقام)
2. POST /auth/verifyemail     → تأكيد البريد بالكود → تسلم accessToken + refreshToken cookie
3. POST /auth/login           → تسجيل دخول (بعد التأكيد فقط)
```

### 1. تسجيل مستخدم جديد

```http
POST /auth/signup
```

**Request Body:**

```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201):**

```json
{
  "status": "success",
  "message": "Account created. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "أحمد محمد",
      "email": "ahmed@example.com"
    }
  }
}
```

> 💡 لا يتم إرجاع token عند التسجيل. لازم تأكد البريد أولاً.

### 2. تأكيد البريد الإلكتروني

```http
POST /auth/verifyemail
```

**Request Body:**

```json
{
  "verificationCode": "123456"
}
```

> الكود المرسل على البريد مكون من **6 أرقام** وصالح لمدة **15 دقيقة**.

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Email verified successfully.",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "user" },
    "accessToken": "eyJhbG..."
  }
}
```

> 🍪 يتم أيضاً إرسال **refreshToken** كـ `HttpOnly` cookie تلقائياً.

### 3. إعادة إرسال كود التأكيد

```http
POST /auth/resendverification
```

**Request Body:**

```json
{
  "email": "ahmed@example.com"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Verification code sent to your email."
}
```

### 4. تسجيل الدخول

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "avatar": "أ"
    },
    "accessToken": "eyJhbG..."
  }
}
```

> 🍪 يتم أيضاً إرسال **refreshToken** كـ `HttpOnly` cookie.
>
> ⚠️ إذا كان البريد غير مؤكد، سيرجع خطأ `403`:
> `"Please verify your email before logging in..."`

### 5. تجديد الـ Access Token

```http
POST /auth/refresh
```

لا يحتاج أي body. الـ refreshToken يُرسل تلقائياً من الـ cookie.

**Success Response (200):**

```json
{
  "status": "success",
  "accessToken": "eyJhbG..."
}
```

> 💡 استخدم هذا الـ endpoint لما الـ accessToken ينتهي بدل ما تطلب من المستخدم يعمل login تاني.

### 6. تسجيل الخروج

```http
POST /auth/logout
Authorization: Bearer TOKEN
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

> يتم حذف الـ refreshToken من الـ DB ومن الـ cookie.

### 7. نسيت كلمة المرور

```http
POST /auth/forgetpassword
```

**Request Body:**

```json
{
  "email": "ahmed@example.com"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Password reset code sent to your email."
}
```

### 8. التحقق من كود إعادة التعيين

```http
POST /auth/verifyresetcode
```

**Request Body:**

```json
{
  "resetCode": "12345678"
}
```

> الكود مكون من **8 أرقام** وصالح لمدة **10 دقائق**.

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Reset code verified."
}
```

### 9. إعادة تعيين كلمة المرور

```http
PUT /auth/resetpassword
```

**Request Body:**

```json
{
  "email": "ahmed@example.com",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Password reset successful.",
  "accessToken": "new_access_token..."
}
```

> 🍪 يتم أيضاً إرسال **refreshToken** جديد كـ cookie.

---

## 👤 User (المستخدم)

### جلب بيانات المستخدم الحالي

```http
GET /users/getMe
Authorization: Bearer TOKEN
```

**Response:**

```json
{
  "data": {
    "_id": "user_id",
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "profileImg": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/users/user-image.jpeg",
    "role": "user",
    "wishlist": ["product_id_1", "product_id_2"],
    "addresses": [
      {
        "_id": "addr_id",
        "alias": "المنزل",
        "details": "123 شارع النيل",
        "phone": "01012345678",
        "city": "القاهرة",
        "postalCode": "12345"
      }
    ],
    "avatar": "أ"
  }
}
```

### تحديث بيانات المستخدم

```http
PUT /users/updateMe
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "name": "أحمد محمود",
  "email": "ahmed.new@example.com",
  "phone": "01098765432"
}
```

**Response (200):**

```json
{
  "data": {
    "_id": "user_id",
    "name": "أحمد محمود",
    "slug": "أحمد-محمود",
    "email": "ahmed.new@example.com",
    "phone": "01098765432",
    "role": "user",
    "active": true,
    "avatar": "أ"
  }
}
```

### تغيير كلمة المرور

```http
PUT /users/updateMyPassword
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "user",
      "avatar": "أ"
    },
    "accessToken": "new_jwt_token_here..."
  }
}
```

> ⚠️ **مهم:** لازم تحفظوا الـ accessToken الجديد وتستبدلوا القديم فوراً.

### حذف الحساب (Soft Delete)

```http
DELETE /users/deleteMe
Authorization: Bearer TOKEN
```

> ⚠️ **ملاحظة:** هذا الـ endpoint بيعمل **soft delete** (بيحوّل `active` إلى `false`). الحساب لا يُحذف نهائياً من قاعدة البيانات.
> Response: `204 No Content`

---

## 📦 Products (المنتجات)

### جلب كل المنتجات (مع Pagination و Filtering)

```http
GET /products
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | رقم الصفحة (الافتراضي: 1) | `?page=1` |
| `limit` | number | عدد العناصر في الصفحة (الافتراضي: 25) | `?limit=10` |
| `sort` | string | الترتيب (الافتراضي: `createdAt` تصاعدي) | `?sort=-price` أو `?sort=price` |
| `fields` | string | الحقول المطلوبة | `?fields=title,price,imageCover` |
| `keyword` | string | البحث في العنوان والوصف | `?keyword=laptop` |
| `price[gte]` | number | السعر أكبر من أو يساوي | `?price[gte]=100` |
| `price[lte]` | number | السعر أقل من أو يساوي | `?price[lte]=1000` |
| `category` | ObjectId | فلترة حسب التصنيف | `?category=category_id` |
| `brand` | ObjectId | فلترة حسب العلامة التجارية | `?brand=brand_id` |
| `ratingsAverage[gte]` | number | التقييم أكبر من | `?ratingsAverage[gte]=4` |

**Example Request:**

```
GET /products?page=1&limit=10&sort=-price&keyword=phone&category=cat_id
```

**Response:**

```json
{
  "results": 10,
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "numberOfPages": 5,
    "nextPage": 2
  },
  "data": [
    {
      "_id": "product_id",
      "title": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "وصف المنتج الكامل هنا...",
      "quantity": 50,
      "sold": 120,
      "price": 50000,
      "priceAfterDiscount": 45000,
      "colors": ["Black", "Silver", "Gold"],
      "imageCover": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/cover.jpeg",
      "images": [
        "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/img1.jpeg",
        "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/img2.jpeg"
      ],
      "category": { "name": "الهواتف" },
      "subCategory": [{ "name": "هواتف ذكية" }],
      "brand": { "name": "Apple" },
      "ratingsAverage": 4.5,
      "ratingsQuantity": 25,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### جلب منتج واحد

```http
GET /products/:id
```

**Response:**

```json
{
  "data": {
    "_id": "product_id",
    "title": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "وصف المنتج الكامل...",
    "quantity": 50,
    "sold": 120,
    "price": 50000,
    "priceAfterDiscount": 45000,
    "colors": ["Black", "Silver", "Gold"],
    "imageCover": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/cover.jpeg",
    "images": ["..."],
    "category": { "name": "الهواتف" },
    "subCategory": [{ "name": "هواتف ذكية" }],
    "brand": { "name": "Apple" },
    "ratingsAverage": 4.5,
    "ratingsQuantity": 25,
    "reviews": [
      {
        "_id": "review_id",
        "content": "منتج ممتاز!",
        "rating": 5,
        "user": {
          "name": "محمد",
          "profileImg": "...",
          "avatar": "م"
        }
      }
    ]
  }
}
```

### جلب تقييمات منتج

```http
GET /products/:productId/reviews
```

---

## 📂 Categories (التصنيفات)

### جلب كل التصنيفات

```http
GET /categories
```

**Query Parameters:**

- `page`, `limit`, `sort`, `keyword`

**Response:**

```json
{
  "results": 10,
  "pagination": { "..." },
  "data": [
    {
      "_id": "cat_id",
      "name": "الإلكترونيات",
      "slug": "electronics",
      "image": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/categories/electronics.jpeg"
    }
  ]
}
```

### جلب تصنيف واحد

```http
GET /categories/:id
```

### جلب التصنيفات الفرعية لتصنيف

```http
GET /categories/:categoryId/subcategories
```

---

## 🏷️ SubCategories (التصنيفات الفرعية)

### جلب كل التصنيفات الفرعية

```http
GET /subcategories
```

### جلب تصنيف فرعي

```http
GET /subcategories/:id
```

---

## 🏪 Brands (العلامات التجارية)

### جلب كل العلامات التجارية

```http
GET /brands
```

**Response:**

```json
{
  "results": 5,
  "pagination": { "..." },
  "data": [
    {
      "_id": "brand_id",
      "name": "Apple",
      "slug": "apple",
      "image": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/brands/apple.jpeg"
    }
  ]
}
```

### جلب علامة تجارية

```http
GET /brands/:id
```

---

## 🛒 Cart (سلة التسوق)

> ⚠️ **ملاحظة:** كل endpoints سلة التسوق تتطلب `Authorization: Bearer TOKEN` ولصلاحية `user` فقط

### جلب سلة التسوق

```http
GET /my-cart
Authorization: Bearer TOKEN
```

**Response:**

```json
{
  "status": "success",
  "numberOfItems": 3,
  "data": {
    "_id": "cart_id",
    "cartItems": [
      {
        "_id": "item_id",
        "product": "product_id",
        "quantity": 2,
        "color": "Black",
        "price": 50000,
        "productImage": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/img.jpeg",
        "nameOfProduct": "iPhone 15 Pro",
        "description": "..."
      }
    ],
    "totalCartPrice": 100000,
    "totalCartPriceAfterDiscount": 90000,
    "user": "user_id"
  }
}
```

### إضافة منتج للسلة

```http
POST /my-cart
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "productId": "product_id",
  "color": "Black"
}
```

**Response:**

```json
{
  "status": "success",
  "numberOfItems": 4,
  "data": { "..." }
}
```

### تعديل كمية منتج في السلة

```http
PATCH /my-cart/:itemId
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "quantity": 3
}
```

### تغيير لون منتج في السلة

```http
PATCH /my-cart/:itemId/color
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "color": "Silver"
}
```

### حذف منتج من السلة

```http
DELETE /my-cart/:itemId
Authorization: Bearer TOKEN
```

### تفريغ السلة بالكامل

```http
DELETE /my-cart
Authorization: Bearer TOKEN
```

### تطبيق كوبون خصم

```http
PATCH /my-cart/applyCoupon
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "couponName": "DISCOUNT20"
}
```

**Response:**

```json
{
  "status": "success",
  "numberOfItems": 3,
  "data": {
    "totalCartPrice": 100000,
    "totalCartPriceAfterDiscount": 80000
  }
}
```

---

## 📋 Orders (الطلبات)

### إنشاء طلب (الدفع عند الاستلام)

```http
POST /orders/:cartId
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "shippingAddress": {
    "details": "123 شارع النيل، الدور الخامس",
    "phone": "01012345678",
    "city": "القاهرة",
    "postalCode": "12345",
    "country": {
      "code": "EG",
      "name": "Egypt"
    }
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "_id": "order_id",
    "user": "user_id",
    "cartItems": [
      {
        "product": "product_id",
        "quantity": 1,
        "color": "Black",
        "price": 50000,
        "productImage": "https://res.cloudinary.com/<cloud-name>/image/upload/v123456/e-commerce/products/img.jpeg",
        "nameOfProduct": "iPhone 15 Pro",
        "description": "..."
      }
    ],
    "taxPrice": 0,
    "shippingPrice": 0,
    "shippingAddress": {
      "details": "123 شارع النيل، الدور الخامس",
      "phone": "01012345678",
      "city": "القاهرة",
      "postalCode": "12345",
      "country": {
        "code": "EG",
        "name": "Egypt"
      }
    },
    "totalOrderPrice": 100000,
    "paymentMethodType": "cash",
    "isPaid": false,
    "isDelivered": false,
    "createdAt": "..."
  }
}
```

### إنشاء جلسة دفع Stripe

```http
POST /orders/checkout-session/:cartId
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "shippingAddress": {
    "details": "123 شارع النيل",
    "phone": "01012345678",
    "city": "القاهرة",
    "postalCode": "12345",
    "country": {
      "code": "EG",
      "name": "Egypt"
    }
  }
}
```

**Response:**

```json
{
  "status": "success",
  "session": {
    "id": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

> 💡 **ملاحظة:** قم بتوجيه المستخدم إلى `session.url` لإتمام الدفع

### جلب طلباتي (User)

```http
GET /orders/my-orders
Authorization: Bearer TOKEN
```

**Response:**

```json
{
  "results": 5,
  "pagination": { "..." },
  "data": [
    {
      "_id": "order_id",
      "user": {
        "name": "أحمد",
        "email": "ahmed@example.com",
        "phone": "01012345678",
        "avatar": "أ"
      },
      "cartItems": [
        {
          "product": {
            "title": "iPhone 15 Pro",
            "price": 50000,
            "imageCover": "..."
          },
          "quantity": 1,
          "color": "Black",
          "price": 50000
        }
      ],
      "totalOrderPrice": 50050,
      "paymentMethodType": "online",
      "isPaid": true,
      "paidAt": "2025-01-01T12:00:00.000Z",
      "isDelivered": false,
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### جلب كل الطلبات (Admin/Manager)

```http
GET /orders
Authorization: Bearer TOKEN (Admin/Manager)
```

### جلب طلب واحد (Admin/Manager)

```http
GET /orders/:id
Authorization: Bearer TOKEN (Admin/Manager)
```

### تعليم الطلب كمُسلَّم (Admin/Manager)

```http
PATCH /orders/:id/deliver
Authorization: Bearer TOKEN (Admin/Manager)
```

### تعليم الطلب كمدفوع كاش (Admin/Manager)

```http
PATCH /orders/:id/pay
Authorization: Bearer TOKEN (Admin/Manager)
```

---

## ❤️ Wishlist (قائمة الأمنيات)

### جلب قائمة الأمنيات

```http
GET /wishlist
Authorization: Bearer TOKEN
```

**Response:**

```json
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "product_id",
      "title": "iPhone 15 Pro",
      "price": 50000,
      "imageCover": "..."
    }
  ]
}
```

### إضافة منتج للأمنيات

```http
POST /wishlist
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "productId": "product_id"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Product added to wishlist",
  "data": ["product_id_1", "product_id_2", "product_id_3"]
}
```

> 💡 **ملاحظة:** الـ `POST` بيرجع array of product IDs فقط. لجلب بيانات المنتجات الكاملة (title, price, imageCover) استخدم `GET /wishlist`.

### حذف منتج من الأمنيات

```http
DELETE /wishlist/:productId
Authorization: Bearer TOKEN
```

---

## 📍 Addresses (العناوين)

### جلب عناويني

```http
GET /addresses
Authorization: Bearer TOKEN
```

**Response:**

```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "addr_id",
      "alias": "المنزل",
      "details": "123 شارع النيل",
      "phone": "01012345678",
      "city": "القاهرة",
      "postalCode": "12345"
    }
  ]
}
```

### إضافة عنوان جديد

```http
POST /addresses
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "alias": "العمل",
  "details": "456 شارع التحرير",
  "phone": "01098765432",
  "city": "الجيزة",
  "postalCode": "54321"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Address added successfully",
  "data": [
    {
      "_id": "addr_id",
      "alias": "العمل",
      "details": "456 شارع التحرير",
      "phone": "01098765432",
      "city": "الجيزة",
      "postalCode": "54321"
    }
  ]
}
```

### حذف عنوان

```http
DELETE /addresses/:addressId
Authorization: Bearer TOKEN
```

---

## ⭐ Reviews (التقييمات)

### جلب تقييمات منتج

```http
GET /products/:productId/reviews
```

**Response:**

```json
{
  "results": 10,
  "pagination": { "..." },
  "data": [
    {
      "_id": "review_id",
      "content": "منتج رائع! أنصح به بشدة",
      "rating": 5,
      "user": {
        "name": "محمد أحمد",
        "profileImg": "...",
        "avatar": "م"
      },
      "product": "product_id",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### إضافة تقييم لمنتج

```http
POST /products/:productId/reviews
Authorization: Bearer TOKEN (User only)
```

**Request Body:**

```json
{
  "content": "منتج ممتاز!",
  "rating": 5
}
```

### تعديل تقييمي

```http
PUT /reviews/:id
Authorization: Bearer TOKEN (Owner only)
```

**Request Body:**

```json
{
  "content": "تعديل التقييم",
  "rating": 4
}
```

### حذف تقييم

```http
DELETE /reviews/:id
Authorization: Bearer TOKEN (Owner/Admin/Manager)
```

---

## 🎫 Coupons (الكوبونات) - للـ Admin/Manager فقط

### جلب كل الكوبونات

```http
GET /coupons
Authorization: Bearer TOKEN (Admin/Manager)
```

**Response:**

```json
{
  "results": 3,
  "pagination": { "..." },
  "data": [
    {
      "_id": "coupon_id",
      "name": "SUMMER2025",
      "discountDegree": 20,
      "discountMAX": 500,
      "expiryDate": "2025-08-31T23:59:59.000Z"
    }
  ]
}
```

### باقي Endpoints الكوبونات

```http
GET /coupons/:id
POST /coupons
PUT /coupons/:id
DELETE /coupons/:id
Authorization: Bearer TOKEN (Admin/Manager)
```

---

## ❌ Error Responses

### التنسيق العام للأخطاء

```json
{
  "status": "Fail | Error",
  "message": "رسالة الخطأ"
}
```

### أكواد الأخطاء الشائعة

| Code  | المعنى            | السبب المحتمل           |
| ----- | ----------------- | ----------------------- |
| `400` | Bad Request       | بيانات غير صحيحة        |
| `401` | Unauthorized      | Token مفقود أو غير صالح |
| `403` | Forbidden         | ليس لديك صلاحية         |
| `404` | Not Found         | المورد غير موجود        |
| `429` | Too Many Requests | تجاوزت الحد المسموح     |
| `500` | Server Error      | خطأ في السيرفر          |

### أمثلة على الأخطاء

**Token مفقود:**

```json
{
  "status": "Fail",
  "message": "You are not logged in Please log in to access this route"
}
```

**ليس لديك صلاحية:**

```json
{
  "status": "Fail",
  "message": "You are not authorized to access this route"
}
```

**Validation Error:**

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

## 🔧 مثال على Integration بـ JavaScript

### Axios Setup

```javascript
import axios from "axios";

// تحديد الـ Base URL حسب البيئة
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://backend-easeshopping-system-production.up.railway.app/api/v1"
    : "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // مهم لإرسال refreshToken cookie تلقائياً
  headers: {
    "Content-Type": "application/json",
  },
});

// إضافة Access Token تلقائياً لكل الطلبات
API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// معالجة الأخطاء
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
```

### أو باستخدام Environment Variables (Next.js)

في ملف `.env.local`:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

في ملف `.env.production`:

```env
# Production
NEXT_PUBLIC_API_URL=https://backend-easeshopping-system-production.up.railway.app/api/v1
```

ثم في الكود:

```javascript
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### استخدام الـ API

```javascript
// تسجيل الدخول
const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", data.data.accessToken);
  return data.data.user;
};

// جلب المنتجات
const getProducts = async (page = 1, limit = 10) => {
  const { data } = await API.get(`/products?page=${page}&limit=${limit}`);
  return data;
};

// إضافة للسلة
const addToCart = async (productId, color) => {
  const { data } = await API.post("/my-cart", { productId, color });
  return data;
};

// إنشاء طلب
const createOrder = async (cartId, shippingAddress) => {
  const { data } = await API.post(`/orders/${cartId}`, { shippingAddress });
  return data;
};
```

---

## 🌍 قائمة أكواد الدول المدعومة

للـ `shippingAddress.country.code`:

```
AD, AT, AU, AZ, BA, BE, BG, BR, BY, CA, CH, CN, CZ, DE, DK, DO, DZ,
EE, EG, ES, FI, FR, GB, GR, HR, HT, HU, ID, IL, IN, IR, IS, IT, JP,
KE, KR, LI, LK, LT, LU, LV, MT, MX, MY, NL, NO, NP, NZ, PL, PR, PT,
RO, RU, SA, SE, SG, SI, SK, TH, TN, TW, UA, US, ZA, ZM
```

---

## 📞 للتواصل

إذا واجهتم أي مشاكل أو لديكم استفسارات، تواصلوا مع فريق الـ Backend.

---

**آخر تحديث:** March 2026
