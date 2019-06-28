export type Address = string;

export type ListenEvent = Readonly<{
  type: 'staged' | 'unstaged';
  address: Address;
}>;

export type StagedData = Readonly<{
  key?: string;
  type?: 'bt' | 'lan' | 'internet';
  [misc: string]: any;
}>;
