const { query } = require('../../config/db');
const paymentModel = require('../../models/paymentModel');
const { processPayment } = require('../../services/paymentService');

exports.listPlans = async (_, res) => {
  const rows = await query('SELECT * FROM subscription_plans ORDER BY price ASC');
  res.json(rows);
};

exports.buyPlan = async (req, res) => {
  const { plan_id } = req.body;
  const [plan] = await query('SELECT * FROM subscription_plans WHERE id=?', [plan_id]);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });

  const payment = await processPayment({ amount: plan.price });
  await paymentModel.create(req.user.id, plan.price, payment.paymentId, payment.status);
  res.status(201).json({ message: 'Subscription purchased', payment });
};

exports.history = async (req, res) => {
  const rows = await paymentModel.historyByUser(req.user.id);
  res.json(rows);
};
