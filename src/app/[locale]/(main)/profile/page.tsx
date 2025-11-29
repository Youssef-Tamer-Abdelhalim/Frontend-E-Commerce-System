"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, addressesApi } from "@/lib/api";
import { User, Address } from "@/types";
import axios from "axios";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { SafeImage } from "@/components/ui/SafeImage";
import { getImageUrl } from "@/lib/utils/helpers";
import { Breadcrumb } from "@/components/layout";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { isAuthenticated, setUser, user: authUser } = useAuthStore();

  const [user, setUserData] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "addresses"
  >("profile");

  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    alias: "",
    details: "",
    phone: "",
    city: "",
    postalCode: "",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const breadcrumbItems = [{ label: t("title") }];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, addressesResponse] = await Promise.all([
          usersApi.getMe(),
          addressesApi.getAll(),
        ]);

        setUserData(userResponse.data);
        setProfileForm({
          name: userResponse.data.name || "",
          phone: userResponse.data.phone || "",
        });
        setAddresses(addressesResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Fallback to authStore user data if API fails
        if (authUser) {
          setUserData(authUser);
          setProfileForm({
            name: authUser.name || "",
            phone: authUser.phone || "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router, authUser]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto upload after selection
    setIsUploadingImage(true);
    try {
      const response = await usersApi.updateMeWithImage({
        name: user.name, // Backend may require name with image upload
        profileImg: file,
      });
      setUserData(response.data);
      setUser(response.data);
      setProfileImage(null);
      toast.success("تم تحديث الصورة بنجاح");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorMsg = errors
            .map((e: { msg?: string }) => e.msg)
            .join(", ");
          toast.error(errorMsg);
        } else {
          toast.error(error.response?.data?.message || "فشل في رفع الصورة");
        }
      } else {
        toast.error("فشل في رفع الصورة");
      }
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUploadImage = async () => {
    if (!profileImage) return;

    setIsUploadingImage(true);
    try {
      const response = await usersApi.updateMeWithImage({
        profileImg: profileImage,
      });
      setUserData(response.data);
      setUser(response.data);
      setProfileImage(null);
      setImagePreview(null);
      toast.success("تم تحديث الصورة بنجاح");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("فشل في رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Send only the fields that need to be updated
      const updateData: { name?: string; phone?: string } = {};

      if (profileForm.name && profileForm.name !== user?.name) {
        updateData.name = profileForm.name;
      }
      if (profileForm.phone && profileForm.phone !== user?.phone) {
        updateData.phone = profileForm.phone;
      }

      // If nothing changed, just close the form
      if (Object.keys(updateData).length === 0) {
        setIsEditingProfile(false);
        return;
      }

      const response = await usersApi.updateMe(updateData);
      setUserData(response.data);
      setUser(response.data);
      setIsEditingProfile(false);
      toast.success(t("profileUpdated"));
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const errorMsg = errors
            .map((e: { msg?: string }) => e.msg)
            .join(", ");
          toast.error(errorMsg);
        } else {
          toast.error(error.response?.data?.message || tCommon("error"));
        }
      } else if (error instanceof Error) {
        toast.error(error.message || tCommon("error"));
      } else {
        toast.error(tCommon("error"));
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.password !== passwordForm.passwordConfirm) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    setIsSavingPassword(true);
    try {
      await usersApi.updateMyPassword(passwordForm);
      setPasswordForm({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      });
      toast.success(t("passwordChanged"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          const errorMsg = errors
            .map((e: { msg?: string }) => e.msg)
            .join(", ");
          toast.error(errorMsg);
        } else {
          toast.error(
            error.response?.data?.message || "فشل في تغيير كلمة المرور"
          );
        }
      } else {
        toast.error(tCommon("error"));
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAddAddress = async () => {
    setIsSavingAddress(true);
    try {
      const response = await addressesApi.add(addressForm);
      setAddresses(response.data);
      setShowAddressForm(false);
      setAddressForm({
        alias: "",
        details: "",
        phone: "",
        city: "",
        postalCode: "",
      });
      toast.success("تم إضافة العنوان بنجاح");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          // Translate common backend error messages to Arabic
          const translatedErrors = errors.map((e: { msg?: string }) => {
            const msg = e.msg || "";
            if (msg.includes("Alias already in use"))
              return "اسم العنوان مستخدم بالفعل";
            if (msg.includes("phone"))
              return "رقم الهاتف غير صحيح (يجب أن يكون رقم مصري أو سعودي)";
            if (msg.includes("required")) return "جميع الحقول مطلوبة";
            return msg;
          });
          toast.error(translatedErrors.join("، "));
        } else {
          toast.error(error.response?.data?.message || "فشل في إضافة العنوان");
        }
      } else {
        toast.error(tCommon("error"));
      }
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await addressesApi.remove(addressId);
      setAddresses(response.data);
      toast.success("تم حذف العنوان بنجاح");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error(tCommon("error"));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              {/* User Avatar */}
              <div className="flex flex-col items-center mb-6 pt-4">
                <div className="relative group">
                  {imagePreview || user?.profileImg ? (
                    <SafeImage
                      src={imagePreview || getImageUrl(user?.profileImg || "")}
                      alt={user?.name || "User"}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {/* Camera overlay for upload */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {isUploadingImage && (
                  <p className="text-xs text-muted-foreground mt-2">
                    جارٍ رفع الصورة...
                  </p>
                )}
                <h3 className="font-semibold text-lg mt-3">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  {t("profile")}
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "password"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  {t("changePassword")}
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "addresses"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  {t("addresses")}
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("profile")}</CardTitle>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit3 className="w-4 h-4 me-2" />
                    {tCommon("edit")}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          name: user?.name || "",
                          phone: user?.phone || "",
                        });
                      }}
                    >
                      <X className="w-4 h-4 me-2" />
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      isLoading={isSavingProfile}
                    >
                      <Save className="w-4 h-4 me-2" />
                      {tCommon("save")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <UserIcon className="w-4 h-4 inline me-2" />
                      {tAuth("name")}
                    </label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="p-3 bg-muted rounded-lg">
                        {user?.name || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 inline me-2" />
                      {tAuth("email")}
                    </label>
                    <p className="p-3 bg-muted rounded-lg text-muted-foreground">
                      {user?.email || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      البريد الإلكتروني لا يمكن تغييره
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 inline me-2" />
                      {tAuth("phone")}
                    </label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="p-3 bg-muted rounded-lg">
                        {user?.phone || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("changePassword")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("currentPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("confirmNewPassword")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.passwordConfirm}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          passwordConfirm: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  isLoading={isSavingPassword}
                  disabled={
                    !passwordForm.currentPassword ||
                    !passwordForm.password ||
                    !passwordForm.passwordConfirm
                  }
                >
                  {t("changePassword")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("addresses")}</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus className="w-4 h-4 me-2" />
                  إضافة عنوان
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="p-4 border border-border rounded-lg space-y-4 bg-muted/30">
                    <h4 className="font-medium">عنوان جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          اسم العنوان (مثال: المنزل، العمل)
                        </label>
                        <Input
                          value={addressForm.alias}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              alias: e.target.value,
                            })
                          }
                          placeholder="المنزل"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          المدينة
                        </label>
                        <Input
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                            })
                          }
                          placeholder="القاهرة"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          العنوان بالتفصيل
                        </label>
                        <Input
                          value={addressForm.details}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              details: e.target.value,
                            })
                          }
                          placeholder="123 شارع النيل، الدور الخامس"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          رقم الهاتف
                        </label>
                        <Input
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="01012345678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          الرمز البريدي
                        </label>
                        <Input
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddAddress}
                        isLoading={isSavingAddress}
                        disabled={!addressForm.alias || !addressForm.details}
                      >
                        حفظ العنوان
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                      >
                        {tCommon("cancel")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Addresses List */}
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد عناوين محفوظة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.addressId || address._id}
                        className="p-4 border border-border rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            {address.alias}
                          </h4>
                          <p className="text-muted-foreground mt-1">
                            {address.details}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.city}
                            {address.postalCode && ` - ${address.postalCode}`}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground">
                              <Phone className="w-3 h-3 inline me-1" />
                              {address.phone}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteAddress(
                              address.addressId || address._id || ""
                            )
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
