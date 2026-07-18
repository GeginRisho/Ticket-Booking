# Walkthrough - Database & Authentication System

I have successfully designed and built the full database schema, migrations, seeders, and session authentication layer for the Online Movie & Event Ticket Booking Platform, stripping all admin/user/city/role management CRUD endpoints as requested.

## Features Completed

1. **PostgreSQL 17 Integration**: Created a schema comprising 22 tables normalized to 3NF, leveraging Sequelize ORM.
2. **UUID v4 Primary Keys**: Fully configured UUID primary keys for all database tables, complete with default Postgres uuid-ossp generation.
3. **Database Constraints & Indexes**: Set up indexes on critical lookup fields (`email`, `phone`, `booking_number`, `transaction_id`, etc.) and unique/foreign key constraints.
4. **Soft Deletes (Paranoid Mode)**: Configured paranoid mode across model definitions to preserve audit trails.
5. **Secure Refresh Token Rotation**: Implemented a database-backed rotation model for refresh tokens to defend against token replays and brute forcing.
6. **Robust Auth Module**: Created REST endpoints for:
   - `POST /api/auth/register` (Sanitized signup validation check)
   - `POST /api/auth/login` (Uses bcrypt with 12 salt rounds, returns Access & Refresh tokens)
   - `POST /api/auth/logout` (Revokes and cleans tokens from DB)
   - `POST /api/auth/refresh-token` (Refreshes tokens using session verification)
   - `POST /api/auth/forgot-password` (Logs temporary reset link)
   - `POST /api/auth/reset-password` (Validates short-term reset tokens)
   - `PUT /api/auth/change-password` (Protected endpoint)
   - `GET /api/auth/profile` (Protected profile retrieve)
   - `PUT /api/auth/profile` (Protected profile update)
7. **RBAC & Middleware**: Created JWT verification and role authorization middleware to restrict access to `Admin`, `Customer`, `Theatre Owner`, and `Event Organizer`.
8. **Documentation & Assets**:
   - `database_documentation.md` (Contains the full ER Diagram in Mermaid and schema mapping)
   - `swagger.json` (OpenAPI docs detailing request schemas and response formats)
   - `postman_collection.json` (Postman test endpoints collection ready for direct import)

## Verification and Testing

### DB Setup & Migrations Execution
```powershell
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
Result: Schema successfully created in PostgreSQL; default cities, roles, and administrative users seeded successfully.

### Running Backend Server
```powershell
npm run start
```
Result: App booted successfully and connected to PostgreSQL database instance.

### Health Endpoint Check
```powershell
Invoke-RestMethod -Uri http://localhost:5000/health
```
Output:
```json
{
  "status": "success",
  "message": "System is healthy",
  "timestamp": "2026-07-16T11:37:06.500Z"
}
```

### Authentication Test
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login -ContentType "application/json" -Body '{"email":"admin@ticketbooking.com","password":"Password123!"}'
```
Output:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "10000000-1000-1000-1000-100000000000",
      "full_name": "Platform Admin",
      "email": "admin@ticketbooking.com",
      "phone": "1234567890",
      "role": "Admin",
      "status": "active"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```
