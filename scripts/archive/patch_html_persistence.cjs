const fs = require('fs');

// 1. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\r\n/g, '\n');
const oldIndexInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();`;
const newIndexInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    if (auth.setPersistence && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn('[Auth] Persistence setup:', e));
    }`;

if (indexHtml.includes(oldIndexInit)) {
  indexHtml = indexHtml.replace(oldIndexInit, newIndexInit);
  console.log('index.html persistence added');
}

// Also add alert to catch in index.html checkout submit
const oldIndexCatch = `      } catch (err) {
        showCheckoutNotice('Network error connecting to store server. Please try again.', 'danger');`;
const newIndexCatch = `      } catch (err) {
        alert('Order Placement Error: ' + (err.message || 'Network error connecting to store server. Please try again.'));
        showCheckoutNotice('Network error connecting to store server. Please try again.', 'danger');`;

if (indexHtml.includes(oldIndexCatch)) {
  indexHtml = indexHtml.replace(oldIndexCatch, newIndexCatch);
  console.log('index.html order catch alert added');
}
fs.writeFileSync('index.html', indexHtml, 'utf8');

// 2. Update admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');
adminHtml = adminHtml.replace(/\r\n/g, '\n');
const oldAdminInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();`;
const newAdminInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    if (auth.setPersistence && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn('[Auth] Persistence setup:', e));
    }`;

if (adminHtml.includes(oldAdminInit)) {
  adminHtml = adminHtml.replace(oldAdminInit, newAdminInit);
  fs.writeFileSync('admin.html', adminHtml, 'utf8');
  console.log('admin.html persistence added');
}

// 3. Update worker.html
let workerHtml = fs.readFileSync('worker.html', 'utf8');
workerHtml = workerHtml.replace(/\r\n/g, '\n');
const oldWorkerInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();`;
const newWorkerInit = `    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    if (auth.setPersistence && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn('[Auth] Persistence setup:', e));
    }`;

if (workerHtml.includes(oldWorkerInit)) {
  workerHtml = workerHtml.replace(oldWorkerInit, newWorkerInit);
  fs.writeFileSync('worker.html', workerHtml, 'utf8');
  console.log('worker.html persistence added');
}
