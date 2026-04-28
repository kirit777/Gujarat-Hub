const { v4: uuidv4 } = require('uuid');

async function processPayment({ amount }) {
  return {
    paymentId: `pay_${uuidv4()}`,
    amount,
    status: 'success'
  };
}

module.exports = { processPayment };
