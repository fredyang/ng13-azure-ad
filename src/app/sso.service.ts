import { Inject, Injectable } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventType,
  InteractionType,
  PopupRequest
} from '@azure/msal-browser';
import { filter, first, map, shareReplay, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SsoService {
  constructor(
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration,
    private msal: MsalService,
    private msalBroadcast: MsalBroadcastService
  ) { }


  activeAccount$ = this.msalBroadcast.msalSubject$.pipe(
    filter(
      event =>
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.SSO_SILENT_SUCCESS
    ),
    map(successEvent => {
      const account = (successEvent.payload as AuthenticationResult).account;
      this.msal.instance.setActiveAccount(account);
      return account;
    }),
    startWith(this.msal.instance.getActiveAccount()),
    shareReplay(100)
  );

  autoLoginDone = new Promise<boolean>((resolve, reject) => {
    this.activeAccount$.pipe(first()).subscribe(account => {
      if (account) {
        console.log('already logged in', account);
        resolve(true);
      } else {
        console.log('not logged in, try silent login');
        this.msal.ssoSilent(this.msalGuardConfig.authRequest as PopupRequest).subscribe({
          next: (x) => {
            console.log('silent login good', x);
            resolve(true);
          },
          error: reason => {
            console.log('silent login bad', reason);
            resolve(true);
          }
        });
      }
    });
  });

  isLoggedIn$ = this.activeAccount$.pipe(map(acc => !!acc));

  logout() {
    if (this.msalGuardConfig.interactionType == InteractionType.Popup) {
      this.msal.logout();
      this.msal.logoutPopup();
    } else {
      this.msal.logoutRedirect();
    }
  }

  login() {
    const loginRequest = this.msalGuardConfig.authRequest as any;
    if (this.msalGuardConfig.interactionType == InteractionType.Popup) {
      this.msal.loginPopup(loginRequest);
    } else {
      this.msal.loginRedirect(loginRequest);
    }
  }
}