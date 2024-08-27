import axios from "axios";
import { CoverflexTransaction, FireflyTransaction } from "./types";

const file = Bun.file("api_response.json");
const data = await file.json();

const fireflyToken = Bun.env.FIREFLY_API_KEY;
const fireflyUrl = Bun.env.FIREFLY_URL;

function getArgs(argv: Array<string>) {
  const result: { [key: string]: string | boolean } = {};
  argv.splice(0, 2);
  argv.forEach((arg, index) => {
    if (arg.substring(0, 2) === "--") {
      const key = arg.substring(2, arg.length);
      const value =
        argv[index + 1].substring(0, 2) === "--" ? true : argv[index + 1];
      result[key] = value === "false" ? false : value;
    }
  });

  return result;
}

const input = data.movements.list
  .filter((t: CoverflexTransaction) => t.amount.amount > 0)
  .map((t: CoverflexTransaction) => ({
    date: t.executed_at,
    amount: t.amount.amount / 100,
    currency: t.amount.currency.toLowerCase(),
    source_name: t.is_debit ? "Coverflex" : t.merchant_name,
    destination_name: t.is_debit ? t.merchant_name : "Coverflex",
    external_id: t.id,
    description: t.description,
    type: t.is_debit ? "withdrawal" : "deposit",
  }))
  .sort((a: FireflyTransaction, b: FireflyTransaction) => a.date < b.date);

const { sendAll } = getArgs(Bun.argv);

let transactions = input;

if (!sendAll) {
  transactions = input.slice(0, 50);
}

console.log("Transactions in the .json file: ", input.length);
console.log(
  "Transactions that will be sent to Firefly III: ",
  transactions.length,
);
console.log("Sending transactions...");

const requests = transactions.map((t: FireflyTransaction) => {
  return axios
    .post(
      `${fireflyUrl}/api/v1/transactions`,
      {
        apply_rules: true,
        error_if_duplicate_hash: true,
        transactions: [t],
      },
      { headers: { Authorization: `Bearer ${fireflyToken}` } },
    )
    .then(function (response) {
      console.log("Created transaction #", response.data.data.id);
    })
    .catch(function (error) {
      if (error.response.data) {
        console.log(error.response.data.message);
      } else {
        console.log("error", error);
      }
    });
});

Promise.all(requests).then(() => {
  console.log("All done! 🎉");
});
