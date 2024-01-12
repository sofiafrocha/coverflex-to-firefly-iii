type CoverflexTransaction = {
    id: string;
    amount: {
        currency: string;
        amount: number;
    };
    description: string;
    executed_at: string;
    is_debit: boolean;
    merchant_name: string;
}

type FireflyTransaction = {
    date: string;
    amount: number;
    currency: string;
    source_name: string;
    destination_name: string;
    external_id: string;
    description: string;
    type: 'withdrawal' | 'deposit';
}