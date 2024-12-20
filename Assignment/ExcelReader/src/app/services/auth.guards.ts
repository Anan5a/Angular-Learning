import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { HttpHeaders, HttpInterceptorFn } from "@angular/common/http";

//contains guard functions to authenticate

//@ts-nocheck
export const isNotAuthenticatedGuard: CanActivateFn = (route, segments) => {
  const authService = inject(AuthService)
  return !authService.isAuthenticated();
};
//@ts-nocheck
export const isAuthenticatedGuard: CanActivateFn = (route, segments) => {
  const authService = inject(AuthService)


  if (!authService.isAuthenticated()) {
    const router = inject(Router)

    router.navigate(['/login']);

    return false;
  }
  return authService.isAuthenticated();
}

//@ts-nocheck
export const isAdminGuard: CanActivateFn = (route, segments) => {
  const authService = inject(AuthService)


  if (!authService.isAuthenticated()) {
    const router = inject(Router)

    router.navigate(['/login']);

    return false;
  }
  return authService.isAdmin();
}

export const injectAuthorizationHeaderInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService)

  if (authService.isAuthenticated()) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authService.token()}`
    });
    const reqWithHeader = req.clone({
      headers: headers
    });

    return next(reqWithHeader);

  }
  return next(req);
}
