import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("DNS SERVERS:", dns.getServers());

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URL);

const db = client.db('better-auth-db');

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },

    database: mongodbAdapter(db, {
        client,
    }),
});