"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { getUserSubscription } from "@/db/queries";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async (): Promise<{ data: string }> => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized.");

  throw new Error("Stripe payments are disabled. Everything is free!");
};
