# SubCategory (SupCategory) API — Frontend Documentation

> **ملاحظة مهمة للفريق:** هذا الـ resource موجود في الـ Backend من البداية، ومرتبط بالـ Category وبالـ Product. يُرجى قراءة هذا الملف بعناية قبل بناء أي شاشة تتعلق بالتصنيفات أو المنتجات.

---

## ما هو الـ SubCategory؟

الـ SubCategory (المخزّن بالاسم `SupCategory` في الـ DB) هو **تصنيف فرعي** ينتمي لتصنيف رئيسي (Category). مثال:

```
Category:    "إلكترونيات"
SubCategory: "هواتف ذكية" ، "لابتوبات" ، "تابلت"
```

وعند إنشاء **منتج**، يمكن (اختياريًا) ربطه بـ SubCategory واحد أو أكثر، بشرط أن تنتمي هذه الـ SubCategories للـ Category نفسها الخاصة بالمنتج.

---

## Data Model

```json
{
  "_id":      "MongoDB ObjectId",
  "name":     "String  (1–64 حرف، مطلوب، فريد)",
  "slug":     "String  (auto-generated من الـ name)",
  "category": "MongoDB ObjectId → Category (مطلوب)",
  "createdAt":"ISO Date",
  "updatedAt":"ISO Date"
}
```

---

## مسارات الوصول (Access Paths)

> للـ SubCategory **مسارين** للوصول — اختر المناسب حسب السياق:

| المسار | متى تستخدمه؟ |
|--------|--------------|
| `/api/v1/subcategories` | جلب أو تعديل SubCategory بشكل مستقل بدون تصفية |
| `/api/v1/categories/:categoryId/subcategories` | جلب أو إنشاء SubCategories تابعة لـ Category معينة (الأكثر استخدامًا في الـ UI) |

---

## Endpoints

### 1. جلب كل الـ SubCategories
```
GET /api/v1/subcategories
```
**أو (مفلتر حسب Category):**
```
GET /api/v1/categories/:categoryId/subcategories
```

- **Auth:** لا يحتاج — Public
- **Query Params (اختياري):**

| Param | النوع | الوصف | مثال |
|-------|-------|-------|------|
| `page` | Number | رقم الصفحة (افتراضي: 1) | `?page=2` |
| `limit` | Number | عدد النتائج (افتراضي: 25) | `?limit=10` |
| `sort` | String | ترتيب النتائج | `?sort=name` أو `?sort=-createdAt` |
| `fields` | String | تحديد الحقول المُرجَعة | `?fields=name,category` |
| `keyword` | String | بحث بالاسم (regex) | `?keyword=هاتف` |

**Response 200:**
```json
{
  "results": 3,
  "pagination": {
    "currentPage": 1,
    "limit": 25,
    "numberOfPages": 1
  },
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "هواتف ذكية",
      "slug": "هواتف-ذكية",
      "category": "64f1a2b3c4d5e6f7a8b9c0a1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2. جلب SubCategory واحد
```
GET /api/v1/subcategories/:id
```

- **Auth:** لا يحتاج — Public
- **`:id`:** MongoDB ObjectId للـ SubCategory

**Response 200:**
```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "هواتف ذكية",
    "slug": "هواتف-ذكية",
    "category": "64f1a2b3c4d5e6f7a8b9c0a1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400 — ID غير صحيح:**
```json
{
  "errors": [{ "msg": "Invalid Sub Category ID format", "path": "id" }]
}
```

---

### 3. إنشاء SubCategory جديد
```
POST /api/v1/subcategories
```
**أو (الأفضل — يمرر الـ categoryId تلقائيًا):**
```
POST /api/v1/categories/:categoryId/subcategories
```

- **Auth:** مطلوب — `Bearer Token` (Manager أو Admin فقط)

**Request Body:**
```json
{
  "name": "هواتف ذكية",
  "category": "64f1a2b3c4d5e6f7a8b9c0a1"
}
```

> **ملاحظة:** عند الاستخدام عبر الـ Nested Route `/categories/:categoryId/subcategories`، حقل `category` اختياري في الـ body — يتم تعيينه تلقائيًا من الـ URL.

**Validation Rules:**
| الحقل | المتطلبات |
|-------|-----------|
| `name` | مطلوب، 1–64 حرف |
| `category` | مطلوب، MongoDB ObjectId صحيح |

**Response 201:**
```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "هواتف ذكية",
    "slug": "هواتف-ذكية",
    "category": "64f1a2b3c4d5e6f7a8b9c0a1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400 — Validation Error:**
```json
{
  "errors": [
    { "msg": "Name is required", "path": "name" },
    { "msg": "Category is required", "path": "category" }
  ]
}
```

---

### 4. تعديل SubCategory
```
PUT /api/v1/subcategories/:id
```

- **Auth:** مطلوب — `Bearer Token` (Manager أو Admin)

**Request Body (كل الحقول اختيارية):**
```json
{
  "name": "اسم جديد"
}
```

> الـ `slug` يُحدَّث تلقائيًا عند تغيير الـ `name`.

**Response 200:**
```json
{
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "اسم جديد",
    "slug": "اسم-جديد",
    "category": "64f1a2b3c4d5e6f7a8b9c0a1",
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

---

### 5. حذف SubCategory
```
DELETE /api/v1/subcategories/:id
```

- **Auth:** مطلوب — `Bearer Token` (**Admin فقط**)

**Response 204:** No Content (لا يوجد body في الـ Response)

---

## ⚠️ علاقته بالـ Product (مهم جداً)

عند **إنشاء أو تعديل منتج**، يوجد حقل `subCategory` وهو array من الـ IDs:

```json
{
  "title": "iPhone 16 Pro",
  "category": "64f1a2b3c4d5e6f7a8b9c0a1",
  "subCategory": ["64f1a2b3c4d5e6f7a8b9c0d1", "64f1a2b3c4d5e6f7a8b9c0d2"]
}
```

**قواعد التحقق المهمة:**
1. `subCategory` **اختياري** — يمكن للمنتج أن يكون بدون SubCategory
2. إذا تم تمرير `subCategory`، يجب أن **تنتمي جميع الـ IDs** للـ `category` نفسها المحددة في المنتج — وإلا سيرجع الـ API خطأ

**مثال على الخطأ:**
```json
{
  "errors": [
    {
      "msg": "Subcategory not found with this ID: [...] in this category [categoryId]",
      "path": "subCategory"
    }
  ]
}
```

---

## سيناريوهات الاستخدام في الـ UI

### سيناريو 1: صفحة التصنيفات
عند الضغط على Category لعرض SubCategories الخاصة بها:
```
GET /api/v1/categories/{categoryId}/subcategories
```

### سيناريو 2: فلترة المنتجات بالـ SubCategory
```
GET /api/v1/products?subCategory={subCategoryId}
```

### سيناريو 3: نموذج إنشاء منتج (Admin Panel)
1. جلب الـ Categories: `GET /api/v1/categories`
2. عند اختيار Category، جلب SubCategories الخاصة بها:
   `GET /api/v1/categories/{categoryId}/subcategories`
3. يختار الـ admin SubCategory من القائمة ويضيف الـ ID في حقل `subCategory` بالمنتج

---

## ملخص الـ Endpoints

| Method | Endpoint | Auth | الوصول |
|--------|----------|------|--------|
| `GET` | `/api/v1/subcategories` | Public | جلب كل الـ SubCategories |
| `GET` | `/api/v1/subcategories/:id` | Public | جلب SubCategory واحد |
| `GET` | `/api/v1/categories/:categoryId/subcategories` | Public | جلب SubCategories لـ Category معينة |
| `POST` | `/api/v1/subcategories` | Manager/Admin | إنشاء SubCategory |
| `POST` | `/api/v1/categories/:categoryId/subcategories` | Manager/Admin | إنشاء SubCategory منسوب لـ Category |
| `PUT` | `/api/v1/subcategories/:id` | Manager/Admin | تعديل SubCategory |
| `DELETE` | `/api/v1/subcategories/:id` | Admin Only | حذف SubCategory |

---

## Error Responses العامة

| Status Code | المعنى |
|-------------|--------|
| `400` | Validation Error أو ID غير صحيح |
| `401` | لم يتم تمرير الـ Access Token |
| `403` | الـ role غير مصرح له |
| `404` | الـ SubCategory غير موجود |

---

*آخر تحديث: مارس 2026*
