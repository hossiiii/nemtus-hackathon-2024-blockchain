import { Account,NetworkType } from 'symbol-sdk';

export const createAccount = (): string => {
  const account = Account.generateNewAccount(NetworkType.TEST_NET);
  const privateKey = account.privateKey;
  return privateKey;
};