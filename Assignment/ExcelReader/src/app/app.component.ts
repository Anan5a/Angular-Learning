import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  NavigationCancel,
  NavigationSkipped,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import {
  BreakpointObserver,
  Breakpoints,
} from '@angular/cdk/layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { map, Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthService } from './services/auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { ChatComponent } from './dashboard/chat/chat.component';
import { RealtimeService } from './services/realtime.service';
import { UserListComponent } from './dashboard/chat/user-list/user-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatTooltipModule,
    RouterOutlet,
    RouterLink,
    NgIf,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ChatComponent,
    UserListComponent,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FileKeeper';

  @ViewChild('sidenav') sidenav!: MatSidenav;
  isHandset$ = false;

  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;
  navigationSubscription!: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private toastrService: ToastrService,
    private realtimeService: RealtimeService
  ) {
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => (this.isHandset$ = result.matches)));
  }

  ngOnInit(): void {
    this._navigationAutoClose();
    this._socialServiceAuth();
    //application wide realtime comm.
    this._realtimeComms();
  }

  logout() {
    this.authService.logout();
  }

  onSocialAuth(idToen: string) {
    this.authService.socialAuth(idToen).subscribe({
      next: (response) => {
        //login ok
        this.toastrService.success(response.message);
        this.router.navigate(['/']);
      },
    });
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
  }

  ///////private function to declutter oninit/////
  private _navigationAutoClose() {
    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationStart ||
        event instanceof NavigationCancel ||
        event instanceof NavigationSkipped
      ) {
        if (this.sidenav.opened) {
          //close
          this.sidenav.close();
        }
      }
    });
  }

  private _socialServiceAuth() {
    this.socialAuthService.authState.subscribe((user) => {
      //social login
      this.onSocialAuth(user.idToken);
    });
  }

  private _realtimeComms() {
    this.realtimeService.startConnection();
    this.realtimeService.addReceiveMessageListener<string[]>(
      'ReceiveMessage',
      (message) => {
        this.toastrService.show('Realtime message: ' + message);
      }
    );
  }
}
