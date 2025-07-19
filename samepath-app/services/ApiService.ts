import axios from 'axios';

const API_BASE = 'https://server-schoolschedule-gtftb7cfbyc7h3am.centralus-01.azurewebsites.net';

export const login = (email: string, password: string) =>
  axios.post(`${API_BASE}/login`, { email, password });

export const signup = (first_name: string, last_name: string, email: string, password: string, school: string) =>
  axios.post(`${API_BASE}/signup`, { first_name, last_name, email, password, school });

export const getAvailableCourses = (user_id: number) =>
  axios.get(`${API_BASE}/available_courses`, {
    headers: { user_id }
  });

export const getSchedule = (user_id: number) =>
  axios.get(`${API_BASE}/schedule`, {
    headers: { user_id }
  });

export const registerCourses = (user_id: number, crns: number[]) =>
  axios.post(`${API_BASE}/register_courses`, { user_id, crns });

export const sendFriendRequest = (user_id: number, friend_id: number) =>
  axios.post(`${API_BASE}/send_friend_request`, { user_id, friend_id });

export const acceptFriendRequest = (user_id: number, friend_id: number) =>
  axios.post(`${API_BASE}/accept_friend_request`, { user_id, friend_id });

export const unsendFriendRequest = (user_id: number, friend_id: number) =>
  axios.post(`${API_BASE}/unsend_friend_request`, { user_id, friend_id });

export const removeFriend = (user_id: number, friend_id: number) =>
  axios.post(`${API_BASE}/remove_friend`, { user_id, friend_id }); 