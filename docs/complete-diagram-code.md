# Complete Diagram Code

This file contains the complete Mermaid code for all diagrams. You can copy each code block and paste it directly into [Mermaid Live Editor](https://mermaid.live/) to generate the diagrams.

## 1. Application Flow Diagram (Complete Code)

```mermaid
flowchart TD
    A[Authentication Layer\nClerk] --> B[Main Page\nsrc/app/page.tsx]

    B -->|Not Authenticated| C[Login Button]
    B -->|Authenticated| D[FileUpload Component\nsrc/components/FileUpload.tsx]

    C --> E[Sign-in Page]
    D --> F[File Selection & Upload]

    F --> G[S3 Upload\nsrc/lib/s3.ts]
    G --> H[API Call to create-chat\naxios.post]

    H --> I[API Route\nsrc/app/api/create-chat/route.ts]

    I --> J[Auth Verification]
    J --> K[loadS3IntoPinecone]
    K --> L[Database Insert]

    L --> M[Return chat_id to client]
    M --> N[Router.push to /chat/chat_id]

    N --> O[Chat Page\nsrc/app/chat/chatId/page.tsx]
    O --> P[Auth Verification]
    P --> Q[Load Chat Data]
    Q --> R[Chat UI]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#bfb,stroke:#333,stroke-width:2px
    style O fill:#fbb,stroke:#333,stroke-width:2px
```

## 2. Data Storage Components Diagram (Complete Code)

```mermaid
flowchart LR
    A[AWS S3 Storage\n- PDF Files] --> B[Pinecone Vector Database\n- Text Embeddings\n- Vector Search]
    A -.-> C[Application Database\n- Chat Metadata\n- User Data\n- File References]
    B -.-> C

    style A fill:#ffd,stroke:#333,stroke-width:2px
    style B fill:#dff,stroke:#333,stroke-width:2px
    style C fill:#dfd,stroke:#333,stroke-width:2px
```

## 3. Detailed Data Flow Diagram (Complete Code)

```mermaid
sequenceDiagram
    actor User
    participant MainPage as Main Page<br>(src/app/page.tsx)
    participant FileUpload as FileUpload Component<br>(src/components/FileUpload.tsx)
    participant S3 as AWS S3<br>(src/lib/s3.ts)
    participant API as API Route<br>(src/app/api/create-chat/route.ts)
    participant Pinecone as Pinecone<br>(src/lib/pinecone.ts)
    participant DB as Database<br>(src/lib/db.ts)
    participant ChatPage as Chat Page<br>(src/app/chat/chatId/page.tsx)

    User->>MainPage: Visit application
    MainPage->>User: Display UI based on auth status
    User->>FileUpload: Upload PDF file
    FileUpload->>S3: uploadToS3(file)
    S3-->>FileUpload: Return file_key, file_name
    FileUpload->>API: POST /api/create-chat
    API->>Pinecone: loadS3IntoPinecone(file_key)
    Pinecone-->>API: Confirm processing complete
    API->>DB: Insert chat record
    DB-->>API: Return chat_id
    API-->>FileUpload: Return chat_id
    FileUpload->>ChatPage: router.push(/chat/chat_id)
    ChatPage->>User: Display chat interface
```

## 4. Combined Application Architecture (Complete Code)

```mermaid
graph TD
    subgraph "Frontend"
        A[Main Page\nsrc/app/page.tsx]
        D[FileUpload Component\nsrc/components/FileUpload.tsx]
        O[Chat Page\nsrc/app/chat/chatId/page.tsx]
        R[Chat UI]
    end

    subgraph "Authentication"
        B[Clerk Auth Service]
    end

    subgraph "API Layer"
        H[API Routes]
        I[create-chat API\nsrc/app/api/create-chat/route.ts]
    end

    subgraph "Storage"
        S[AWS S3\nPDF Storage]
        P[Pinecone\nVector Database]
        DB[Application Database\nChat & User Data]
    end

    B ---|Auth Flow| A
    A -->|Authenticated| D
    D -->|Upload PDF| S
    D -->|Create Chat| I
    I -->|Process PDF| P
    I -->|Store Metadata| DB
    I -->|Return chat_id| D
    D -->|Redirect| O
    O -->|Load Data| DB
    O -->|Render| R
    R -->|Query PDF| P

    style A fill:#bbf,stroke:#333,stroke-width:2px
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#bfb,stroke:#333,stroke-width:2px
    style O fill:#fbb,stroke:#333,stroke-width:2px
    style S fill:#ffd,stroke:#333,stroke-width:2px
    style P fill:#dff,stroke:#333,stroke-width:2px
    style DB fill:#dfd,stroke:#333,stroke-width:2px
```

## How to Use

1. Copy the entire code block for the diagram you want to create
2. Go to [Mermaid Live Editor](https://mermaid.live/)
3. Paste the code into the editor
4. The diagram will be generated automatically
5. Download as SVG or PNG using the "Export" button
6. Save the image to the `docs/images/` folder
