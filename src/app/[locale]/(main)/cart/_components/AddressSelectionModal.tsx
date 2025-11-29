"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { addressesApi } from "@/lib/api";
import { Address, CreateAddressData } from "@/types";
import { Button, Input, Modal } from "@/components/ui";
import {
  MapPin,
  Plus,
  Check,
  Phone,
  Building,
  Home,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

const aliasIcons: Record<string, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  المنزل: <Home className="h-4 w-4" />,
  العمل: <Briefcase className="h-4 w-4" />,
};

export function AddressSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: AddressSelectionModalProps) {
  const t = useTranslations();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateAddressData>({
    alias: "",
    details: "",
    phone: "",
    city: "",
    postalCode: "",
  });

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await addressesApi.getAll();
      setAddresses(response.data || []);
      // Auto-select first address if available
      if (response.data && response.data.length > 0) {
        setSelectedAddressId(
          response.data[0].addressId || response.data[0]._id || null
        );
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error(t("address.fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.alias ||
      !formData.details ||
      !formData.phone ||
      !formData.city
    ) {
      toast.error(t("address.fillRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addressesApi.add(formData);
      setAddresses(response.data || []);
      setShowAddForm(false);
      setFormData({
        alias: "",
        details: "",
        phone: "",
        city: "",
        postalCode: "",
      });
      toast.success(t("address.added"));

      // Select the newly added address
      if (response.data && response.data.length > 0) {
        const newAddress = response.data[response.data.length - 1];
        setSelectedAddressId(newAddress.addressId || newAddress._id || null);
      }
    } catch (error) {
      console.error("Failed to add address:", error);
      toast.error(t("address.addError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = () => {
    const selectedAddress = addresses.find(
      (addr) => (addr.addressId || addr._id) === selectedAddressId
    );
    if (selectedAddress) {
      onSelect(selectedAddress);
      onClose();
    } else {
      toast.error(t("address.selectRequired"));
    }
  };

  const getAddressIcon = (alias: string) => {
    const lowerAlias = alias.toLowerCase();
    return (
      aliasIcons[lowerAlias] ||
      aliasIcons[alias] || <Building className="h-4 w-4" />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("address.selectAddress")}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : showAddForm ? (
          // Add New Address Form
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("address.alias")} *
              </label>
              <Input
                value={formData.alias}
                onChange={(e) =>
                  setFormData({ ...formData, alias: e.target.value })
                }
                placeholder={t("address.aliasPlaceholder")}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("address.details")} *
              </label>
              <Input
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder={t("address.detailsPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("address.city")} *
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder={t("address.cityPlaceholder")}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("address.postalCode")}
                </label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder={t("address.postalCodePlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                {t("address.phone")} *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t("address.phonePlaceholder")}
                type="tel"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddForm(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                {t("address.addAddress")}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Address List */}
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {t("address.noAddresses")}
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 me-2" />
                  {t("address.addNew")}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {addresses.map((address) => {
                    const addressId = address.addressId || address._id;
                    const isSelected = selectedAddressId === addressId;

                    return (
                      <div
                        key={addressId}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedAddressId(addressId || null)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {getAddressIcon(address.alias)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{address.alias}</h4>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.details}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {address.city}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {address.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Address Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 me-2" />
                  {t("address.addNew")}
                </Button>

                {/* Confirm Button */}
                <Button
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={!selectedAddressId}
                >
                  {t("address.confirmAddress")}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
