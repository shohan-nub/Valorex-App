export const fbq = (event: string, data?: object) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", event, data);
  }
};

// Ready-made functions
export const trackViewContent = (product: { id: string; name: string; price: number }) => {
  fbq("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "BDT",
  });
};

export const trackAddToCart = (product: { id: string; name: string; price: number }) => {
  fbq("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price,
    currency: "BDT",
  });
};

export const trackPurchase = (orderId: string, value: number) => {
  fbq("Purchase", {
    value: value,
    currency: "BDT",
    order_id: orderId,
  });
};