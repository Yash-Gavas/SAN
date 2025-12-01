# SAN Management Console

## Overview
A comprehensive Storage Area Network (SAN) management platform for enterprise storage infrastructure. The system provides unified management of storage systems, capacity pooling, disaster recovery, automated tiering, and real-time performance monitoring.

## Project Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, and shadcn/ui components
  - Pages: Dashboard, Storage Systems, LUN Management, Host Management, Fabric Management, Disaster Recovery, Tiering Management
  - Authentication with secure password hashing (scrypt)
  - SAN-focused UI with storage domain terminology
- **Backend**: Express.js server with TypeScript
  - Failover Engine: Automated replication and failover orchestration
  - Tiering Engine: Data tier management based on access patterns
  - Passport.js authentication with local strategy and secure password hashing
- **Database**: PostgreSQL with Drizzle ORM
  - Schema includes: StorageSystems, Pools, LUNs, Hosts, TierPolicies, ReplicationPairs, PerformanceMetrics, Alerts
- **Authentication**: Passport.js with local strategy, bcrypt/scrypt password hashing
- **Package Management**: npm with Node.js 20

## Recent Changes
- **2025-12-01**: Complete transformation from DeFi to SAN management system
  - Removed all DeFi/blockchain components: blockchain.ts, wallet contexts, lending/borrowing/swap UIs, liquidation engine, Solidity contracts
  - Implemented secure authentication with password hashing (scrypt algorithm)
  - Created admin user seeding with hashed passwords
  - Replaced liquidation engine with Failover Engine for disaster recovery
  - Replaced price feeds with Tiering Engine for automated data management
  - Implemented comprehensive SAN frontend pages with storage domain terminology
  - Updated all UI branding from DeFi Protocol to SAN Console
- **Completed**: Frontend now fully SAN-based with no DeFi elements

## Key Features
- **Storage Management**: Monitor and manage storage systems, pools, and capacity
- **LUN Management**: Create, configure, and manage Logical Unit Numbers
- **Host Management**: Register and manage storage hosts with zoning and masking
- **Fabric Management**: Monitor SAN fabric health, switches, and port status
- **Disaster Recovery**: Automated replication with failover capabilities
- **Data Tiering**: Automated tier migration based on access patterns (hot/cold)
- **Performance Monitoring**: Real-time metrics, alerts, and system health dashboards
- **Secure Authentication**: User authentication with secure password hashing

## User Preferences
- SAN-focused domain terminology throughout the application
- Clean, professional UI with storage infrastructure visualizations

## Technical Stack
- Node.js 20
- TypeScript
- React + Vite
- Express.js
- PostgreSQL with Drizzle ORM
- Tailwind CSS + shadcn/ui
- Passport.js with local authentication
- Scrypt for secure password hashing

## Application Status
✅ Fully operational
- Frontend: SAN-based (all DeFi branding removed)
- Backend: SAN engines running (Failover, Tiering)
- Database: Initialized with admin user
- Authentication: Secure with password hashing
- Workflow: Running on port 5000
