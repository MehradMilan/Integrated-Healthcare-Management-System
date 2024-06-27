import { getCookie } from "./csrf";

export function fetchWithAuth (url, options = {}) {
    const headers = {
      ...options.headers,
      'X-CSRFToken': getCookie('csrftoken'),
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };