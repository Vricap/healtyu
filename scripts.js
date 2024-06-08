import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const contactBtn = document.querySelectorAll(".book-btn");
const formPayment = document.querySelector(".form-payment");
const btnHisClose = document.querySelector(".history-btn-close");
const btnHisOpen = document.querySelector(".history-btn-open");
const historyContainer = document.querySelector(".history-container");

const month = new Date().getMonth() + 1;
let user;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCITiAJyNQsKHzjVC7rztpuARaIsMLyc8c",
  authDomain: "wellness-tourism.firebaseapp.com",
  projectId: "wellness-tourism",
  storageBucket: "wellness-tourism.appspot.com",
  messagingSenderId: "40738864520",
  appId: "1:40738864520:web:02faf9e8199d01283e0e3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener('click', function(){
  signInWithPopup(auth, provider).then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    user = result.user;
    // googleLogin.textContent = user.displayName

    // Reloads the current page
    window.location.reload();
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
  });
});

// Reference to the logout button
const logoutBtn = document.getElementById('logout-btn');

// Logout function
logoutBtn.addEventListener('click', function() {
  alert("Yakin?");
  signOut(auth).then(() => {
    // console.log("User has logged out");
    logoutBtn.style.display = 'none'; // Hide logout button
    googleLogin.textContent = "Log In"; // Reset login button text
    googleLogin.style.display = 'block'; // Show login button
  }).catch((error) => {
    console.error('Sign Out Error', error);
  });
  // Reloads the current page
  window.location.reload();
});

// Firebase Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, show logout button and hide login button
    logoutBtn.style.display = 'block';
    googleLogin.style.display = 'none';
  } else {
    // No user is signed in, show login button and hide logout button
    logoutBtn.style.display = 'none';
    googleLogin.style.display = 'block';
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, update user info and display it
    document.getElementById('user-pic').src = user.photoURL || 'default-user-image.png'; // Provide a default image if none
    document.getElementById('user-name').textContent = user.displayName;
    // document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-info').style.display = 'block';
    
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('google-login-btn').style.display = 'none';
  } else {
    // No user is signed in
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('google-login-btn').style.display = 'block';
  }
});

onAuthStateChanged(auth, user => {
  // Ensure meditation and zumba buttons are not disabled
  contactBtn[0].disabled = false;
  contactBtn[0].style.cursor = "pointer";
  contactBtn[1].disabled = false;
  contactBtn[1].style.cursor = "pointer";

  if(month >= 8) {
    contactBtn[3].disabled = true;
    contactBtn[3].style.cursor = "not-allowed";
  }

  if(user) {
    contactBtn.forEach((b, i) => {
      b.removeEventListener("click", showPayAlert); // Remove previous event listener
      b.removeEventListener("click", showMustLogAlert); // Remove previous event listener

      if(!b.disabled) {
        b.addEventListener("click", () => {
          if (i === 0) { // Assuming 0 is for meditation booking
            window.location.href = "meditasi.html";
          } else if (i === 1) { // Zumba
            showPayAlert(user, i);
          }
        });
      }
    });
  } else {
    contactBtn.forEach(b => {
      b.removeEventListener("click", showPayAlert); // Remove previous event listener
      b.removeEventListener("click", showMustLogAlert); // Remove previous event listener

      if(!b.disabled) b.addEventListener("click", showMustLogAlert);
    });
  }
});

onAuthStateChanged(auth, user => {
  if(user) {
    getData(user).then(docData => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
      <h2 style="text-transform: uppercase;">${docData.book}</h2>
      <p>Atas Nama: ${docData.name}</p>
      <p>Tanggal Pembelian: ${docData.date}</p>
      <p>Harga: ${docData.harga}</p>
      <p>Token: ${docData.token}</p>`;

      historyContainer.appendChild(div);
    });
  
  }
  btnHisOpen.addEventListener("click", () => {
    document.querySelector(".history-container").style.display = "block";
  });
});

// General functions
async function getData(user) {
  const docRef = doc(db, "users", user.email);
  try {
    const docData = await getDoc(docRef);
    return docData.data();
  } catch(err) {
    console.log(err);
  }
}

function showMustLogAlert() {
  alert("LOGIN FIRST!");
}

function showPayAlert(user, i) {
  document.getElementById('popupOverlay').style.display = 'block';
  formPayment.elements['email'].value = user.email;

  let bookName;
  if(i == 0) {
    bookName = "meditation";
  } else if(i == 1) {
    bookName = "zumba";
  }

  document.querySelector(".pay-btn").addEventListener("click", () => {
    const token = uuid
    .v4();
    setDoc(doc(db, "users", user.email), {
      name: formPayment.elements['name'].value,
      book: bookName,
      date: getCurrentDateInWords(),
      bookId: i,
      harga: 500,
      token,
    }).then(() => {
      alert("Pembayaran berhasil! Cek email mu.");
      document.getElementById('popupOverlay').style.display = 'none';
      if (bookName === "meditation") {
        window.location.href = "meditasi.html";
      } else {
        window.location.reload();
      }
    });
  });

  formPayment.elements['name'].value = "";
  formPayment.elements['cardNumber'].value = "";
}

function getCurrentDateInWords() {
  const date = new Date();

  // Arrays for days and months
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Extract day, month, and year
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Format the date
  return `${dayName}/${monthName}/${year}`;
}

btnHisClose.addEventListener("click", () => {
  document.querySelector(".history-container").style.display = "none";
});