import axios from 'axios';

const file = Bun.file('api_response.json');
const data = await file.json();

const fireflyToken = Bun.env.FIREFLY_API_KEY;
// console.log('input', input);

const input = data.movements.list.filter((t) => t.amount.amount > 0).map((t) => ({
    date: t.executed_at,
    amount: t.amount.amount / 100,
    currency: t.amount.currency.toLowerCase(),
    source_name: t.is_debit ? 'Coverflex' : t.merchant_name,
    destination_name: t.is_debit ? t.merchant_name : 'Coverflex',
    external_id: t.id,
    description: t.description,
    type: t.is_debit ? 'withdrawal' : 'deposit',
})).sort((a, b) => a.date < b.date);

const transactions = input.slice(0, 50);
// console.log(transactions)

transactions.forEach((t) => {
    axios.post('http://192.168.1.6/api/v1/transactions', {
        apply_rules: true,
        error_if_duplicate_hash: true,
        transactions: [t],
    }, { headers: { 'Authorization': `Bearer ${fireflyToken}` }
    }).then(function (response) {
        console.log('success:', response.data.data.id);
    })
    .catch(function (error) {
    console.log(error.response.data.message);
    });
});

console.log('length', input.length);
