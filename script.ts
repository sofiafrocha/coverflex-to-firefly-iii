import axios from "axios";
import { CoverflexTransaction, FireflyTransaction } from "./types";

const file = Bun.file("api_response.json");
const data = await file.json();

const fireflyToken = Bun.env.FIREFLY_API_KEY;

function getArgs(argv) {
  const result = {};
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

transactions.forEach((t: FireflyTransaction) => {
  axios
    .post(
      "http://192.168.1.6:90/api/v1/transactions",
      {
        apply_rules: true,
        error_if_duplicate_hash: true,
        transactions: [t],
      },
      { headers: { Authorization: `Bearer ${fireflyToken}` } },
    )
    .then(function (response) {
      console.log("success:", response.data.data.id);
    })
    .catch(function (error) {
      if (error.response.data) {
        console.log(error.response.data.message);
      } else {
        console.log("error", error);
      }
    });
});

console.log("length", input.length);
