export function formatCurrency(amount: number, currency: string = 'INR', options?: { decimals?: boolean }): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: options?.decimals === false ? 0 : 2,
    maximumFractionDigits: options?.decimals === false ? 0 : 2
  }).format(amount);
}
