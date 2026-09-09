import { ApiClient } from '../apiClient';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ApiClient', () => {
  describe('get', () => {
    it('makes a GET request and returns parsed JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        text: async () => JSON.stringify({ id: '1', nombre: 'test' }),
      });

      const result = await ApiClient.get<{ id: string; nombre: string }>('/parcelas');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/parcelas',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({ id: '1', nombre: 'test' });
    });

    it('throws on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => '',
      });

      await expect(ApiClient.get('/parcelas/404')).rejects.toThrow('Recurso no encontrado');
    });

    it('throws on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => '',
      });

      await expect(ApiClient.get('/parcelas')).rejects.toThrow('Internal Server Error');
    });

    it('passes signal to fetch', async () => {
      const ac = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        text: async () => '{}',
      });

      await ApiClient.get('/parcelas', { signal: ac.signal });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/parcelas',
        expect.objectContaining({ signal: ac.signal })
      );
    });
  });

  describe('post', () => {
    it('makes a POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        statusText: 'Created',
        text: async () => JSON.stringify({ id: '1' }),
      });

      const body = { nombre: 'test' };
      const result = await ApiClient.post<{ id: string }>('/parcelas', body);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/parcelas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ id: '1' });
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        statusText: 'No Content',
        text: async () => '',
      });

      const result = await ApiClient.post('/parcelas', {});

      expect(result).toEqual({});
    });
  });
});
