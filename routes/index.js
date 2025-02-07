var express = require('express');
var router = express.Router();

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('../secrets/serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

let foodData = []

refreshFoodData()
setInterval(refreshFoodData, 1000 * 60 * 30); // Elke 60 minuten?

async function refreshFoodData() {
  console.log("refreshing FoodData")
  let newArray = [];
  const snapshot = await db
      .collection('food')
      .where('ownerId', '==', 'cHO2bLdsCPbNan2dYyLJ62G6ACc2')
      .orderBy('date', 'desc')
      .get();
  snapshot.forEach((doc) => {
    newArray.push(doc.data())
  });
  foodData = newArray
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let bannerUrl = foodData[Math.floor(Math.random() * foodData.length)].imageUrl

  res.render('index', {title: 'Vuong\'s food', foodList: foodData, bannerUrl: bannerUrl});
});

router.get('/.json', async function (req, res, next) {
  res.json(foodData)
});

module.exports = router;
