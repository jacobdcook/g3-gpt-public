const deploymentBackendURL = 'https://g3-gpt-0fc741a11b6f.herokuapp.com'

export const backendURL = process.env.NODE_ENV === 'production' ? deploymentBackendURL : 'http://localhost:3001';