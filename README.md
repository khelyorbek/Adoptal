### **Adoptal**
### Find and adopt your next fabulous feline friend!

---
- [How to run the application?](#how-to-run-the-application-)
  * [Method 1: Running the application online](#method-1-running-the-application-online)
  * [Method 2: Running the application locally](#method-2-running-the-application-locally)
- [Screenshots of the application](#screenshots-of-the-application)
---

## How to run the application?
### **Method 1: Running the application online**
[**CLICK HERE TO OPEN THE APPLICATION ONLINE**](https://adoptal.elyorbek.com/) 
- or copy-paste https://adoptal.elyorbek.com/ into your browser

---
### **Method 2: Running the application locally**
1. Download this repository to your local computer
2. Make sure you have `npm` installed or check [this page](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on how install it
3. Make sure you have a `MongoDB Atlas` account. Check [this page](https://www.mongodb.com/cloud/atlas/register) to register. Once you are registered, create a MongoDB database and then a collection called Adoptal. Once that's done you can go back to the main page of MongoDB Atlas and then click on Connect which will generate the Connect string for you. You will need this string during step 11.
4. Open command prompt on your computer
5. In your command prompt, navigate to the folder where you have this repository
6. Go into backend folder and run `npm install` to install dependencies
7. Go into frontend folder and run `npm install` to install dependencies (Note: this might take a while)
8. Create a Petfinder Developer account by going [here](https://www.petfinder.com/developers/v2/docs/) and registering there
9. Once registered, you should get an "API Key" and "Secret"
10. Go into the backend folder and create a .env file
11. Open the file and add the following and replace the values after = with your own
```
client_id=ADD-YOUR-PETFINDER-API-KEY-HERE
client_secret=ADD-YOUR-PETFINDER-SECRET-HERE
mongodb_connect_string=mongodb+srv://ADD-YOUR-MONGODB-ATLAST-CONNECTION-ADDRESS-HERE
session_secret=GENERATE-A-RANDOM-LONG-STRING-AND-PUT-IT-HERE
BCRYPT_WORK_FACTOR=TYPE-IN-12-OR-ANYTHING-HIGHER-FOR-PASSWORD-ENCRYPTION
```
12. Go into the frontend folder and create a .env file
13. Open the file and add the following and replace the values after = with your own
```
WATCHPACK_POLLING=true
REACT_APP_APP_SECRET=GENERATE-A-RANDOM-LONG-STRING-AND-PUT-IT-HERE
REACT_APP_BACKEND_URL=PUT-THE-ADDRESS-TO-THE-ADOPTAL-BACK-END-USUALLY-ITS-LOCALHOST:3015
```
14. Go into backend folder and run `npm run dev` to start the backend Express server
15. Go into frontend folder and run `npm start` to start React application (Note: this might take a while)
16. The address `https://localhost:3000` should open automatically but if it doesn't, go to that address in any browser (I recommend Chrome)
17. Have fun!

**NOTE: IF THERE ARE NO PETS DISPLAYING WHEN YOU OPEN THE APP, CHECK THE BACK-END CONSOLE LOG AND THE FRONTEND CONSOLE LOG FOR ANY ERRORS REGARINDG YOUR PETFINDER API KEYS**

---

## **Screenshots of the application**
![Main page in Dark Mode](/screenshots/1.jpg)
**1. Main page in Dark Mode for guest visitor**

![Main page in Light Mode](/screenshots/2.jpg)
**2. Main page in Light Mode for guest visitor**

![Working pagination](/screenshots/3.jpg)
**3. Working pagination with current and total pages**

![Loading spinner animation](/screenshots/4.jpg)
**4. Loading spinner animation**


![No results found in filter](/screenshots/5.jpg)
**5. No results found in filter**


![Filtering](/screenshots/6.jpg)
**6. Filtering produces the requested results**


![Cat Details 1](/screenshots/7.jpg)
![Cat Details 2](/screenshots/8.jpg)
**7-8. Cat details page with no comments for guest visitor**

![Login modal](/screenshots/9.jpg)
**9. Login modal**

![Registration modal](/screenshots/10.jpg)
**10. Registration modal**

![Successful login prompt](/screenshots/11.jpg)
**11. Successful login prompt**

![Navigation with logged in user](/screenshots/12.jpg)
**12. Navigation with logged in user**

![Profile toggle](/screenshots/13.jpg)
**13. Profile toggle**
 
![Edit profile modal for logged in user](/screenshots/14.jpg)
**14. Edit profile modal for logged in user**

![Want to Adopt List](/screenshots/15.jpg)
**15. Want to Adopt List**
 
![My private notes list](/screenshots/16.jpg)
**16. My private notes list**
 
![My private notes list message update](/screenshots/17.jpg)
**17. My private notes list message update**
 
![My public comments list](/screenshots/18.jpg)
**18. My public comments list**
 
![Cat details 1](/screenshots/19.jpg)
![Cat details 2](/screenshots/20.jpg)
**19-20. Cat details page for logged in user with own comment**

![Cat details no comments section](/screenshots/21.jpg)
**21. Cat details no comments section**
 
![Cat details comments section with own comment and another user comment](/screenshots/22.jpg)
**22. Cat details comments section with own comment and another user comment**
 
![Cat details comments section with comments for guest visitor](/screenshots/23.jpg)
**23. Cat details comments section with comments for guest visitor**

![Responsive design for mobile devices](/screenshots/24.jpg)

**24. Responsive design for mobile devices**

![Responsive menu/navigation for mobile devices](/screenshots/25.jpg)

**25. Responsive menu/navigation for mobile devices**