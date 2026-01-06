export const BOOKING_STATUS_LABELS = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const BOOKING_STATUS_CLASSES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "قيد الانتظار",
  completed: "مكتمل",
  failed: "فشل",
};

export const PAYMENT_STATUS_CLASSES = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function getBookingStatusLabel(status) {
  return BOOKING_STATUS_LABELS[status] || status;
}

export function getBookingStatusClass(status, extra = "") {
  const base = BOOKING_STATUS_CLASSES[status] || "bg-gray-100 text-gray-800";
  return extra ? `${base} ${extra}` : base;
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status;
}

export function getPaymentStatusClass(status, extra = "") {
  const base = PAYMENT_STATUS_CLASSES[status] || "bg-gray-100 text-gray-800";
  return extra ? `${base} ${extra}` : base;
}
