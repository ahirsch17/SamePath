import axios from 'axios';

const API_BASE = 'https://server-schoolschedule-gtftb7cfbyc7h3am.centralus-01.azurewebsites.net';

export const login = (email: string, password: string) => {
  const params = new URLSearchParams({
    email,
    password
  });
  return axios.post(`${API_BASE}/login?${params.toString()}`);
};

export const signup = (first_name: string, last_name: string, email: string, password: string, phone_number: string, school: string) => {
  const params = new URLSearchParams({
    first_name,
    last_name,
    email,
    password,
    phone_number,
    school
  });
  return axios.post(`${API_BASE}/signup?${params.toString()}`);
};

export const getAvailableCourses = (user_id: number) => {
  const params = new URLSearchParams({ user_id: String(user_id) });
  return axios.get(`${API_BASE}/available_courses?${params.toString()}`);
};

export const getSchedule = (user_id: number) => {
  const params = new URLSearchParams({ user_id: String(user_id) });
  return axios.get(`${API_BASE}/get_schedule?${params.toString()}`);
};

// Note: This endpoint doesn't exist in our API - removed

export const registerCourses = (user_id: number, crns: number[]) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id)
  });
  return axios.post(`${API_BASE}/register_courses?${params.toString()}`, {
    crns: crns
  });
};

export const schools = () => {
  return axios.get(`${API_BASE}/get_schools`);
};

export const searchByCRN = (user_id: number, crn: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    crn: String(crn)
  });
  return axios.get(`${API_BASE}/search_by_crn?${params.toString()}`);
};

export const searchByDeptNum = (user_id: number, department: string, number: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    department,
    number: String(number)
  });
  return axios.get(`${API_BASE}/search_by_dept_num?${params.toString()}`);
};

export const getFriendsInThisSection = (user_id: number, crn: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    crn: String(crn)
  });
  return axios.get(`${API_BASE}/get_friends_in_this_section?${params.toString()}`);
};

export const getFriendsInOtherSections = (user_id: number, crn: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    crn: String(crn)
  });
  return axios.get(`${API_BASE}/get_friends_in_other_sections?${params.toString()}`);
};

export const sendFriendRequest = (user_id: number, friend_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    friend_id: String(friend_id)
  });
  return axios.post(`${API_BASE}/send_friend_request?${params.toString()}`);
};

export const acceptFriendRequest = (user_id: number, friend_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    friend_id: String(friend_id)
  });
  return axios.post(`${API_BASE}/accept_friend_request?${params.toString()}`);
};

export const declineFriendRequest = (user_id: number, friend_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    friend_id: String(friend_id)
  });
  return axios.post(`${API_BASE}/decline_friend_request?${params.toString()}`);
};

export const unsendFriendRequest = (user_id: number, friend_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    friend_id: String(friend_id)
  });
  return axios.post(`${API_BASE}/unsend_friend_request?${params.toString()}`);
};

export const removeFriend = (user_id: number, friend_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    friend_id: String(friend_id)
  });
  return axios.post(`${API_BASE}/remove_friend?${params.toString()}`);
};

export const getFriendsList = (user_id: number) => {
  const params = new URLSearchParams({ user_id: String(user_id) });
  return axios.get(`${API_BASE}/get_friends_list?${params.toString()}`);
};

export const getUserById = (user_id: number) => {
  const params = new URLSearchParams({ user_id: String(user_id) });
  return axios.get(`${API_BASE}/get_user_by_id?${params.toString()}`);
};

export const getClassGroups = (user_id: number) => {
  const params = new URLSearchParams({ user_id: String(user_id) });
  return axios.get(`${API_BASE}/get_class_groups?${params.toString()}`);
};

export const joinGroup = (user_id: number, group_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    group_id: String(group_id)
  });
  return axios.post(`${API_BASE}/join_group?${params.toString()}`);
};

export const leaveGroup = (user_id: number, group_id: number) => {
  const params = new URLSearchParams({ 
    user_id: String(user_id),
    group_id: String(group_id)
  });
  return axios.post(`${API_BASE}/leave_group?${params.toString()}`);
};

 