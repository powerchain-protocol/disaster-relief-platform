import type { FastifyRequest } from "fastify";

export function requestContext(request:FastifyRequest){
  return {
    requestId:String(request.id),
    method:request.method,
    route:request.routeOptions?.url ?? request.url,
    ip:request.ip,
    receivedAt:new Date().toISOString(),
  };
}
