import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { supabase } from '../../../supabase/client';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});


Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    const stripeData = event.data.object;
    const customerId = 'customer' in stripeData ? stripeData.customer : null;

    if (!customerId || typeof customerId !== 'string') {
      console.error(`No customer received on event: ${JSON.stringify(event)}`);
      return Response.json({ received: true });
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = stripeData as Stripe.Subscription;
      
      await supabase
        .from('stripe_subscriptions')
        .upsert({
          subscription_id: subscription.id,
          customer_id: customerId,
          price_id: subscription.items.data[0]?.price.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
            ? {
                payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
                payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
              }
            : {})
        }, {
          onConflict: 'subscription_id'
        });

      // Update user's pro status
      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();

      if (customer) {
        await supabase
          .from('users')
          .update({
            is_pro: subscription.status === 'active' || subscription.status === 'trialing',
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.user_id);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = stripeData as Stripe.Subscription;
      
      // Mark subscription as deleted
      await supabase
        .from('stripe_subscriptions')
        .update({
          status: 'canceled',
          deleted_at: new Date().toISOString()
        })
        .eq('subscription_id', subscription.id);

      // Update user's pro status
      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();

      if (customer) {
        await supabase
          .from('users')
          .update({
            is_pro: false,
            subscription_ends_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.user_id);
      }
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});