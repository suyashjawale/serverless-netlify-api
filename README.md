# serverless-netlify-api

Contains all api's used for all projects

Apis are hosted on netlify, which uses netlify functions to query the Firestore Database.

Setup

1. Make a clean repo.

2. Install netlify cli

```
npm install netlify-cli -g
```

3. create netlify.toml file
    - add example code in it

4. create functions folder

5. create js files inside functions folder
   - file name are function names and urls

6. install firebase admin cli

```
npm i firebase-admin
```
7. Create Firestore Database
    - go to project settings > service accounts 
    - select node.js
    - Click on generate new private key. A json file will be downloaded. 
    - rename the file as your wish
    - keep the file outside functions folder

8. add your code.
   - While testing on local
   - Use this line 
   ```
    const serviceAccount = require('../admin.json');
   ```
   Instead of this
   ```
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```

9. run the code using following command
```
netlify dev 
```

10. This will open the browser. Now to go to your api. use the following url.

```
http://localhost:8888/.netlify/functions/demo
```

Here demo is the file name. That is api.

11. After testing, replace the 
```
    const serviceAccount = require('../admin.json');
   ```
   With  this
   ```
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   ```

12. Push the code, but dont push the downloaded json file.

13. Go to netlify website and select website from git. allow to access this repo. This will automatically publish the site.

14. Now on netlify project site. Go to site configuration > environment variables.

    - create a key with this name 
    ```
    FIREBASE_SERVICE_ACCOUNT
    ```

    and assign value to it which would be the content of the downloaded json file.

15. Now netlify gives you url of site visit the site. kindly modify the site url and append this

```
/.netlify/functions/demo 
```
to the site. 

demo is the file name you created. 

Now it works. Please refer code files for further more usage.


---------------------------

if you take pull 

just write command "netlify link"

this way you can access remote environment varibles

------------------------------------------

# Dropbox generate permanent access token

Great — this tells me exactly what type of Dropbox app you created.

Because you clicked “Generate access token” in the App Console, Dropbox gives you:

❌ A short-lived development access token

→ Expires in a few hours
→ Expires when regenerated
→ Not meant for production
→ Will ALWAYS give 401 after expiration

This is why your uploads suddenly stop working.

✅ GOOD NEWS: Your app CAN generate a permanent refresh token.

You already have everything needed:

✔ App Key

✔ App Secret

✔ Scoped App (App Folder) → Allowed

✔ "Allow public clients" (PKCE) → Allowed

✔ Redirect URI → you can add localhost

So we can create a never-expiring refresh token.

🔥 FOLLOW THESE 5 MINUTES STEPS — YOU WILL NEVER GET 401 AGAIN
## STEP 1 — Add a redirect URI

In your Dropbox app settings → Add:

http://localhost:3000/auth


Click Add → Save.

## STEP 2 — Open this URL in browser

Replace:

APP_KEY with your Dropbox App Key

REDIRECT_URI with the exact one you set

https://www.dropbox.com/oauth2/authorize?client_id=APP_KEY&response_type=code&token_access_type=offline&redirect_uri=http://localhost:3000/auth


This opens a Dropbox login + permission screen.

After login, Dropbox redirects to:

http://localhost:3000/auth?code=XXXXX


Copy the code parameter.

## STEP 3 — Exchange code for REFRESH TOKEN

Open terminal, run:

curl https://api.dropboxapi.com/oauth2/token \
  -d code=THE_CODE_YOU_GOT \
  -d grant_type=authorization_code \
  -d client_id=APP_KEY \
  -d client_secret=APP_SECRET \
  -d redirect_uri=http://localhost:3000/auth


Output looks like:

{
  "access_token": "sl.ABCDE...",
  "refresh_token": "Vja3kKoe4....",
  "expires_in": 14400,
  "token_type": "bearer"
}

⚠️ SAVE THE REFRESH TOKEN — IT NEVER EXPIRES.
## STEP 4 — Store only the refresh token

From now on, you never use developer access tokens again.

## STEP 5 — Get a new access token anytime using refresh_token

Use:

curl https://api.dropboxapi.com/oauth2/token \
  -d grant_type=refresh_token \
  -d refresh_token=YOUR_REFRESH_TOKEN \
  -d client_id=APP_KEY \
  -d client_secret=APP_SECRET


Output:

{
  "access_token": "sl.new-token-123",
  "expires_in": 14400
}


Your Angular app must use THIS access token.

⚠️ IMPORTANT: YOU CANNOT DO THIS DIRECTLY FROM ANGULAR

Because:

You cannot expose APP_SECRET

Anyone could steal it

They could delete/modify your Dropbox data

Therefore:

👉 The refresh_token and app_secret must stay on a backend
✔ FastAPI
✔ NodeJS
✔ Cloudflare Worker
✔ Firebase Cloud Function

Your Angular frontend just calls your backend like:

GET /getDropBoxToken


And backend returns:

{ access_token: "sl.newtoken..." }

⭐ If you want, I will generate a complete backend for refreshing tokens:

Just tell me one of these options:

FastAPI version

NodeJS Express version

Cloudflare Worker version (free, no server)

Firebase Cloud Function version

Which one?