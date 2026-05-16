
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        return {
          error: errorData.error || `Erro do servidor (${response.status})`,
          status: response.status,
        };
      } else {
        const text = await response.text();
        console.error('Erro não-JSON recebido:', text.substring(0, 200));
        return {
          error: `O servidor retornou um erro inesperado (HTML ${response.status}). Verifique se a rota existe.`,
          status: response.status,
        };
      }
    }

    if (!isJson) {
      return {
        error: 'O servidor retornou uma resposta em formato inválido.',
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error: any) {
    console.error('Erro de rede ou fetch:', error);
    return {
      error: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      status: 0,
    };
  }
}
