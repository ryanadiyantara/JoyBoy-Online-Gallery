const express = require("express");
const app = express();
const bodyParser = require("body-parser");

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

//API Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); // Baca Form
app.use(express.static("public")); // Baca Direktori Page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); // Baca Direktori Page
});

// Auth Check
function checkAuth(req, res, next) {
  if (req.session.user) {
    next(); // Lanjutkan jika pengguna sudah masuk
  } else {
    res.redirect("/login"); // Redirect ke halaman login jika pengguna belum masuk
  }
}
app.get("/home", checkAuth, (req, res) => {
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

//Signup Biasa BISA
// app.post("/signup", async (req, res) => {
//   console.log(req.body);
//   const user = {
//     email: req.body.email,
//     password: req.body.password,
//   };
//   const userResponse = await admin.auth().createUser({
//     email: user.email,
//     password: user.password,
//     emailVerified: false,
//     disabled: false,
//   });
//   res.json(userResponse);
// });

// Login Biasa Gabisa
// app.post("/login", (req, res) => {
//   const adminCredentials = {
//     username: "superadmin",
//     password: "admin123",
//   };
//   const user = {
//     email: req.body.email,
//     password: req.body.password,
//   };

//   if (user.email === adminCredentials.username && user.password === adminCredentials.password) {
//     // Successful login
//     res.redirect("./pages.dashboard.html"); // Redirect to the dashboard or desired page
//   } else {
//     res.status(401).send("Invalid Credentials");
//   }
// });

//Port Test Lokal
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`);
});
