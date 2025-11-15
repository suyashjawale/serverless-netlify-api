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