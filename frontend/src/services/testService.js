/* 
* Test function for apiFetch to '/' in backend
* Can use same pattern for: login, logout, register, etc.
*/

import { apiFetch } from "./api";

export async function getTestMessage() {
  return apiFetch("/api/auth/");
}