const plans = {
  silver: { name: "Silver Plan", price: "500" },
  gold: { name: "Gold Plan", price: "1200" },
};

const payfast_redirect_url = (selectedPlan, orderId) => {
  return `https://sandbox.payfast.co.za/eng/process?merchant_id=${process.env.MERCHANT_ID}&merchant_key=${process.env.MERCHANT_KEY}&amount=${selectedPlan.price}&item_name=${selectedPlan.name}&return_url=http://localhost:5173/thank-you&cancel_url=http://localhost:5173/cancel&notify_url=https://devmate.click/payment/webhook&custom_str1=${orderId}`;
};

module.exports = { plans, payfast_redirect_url };
