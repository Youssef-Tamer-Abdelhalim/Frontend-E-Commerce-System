"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { reviewsApi } from "@/lib/api";
import {
  Button,
  Rating,
  RatingInput,
  Textarea,
  Skeleton,
} from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { getImageUrl } from "@/lib/utils/helpers";
import { SafeImage } from "@/components/ui/SafeImage";
import toast from "react-hot-toast";

interface Review {
  _id: string;
  title?: string;
  rating: number;
  content: string;
  user: string | { _id: string; name: string; profileImg?: string };
  product: string;
  createdAt: string;
  updatedAt?: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useAuthStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewsApi.getForProduct(productId);
      setReviews(response.data as unknown as Review[]);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginToReview"));
      return;
    }

    if (!newReview.content.trim()) {
      toast.error(t("reviewRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reviewsApi.create(productId, {
        rating: newReview.rating,
        content: newReview.content,
      });
      setReviews([response.data as unknown as Review, ...reviews]);
      setNewReview({ rating: 5, content: "" });
      setShowReviewForm(false);
      toast.success(t("reviewSubmitted"));
    } catch {
      toast.error(t("reviewError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mt-12 pt-8 border-t border-border">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {t("customerReviews")} ({reviews.length})
        </h2>
        {isAuthenticated && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            {t("writeReview")}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="font-medium mb-4">{t("writeReview")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("yourRating")}
              </label>
              <RatingInput
                value={newReview.rating}
                onChange={(rating) => setNewReview({ ...newReview, rating })}
              />
            </div>
            <Textarea
              label={t("yourReview")}
              value={newReview.content}
              onChange={(e) =>
                setNewReview({ ...newReview, content: e.target.value })
              }
              placeholder={t("reviewPlaceholder")}
              rows={4}
            />
            <div className="flex gap-3">
              <Button onClick={handleSubmitReview} isLoading={isSubmitting}>
                {t("submitReview")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                {tCommon("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {t("noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="p-4 border border-border rounded-lg"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                {review.user &&
                typeof review.user !== "string" &&
                review.user.profileImg ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden relative">
                    <SafeImage
                      src={getImageUrl(review.user.profileImg)}
                      alt={review.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {review.user && typeof review.user !== "string"
                      ? getInitials(review.user.name)
                      : "U"}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">
                        {review.user && typeof review.user !== "string"
                          ? review.user.name
                          : t("anonymous")}
                      </h4>
                      <Rating value={review.rating} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
