"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { reviewsApi } from "@/lib/api";
import { Review } from "@/types/review";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Pagination,
  Skeleton,
} from "@/components/ui";
import { formatDate, getInitials } from "@/lib/utils";
import { Trash2, Star, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const t = useTranslations("admin");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewsApi.getAll({
        page: currentPage,
        limit: 10,
      });
      setReviews(response.data);
      setTotalPages(response.paginationResult?.numberOfPages || 1);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      await reviewsApi.delete(id);
      toast.success(t("reviewDeleted"));
      fetchReviews();
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const getUserName = (review: Review): string => {
    if (typeof review.user === "string") return t("guest");
    return review.user?.name || t("guest");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("reviews")}</h1>
          <p className="text-muted-foreground">{t("manageReviews")}</p>
        </div>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allReviews")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noReviews")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                    {getInitials(getUserName(review))}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {getUserName(review)}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-sm mb-1">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {review.content}
                    </p>

                    {review.product && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("productId")}:{" "}
                        {typeof review.product === "string"
                          ? review.product
                          : review.product}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(review._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
