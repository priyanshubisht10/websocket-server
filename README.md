# WebSocket Server for Submission Processing
This WebSocket server is a real-time communication backend designed to handle student submission results. It integrates with Redis to manage connections and uses Pub/Sub for processing updates from the Result Worker. This architecture supports scalability by allowing multiple WebSocket servers to work in parallel, all subscribing to the same Pub/Sub channels.

## Features
- **Pub/Sub Integration**: Listens to `positive-processed` and `negative-processed` channels for real-time updates.
- **WebSocket Connection Management**: Stores and retrieves client connections using Redis, mapped to their respective student IDs.
- **Scalable Architecture**: Multiple WebSocket servers can subscribe to the same Pub/Sub channels for horizontal scaling.
- **Real-Time Notifications**:
  - Sends a `positive` message to students with verified submissions.
  - Sends a `negative` message to students with failed verification, triggering their system to shut down.

## How It Works
1. **Connection Management**:
   - When a client connects, their WebSocket `remoteAddress` is stored in Redis, mapped to their student ID.
   - If a client disconnects, the mapping is removed.

2. **Message Handling**:
   - On receiving a message from the `positive-processed` channel, the server sends a `positive` signal to the relevant client.
   - On receiving a message from the `negative-processed` channel, the server sends a `negative` signal to the relevant client, shutting down the student's system and notifying authorities.

3. **Scalability**:
   - Multiple WebSocket servers can be deployed, all subscribing to the same Pub/Sub channels for distributed processing.

### Prerequisites

1. **Node.js** (version >= 16)
2. **Redis** (for Pub/Sub and connection management)
3. **Docker** (optional, for running Redis in a container)
4. **Git**

## Installation
Follow these steps to set up the WebSocket server in your environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/priyanshubisht10/websocket-server.git
   cd websocket-server
    ```
2. Install dependencies:
   ```bash
    npm install
    ```
3. Make sure your redis-stack is up and running and the worker is able to publish to the pub/sub. If you haven't installed the worker it yet, you can find the steps here - (https://github.com/priyanshubisht10/result-worker)
4. Build
   ```bash
    tsc -b
    ```
5. Start the server:
   ```bash
   node dist/app.js
    ```
6. Verify the setup: If everything is set up correctly, you should see the following log in the terminal:
    ```bash
   Server is listening on port 3000
    ```
## Additional Resources
For a detailed explanation of the architecture, functionality, and use cases of this WebSocket server, check out this Medium article by me:  
[https://priyanshubisht10.medium.com/pub-sub-and-websockets-d8d180c2b9e8](https://priyanshubisht10.medium.com/pub-sub-and-websockets-d8d180c2b9e8)  
