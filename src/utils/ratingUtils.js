export function getRatingSummary(reviews, userId) {
  const userReviews = reviews.filter((review) => review.revieweeId === userId);

  if (userReviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = userReviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: total / userReviews.length,
    count: userReviews.length,
  };
}