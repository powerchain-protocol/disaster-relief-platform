export type AuthorityContext={
  authenticated:boolean;
  identityId:string|null;
  roles:string[];
  policyActions:string[];
  approvals:number;
  minimumApprovals:number;
  signerReady:boolean;
  walletConnected:boolean;
  pwrcBalanceAtomic:string|null;
};

export function evaluateAuthority(context:AuthorityContext,action:string){
  const checks=[
    {code:"AUTHENTICATED",ok:context.authenticated},
    {code:"IDENTITY_BOUND",ok:Boolean(context.identityId)},
    {code:"ROLE_PRESENT",ok:context.roles.length>0},
    {code:"POLICY_ALLOWS_ACTION",ok:context.policyActions.includes(action)},
    {code:"APPROVAL_THRESHOLD",ok:context.approvals>=context.minimumApprovals},
    {code:"SIGNER_READY",ok:context.signerReady},
  ];
  return {
    authorized:checks.every(c=>c.ok),
    checks,
    nonAuthoritySignals:{
      walletConnected:context.walletConnected,
      pwrcBalanceAtomic:context.pwrcBalanceAtomic,
      note:"Wallet connection and PWRC balance do not grant treasury authority.",
    },
  };
}
