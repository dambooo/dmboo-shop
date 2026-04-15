'use client';

import { useShop } from '@/lib/ShopContext';

export default function Toast() {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return <div className="toast show">{toastMessage}</div>;
}
