const config = {
  api: {
    baseUrl: 'https://employeeschedulerapi.azurewebsites.net/api',
    endpoints: {
      employees: '/Employee',
      positions: '/position',
      schedule: "/Schedule",
      register: '/auth/register'
      // Add more endpoints as needed
    }
  }
};

export default config; 