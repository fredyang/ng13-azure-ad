import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalRedirectComponent,
  MsalService
} from '@azure/msal-angular';
import {
  LogLevel,
  Configuration,
  BrowserCacheLocation,
  InteractionType,
  PublicClientApplication
} from '@azure/msal-browser';
import { CLIENT_ID, TENANT_ID, REDIRECT_URL } from 'src/environments/environment';

const loginScopes: string[] = [
  // `api://${CLIENT_ID}/Files.Read`,
  // `api://${CLIENT_ID}/CIAMAdmin-SysAdmin-Scope`,
  // `api://${CLIENT_ID}/CIAMAdmin-CIAMSuperUser-Scope`,
  // `api://${CLIENT_ID}/CIAMAdmin-CIAMUser-Scope`,
  // 'User.Read',
  // 'openid',
  // 'profile',
  // 'offline_access'
];

const resourceUrlScopes = {
  'https://graph.microsoft.com/v1.0/me': ['User.Read', 'openid', 'profile', 'offline_access']
};


// const cacheLocation = BrowserCacheLocation.LocalStorage;
const cacheLocation = BrowserCacheLocation.MemoryStorage;

const loginType = InteractionType.Popup;
// const loginType  = InteractionType.Redirect;

// 'https://graph.microsoft.com/v1.0/me': ['User.Read', 'openid', 'profile', 'offline_access']
// config 1 
const msalClientConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URL,
    postLogoutRedirectUri: REDIRECT_URL,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: cacheLocation,
    storeAuthStateInCookie: true
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel: LogLevel, message: string) {
        console.log(message);
      },
      logLevel: LogLevel.Error,
      piiLoggingEnabled: false
    }
  }
};

const msalRouteGuardConfig: MsalGuardConfiguration = {
  interactionType: loginType,
  authRequest: {
    scopes: loginScopes,
    domainHint: TENANT_ID
  }
};


const msalHttpClientInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Popup,
  protectedResourceMap: new Map(Object.entries(resourceUrlScopes))
};

const customizedMsalModule = MsalModule.forRoot(
  new PublicClientApplication(msalClientConfig),
  msalRouteGuardConfig,
  msalHttpClientInterceptorConfig
);

@NgModule({
  imports: [customizedMsalModule],
  providers: [
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ],
  bootstrap: [MsalRedirectComponent]
})
export class MsalConfigModule { }
