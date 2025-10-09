const request = require('supertest');
const app = require('../src/server');

describe('Leave API Endpoints', () => {
  
  describe('POST /api/leave/apply', () => {
    test('should reject request without authentication', async () => {
      const leaveData = {
        startDate: '2025-11-15',
        endDate: '2025-11-17',
        reason: 'Vacation',
        type: 'vacation'
      };

      const response = await request(app)
        .post('/api/leave/apply')
        .send(leaveData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('No user ID provided');
    });

    test('should reject manager trying to apply for leave', async () => {
      const leaveData = {
        startDate: '2025-11-15',
        endDate: '2025-11-17',
        reason: 'Vacation',
        type: 'vacation'
      };

      const response = await request(app)
        .post('/api/leave/apply')
        .set('x-user-id', 'mgr-001') // Manager ID
        .send(leaveData);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    test('should accept valid employee leave request', async () => {
      const leaveData = {
        startDate: '2025-12-01',
        endDate: '2025-12-03',
        reason: 'Personal vacation',
        type: 'vacation'
      };

      const response = await request(app)
        .post('/api/leave/apply')
        .set('x-user-id', 'emp-001') // Employee ID
        .send(leaveData);


      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
    });
  });

  describe('GET /api/leave/pending', () => {
    test('should reject employee access', async () => {
      const response = await request(app)
        .get('/api/leave/pending')
        .set('x-user-id', 'emp-001');

      expect(response.status).toBe(403);
    });

    test('should return pending requests for manager', async () => {
      const response = await request(app)
        .get('/api/leave/pending')
        .set('x-user-id', 'mgr-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/leave/approve/:id', () => {
    test('should reject employee access', async () => {
      const response = await request(app)
        .post('/api/leave/approve/req-001')
        .set('x-user-id', 'emp-001')
        .send({ action: 'approve' });

      expect(response.status).toBe(403);
    });

    test('should validate action field', async () => {
      const response = await request(app)
        .post('/api/leave/approve/req-001')
        .set('x-user-id', 'mgr-001')
        .send({ action: 'invalid-action' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/leave/balance', () => {
    test('should return balance for authenticated user', async () => {
      const response = await request(app)
        .get('/api/leave/balance')
        .set('x-user-id', 'emp-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalDays');
      expect(response.body.data).toHaveProperty('usedDays');
      expect(response.body.data).toHaveProperty('remainingDays');
    });
  });
});