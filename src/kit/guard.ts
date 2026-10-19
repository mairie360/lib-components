import { NextRequest, NextResponse } from 'next/server.js';
import { buildContentSecurityPolicy, createNonce, isExpiredJwt, NONCE_REQUEST_HEADER, publicOrigin, publicFrontHref } from './shared';

export type AuthGuardConfig = {
  paths: Record<string, Record<string, unknown>>;
  frontUrl: () => string;
  loginUrl: () => string;
  profileUrl?: () => string | undefined;
};
export function isContractDataPath(pathname: string, paths: AuthGuardConfig['paths']): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return Object.keys(paths).some(template => {
    const parts = template.split('/').filter(Boolean);
    return parts.length === segments.length && parts.every((part,index) => /^\{[^}]+\}$/.test(part) || part === segments[index]);
  });
}
export function withContentSecurityPolicy(request: NextRequest): NextResponse {
  const nonce = createNonce();
  const policy = buildContentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  const headers = new Headers(request.headers);
  headers.set(NONCE_REQUEST_HEADER, nonce); headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({request:{headers}});
  response.headers.set('Content-Security-Policy', policy);
  return response;
}
export function createAuthGuard(config: AuthGuardConfig) {
  return (request: NextRequest): NextResponse => {
    const pathname = request.nextUrl.pathname;
    if (['/openapi.json','/swagger.json'].includes(pathname)) return NextResponse.json({error:{message:'Route inconnue.'}},{status:404,headers:{'Cache-Control':'no-store'}});
    if (isExpiredJwt(request.cookies.get('accessToken')?.value)) {
      if (isContractDataPath(pathname, config.paths) || !['GET','HEAD'].includes(request.method)) {
        return NextResponse.json({error:{message:'Votre session a expiré. Veuillez vous reconnecter.'}},{status:401,headers:{'Cache-Control':'no-store','X-Mairie360-Login-Required':'true'}});
      }
      const own = publicOrigin(config.frontUrl());
      if (!own) return new NextResponse('Connexion temporairement indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});
      const resume = new URL('/api/auth/resume',own);
      resume.searchParams.set('next',pathname+request.nextUrl.search);
      const response = NextResponse.redirect(resume);response.headers.set('Cache-Control','no-store');return response;
    }
    if ((pathname === '/profile' || pathname.startsWith('/profile/')) && config.profileUrl) {
      let profile: string | undefined;
      try { profile = config.profileUrl(); } catch { /* Invalid public configuration fails closed. */ }
      const destination = publicFrontHref(profile);
      const response = destination ? NextResponse.redirect(destination) : new NextResponse('Paramètres indisponibles.',{status:503});
      response.headers.set('Cache-Control','no-store');
      return response;
    }
    return withContentSecurityPolicy(request);
  };
}
