export interface DeliveryConfig { cutoff?: string; days?: number[]; blockedDates?: string[] }
export interface DeliveryResult { status: 'today'|'tomorrow'|'later'|'unavailable'; date: Date|null; seconds: number }
export function nextDelivery(now: Date, config: DeliveryConfig): DeliveryResult;
export function countdown(seconds: number): string;
export function deliveryLabel(result: DeliveryResult): string;
