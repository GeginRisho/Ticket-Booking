import api from './api';

export const getCachedCities = async () => {
  const cacheKey = 'cached_cities_list';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  
  const res = await api.get('/cities');
  const cities = res.data?.data?.cities || res.data?.cities || [];
  if (cities.length > 0) {
    sessionStorage.setItem(cacheKey, JSON.stringify(cities));
  }
  return cities;
};

export const getCachedStates = async () => {
  const cacheKey = 'cached_states_list';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  
  const res = await api.get('/states');
  const states = res.data?.data?.states || res.data?.states || [];
  if (states.length > 0) {
    sessionStorage.setItem(cacheKey, JSON.stringify(states));
  }
  return states;
};

export const clearLocationCache = () => {
  sessionStorage.removeItem('cached_cities_list');
  sessionStorage.removeItem('cached_states_list');
};
