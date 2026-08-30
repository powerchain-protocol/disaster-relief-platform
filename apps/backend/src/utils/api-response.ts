export type ApiMeta = {
  requestId: string;
  version: "1.0.0";
  timestamp: string;
};

export type ApiEnvelope<T> = {
  data: T;
  meta: ApiMeta;
};

export function envelope<T>(requestId:string,data:T):ApiEnvelope<T>{
  return {
    data,
    meta:{requestId,version:"1.0.0",timestamp:new Date().toISOString()},
  };
}

export function apiError(input:{requestId:string;code:string;message:string;details?:unknown}){
  return {
    error:{
      code:input.code,
      message:input.message,
      ...(input.details===undefined?{}:{details:input.details}),
    },
    meta:{requestId:input.requestId,version:"1.0.0" as const,timestamp:new Date().toISOString()},
  };
}
