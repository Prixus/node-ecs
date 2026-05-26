import request from 'supertest';
import { createApp } from './app';
import { UserService } from './services/userService';
import { IUserRepository } from './repositories/userRepository';
import { User } from './models/user';

const baseUser: User = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
};

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const app = createApp(new UserService(mockRepo));

beforeEach(() => jest.clearAllMocks());

describe('Health routes', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns 200', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
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

  it('POST /api/v1/users returns 400 with field errors when name is missing', async () => {
    const res = await request(app).post('/api/v1/users').send({ email: 'alice@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.name).toBeDefined();
  });

  it('POST /api/v1/users returns 400 when email is invalid', async () => {
    const res = await request(app).post('/api/v1/users').send({ name: 'Alice', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.details.email).toBeDefined();
  });
});
