export const getAvailabilityInfo = (stock) => {
  if (stock <= 0) {
    return { text: "✗ Out of Stock", color: "text-danger!" };
  }

  if (stock <= 10) {
    return { text: `⚠ Only ${stock} left`, color: "text-danger!" };
  }

  return { text: "✓ In Stock", color: "text-success!" };
};

export default getAvailabilityInfo;
