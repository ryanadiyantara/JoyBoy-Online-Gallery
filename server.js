const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

// Untuk Membaca File + Upload File
const multer = require("multer");
const upload = multer().single("file");

// import firebase + key
const admin = require("firebase-admin");
const credentials = require("./key.json");
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  storageBucket: "gs://joyboy-online-gallery.appspot.com/",
});

// const firebase = require("firebase");
// const firebaseConfig = {
//   apiKey: "AIzaSyAlaQKXOuCblaV13luqoag0NYhnFJzL-6A",
//   authDomain: "joyboy-online-gallery.firebaseapp.com", //ganti pake domain hosting
//   projectId: "joyboy-online-gallery",
//   storageBucket: "joyboy-online-gallery.appspot.com",
//   messagingSenderId: "1061356397950",
//   appId: "1:1061356397950:web:57c34911255f45b9723f2f",
// };
// firebase.initializeApp(firebaseConfig);

// API Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); // Baca Form
app.use(express.static("public")); // Baca Direktori Page
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
); // Inisialisasi session

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); // Baca Direktori Page
});

// Auth Check
// function checkAuth(req, res, next) {
//   if (req.session.user) {
//     next(); // Lanjutkan jika pengguna sudah masuk
//   } else {
//     res.redirect("/login"); // Redirect ke halaman login jika pengguna belum masuk
//   }
// }
app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

// Simple
const db = admin.firestore();

// Read-Photo
app.get("/read/photos", async (req, res) => {
  try {
    // Mengambil data dari koleksi "gallery"
    const snapshot = await db.collection("gallery").get();

    const photos = [];
    // Mengolah setiap dokumen dalam koleksi
    snapshot.forEach((doc) => {
      const data = doc.data();
      photos.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        imageURL: data.imageURL,
        timeStamp: data.timeStamp,
      });
    });
    res.send(photos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Signup Google
// app.get("/auth/google", (req, res) => {
//   const provider = new firebase.auth.GoogleAuthProvider();
//   firebase
//     .auth()
//     .signInWithPopup(provider)
//     .then((result) => {
//       // Setelah autentikasi berhasil, Anda dapat menyimpan informasi pengguna dalam sesi
//       const user = result.user;
//       req.session.user = user;
//       res.redirect("/home"); // Ubah URL sesuai halaman yang Anda inginkan
//     })
//     .catch((error) => {
//       res.status(500).send(error.message);
//     });
// });

// Signup Udah BISA
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userResponse = await admin.auth().createUser({
      email: user.email,
      password: hashedPassword,
      emailVerified: false,
      disabled: false,
    });
    res.redirect("/home");
  } catch (error) {
    res.redirect("/login");
  }
});

// Signin / Login
app.post("/signin", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const userCredential = await admin.auth().getUserByEmail(email);

    // Verifikasi kata sandi
    const user = await admin.auth().updateUser(userCredential.uid, {
      password: password,
    });

    res.redirect("/home");
  } catch (error) {
    res.redirect("/login");
  }
});

//Port Test Lokal
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`);
});
