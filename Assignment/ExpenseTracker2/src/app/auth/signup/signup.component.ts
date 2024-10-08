import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';




//custom validator to match passwords
function passwordMatchValidator(): ValidatorFn {
  return function passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('c_password')?.value;

    if (password && confirmPassword && password === confirmPassword) {
      return null;
    }
    control.get('c_password')?.setErrors({ passwordsDoNotMatch: true })
    return { passwordsDoNotMatch: true };
  };
}


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.minLength(2)] }),
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    c_password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
  },
    {
      validators: passwordMatchValidator()
    })
  emailExists = false

  constructor(private authService: AuthService, private router: Router) { }

  formOnSubmit() {
    if (!this.form.valid) {
      return
    }
    //create user

    const signupState = this.authService.signup(
      this.form.controls['name'].value!,
      this.form.controls['email'].value!,
      this.form.controls['password'].value!
    )

    if (signupState == null) {
      //already exists
      this.emailExists = true
      return
    }

    //redirect to login
    this.authService.login(this.form.controls['email'].value!,
      this.form.controls['password'].value!)
    this.router.navigate(['/'])
  }
}
