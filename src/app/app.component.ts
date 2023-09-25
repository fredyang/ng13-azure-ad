import { Component } from '@angular/core';
import { SsoService } from './sso.service';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'y';


  constructor(private sso: SsoService, private msal: MsalService) {

  }

  account$ = this.sso.activeAccount$;


  login() {
    this.sso.login();
  }

  logout() {
    this.sso.logout();
  }

  getAccessToken() {

  }
}
