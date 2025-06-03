import { Client, Databases, Account, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Change if self-hosted
  .setProject("683de53b0032c338fa4b"); // <-- Replace with your Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
