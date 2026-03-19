# 📋 ملخص مشروع EaseShopping - Frontend E-Commerce System

## 🎯 نظرة عامة

المشروع ده هو **الفرونت إند** لنظام تجارة إلكترونية اسمه **EaseShopping**، مبني بـ **Next.js 16** مع **React 19** و **TypeScript**. المشروع بيتواصل مع **باك إند API** (مبني بـ Node.js) وبيوفر واجهة كاملة للمستخدمين والأدمن.

### المميزات الرئيسية
- 🌐 **دعم ثنائي اللغة** (عربي 🇪🇬 + إنجليزي 🇬🇧) مع RTL/LTR
- 🌙 **وضع ليلي ونهاري** (Dark/Light Theme)
- 👤 **نظام مصادقة كامل** (تسجيل/دخول/نسيت الباسورد/تغيير الباسورد)
- 🛒 **سلة مشتريات** مع كوبونات خصم
- ❤️ **قائمة المفضلة** (Wishlist)
- 📦 **نظام طلبات** مع دفع كاش وأونلاين (Stripe)
- 🔧 **لوحة تحكم أدمن كاملة** لإدارة كل حاجة
- 📱 **تصميم متجاوب** (Responsive) لكل الشاشات

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **Next.js** | 16.1.6 | Framework أساسي (App Router) |
| **React** | 19.2.0 | مكتبة UI |
| **TypeScript** | 5.x | Type Safety |
| **TailwindCSS** | 4.x | التنسيق والتصميم |
| **Zustand** | 5.0.8 | إدارة الحالة (State Management) |
| **Axios** | 1.13.2 | طلبات HTTP للـ API |
| **next-intl** | 4.5.6 | الترجمة والتعريب (i18n) |
| **next-themes** | 0.4.6 | الوضع الليلي/النهاري |
| **React Hook Form** | 7.66.1 | إدارة الفورمات |
| **Zod** | 4.1.13 | التحقق من البيانات (Validation) |
| **Swiper** | 12.0.3 | السلايدرات والكاروسيل |
| **react-hot-toast** | 2.6.0 | الإشعارات (Notifications) |
| **lucide-react** | 0.555.0 | الأيقونات |
| **react-icons** | 5.5.0 | أيقونات إضافية |

### الخطوط (Fonts)
- **Tajawal** — للنصوص العربية
- **Poppins** — للنصوص الإنجليزية والأرقام

---

## 📁 هيكل المشروع (Project Structure)

```
Frontend-E-Commerce-System/
├── messages/                    # ملفات الترجمة الرئيسية
│   ├── ar.json                  # الترجمة العربية (اللغة الافتراضية)
│   └── en.json                  # الترجمة الإنجليزية
├── public/
│   └── images/
│       └── placeholder.svg      # صورة placeholder
├── src/
│   ├── app/                     # صفحات Next.js (App Router)
│   ├── components/              # مكونات قابلة لإعادة الاستخدام
│   ├── i18n/                    # إعدادات التعريب
│   ├── lib/                     # API Layer + Utilities
│   ├── providers/               # React Context Providers
│   ├── stores/                  # Zustand State Stores
│   ├── types/                   # TypeScript Type Definitions
│   └── middleware.ts            # Middleware للترجمة والتوجيه
├── next.config.ts               # إعدادات Next.js
├── package.json                 # التبعيات والسكربتات
└── tsconfig.json                # إعدادات TypeScript
```

---

## 🗂️ الصفحات والمسارات (Routes)

المشروع بيستخدم **Next.js App Router** مع **Route Groups** و **Dynamic Segments**.

### المسار الأساسي: `src/app/[locale]/`
كل المسارات بتبدأ بـ `[locale]` (إما `/ar/` أو `/en/`) عشان الترجمة.

### 🏪 (main) — الواجهة الرئيسية للمتجر

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **الصفحة الرئيسية** | `/` | Hero + Categories + Featured Products + Brands + Features |
| **المنتجات** | `/products` | كل المنتجات مع فلترة وبحث وترتيب وتصفح صفحات |
| **تفاصيل المنتج** | `/products/[id]` | تفاصيل المنتج + التقييمات + منتجات مرتبطة |
| **التصنيفات** | `/categories` | عرض كل التصنيفات |
| **السلة** | `/cart` | محتويات السلة + تعديل الكميات + كوبونات الخصم |
| **نجاح الدفع** | `/checkout/success` | صفحة تأكيد الطلب بعد الدفع |
| **طلباتي** | `/orders` | سجل طلبات المستخدم |
| **المفضلة** | `/wishlist` | قائمة المنتجات المفضلة |
| **حسابي** | `/profile` | تعديل الملف الشخصي وتغيير الباسورد |

**Layout (main):** يحتوي على `Header` + `Footer`

---

### 🔐 (auth) — صفحات المصادقة

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **تسجيل الدخول** | `/login` | إدخال الإيميل والباسورد |
| **إنشاء حساب** | `/register` | تسجيل حساب جديد |
| **نسيت الباسورد** | `/forgot-password` | إرسال كود إعادة تعيين |
| **تأكيد الكود** | `/verify-code` | إدخال كود التحقق |
| **إعادة تعيين الباسورد** | `/reset-password` | إدخال الباسورد الجديد |

**Layout (auth):** تصميم بسيط مع شعار EaseShopping فقط

---

### 🔧 (admin) — لوحة تحكم الأدمن

> ⚠️ **محمية** — يجب تسجيل الدخول بصلاحية `admin` فقط

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| **لوحة التحكم** | `/admin` | إحصائيات (مستخدمين/منتجات/طلبات/إيرادات) + رسم بياني + آخر الطلبات |
| **إدارة المنتجات** | `/admin/products` | عرض/بحث/حذف المنتجات |
| **إضافة/تعديل منتج** | `/admin/products/[id]` | فورم إضافة أو تعديل منتج (مع رفع صور) |
| **إدارة الطلبات** | `/admin/orders` | كل الطلبات + تحديث حالة الدفع/التوصيل |
| **تفاصيل طلب** | `/admin/orders/[id]` | تفاصيل طلب محدد |
| **إدارة التصنيفات** | `/admin/categories` | إضافة/تعديل/حذف التصنيفات |
| **إدارة البراندات** | `/admin/brands` | إضافة/تعديل/حذف الماركات |
| **إدارة الكوبونات** | `/admin/coupons` | إضافة/تعديل/حذف كوبونات الخصم |
| **إدارة المراجعات** | `/admin/reviews` | عرض/حذف مراجعات المنتجات |
| **إدارة المستخدمين** | `/admin/users` | عرض/تعديل أدوار/حذف المستخدمين |

**Layout (admin):** Sidebar جانبي + Header فيه Theme Toggle و Language Switcher

---

## 🧩 المكونات (Components)

### مكونات الـ UI (`src/components/ui/`)
مكونات أساسية قابلة لإعادة الاستخدام في كل المشروع:

| المكون | الوصف |
|--------|-------|
| `Button` | زر مع دعم حالات loading و variants مختلفة |
| `Input` | حقل إدخال مع دعم عرض الأخطاء |
| `Select` | قائمة منسدلة |
| `Textarea` | حقل نص متعدد الأسطر |
| `Card` | بطاقة مع `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` |
| `Badge` | شارة ملونة (نجاح/خطأ/تحذير/معلومة) |
| `Modal` | نافذة منبثقة |
| `Pagination` | تصفح الصفحات |
| `Rating` | عرض/إدخال التقييم بالنجوم |
| `SafeImage` | صورة مع fallback لما الصورة تفشل |
| `Skeleton` | حالة التحميل (Loading Placeholder) |
| `Spinner` / `Loading` | مؤشرات التحميل |

### مكونات الـ Layout (`src/components/layout/`)

| المكون | الوصف |
|--------|-------|
| `Header` | شريط التنقل الرئيسي (ناف بار) مع بحث وسلة ولغة وثيم |
| `Footer` | الفوتر مع روابط سريعة ومعلومات التواصل ونشرة إخبارية |
| `MobileMenu` | قائمة جانبية للموبايل |
| `AdminSidebar` | القائمة الجانبية للأدمن |
| `Breadcrumb` | مسار التنقل |
| `ThemeToggle` | زر تبديل الوضع الليلي/النهاري |
| `LanguageSwitcher` | زر تبديل اللغة (عربي ↔ English) |

### مكونات المنتجات (`src/components/products/`)

| المكون | الوصف |
|--------|-------|
| `ProductCard` | بطاقة المنتج (صورة + اسم + سعر + تقييم + زر إضافة للسلة + زر مفضلة) |

### مكونات الصفحة الرئيسية (`src/app/[locale]/(main)/_components/`)

| المكون | الوصف |
|--------|-------|
| `HeroSection` | البانر الرئيسي مع Swiper Slider |
| `CategoriesSection` | عرض التصنيفات المتاحة |
| `FeaturedProducts` | المنتجات المميزة |
| `BrandsSection` | الماركات المتاحة |
| `FeaturesSection` | مميزات المتجر (شحن مجاني/دفع آمن/إرجاع سهل/دعم 24/7) |

---

## 🗄️ إدارة الحالة — Zustand Stores (`src/stores/`)

### 1. `authStore` — حالة المصادقة
- **State:** `user`, `token`, `isAuthenticated`, `isLoading`, `error`
- **Actions:** `login()`, `register()`, `logout()`, `fetchUser()`, `hydrateAuth()`
- **ميزة:** البيانات محفوظة في `localStorage` عبر `persist` middleware
- **آلية:** عند فتح التطبيق، `StoreProvider` ينادي `hydrateAuth()` لاسترجاع الجلسة

### 2. `cartStore` — السلة
- **State:** `items[]`, `cartId`, `numOfCartItems`, `totalCartPrice`, `totalCartPriceAfterDiscount`
- **Actions:** `fetchCart()`, `addToCart()`, `updateQuantity()`, `updateColor()`, `removeItem()`, `clearCart()`, `applyCoupon()`, `resetCart()`
- **ميزة:** كل العمليات بتتواصل مع الباك إند API مباشرة

### 3. `wishlistStore` — المفضلة
- **State:** `items[]` (Product IDs), `products[]` (Full Product data)
- **Actions:** `fetchWishlist()`, `addToWishlist()`, `removeFromWishlist()`, `isInWishlist()`
- **ميزة:** بتستخدم **Optimistic Updates** — التغيير بيظهر فوراً وبيترجع لو حصل خطأ

### 4. `filtersStore` — فلاتر المنتجات
- **State:** `keyword`, `category`, `brand`, `priceMin`, `priceMax`, `rating`, `sort`, `page`, `limit`
- **Actions:** `setKeyword()`, `setCategory()`, `setBrand()`, `setPriceRange()`, `setRating()`, `setSort()`, `setPage()`, `resetFilters()`, `getQueryParams()`
- **ميزة:** `sort` و `limit` محفوظين في `localStorage`؛ أي تغيير في الفلاتر يرجع لصفحة 1

### 5. `uiStore` — حالة واجهة المستخدم
- **State:** `isMobileMenuOpen`, `isCartDrawerOpen`, `isSearchOpen`, `toasts[]`
- **Actions:** `toggleMobileMenu()`, `toggleCartDrawer()`, `toggleSearch()`, `showToast()`, `hideToast()`
- **ميزة:** التنبيهات بتختفي تلقائياً بعد 5 ثواني

---

## 🌐 طبقة الـ API (`src/lib/api/`)

### الـ Client (`client.ts`)
- مبني على **Axios** مع `baseURL` = `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`)
- **Request Interceptor:** بيضيف `Authorization: Bearer <token>` من `localStorage` تلقائياً
- **Response Interceptor:**
  - خطأ **429** (Too Many Requests) → إعادة المحاولة 3 مرات مع **Exponential Backoff** (1s, 2s, 4s)
  - خطأ **401** (Unauthorized) → حذف التوكن وتحويل لصفحة Login
- دالة مساعدة `createFormData()` لرفع الملفات

### الوحدات (Modules)

| الوحدة | الـ Endpoint | العمليات |
|--------|-------------|----------|
| `authApi` | `/auth/*` | `signup`, `login`, `forgotPassword`, `verifyResetCode`, `resetPassword` |
| `usersApi` | `/users/*` | `getMe`, `updateMe`, `updateMeWithImage`, `updateMyPassword`, `deleteMe` + Admin: `getAll`, `getById`, `create`, `update`, `delete` |
| `productsApi` | `/products/*` | `getAll` (مع فلاتر), `getById` + Admin: `create`, `update`, `delete` |
| `categoriesApi` | `/categories/*` | `getAll`, `getById`, `getSubcategories` + Admin: `create`, `update`, `delete` |
| `subcategoriesApi` | `/subcategories/*` | `getAll`, `getById` + Admin: `create`, `update`, `delete` |
| `brandsApi` | `/brands/*` | `getAll`, `getById` + Admin: `create`, `update`, `delete` |
| `cartApi` | `/my-cart/*` | `get`, `add`, `updateQuantity`, `updateColor`, `removeItem`, `clear`, `applyCoupon` |
| `ordersApi` | `/orders/*` | `getMyOrders`, `getAll` (admin), `getById`, `createCashOrder`, `createCheckoutSession` (Stripe) + Admin: `updatePaidStatus`, `updateDeliveredStatus` |
| `wishlistApi` | `/wishlist/*` | `get`, `add`, `remove` |
| `addressesApi` | `/addresses/*` | `getAll`, `add`, `remove` |
| `reviewsApi` | `/reviews/*`, `/products/[id]/reviews` | `getForProduct`, `create`, `update`, `delete` + Admin: `getAll` |
| `couponsApi` | `/coupons/*` | Admin: `getAll`, `getById`, `create`, `update`, `delete` |

---

## 📝 أنواع البيانات (Types — `src/types/`)

| النوع | الحقول الرئيسية |
|-------|----------------|
| `User` | `_id`, `name`, `email`, `phone`, `role` (user/manager/admin), `addresses[]`, `wishlist[]`, `avatar` |
| `Product` | `_id`, `title`, `slug`, `description`, `price`, `priceAfterDiscount`, `colors[]`, `imageCover`, `images[]`, `category`, `brand`, `ratingsAverage`, `ratingsQuantity`, `sold`, `quantity` |
| `Category` | `_id`, `name`, `slug`, `image` |
| `SubCategory` | `_id`, `name`, `slug`, `category` |
| `Brand` | `_id`, `name`, `slug`, `image` |
| `CartItem` | `_id`, `product`, `quantity`, `color`, `price`, `productImage`, `nameOfProduct` |
| `Order` | `_id`, `user`, `cartItems[]`, `totalOrderPrice`, `paymentMethodType` (cash/online), `isPaid`, `isDelivered`, `shippingAddress`, `taxPrice`, `shippingPrice` |
| `Review` | `_id`, `content`, `rating`, `user`, `product` |
| `Coupon` | `_id`, `name`, `discountDegree`, `discountMAX`, `expiryDate` |
| `Address` | `alias`, `details`, `phone`, `city`, `postalCode` |
| `ApiResponse<T>` | `status`, `message`, `results`, `paginationResult`, `data: T` |

---

## 🌍 نظام الترجمة (i18n)

### الإعدادات (`src/i18n/`)
- **المكتبة:** `next-intl` v4
- **اللغات:** عربي (`ar` — الافتراضية) + إنجليزي (`en`)
- **الاستراتيجية:** `localePrefix: 'always'` — المسار دايماً يبدأ بالغة مثل `/ar/products`
- **Middleware:** بيوجه المستخدم للغة المناسبة تلقائياً
- **Navigation:** `Link`, `useRouter`, `usePathname`, `redirect` — كلهم مدعومين بالترجمة

### ملفات الترجمة (`messages/`)
- `ar.json` (~21,652 bytes) و `en.json` (~16,515 bytes)
- بالإضافة لنسخ إضافية في `src/messages/` (للـ admin بشكل خاص)
- **الأقسام:** `common`, `nav`, `home`, `products`, `cart`, `checkout`, `orders`, `wishlist`, `auth`, `account`, `admin`, `address`, `footer`

---

## 🎨 نظام التصميم (Design System)

### متغيرات CSS (`globals.css`)
- **Light Theme:** خلفية بيضاء مع لون أساسي أخضر (`rgb(34, 197, 94)`)
- **Dark Theme:** خلفية داكنة خضراء (`rgb(10, 31, 10)`) مع أخضر فاتح
- **الألوان:** `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`

### RTL/LTR
- الاتجاه بيتحدد تلقائياً حسب اللغة (`dir="rtl"` للعربي، `dir="ltr"` للإنجليزي)
- CSS مخصص لمحاذاة النصوص

### الأرقام
- الأرقام دايماً بتظهر بالشكل الإنجليزي (0-9) حتى في الواجهة العربية
- عبر `font-feature-settings` + دالة `convertToEnglishNumbers()`

---

## 🔧 الأدوات المساعدة (Utilities — `src/lib/utils/`)

### `formatters.ts`
| الدالة | الوصف |
|--------|-------|
| `formatPrice()` | تنسيق السعر بالدولار (دايماً أرقام إنجليزية) |
| `formatDate()` | تنسيق التاريخ مع أسماء الشهور حسب اللغة |
| `formatDateTime()` | تنسيق التاريخ والوقت |
| `formatRelativeTime()` | وقت نسبي (مثل "منذ يومين") |
| `truncateText()` | قص النص |
| `getDiscountPercentage()` | حساب نسبة الخصم |

### `helpers.ts`
| الدالة | الوصف |
|--------|-------|
| `getImageUrl()` | بناء URL الصورة من الباك إند مع معالجة localhost و malformed URLs |
| `debounce()` | تأخير تنفيذ الدالة |
| `getInitials()` | أول حرف من الاسم للأفاتار |
| `isValidEmail()` | التحقق من صحة الإيميل |
| `isValidPhone()` | التحقق من رقم الموبايل (تنسيق مصري `01xxxxxxxxx`) |
| `getColorHex()` | تحويل اسم اللون لكود HEX |

### `cn.ts`
- دالة `cn()` لدمج classes الـ TailwindCSS باستخدام `clsx` + `tailwind-merge`

### `constants.ts`
- `API_URL`, `BACKEND_URL`
- `DEFAULT_PAGE_SIZE = 12`, `PAGE_SIZE_OPTIONS = [12, 24, 48]`
- `SORT_OPTIONS`, `USER_ROLES`, `ORDER_STATUS`, `PAYMENT_METHODS`
- `SUPPORTED_COUNTRIES` — 8 دول عربية (مصر، السعودية، الإمارات، الكويت، قطر، البحرين، عمان، الأردن)
- `RATING_OPTIONS`, `BREAKPOINTS`

---

## 🏗️ الـ Providers (`src/providers/`)

| Provider | الوصف |
|----------|-------|
| `ThemeProvider` | يغلف التطبيق بـ `next-themes` مع `defaultTheme="light"` |
| `StoreProvider` | ينادي `hydrateAuth()` عند فتح التطبيق لاسترجاع جلسة المستخدم من `localStorage` |
| `ToastProvider` | يعرض إشعارات `react-hot-toast` في أعلى الصفحة مع تنسيق متوافق مع الثيم |

**ترتيب التغليف في Layout:**
```
ThemeProvider → StoreProvider → ToastProvider → NextIntlClientProvider → {children}
```

---

## 🔐 نظام المصادقة والصلاحيات

### الأدوار (Roles)
| الدور | الصلاحيات |
|-------|----------|
| `user` | تصفح المنتجات + سلة + طلبات + مفضلة + ملف شخصي + مراجعات |
| `manager` | (معرف في النظام — صلاحياته حسب الباك إند) |
| `admin` | كل صلاحيات المستخدم + لوحة تحكم كاملة لإدارة كل شيء |

### حماية الصفحات
- **صفحات الأدمن:** Layout بيتحقق من `isAuthenticated` و `user.role === 'admin'` — لو مش أدمن بيتحول لصفحة Login أو الرئيسية
- **API Client:** لو رجع خطأ 401 بيحذف التوكن وبيوجه لصفحة Login تلقائياً

---

## ⚙️ إعدادات Next.js (`next.config.ts`)

- **الصور:** `unoptimized: true` + Remote Patterns لـ:
  - `localhost:8000` (التطوير المحلي)
  - `backend-easeshopping-system-production.up.railway.app` (الإنتاج)
  - `fakestoreapi.com` (بيانات تجريبية)
  - `*.unsplash.com` (صور)
  - `www.lamborghini.com`
- **i18n:** ملحق `next-intl` مُفعّل عبر `withNextIntl()`

---

## 📊 لوحة تحكم الأدمن (Admin Dashboard) — تفصيل

عند الدخول بتظهر:
1. **4 بطاقات إحصائيات:** إجمالي المستخدمين / المنتجات / الطلبات / الإيرادات
2. **رسم بياني للمبيعات** (`SalesChart`)
3. **إحصائيات سريعة:** طلبات معلقة + منتجات قليلة المخزون
4. **جدول آخر الطلبات** (`RecentOrders`)

### إمكانيات الأدمن الكاملة:
- ✅ إضافة/تعديل/حذف **منتجات** (مع رفع صور cover و additional)
- ✅ إضافة/تعديل/حذف **تصنيفات** (مع صور)
- ✅ إضافة/تعديل/حذف **براندات** (مع صور)
- ✅ إضافة/تعديل/حذف **كوبونات خصم** (نسبة + حد أقصى + تاريخ انتهاء)
- ✅ عرض/حذف **مراجعات**
- ✅ عرض/تعديل أدوار/حذف **مستخدمين**
- ✅ عرض/تحديث حالة **طلبات** (تأكيد الدفع + تأكيد التوصيل)

---

## 🔗 اتصال الباك إند

- **URL التطوير:** `http://localhost:8000/api/v1`
- **URL الإنتاج:** `https://backend-easeshopping-system-production.up.railway.app/api/v1`
- يُحدد عبر متغير البيئة `NEXT_PUBLIC_API_URL`
- متغير إضافي `NEXT_PUBLIC_BACKEND_URL` للصور

---

## 📌 ملاحظات مهمة

1. **ملف `DOCS_API_FOR_FRONTEND.md`** — شرح الباك إند بعد تحديثات ولسه الفرونت مش مربوط بالحاجات الجديدة دي
2. **الصفحة الرئيسية `app/page.tsx`** — لسه بتعرض صفحة Next.js الافتراضية (مش مستخدمة — الصفحة الفعلية في `app/[locale]/(main)/page.tsx`)
3. **ملفات ترجمة مزدوجة** — فيه نسختين: `messages/` (الجذر) و `src/messages/` — الكود بيحمل من `messages/` (الجذر)
4. **دعم Stripe** — فيه endpoint لـ checkout session بس التكامل الكامل مع Stripe محتاج مراجعة
5. **الباك إند مستضاف على Railway** — الصور والـ API بيتحملوا من هناك في بيئة الإنتاج
