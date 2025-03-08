import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { userSubscription } from "./db/schema";
import { eq } from "drizzle-orm";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async () => {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }
  const subscriptions = await db
    .select()
    .from(userSubscription)
    .where(eq(userSubscription.userId, userId));

  if (!subscriptions[0]) {
    return false;
  }

  const subscription = subscriptions[0];

  const isValid =
    subscription.stripePriceId &&
    subscription.stripeCurrentPeriodEnd &&
    subscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS > Date.now();
  return !!isValid;
};
