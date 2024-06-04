import "./style.css";
import { User, init } from "@instantdb/core";

const db = init({
  appId: "5b640925-7328-451d-b79e-a7d4c8b48adb",
});

const appEl = document.querySelector<HTMLDivElement>("#app")!;

function renderLoading() {
  appEl.innerHTML = `<div>Loading...</div>`;
}

function renderAuthError(message: string) {
  appEl.innerHTML = `<div>Uh oh! ${message}</div>`;
}

function renderLoggedInPage(user: User) {
  appEl.innerHTML = `
    <div>
      <h1>Welcome, ${user.email}!</h1>
      <button id='sign-out-button'>Sign out</button>
    </div>
  `;
  const signOutBtn =
    document.querySelector<HTMLButtonElement>("#sign-out-button")!;
  signOutBtn.addEventListener("click", () => {
    db.auth.signOut();
  });
}

function renderSignInPage() {
  const googAuthURI = db.auth.createAuthorizationURL({
    clientName: "google-web",
    redirectURL: window.location.href,
  });
  appEl.innerHTML = `
    <div>
      <form id='email-input-form'>
        <h3>Welcome. Let's log you in</h3>
        <p>
          Enter your email, and we’ll send you a verification code.
          We'll create an account for you too if you don't already have one :)
        </p>
        <input type='email' name='email' placeholder='Email' />
        <button type='submit'>Send code</button>
      </form>
      <div>
      Or, <a href="${googAuthURI}">Sign in with Google</a>
    </div>
  `;
  const formEl = document.querySelector<HTMLFormElement>("#email-input-form")!;
  formEl.email.focus();
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = formEl.email.value;
    try {
      await db.auth.sendMagicCode({ email });
    } catch (e: any) {
      alert(`Uh oh! ${e.body?.message}`);
    }
    renderMagicCodePage(email);
  });
}

function renderMagicCodePage(email: string) {
  appEl.innerHTML = `
    <div>
      <form id='magic-code-form'>
        <h3>Check your email</h3>
        <p>
          We've sent a magic code to ${email}. Enter it below to sign in.
        </p>
        <input type='text' name='code' placeholder='Magic Code' />
        <button type='submit'>Verify code</button>
      </form>
    </div>
  `;
  const formEl = document.querySelector<HTMLFormElement>("#magic-code-form")!;
  formEl.code.focus();
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = formEl.code.value;
    try {
      db.auth.signInWithMagicCode({ email, code });
    } catch (e: any) {
      alert(`Uh oh! ${e.body?.message}`);
    }
  });
}

renderLoading();
db.subscribeAuth((auth) => {
  if (auth.error) {
    renderAuthError(auth.error.message);
  } else if (auth.user) {
    renderLoggedInPage(auth.user);
  } else {
    renderSignInPage();
  }
});
