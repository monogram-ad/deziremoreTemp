export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  price?: number;
}

export function generateWhatsAppMessage({
  customerName,
  customerPhone,
  address,
  items,
  totalAmount,
}: {
  customerName: string;
  customerPhone: string;
  address: string;
  items: WhatsAppOrderItem[];
  totalAmount: number;
}) {
  const products = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x ${item.quantity}`
    )
    .join("\n");

  return `Hello Deziremore,

I would like to place an order.

Name: ${customerName}
Phone: ${customerPhone}

Products:
${products}

Total Amount: ₹${totalAmount}

Delivery Address:
${address}

Please confirm my order.`;
}

export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string
) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;
}