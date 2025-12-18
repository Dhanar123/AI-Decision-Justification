const API_BASE_URL = 'http://localhost:3001/api';

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    throw error;
  }
  return data;
}

export const createDecision = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getDecisions = async () => {
  const response = await fetch(`${API_BASE_URL}/decisions`);
  return handleResponse(response);
};

export const getDecision = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/decisions/${id}`);
  return handleResponse(response);
};

export const addOutcome = async (id: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}/decisions/${id}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const generateAnalysis = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/decisions/${id}/analysis`);
  return handleResponse(response);
};
