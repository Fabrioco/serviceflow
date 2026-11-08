export const listCustomersResponseExample = {
  data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            organizationId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Maria Silva',
            phone: '19999999999',
            email: 'maria@email.com',
            address: 'Rua das Flores, 123',
            notes: 'Cliente recorrente',
            createdAt: '2026-11-08T12:00:00.000Z',
          },
        ],
        meta: {
          total: 85,
          page: 1,
          limit: 10,
          totalPages: 9,
        },
    };