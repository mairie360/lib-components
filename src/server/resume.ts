import { NextRequest, NextResponse } from 'next/server.js';
import { publicOrigin, serviceBase } from './config';
import { rejectSessionMutation } from './refresh';
import { readSessionCookies, setSessionCookies, validSessionToken } from './session';
import type { SessionPeerConfig } from './session-peer';

function unavailable(status:number) {
  return NextResponse.json({message:status===401?'Votre session a expiré.':'La session est temporairement indisponible.'},{status,headers:{'Cache-Control':'no-store'}});
}
async function renewAtOwner(request:NextRequest,config:SessionPeerConfig):Promise<NextResponse> {
  const own = publicOrigin(config.frontUrl()), login = serviceBase(config.loginUrl());
  if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_DOMAIN?.trim()) return unavailable(503);
  const token = request.cookies.get('refreshToken')?.value;
  if (!own || !login || (process.env.NODE_ENV === 'production' && !login.startsWith('https:'))) return unavailable(503);
  if (!validSessionToken(token)) return unavailable(401);
  try {
    const response = await fetch(new URL('/api/auth/refresh', login),{
      method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Origin:own,'Sec-Fetch-Site':'same-site',Cookie:`refreshToken=${encodeURIComponent(token)}`},
      body:'{}',cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(12000),
    });
    if (!response.ok) { await response.body?.cancel(); return unavailable(response.status===401?401:503); }
    const session=readSessionCookies(response); const body:unknown=await response.json();
    if (!session || !body || typeof body!=='object' || !('message' in body) || typeof body.message!=='string' || !body.message.trim()) return unavailable(502);
    const receipt=NextResponse.json({message:'Session renouvelée.'},{headers:{'Cache-Control':'no-store'}});
    setSessionCookies(receipt,session,{secure:process.env.NODE_ENV==='production',domain:process.env.COOKIE_DOMAIN?.trim()||undefined});
    return receipt;
  } catch {return unavailable(503);}
}
export function createSessionRefreshProxy(config:SessionPeerConfig) {
  return async(request:NextRequest) => {
    const rejected=rejectSessionMutation(request,[config.frontUrl()]);
    return rejected ?? renewAtOwner(request,config);
  };
}
/** Only local document paths can be resumed; no tokens enter a redirect URL. */
export function createSessionResumeHandler(config:SessionPeerConfig) {
  return async(request:NextRequest):Promise<NextResponse> => {
    const next=request.nextUrl.searchParams.get('next') ?? '/';
    if (!next.startsWith('/') || next.startsWith('//') || /[\\\x00-\x20\x7f]/.test(next) || /^\/(?:api|_next)(?:\/|\?|$)/.test(next)) return unavailable(400);
    const own=publicOrigin(config.frontUrl()); if (!own) return unavailable(503);
    const destination=new URL(next,own);
    if(destination.origin!==own || /^\/(?:api|_next)(?:\/|$)/.test(destination.pathname)) return unavailable(400);
    const renewed=await renewAtOwner(request,config);
    if (renewed.ok) {
      const result=NextResponse.redirect(destination,303);
      for(const cookie of renewed.headers.getSetCookie()) result.headers.append('Set-Cookie',cookie);
      result.headers.set('Cache-Control','no-store');return result;
    }
    if (renewed.status!==401) return renewed;
    const login=publicOrigin(config.loginUrl());if(!login) return unavailable(503);
    const target=new URL('/',login);target.searchParams.set('redirect',destination.href);
    const response=NextResponse.redirect(target,303);response.headers.set('Cache-Control','no-store');return response;
  };
}
