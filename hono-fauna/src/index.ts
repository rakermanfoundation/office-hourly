/*
 * OH! (Office Hourly) Hono.js Backend
 *
 * Wildhacks Project, April 2023
 *
 * Radison Akerman, Leeza Andryushchenko
 * Richard Yang, Sengdao Inthavong
 */

import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as jose from "jose";
import { Bindings } from "hono/dist/types/types";
import faunadb from "faunadb";
import {
  classSchema,
  getClasses,
  putClasses,
  postClasses,
  deleteClasses,
} from "./classes";
import {
  userSchema,
  addStudentuserSchema,
  addInstructoruserSchema,
  getStudentsByClass,
  addStudentClassForUser,
  createUser,
  addInstructorClassForUser,
  getEstimatedWaitTime,
  deleteUser,
  getInstructorsInClass,
} from "./users";
import {
  putSessionSchema,
  addInstructorSchema,
  sessionSchema,
  getSession,
  postSession,
  putSession,
  addInstructor,
  deleteSession,
} from "./sessions";
import {
  acceptStudentTicketSchema,
  ticketSchema,
  getActiveQueue,
  getCurrentStudents,
  getMyCurrentStudent,
  createTicket,
  acceptStudentTicket,
  deleteTicket,
  getAllTickets,
} from "./tickets";
const { Call, Function, Paginate, Match, Index, Lambda, Get, Var, Map } =
  faunadb.query;

const faunaClient = new faunadb.Client({
  secret: "fnAFBncQWJAASbTQJZ9EssnEJxiaKKln11deXGwR",
});

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      return origin.endsWith(".rakerman.com")
        ? origin
        : "http://localhost:3000";
    },
  })
);
app.get("/", (c) => c.text("OH! API v1.0.0"));

// CLASSES REQUESTS:
app.get("/classes", getClasses);
app.put("/classes", putClasses);
app.post("/classes", zValidator("json", classSchema), postClasses);
app.delete("/classes", deleteClasses);

app.get("/users", getStudentsByClass);
app.get("/users/instructor", getInstructorsInClass);
app.put(
  "/users/student",
  zValidator("json", addStudentuserSchema),
  addStudentClassForUser
);
app.post("/users", zValidator("json", userSchema), createUser);
app.put(
  "/users/instructor",
  zValidator("json", addInstructoruserSchema),
  addInstructorClassForUser
);
app.get("/users/time", getEstimatedWaitTime);
app.delete("/users", deleteUser);

app.get("/sessions", getSession);
app.put("/sessions", zValidator("json", putSessionSchema), putSession);
app.post("/sessions", zValidator("json", sessionSchema), postSession);
app.put(
  "/sessions/instructor",
  zValidator("json", addInstructorSchema),
  addInstructor
);
app.delete("/sessions", deleteSession);

app.get("/tickets", getActiveQueue);
app.get("/tickets/all", getAllTickets);
app.get("/tickets/students", getCurrentStudents);
app.get("/tickets/current", getMyCurrentStudent);
app.post("/tickets", zValidator("json", ticketSchema), createTicket);
app.put(
  "/tickets",
  zValidator("json", acceptStudentTicketSchema),
  acceptStudentTicket
);
app.delete("/tickets", deleteTicket);

export default app;