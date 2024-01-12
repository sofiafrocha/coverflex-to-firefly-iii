import axios from 'axios';

const file = Bun.file('api_response.json');
const data = await file.json();

const fireflyToken = Bun.env.FIREFLY_API_KEY;
const input = data.movements.list.slice(0, 1);
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

transactions.forEach((t) => {
    axios.post('http://192.168.1.6/api/v1/transactions', {
        apply_rules: true,
        error_if_duplicate_hash: true,
        transactions: [t],
    }, { headers: { 'Authorization': `Bearer ${fireflyToken}` }
    }).then(function (response) {
        console.log(response.data.data);
    })
    .catch(function (error) {
    console.log(error.response.data);
    });
});

console.log('length', input.length);
