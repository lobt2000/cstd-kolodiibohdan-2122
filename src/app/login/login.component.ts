import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public formLogIn: FormGroup;
  public formLogUp: FormGroup;
  public formReset: FormGroup;
  pattern = /^.{8,16}$/gm;
  patternName = /^[A-Za-z]{1,}$/;
  patternSecondName = /^[A-Za-z]{1,}$/;
  regExpEmail = /^[a-z0-9\-\.]{1,}@gmail\.com|net\.us|org\.ua$/i;
  isDisabled: boolean = true;
  isVisible: boolean = false;
  isSignUpVisible: boolean = false;
  isConfirmVisible: boolean = false;
  isSign: string = 'signIn';
  confirmPass: string = '';
  resetPassword: string = 'registration';
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (JSON.parse(localStorage.getItem('mainuser'))) {
      JSON.parse(localStorage.getItem('mainuser')).userPos == 'user' ?
        this.router.navigateByUrl("/user") :
        this.router.navigateByUrl('/agent')
    }
    this.buildFormForSignIn();
  }

  @HostListener('window:keydown.enter', ['$event'])
  enterKey() {
    if (this.isSign === 'signUp') {
      this.signUP();
    }
    else if (this.isSign === 'signIn') {
      this.signIN();
    }
    else if (this.resetPassword === 'resetEmail') {
      this.sendEmailForReset();
    }
  }

  buildFormForSignIn(): void {
    this.formLogIn = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.regExpEmail)]],
      pass: ['', [Validators.required, Validators.min(8), Validators.max(16), Validators.pattern(this.pattern)]],
    });
    this.formLogIn.valueChanges.subscribe(res => {
      if (this.formLogIn.valid) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    })
    this.formLogIn.controls.pass.valueChanges.subscribe(res => {
      if (res) {
        res.match(this.pattern);
      }
      if (this.formLogIn.valid) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    })
  }

  buildFormForSignUp(): void {
    this.formLogUp = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern(this.patternName)]],
      secondname: ['', [Validators.required, Validators.pattern(this.patternSecondName)]],
      email: ['', [Validators.required, Validators.pattern(this.regExpEmail)]],
      pass: ['', [Validators.required, Validators.min(8), Validators.max(16), Validators.pattern(this.pattern)]],
      confirmpass: ['', [Validators.required, Validators.min(8), Validators.max(16), this.confirmPassValidator()]],
      checkPosition: ['', [Validators.required]]
    });
    this.formLogUp.valueChanges.subscribe(res => {
      if (this.formLogUp.valid) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    })
    this.formLogUp.controls.pass.valueChanges.subscribe(res => {
      if (res) {
        res.match(this.pattern);
        this.confirmPass = res;
      }
      if (this.formLogUp.valid) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    })
    this.formLogUp.controls.confirmpass.valueChanges.subscribe(res => {
      if (this.formLogUp.valid) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    })
  }

  ChangeType(): void {
    this.isVisible = !this.isVisible;
  }

  ChangeTypeSignUp(): void {
    this.isSignUpVisible = !this.isSignUpVisible;
  }

  ChangeTypeConfirm(): void {
    this.isConfirmVisible = !this.isConfirmVisible;
  }

  signIN(): void {
    if (this.formLogIn.valid) {
      this.authService.signIn(this.formLogIn.getRawValue());
      this.resetForm();
    }
    else {
      this.resetForm();
    }
  }

  signUP(): void {
    if (this.formLogUp.valid) {
      this.authService.signUp(this.formLogUp.getRawValue());
      this.resetForm();
    }
    else {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (this.formLogIn) {
      this.formLogIn.reset();
    }
    if (this.formLogUp) {
      this.formLogUp.reset();
    }
  }

  changeSignForm(checkTypeOfSign) {
    this.isSign = checkTypeOfSign;
    if (checkTypeOfSign == 'signIn') {
      this.formLogUp.reset();
      this.buildFormForSignIn();
    }
    else {
      this.formLogIn.reset();
      this.buildFormForSignUp()
    }
  }

  confirmPassValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => this.confirmPass !== control.value ? { notmatch: 'This value should be the same as password' } : null
  }

  resetPasswordByEmail(isReset) {
    this.resetPassword = isReset;
    isReset == 'resetEmail' ? this.buildFormForResetPass() : this.formReset.reset();
  }

  buildFormForResetPass() {
    this.formReset = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  sendEmailForReset() {
    this.resetPassword = "waitForEmail"
    this.authService.sendEmailForResetPass(this.formReset.get('email').value);
  }
}
