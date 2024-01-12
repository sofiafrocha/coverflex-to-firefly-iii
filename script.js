import axios from 'axios';
import * as dotenv from 'dotenv';

const data = import('api_response.json');
dotenv.config();

const fireflyToken = process.env.FIREFLY_API_KEY;
const input = data.movements.list.slice(0, 100);
// console.log('input', input);

const transactions = input.filter((t) => t.amount.amount > 0).map((t) => ({
    date: t.executed_at,
    amount: t.amount.amount / 100,
    currency: t.amount.currency.toLowerCase(),
    source_name: t.is_debit ? 'Coverflex' : t.merchant_name,
    destination_name: t.is_debit ? t.merchant_name : 'Coverflex',
    external_id: t.id,
    description: t.description,
    type: t.is_debit ? 'withdrawal' : 'deposit',
}));

const requests = transactions.map((t) =>
    axios.post('http://192.168.1.6/api/v1/transactions', {
        apply_rules: true,
        error_if_duplicate_hash: true,
        transactions: [t],
    }, {
        headers: { Authorization: `Bearer ${fireflyToken}` },
    })
    .then(r => console.log('success: ', r.data.data.id))
    .catch(e => console.log('error: ', e.response.data.message))
);

console.log('length', input.length)

/*
axios.post('http://192.168.1.6/api/v1/transactions', payload, {
  headers: { Authorization: `Bearer ${fireflyToken}` },
}).then((response) => {
  console.log('hã', response)
  console.log('📦 Firefly says:', response.data);
	console.log('status', response.status)
}).catch((err) => {
  console.log('🚨 Error!', err);
  console.log(err.response.data.errors)
});
*/
