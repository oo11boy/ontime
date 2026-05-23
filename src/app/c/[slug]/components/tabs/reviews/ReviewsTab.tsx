import { ReviewsSection } from "./components/ReviewsSection";

interface ReviewsTabProps {
  slug: string;
}

export function ReviewsTab({ slug }: ReviewsTabProps) {
  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">نظرات کاربران</h2>
        <p className="text-gray-400 text-sm">نظرات و تجربیات دیگران</p>
      </div>
      <ReviewsSection slug={slug} />
    </div>
  );
}
