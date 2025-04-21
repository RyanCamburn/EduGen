import express from 'express';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import constructorMethod from './routes/index.js';

constructorMethod(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});