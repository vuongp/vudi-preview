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
setInterval(refreshFoodData, 1000 * 60 * 60); // Elke 60 minuten?

async function refreshFoodData() {
  console.log("refreshing FoodData")
  let twoMonthsEarlier = new Date();
  twoMonthsEarlier.setMonth(twoMonthsEarlier.getMonth() - 1);
  twoMonthsEarlier.setHours(0,0,0,0)
  twoMonthsEarlier.setDate(1);

  console.log(twoMonthsEarlier)
  let newArray = [];
  const snapshot = await db
      .collection('food')
      .where('ownerId', '==', 'cHO2bLdsCPbNan2dYyLJ62G6ACc2')
      .where('date', '>', twoMonthsEarlier)
      .orderBy('date', 'desc')
      .get();
  snapshot.forEach((doc) => {
    let month = newArray.find((element) => element.month === getMonthYear(doc.data()));
    if (!month) {
      month = {
        month: getMonthYear(doc.data()),
        items: []
      }
      newArray.push(month)
    }
    month.items.push(doc.data())
  });
  foodData = newArray
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let bannerUrl = foodData[0].items[Math.floor(Math.random() * foodData[0].items.length)].imageUrl

  res.render('index', {title: 'Vuong\'s food', foodList: foodData, bannerUrl: bannerUrl});
});

function getMonthYear(element) {
  if (!element.date) return "old"
  let date = new Date(element.date._seconds * 1000);
  return (date.getMonth() + 1) + "/" + date.getFullYear()
}

module.exports = router;
