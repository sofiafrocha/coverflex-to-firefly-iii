# Coverflex to Firefly III

A simple script to send transactions from [Coverflex](https://www.coverflex.com/), as returned by their API, to [Firefly III](https://www.firefly-iii.org/).

## Setup

Install dependencies, using [Bun](https://bun.sh/):
```bash
bun install
```

Rename the `.env.example` file to `.env`:
```bash
mv .env.example .env
```

And replace the XXXs on the `.env` file with your [Firefly III Access Token](https://docs.firefly-iii.org/how-to/firefly-iii/features/api/#personal-access-tokens) and the URL of your Firefly III instance.

## Usage

### Get the transactions
1. Login as usual on Coverflex and go to the Meal page
1. Open the Developer Tools and check the network tab
1. Find a GET request to a /movements endpoint
1. Copy the whole JSON response and put it on the `api_response.json` file

### Use the script to send them to Firefly III

By default, the most recent 50 transactions are sent:

```bash
bun script.ts
```

To send all transactions, you can use:

```bash
bun script.ts --sendAll true
```
