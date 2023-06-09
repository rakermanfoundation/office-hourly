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
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import * as jose from "jose";
import { Bindings } from "hono/dist/types/types";
import faunadb from "faunadb";
import { retrieveUserReference } from "./classes";
const { Call, Function, Paginate, Match, Index, Lambda, Get, Var, Map } =
  faunadb.query;

const faunaClient = new faunadb.Client({
  secret: "fnAFBncQWJAASbTQJZ9EssnEJxiaKKln11deXGwR",
});

// Fetches all students waiting on TA
// @param:session {string} session reference string
// @returns array of ticket objects
export async function getAllTickets(c) {
  const token = await c.req.header("Authorization");
  const response = await fetch(
    "https://api.author.rakerman.com/api/auth0/user",
    {
      method: "GET",
      headers: { Authorization: token },
    }
  );
  const data = await response.json();

  try {
    const result = await faunaClient.query(
      Call(Function("getAllStudentTickets"), data.profile.username)
    );

    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

// Fetches all students waiting on TA
// @param:session {string} session reference string
// @returns array of ticket objects
export async function getActiveQueue(c) {
  const session = await c.req.header("session");

  try {
    const result = await faunaClient.query(
      Call(Function("getActiveQueue"), session)
    );

    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

// Fetches all students currently with TAs
// @param:session {string}
// @returns {array} array of student objects
export async function getCurrentStudents(c) {
  const session = await c.req.header("session");

  try {
    const result = await faunaClient.query(
      Call(Function("getCurrentStudents"), session)
    );
    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

// Returns student currently with specific TA
// @param:session {string}
// @param:instructor {string} username
// @returns {object} student object
export async function getMyCurrentStudent(c) {
  const session = await c.req.header("session");
  const instructor = await c.req.header("instructor");

  try {
    const result = await faunaClient.query(
      Call(Function("getMyCurrentStudent"), session, instructor)
    );
    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

/**
 * Sets limits for what a valid input is
 *for a post request
 */

export const ticketSchema = z.object({
  ref: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, {
      message: "Ref must be a number",
    }),
  username: z.string().trim(),
  sessionID: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, {
      message: "SessionID must be a number",
    }),
  position: z
    .number()
    .max(100, { message: "position must be 100 or smalller" }),
  time: z.string(),
});

// Add student to the queue
// @param:ref {string}
// @param:username {string}
// @param:sessionID {string}
// @param:position {int}
// @param:time {string ISO} - check pinned messages for formatting time strings!
// @returns {object} ticket object
export async function createTicket(c) {
  const data = await c.req.json();
  try {
    const result = await faunaClient.query(
      Call(
        Function("createTicket"),
        data.ref,
        data.username,
        data.sessionID,
        data.position,
        data.time
      )
    );

    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

/**
 * Sets limits for what a valid input is
 *for a put request of a TA accepting a student
 */

export const acceptStudentTicketSchema = z.object({
  ref: z.string(),
  instructor: z.string().min(1).max(24),
});

// TA takes student in
// @param:ref {string}  reference to Ticket
// @param:instructor {string} TA username
// @returns {object} ticket object
export async function acceptStudentTicket(c) {
  const data = await c.req.json();
  try {
    const result = await faunaClient.query(
      Call(Function("acceptStudentTicket"), data.ref, data.instructor)
    );

    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}

// Deletes a ticket by reference
// @param:query ref - unique id of the ticket to delete
// @returns {object} ticket object
export async function deleteTicket(c) {
  const ref = await c.req.header("ref");

  try {
    const result = await faunaClient.query(Call(Function("deleteTicket"), ref));

    return c.json(result);
  } catch (e) {
    return c.json(e);
  }
}