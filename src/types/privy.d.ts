declare module "@privy-io/server-auth" {
  export interface PrivyUser {
    id: string;
    twitter?: {
      username: string;
    };
    wallets: Array<{
      id: string;
      address: string;
    }>;
  }

  interface PrivyClientConfig {
    appId: string;
    appSecret: string;
  }

  interface PrivyClient {
    getUser(userId: string): Promise<PrivyUser>;
    searchUsers(query: any): Promise<PrivyUser[]>;
    signTransaction(params: {
      userId: string;
      walletId: string;
      transaction: any;
    }): Promise<{ transactionHash: string }>;
  }

  namespace PrivyAuth {
    export function createClient(config: PrivyClientConfig): PrivyClient;
  }

  export = PrivyAuth;
}
