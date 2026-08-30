import { DomainInvariantError } from "./capital.js";

export type LedgerSide="DEBIT"|"CREDIT";
export type LedgerLine={account:string;side:LedgerSide;amountAtomic:bigint};
export type JournalEntry={id:string;reference:string;currency:"USDC"|"SOL";lines:LedgerLine[];createdAt:string};

export function validateJournal(entry:JournalEntry) {
  if (entry.lines.length < 2) throw new DomainInvariantError("UNBALANCED_JOURNAL","Journal requires at least two lines");
  let debit=0n,credit=0n;
  for(const line of entry.lines){
    if(line.amountAtomic<=0n) throw new DomainInvariantError("INVALID_LEDGER_AMOUNT","Ledger amounts must be positive");
    if(!line.account.trim()) throw new DomainInvariantError("LEDGER_ACCOUNT_REQUIRED","Ledger account is required");
    if(line.side==="DEBIT") debit+=line.amountAtomic; else credit+=line.amountAtomic;
  }
  if(debit!==credit) throw new DomainInvariantError("UNBALANCED_JOURNAL",`Debits ${debit} do not equal credits ${credit}`);
  return entry;
}

export function settlementJournal(input:{id:string;reference:string;currency:"USDC"|"SOL";amountAtomic:bigint;treasuryAccount:string;destinationAccount:string;createdAt?:string}):JournalEntry{
  return validateJournal({id:input.id,reference:input.reference,currency:input.currency,createdAt:input.createdAt??new Date().toISOString(),lines:[
    {account:input.destinationAccount,side:"DEBIT",amountAtomic:input.amountAtomic},
    {account:input.treasuryAccount,side:"CREDIT",amountAtomic:input.amountAtomic},
  ]});
}

export function serializeJournal(entry:JournalEntry){
  return {...entry,lines:entry.lines.map(line=>({...line,amountAtomic:line.amountAtomic.toString()}))};
}
