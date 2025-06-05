import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // This is your Appwrite endpoint
  .setProject("683de53b0032c338fa4b");                 // Your Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
