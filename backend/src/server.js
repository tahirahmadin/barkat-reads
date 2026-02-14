const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`Barkat Reads API running at http://localhost:${port}`);
});
