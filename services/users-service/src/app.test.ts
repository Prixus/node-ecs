import request from 'supertest';
import { createApp } from './app';
import { userRepository } from './repositories/userRepository';

// Mock the repository so tests don't need a real DB connection
jest.mock('./repositories/userRepository');
const mockRepo = jest.mocked(userRepository);

const app = createApp();

const baseUser = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('Health routes', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Users routes', () => {
  it('GET /api/v1/users returns array', async () => {
    mockRepo.findAll.mockResolvedValue([baseUser]);

    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/users creates a user', async () => {
    mockRepo.findByEmail.mockResolvedValue(undefined);
    mockRepo.save.mockResolvedValue(baseUser);

    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/v1/users returns 400 when fields missing', async () => {
    const res = await request(app).post('/api/v1/users').send({ name: 'NoEmail' });
    expect(res.status).toBe(400);
  });
});
