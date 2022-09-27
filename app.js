const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//scenario 2
app.get("/todo/", async (request, response) => {
  const {
    id,
    search_q = "",
    todo = "",
    priority = "",
    status = "",
  } = request.query;

  if (status !== "") {
    const getStatusQuery = `
        SELECT *
        FROM todo
        WHERE status = '${status}';
    `;
    const dbResponse = await db.all(getStatusQuery);
    response.send(dbResponse);
  } else if (priority !== "") {
    const getPriorityQuery = `
        SELECT *
        FROM todo
        WHERE priority = '${priority}';
    `;
    const dbResponse = await db.all(getPriorityQuery);
    response.send(dbResponse);
  } else if (status !== "" && priority !== "") {
    const getQuery = `
        SELECT *
        FROM todo
        WHERE status = ${status} AND
        priority = ${priority};
      `;
    const dbResponse = await db.all(getQuery);
    response.send(dbResponse);
  } else if (search_q !== "") {
    const getQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%';
      `;
    const dbResponse = await db.all(getQuery);
    response.send(dbResponse);
  } else {
    const getQuery = `
        SELECT *
        FROM todo;
      `;
    const dbResponse = await db.all(getQuery);
    response.send(dbResponse);
  }
});
///API 2
app.get("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodo = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};
  `;
  const dbResponse = await db.get(getTodo);
  response.send(dbResponse);
});

//API 3
app.post("/todo/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const createTodoQuery = `
        INSERT INTO todo(id,todo,priority,status)
        VALUES (${id},'${todo}','${priority}','${status}');
    `;

  const dbResponse = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});
///API 4
app.put("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "todo";
      break;
  }
  const getQuery = `
    SELECT *
    FROM todo
    WHERE id=${todoId};
  `;
  const previousTodo = await db.get(getQuery);

  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = request.body;

  const updateQuery = `
        UPDATE todo
        SET
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}'
        WHERE id=${todoId};
    `;
  await db.run(updateQuery);
  response.send(`${updateColumn} Updated`);
});

///API 5
app.delete("/todo/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
        DELETE FROM todo
        WHERE id = ${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
