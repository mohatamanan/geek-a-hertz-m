import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, getRedirectResult } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCypRblrnaTYl86Nvdguw7DvWjUYEXejSw",
    authDomain: "geekahertzm.firebaseapp.com",
    projectId: "geekahertzm",
    storageBucket: "geekahertzm.firebasestorage.app",
    messagingSenderId: "745785297756",
    appId: "1:745785297756:web:cf1c9a90a27b50b0d70f99",
    measurementId: "G-K0CLD3SXYP"
};


function moveToDashboard() {
    document.getElementsByClassName('sign-log')[0].style.display = "none";
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
auth.languageCode = "it";

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getDatabase, ref as dbRef, set } from "http://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

let user = "";
let uid;

// ---------------------------- GOOGLE SIGN-IN
let provider = "erm";
// window.addEventListener('beforeunload', () => {
//     window.opener.postMessage({ type: 'popupClosed' }, '*'); // Replace '*' with the origin of your main window if possible for better security
// });

document.getElementsByClassName("signInGoogle")[0].addEventListener("click", () => {
    provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            user = result.user;
            localStorage.setItem(userID, user.uid);
            moveToDashboard();
            // window.location.href = "upload.html";
            console.log(user);
            // IdP data available using getAdditionalUserInfo(result)
        }).catch((error) => {
            // Handle Errors here.
            console.log("Uh oh")
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });

})

// ---------------------------- EMAIL+PASSWORD CREATE ACC
let emailEntered = ""
let pwdEntered = ""
let submitBtn1 = document.getElementById('submitSign')

submitBtn1.addEventListener('click', () => {
    emailEntered = document.getElementById('emailInp').value
    pwdEntered = document.getElementById('pwdInp').value

    createUserWithEmailAndPassword(auth, emailEntered, pwdEntered)
        .then((userCredential) => {
            user = userCredential.user;
            // console.log("Okay...?")

            sendEmailVerification(auth.currentUser)
                .then(() => {
                    console.log("Email Verification sent! Check your inbox")
                    let gmailLink = document.createElement('a')
                    gmailLink.href = "https://gmail.com";
                    gmailLink.innerText = "inbox!"
                    document.getElementsByClassName('errorP')[0].textContent = "Email Verification sent! Check your "
                    document.getElementsByClassName('errorP')[0].appendChild(gmailLink)
                });

        })
        .catch((error) => {
            console.log('tf')
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)

            if (errorMessage == "Firebase: Error (auth/email-already-in-use).") {
                document.getElementsByClassName('errorP')[0].textContent = "⚠︎ It appears that the email is already in use. Please proceed to the login form."
            } else if (errorMessage == "Firebase: Password should be at least 6 characters (auth/weak-password).") {
                document.getElementsByClassName('errorP')[0].textContent = "⚠︎ Weak Password. Please make sure that the password has 6 characters. Should include aplhabets, special characters, numbers, capitals."
            } else if (errorMessage == "Firebase: Error (auth/invalid-email).") {
                document.getElementsByClassName('errorP')[0].textContent = "⚠︎ Invalid Email address."
            }
        })


})

// ---------------------------- SIGN IN WITH EMAIL+PWD
let submitBtn2 = document.getElementById("signBtn");
let rnd = 5;

submitBtn2.addEventListener('click', () => {
    emailEntered = document.getElementById('emailInp').value
    pwdEntered = document.getElementById('pwdInp').value

    signInWithEmailAndPassword(auth, emailEntered, pwdEntered)
        .then((userCredential) => {
            user = userCredential.user
            console.log(user)
            //   localStorage.setItem("userID", user.uid);
            uid = user.uid

            if (user["emailVerified"] == true) {
                console.log('Signed in Succesfully!!!');
                console.log(user);
            }
            else if (user["emailVerified"] == false) {
                let gmailLink2 = document.createElement('a')
                gmailLink2.href = "https://gmail.com";
                gmailLink2.innerText = "inbox!"
                document.getElementsByClassName('errorP')[0].textContent = "⚠︎ Verify your email first"
                document.getElementsByClassName('errorP')[0].appendChild(gmailLink2)
            }

        })
        .catch((error) => {
            console.log('tf')
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);

            if (errorMessage == "Firebase: Error (auth/invalid-credential).") {
                document.getElementsByClassName('errorP')[0].textContent = "⚠︎ Incorrect Password/Email. Make sure you have entered correct one."
            }
        })
})

const database = getDatabase(app)

// UPLOADING ----------------------------
const storage = getStorage(app)
document.getElementById("uploadButton").addEventListener("click", () => {
    const file = document.getElementById("fileInput").files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    // Define file path in Firebase Storage using the user's UID
    const filePath = `${uid}/${file.name}`;
    const storageRef = ref(storage, filePath);

    // Upload the file to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, file);

    //     rules_version = '2';
    //    service firebase.storage {
    //      match /b/{bucket}/o {
    //        match /{allPaths=**} {
    //          allow read, write: if request.auth != null; // Allows authenticated users


    //          // Allow public read access to files in a specific folder (e.g., "public")
    //          // Replace "public" with your folder name
    //          allow read: if request.path.startsWith('/b/{bucket}/o/public/'); 

    //          // Allow read from your web app
    //          allow read: if request.origin == "https://geekahertzm.web.app";
    //        }
    //      }
    //    }

    // Monitor upload progress
    uploadTask.on(
        "state_changed",
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById("status").innerText = `Upload is ${progress}% done`;
        },
        (error) => {
            // Handle upload errors
            alert(`Error during upload: ${error.message}`);
        },
        () => {
            // On successful upload, get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                alert("File uploaded successfully!");
                console.log("File available at:", downloadURL);

                const fileRecord = {
                    name: file.name,
                    url: downloadURL,
                    uploadedAt: new Date().toISOString()
                };

                // Save the download URL and file metadata to Firebase Realtime Database
                const dbUserRef = dbRef(database, `files/${user.uid}`); // Organized by UID

                // Use push() instead of set() to generate a unique key for each file
                const newFileRef = dbUserRef.push(); // Automatically generates a unique key

                // Store the record in the database
                set(newFileRef, fileRecord)
                    .then(() => {
                        alert("File metadata saved to database successfully!");
                    })
                    .catch((error) => {
                        console.error("Error saving to database:", error);
                    });

            });
        }
    );
});