const fastify = require("fastify");
const server = fastify();
const fastifyCors = require("fastify-cors");

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.PGSTRING
});

server.register(fastifyCors);

server.get("/pending", async (request, reply) => {
  const sql = `SELECT * FROM "public"."contacts"  where handled = false;`;
  const result = await client.query(sql);
  reply.send(result.rows);
});

server.post("/", async (request, reply) => {
  const sql = `INSERT INTO contacts (name, message) VALUES ( $1, $2);`;
  const values = [request.body.name, request.body.message];
  await client.query(sql, values);
  reply.send("*ok");
});

server.delete("/:id", async (request, reply) => {
  const sql = "DELETE FROM contacts WHERE id = $1";
  const values = [request.params.id];
  const result = await client.query(sql, values);
  reply.send(result);
});

const boot = async () => {
  await client.connect();

  await client.query(`
CREATE TABLE IF NOT EXISTS contacts (
  id serial PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  handled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
`);

  await server.listen(8080);
};

const onBootComplete = () => console.info("App started correctly");
const onBootFailed = () => console.error(`Boot Error: ${err.message}`);

boot()
  .then(onBootComplete)
  .catch(onBootFailed);
