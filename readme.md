
![Authduo.org](https://i.imgur.com/Pr6ILnz.png)

# 🗽 [Authduo.org](https://authduo.org/) – Free Auth for Everybody

[Authduo.org](https://authduo.org/) is an app where users can create and manage digital login passports.

You can add a *"Login with Authduo"* button to your website, allowing users to login using an Authduo passport.

🔑 **Passwordless** – passports are cryptographic keypairs  
🗽 **User-sovereign** – users can directly download their passport files  
🥷 **Privacy-focused** – users can be anonymous: no emails, no tracking  

💖 **Free and open source** – zero cost at worldwide scale  
🥞 **Easy as pancakes** – paste in a tiny amount of code to get logins  
📱 **Clientside** – statically hosted on github pages, no api servers  

🏛️ **Federated** – get login tokens from the authduo.org popup flow  
🌐 **Decentralized** – fork and self-host if you'd rather  
📜 **Protocol** – permissionless integration, you can do it your way  

> ***Pre-release:** Authduo is an unfinished prototype, use at your own risk.*

<br/>

## 🪪 [Authduo.org](https://authduo.org/) Login Button

Try out the login button at the [Federated Test Page](https://authduo.org/federated/)

### 😎 Easy HTML Installation

*Choose this installation method if you don't know any better.*

1. **Insert this in your `<head>`:**
    ```html
    <script type="module" src="https://authduo.org/install.bundle.min.js"></script>

    <script type="module">
      document.querySelector("auth-login").auth.onChange(login => {
        if (login) console.log("logged in", login)
        else console.log("logged out")
      })
    </script>
    ```
    - Customize that second script to handle logins/logouts your way.
    - When the user logs in, the `login` object looks like this:
      ```js
      login.name // Cetdok Pizafoaba
      login.thumbprint // "0d196fc3..."
      login.expiry // 1731740481065
      ```
    - When the user logs out, `login` is `null`.
1. **Put this button in your `<body>`:**
    ```html
    <auth-login></auth-login>
    ```
    - This provides a nice little status/button ui for users to login or logout.
    - The login state is automatically stored in `localStorage`.

### 🧐 Sophisticated Installation for App Devs

*Choose this installation method if you're familiar with npm, package.json, typescript – stuff like that.*

1. **Install the npm package**
    ```sh
    npm i @authduo/authduo
    ```
1. **Register components and listen for auth changes.** `main.ts`
    ```ts
    import {Auth, components, register_to_dom} from "@authduo/authduo"

    register_to_dom(components)

    const auth = Auth.get()

    auth.onChange(login => {
      if (login) console.log("logged in", login)
      else console.log("logged out")
    })
    ```
1. **Throw down some login buttons.** `index.html`
    ```html
    <auth-login></auth-login>
    ```

<br/>

## 💁 [Authduo.org](https://authduo.org/) is for convenience, not vendor lock-in
- You can fork Authduo to make your own passport management app, and users can take their passport files there instead
- You can point the login button to your own fork:
  ```html
  <auth-login src="https://authduo.org/"></auth-login>
  ```
  - Just swap `https://authduo.org/` with your own url
  - This is what "decentralized", "user-sovereign", and "protocol" is all about

<br/>

## 🌠 The More You Know, about [Authduo.org](https://authduo.org/)

### What if my users lose their passports?
- They'll just generate new passports.
- If you associate important services to your users' passports, you should provide a recovery mechanism so users can re-associate those services with new passports.

### Opt-in services for casual user experience
- While Authduo's core must stay lean to retain user-sovereignty and privacy, we can still build optional services which allow users to trade a little sovereignty for some conveniences:
  - Username and password logins
  - Email-based recovery
  - OTP/QR codes to easily transfer passports across devices
  - Two-factor auth

<br/>

## 🛠️ More advanced integration examples

### Programmatically trigger a login
- You can use `auth.popup` to trigger a login, but you should do this in reaction to a user input event, otherwise the browser will block the popup.
  ```js
  import {auth} from "@authduo/authduo"

  myButton.onclick = async() => {
    const login = await auth.popup("https://authduo.org/")
    if (login) console.log("logged in", login)
  }
  ```

### Understanding the Authduo flow and tokens

![](https://i.imgur.com/18xwaeU.png)

- When a user on your app clicks to login, this opens an Authduo.org popup for them to login.
- The authduo signs some tokens with your user's passport keypair, and sends them back to your application.
- Your app receives a `Login` object, which has some useful things:
  - `login.proof.token` -- this is a `Proof` token and it's public, so you can send it around anywhere so your user can prove their identity
  - `login.keys.signClaimToken(~)` -- you can use this to sign arbitrary data into a token, which is verifiably signed on behalf of the user's passport

#### Example of signing and verifying claim tokens

- **Sign a fresh claim token.**
  ```js
  import {Future} from "@authduo/authduo"

  const idToken = await login.keys.signClaimToken({
    expiresAt: Future.hours(24),

    // you can pack any abitrary data you want into this token
    data: {
      username: "Rec Doamge",
      avatarId: "d15aea1a",

      // perhaps we want to scope this claim to a specific game session,
      // so that it cannot be stolen by other users and reused in other
      // game sessions.
      gameSessionId: "9c22b17e",
    },
  })
  ```
- **Send this *idToken* along with the user's *proofToken.***
  ```js
  await sendElsewhere(login.proof.token, idToken)
  ```
  - Each `login` object comes with a proof token that is required to verify any claim tokens.
- **Verify the proof and claim**
  ```js
  import {Proof, Claim} from "@authduo/authduo"

  receiveElsewhere(async(proofToken, idToken) => {

    // the origin of your site that triggered the authduo popup
    const allowedAudiences = ["https://example.benev.gg"]

    // verifying the proof
    const proof = await Proof.verify(proofToken, {allowedAudiences})

    // proving the claim
    const claim = await Claim.verify(proof, idToken)

    // here's that data you packed into the claim
    console.log(claim.data.username) // "Rec Doamge"
    console.log(claim.data.avatarId) // "d15aea1a"
    console.log(claim.data.gameSessionId) // "9c22b17e"

    // user passport public thumbprint, the true user identifier
    console.log(claim.thumbprint) // "a32e638e..."
    console.log(proof.thumbprint) // "a32e638e..."
  })
  ```
  - The same proof can be used to verify multiple claims from the same login.

<br/>

## 💖 [Authduo](https://authduo.org/) is free and open source
- I built Authduo because I wanted free user-centric auth for my apps.
- Got questions or feedback? Don't hesitate to open a github issue or discussion anytime.
- My name is Chase Moskal, ping me on discord: https://discord.gg/BnZx2utdev

