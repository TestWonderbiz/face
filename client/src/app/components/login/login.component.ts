import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../../model/employee-login.model';
import { LoginService } from '../../shared/services/login/login.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/authentication/auth.service';
import { AppRoutingModule } from '../../app-routing.module';
import { RoutingService } from '../../services/routing/routing.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // loginData = {
  //   email: 'karthik@wonder.com',
  //   password: '80io*)IO'
  // };

  loginData = {
    email: '',
    password: ''
  };

  loginError = '';
  isInvalid = false;
  isLogSubmitted = false;
  isLoginSuccessful = false;

  pType: string = "password";
  eye: boolean = true

  viewPass() {
    this.pType = this.pType == "password" ? "text" : 'password'
    this.eye = !this.eye
  }

  validateEmail(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.loginData.email);
  }

  validatePassword(): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
    return regex.test(this.loginData.password)
  }

  @Output() loginStatusChange = new EventEmitter<boolean>();
  @Output() signUpStatusChange = new EventEmitter<boolean>();

  private loginApiUrl = 'http://192.168.29.242:5000/api/user/log-in';

  constructor(
    private http: HttpClient,
    private router: Router,
    private loginService: LoginService,
    private authService: AuthService,
    private appRoutingModule: AppRoutingModule,
    private routingService: RoutingService

  ) { }

  onLogin(loginForm: NgForm): void {
    const loginData: LoginModel = {
      email: this.loginData.email,
      password: this.loginData.password,
      roleId: 0,
      pageList: []
    }
    console.log(loginData)
    if (this.validateEmail() && this.validatePassword()) {
      this.loginService.Login(loginData).pipe().subscribe({
        next: (response) => {
          console.log(JSON.stringify(response));
          localStorage.setItem('loginData', JSON.stringify(response));
          localStorage.setItem("user", JSON.stringify({
            roleId: response.roleId,
            email: response.email
          }))
          this.routingService.setRoutes(response.pageList)
        },
        error: (error) => {
          this.isInvalid = true
          this.loginError = 'Invalid Credentials'
          this.loginError = error.error
          this.loginStatusChange.emit(false);
          this.isLogSubmitted = true;
          setTimeout(() => { this.isLogSubmitted = false }, 900);
        },
        complete: () => {
          console.log(JSON.stringify("Login Success"));
          this.loginError = '';
          this.isInvalid = false;
          this.loginStatusChange.emit(true);
          this.isLoginSuccessful = true;
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            // if (this.loginData.email === "admin@gmail.com" && this.loginData.password === "Admin@123") {
            //   this.router.navigate(['admin']);
            // } else {
            //   this.router.navigate(['user']);
            // }
            // this.appRoutingModule.loadUserRoutes();
            let user = localStorage.getItem("user")
            if (user) {
              user = JSON.parse(user).roleId
              if (parseInt(user!) == 2) {
                this.router.navigate(['ats/dashboard'])
              } else {
                this.router.navigate(['ats/log-records']);
              }
            }
            // if(localStorage.setItem)
          });
          setTimeout(() => { this.isLoginSuccessful = false }, 1000);
        }
      });
    } else {
      console.log('Login failed');
      this.loginError = 'Invalid Credentials!';
      this.isInvalid = true;
      this.loginStatusChange.emit(false);
      this.isLogSubmitted = true;
      setTimeout(() => { this.isLogSubmitted = false }, 900);
    }
  }


  onSignUp() {
    this.signUpStatusChange.emit(true);
  }
}
