import {
  initConnection,
  fetchProducts,
  requestPurchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  type Purchase,
  type PurchaseAndroid,
  type PurchaseError,
  type ProductSubscriptionAndroid,
  type Product,
  ErrorCode,
} from 'react-native-iap';
import { Alert } from 'react-native';
import i18next from 'i18next';
import { QuotaService } from './quotaService';

/** Play subscription product that holds the monthly and yearly base plans. */
export const SUBSCRIPTION_PRODUCT_ID = 'kaset_pro';

/**
 * Plan keys used across the app (UI, QuotaService.activeSubSku).
 * MONTHLY / YEARLY are base plan IDs of SUBSCRIPTION_PRODUCT_ID; LIFETIME is a one-time product ID.
 */
export const SKUS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'pro_lifetime',
} as const;

type SubscriptionPlanKey = typeof SKUS.MONTHLY | typeof SKUS.YEARLY;

function isSubscriptionPlanKey(value: unknown): value is SubscriptionPlanKey {
  return value === SKUS.MONTHLY || value === SKUS.YEARLY;
}

/** Google Play BillingFlowParams.SubscriptionUpdateParams.ReplacementMode values. */
const ReplacementMode = {
  WITH_TIME_PRORATION: 1,
  CHARGE_FULL_PRICE: 5,
  DEFERRED: 6,
} as const;

/**
 * How a plan change is billed:
 * - monthly → yearly: switch now, charge the full yearly price, remaining monthly time is credited.
 * - yearly → monthly: keep yearly until it renews, then continue monthly.
 * - unknown current plan: switch now and credit the remaining time (safe in both directions).
 */
function replacementModeFor(current: SubscriptionPlanKey | undefined, next: SubscriptionPlanKey): number {
  if (current === SKUS.MONTHLY && next === SKUS.YEARLY) return ReplacementMode.CHARGE_FULL_PRICE;
  if (current === SKUS.YEARLY && next === SKUS.MONTHLY) return ReplacementMode.DEFERRED;
  return ReplacementMode.WITH_TIME_PRORATION;
}

let subscriptionProduct: ProductSubscriptionAndroid | null = null;
let lastRequestedPlan: SubscriptionPlanKey | null = null;

async function loadSubscriptionProduct(): Promise<ProductSubscriptionAndroid | null> {
  const subs = (await fetchProducts({ skus: [SUBSCRIPTION_PRODUCT_ID], type: 'subs' })) as ProductSubscriptionAndroid[];
  subscriptionProduct = subs.find(p => p.id === SUBSCRIPTION_PRODUCT_ID) ?? null;
  return subscriptionProduct;
}

/** The base plan's own offer (no promotional offerId) for a plan key. */
function findBasePlanOffer(product: ProductSubscriptionAndroid | null, plan: SubscriptionPlanKey) {
  // subscriptionOfferDetailsAndroid is deprecated in favor of `subscriptionOffers`, but that list is typed
  // as discount offers (introductory/promotional) and may not include the plain base plan offer we need.
  const offers = product?.subscriptionOfferDetailsAndroid ?? [];
  return offers.find(o => o.basePlanId === plan && !o.offerId)
    ?? offers.find(o => o.basePlanId === plan)
    ?? null;
}

/** Recurring price of a base plan (last pricing phase), e.g. "₺149,99". */
function basePlanPrice(product: ProductSubscriptionAndroid | null, plan: SubscriptionPlanKey): string | undefined {
  const phases = findBasePlanOffer(product, plan)?.pricingPhases?.pricingPhaseList ?? [];
  return phases.at(-1)?.formattedPrice;
}

/** Resolves which base plan a purchase belongs to, falling back to the last known plan. */
function resolvePlan(purchase: Purchase | undefined): SubscriptionPlanKey | undefined {
  if (isSubscriptionPlanKey(purchase?.currentPlanId)) return purchase.currentPlanId;
  const stored = QuotaService.getActiveSubSku();
  return isSubscriptionPlanKey(stored) ? stored : undefined;
}

let purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;
const purchaseSuccessListeners: Set<() => void> = new Set();
const subscriptionStatusListeners: Set<() => void> = new Set();
let lastErrorAlertAt = 0;
let isRestoring = false;

export const IapService = {
  async init(): Promise<void> {
    try {
      await initConnection();

      purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          try {
            await finishTransaction({ purchase, isConsumable: false });
            if (purchase.productId === SKUS.LIFETIME) {
              QuotaService.setHasLifetime(true);
              const activeSku = QuotaService.getActiveSubSku();
              const isRenewing = QuotaService.getActiveSubAutoRenewing();
              QuotaService.setNeedsCancelSubscription(!!(activeSku && isRenewing));
            } else if (purchase.productId === SUBSCRIPTION_PRODUCT_ID) {
              const plan = isSubscriptionPlanKey(purchase.currentPlanId)
                ? purchase.currentPlanId
                : lastRequestedPlan ?? resolvePlan(purchase);
              lastRequestedPlan = null;
              QuotaService.setActiveSubSku(plan);
              QuotaService.setActiveSubToken(purchase.purchaseToken ?? undefined);
              QuotaService.setActiveSubAutoRenewing(true);
            }
            QuotaService.setProStatus(true);
            purchaseSuccessListeners.forEach(cb => cb());
          } catch (ackErr) {
            console.warn('[IAP] finishTransaction error', ackErr);
          }
        },
      );

      purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          console.warn('[IAP] Purchase error — code:', error.code, '| message:', error.message, '| debugMessage:', (error as any).debugMessage ?? '');
          const errorCode = error.code as string;
          if (
            errorCode !== ErrorCode.UserCancelled &&
            errorCode !== 'E_USER_CANCELLED' &&
            errorCode !== 'user-cancelled'
          ) {
            const now = Date.now();
            if (now - lastErrorAlertAt < 2000) return;
            lastErrorAlertAt = now;
            Alert.alert(
              i18next.t('iap.declined'),
              i18next.t('iap.declinedMessage'),
            );
          }
        },
      );
    } catch (err) {
      console.warn('[IAP] Init error', err);
    }
  },

  /** Display prices keyed by plan key (SKUS.MONTHLY / YEARLY / LIFETIME). */
  async getPrices(): Promise<Record<string, string>> {
    const prices: Record<string, string> = {};
    try {
      const product = await loadSubscriptionProduct();
      for (const plan of [SKUS.MONTHLY, SKUS.YEARLY] as const) {
        const price = basePlanPrice(product, plan);
        if (price) prices[plan] = price;
      }
    } catch (err) {
      console.warn('[IAP] subscription prices error', err);
    }
    try {
      const inapp = (await fetchProducts({ skus: [SKUS.LIFETIME], type: 'in-app' })) as Product[];
      const lifetime = inapp.find(p => p.id === SKUS.LIFETIME);
      if (lifetime?.displayPrice) prices[SKUS.LIFETIME] = lifetime.displayPrice;
    } catch (err) {
      console.warn('[IAP] lifetime price error', err);
    }
    return prices;
  },

  /**
   * Buys a plan. Switching between monthly and yearly replaces the active subscription
   * (no cancellation needed); see replacementModeFor() for how the change is billed.
   */
  async subscribe(plan: string): Promise<'purchase_initiated'> {
    try {
      if (plan === SKUS.LIFETIME) {
        await requestPurchase({
          type: 'in-app',
          request: { google: { skus: [SKUS.LIFETIME] } },
        });
        return 'purchase_initiated';
      }
      if (!isSubscriptionPlanKey(plan)) throw new Error(`Unknown plan: ${plan}`);

      const product = subscriptionProduct ?? (await loadSubscriptionProduct());
      const offer = findBasePlanOffer(product, plan);
      if (!offer) throw new Error(`No offer for base plan: ${plan}`);

      const activeToken = QuotaService.getActiveSubToken();
      const currentPlan = resolvePlan(undefined);
      const isPlanChange = !!activeToken && currentPlan !== plan;

      lastRequestedPlan = plan;
      await requestPurchase({
        type: 'subs',
        request: {
          google: {
            skus: [SUBSCRIPTION_PRODUCT_ID],
            subscriptionOffers: [{ sku: SUBSCRIPTION_PRODUCT_ID, offerToken: offer.offerToken }],
            ...(isPlanChange
              ? { purchaseToken: activeToken, replacementMode: replacementModeFor(currentPlan, plan) }
              : {}),
          },
        },
      });
      return 'purchase_initiated';
    } catch (err) {
      lastRequestedPlan = null;
      console.warn('[IAP] subscribe error', err);
      throw err;
    }
  },

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const { getAvailablePurchases } = await import('react-native-iap');
      const purchases = await getAvailablePurchases();
      const lifetimePurchase = purchases.find(p => p.productId === SKUS.LIFETIME);
      const subPurchases = purchases.filter(p => p.productId === SUBSCRIPTION_PRODUCT_ID);
      const activeSub =
        subPurchases.find(p => (p as PurchaseAndroid).autoRenewingAndroid !== false) ??
        subPurchases[0];

      const subStillRenewing = activeSub && (activeSub as PurchaseAndroid).autoRenewingAndroid !== false;

      const normalizedSku = activeSub ? resolvePlan(activeSub) : undefined;

      const isActive = !!lifetimePurchase || !!activeSub;
      QuotaService.setProStatus(isActive);
      QuotaService.setHasLifetime(!!lifetimePurchase);
      QuotaService.setActiveSubSku(normalizedSku);
      QuotaService.setActiveSubToken(activeSub?.purchaseToken ?? undefined);
      QuotaService.setActiveSubAutoRenewing(!!subStillRenewing);
      QuotaService.setNeedsCancelSubscription(!!lifetimePurchase && !!subStillRenewing);
      subscriptionStatusListeners.forEach(cb => cb());
      return isActive;
    } catch (err) {
      console.warn('[IAP] checkSubscriptionStatus error', err);
      return false;
    }
  },

  async restorePurchases(): Promise<boolean> {
    if (isRestoring) return false;
    isRestoring = true;
    try {
      const isActive = await this.checkSubscriptionStatus();
      if (isActive) {
        Alert.alert(
          i18next.t('iap.restored'),
          i18next.t('iap.restoredMessage'),
        );
      } else {
        Alert.alert(
          i18next.t('iap.notFound'),
          i18next.t('iap.notFoundMessage'),
        );
      }
      return isActive;
    } catch (err) {
      console.warn('[IAP] restorePurchases error', err);
      Alert.alert(
        i18next.t('iap.error'),
        i18next.t('iap.errorMessage'),
      );
      return false;
    } finally {
      isRestoring = false;
    }
  },

  addPurchaseSuccessListener(cb: () => void): () => void {
    purchaseSuccessListeners.add(cb);
    return () => purchaseSuccessListeners.delete(cb);
  },

  addSubscriptionStatusListener(cb: () => void): () => void {
    subscriptionStatusListeners.add(cb);
    return () => subscriptionStatusListeners.delete(cb);
  },

  end(): void {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  },
};
