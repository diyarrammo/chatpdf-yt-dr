# ChatPDF Application Flow

## Hierarchical Structure

### 1. Entry Point: Main Page (`src/app/page.tsx`)

This is the highest level in your application hierarchy for the PDF upload flow:

- It checks if the user is authenticated using Clerk's `auth()` function
- If authenticated, it displays the `FileUpload` component
- If not authenticated, it shows a login button that redirects to the sign-in page

### 2. File Upload Component (`src/components/FileUpload.tsx`)

This client-side component handles the PDF upload process:

- Uses `react-dropzone` to create a drag-and-drop interface for PDF files
- Validates file size (rejects files larger than 10MB)
- Uploads the file to S3 using the `uploadToS3` function
- After successful S3 upload, calls the API to create a chat
- On successful chat creation, redirects to the chat page

### 3. API Route (`src/app/api/create-chat/route.ts`)

This server-side API endpoint processes the uploaded PDF:

- Verifies user authentication
- Receives the S3 file key and file name from the request
- Loads the PDF from S3 into Pinecone (vector database) using `loadS3IntoPinecone`
- Creates a new chat entry in the database
- Returns the chat ID to the client

### 4. Chat Page (`src/app/chat/[chatId]/page.tsx`)

This is where users interact with the uploaded PDF:

- Verifies user authentication
- Loads the chat data based on the `chatId` parameter
- Displays the PDF content and provides an interface for interaction

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           AUTHENTICATION LAYER                           │
│                       (Clerk - @clerk/nextjs/server)                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         MAIN PAGE (src/app/page.tsx)                    │
│                                                                         │
│  ┌───────────────────────┐        ┌───────────────────────────────┐    │
│  │                       │        │                               │    │
│  │   Not Authenticated   │        │        Authenticated          │    │
│  │                       │        │                               │    │
│  └───────────┬───────────┘        └──────────────┬────────────────┘    │
│              │                                   │                      │
│              ▼                                   ▼                      │
│     ┌─────────────────┐               ┌────────────────────┐           │
│     │                 │               │                    │           │
│     │  Login Button   │               │   FileUpload.tsx   │           │
│     │                 │               │                    │           │
│     └────────┬────────┘               └──────────┬─────────┘           │
│              │                                   │                      │
└──────────────┼───────────────────────────────────┼──────────────────────┘
               │                                   │
               ▼                                   ▼
┌──────────────────────────┐         ┌─────────────────────────────────────┐
│                          │         │                                     │
│      Sign-in Page        │         │       File Selection & Upload       │
│                          │         │                                     │
└──────────────────────────┘         └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
                                     ┌─────────────────────────────────────┐
                                     │                                     │
                                     │     S3 Upload (src/lib/s3.ts)       │
                                     │                                     │
                                     └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
                                     ┌─────────────────────────────────────┐
                                     │                                     │
                                     │  API Call to /api/create-chat       │
                                     │  (axios.post in FileUpload.tsx)     │
                                     │                                     │
                                     └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                API ROUTE (src/app/api/create-chat/route.ts)                 │
│                                                                             │
│  ┌─────────────────────┐    ┌────────────────────┐    ┌─────────────────┐  │
│  │                     │    │                    │    │                 │  │
│  │ Auth Verification   │───▶│ loadS3IntoPinecone │───▶│ Database Insert │  │
│  │                     │    │                    │    │                 │  │
│  └─────────────────────┘    └────────────────────┘    └────────┬────────┘  │
│                                                                │            │
└────────────────────────────────────────────────────────────────┼────────────┘
                                                                 │
                                                                 ▼
                                     ┌─────────────────────────────────────┐
                                     │                                     │
                                     │    Return chat_id to client         │
                                     │                                     │
                                     └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
                                     ┌─────────────────────────────────────┐
                                     │                                     │
                                     │  Router.push to /chat/[chat_id]     │
                                     │  (in FileUpload.tsx)                │
                                     │                                     │
                                     └──────────────────┬──────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                  CHAT PAGE (src/app/chat/[chatId]/page.tsx)             │
│                                                                         │
│  ┌─────────────────────┐    ┌────────────────────┐    ┌───────────────┐ │
│  │                     │    │                    │    │               │ │
│  │  Auth Verification  │───▶│  Load Chat Data    │───▶│  Chat UI      │ │
│  │                     │    │                    │    │               │ │
│  └─────────────────────┘    └────────────────────┘    └───────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Storage Components

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│                    │     │                    │     │                    │
│  AWS S3 Storage    │     │  Pinecone Vector   │     │  Database          │
│  ---------------   │     │  Database          │     │  ---------------   │
│                    │     │  ---------------   │     │                    │
│  - PDF Files       │────▶│  - Text Embeddings │     │  - Chat Metadata   │
│                    │     │  - Vector Search   │     │  - User Data       │
│                    │     │                    │     │  - File References │
└────────────────────┘     └────────────────────┘     └────────────────────┘
```

## Detailed Data Flow with File References

1. **User uploads a PDF on the main page**

   - File: `src/app/page.tsx` - Renders the FileUpload component
   - File: `src/components/FileUpload.tsx` - Handles the file selection UI

2. **PDF is uploaded to S3 storage**

   - File: `src/components/FileUpload.tsx` - Calls `uploadToS3(file)`
   - File: `src/lib/s3.ts` - Contains the `uploadToS3` function that handles the S3 upload

3. **S3 returns a file key and name**

   - File: `src/components/FileUpload.tsx` - Receives data with `file_key` and `file_name`

   ```typescript
   const data = await uploadToS3(file);
   if (!data?.file_key || !data?.file_name) {
     toast("something went wrong");
     return;
   }
   ```

4. **These are sent to the create-chat API**

   - File: `src/components/FileUpload.tsx` - Uses axios to post to the API

   ```typescript
   const response = await axios.post("/api/create-chat", {
     file_key,
     file_name,
   });
   ```

5. **The API processes the PDF (extracting text and creating embeddings in Pinecone)**

   - File: `src/app/api/create-chat/route.ts` - Receives the request
   - File: `src/lib/pinecone.ts` - Contains the `loadS3IntoPinecone` function

   ```typescript
   await loadS3IntoPinecone(file_key);
   ```

6. **A new chat is created in the database**

   - File: `src/app/api/create-chat/route.ts` - Inserts chat data into database
   - File: `src/lib/db.ts` - Database connection
   - File: `src/lib/db/schema.ts` - Database schema definition

   ```typescript
   const chat_id = await db.insert(chats).values({
     fileKey: file_key,
     pdfName: file_name,
     pdfUrl: getS3Url(file_key),
     userId: userId,
   });
   ```

7. **The chat ID is returned to the client**

   - File: `src/app/api/create-chat/route.ts` - Returns the chat ID

   ```typescript
   return NextResponse.json(
     { chat_id: chat_id[0].insertedId },
     { status: 200 }
   );
   ```

   - File: `src/components/FileUpload.tsx` - Receives the response in the mutation callback

   ```typescript
   mutate(data, {
     onSuccess: ({ chat_id }) => {
       console.log("Chat ID:", chat_id);
       if (chat_id) {
         toast.success("chat created successfully");
         router.push(`/chat/${chat_id}`);
       }
     },
   });
   ```

8. **The user is redirected to the chat page with that ID**
   - File: `src/components/FileUpload.tsx` - Handles the redirect
   ```typescript
   router.push(`/chat/${chat_id}`);
   ```
   - File: `src/app/chat/[chatId]/page.tsx` - Receives the chat ID as a parameter and loads the chat data

## Technical Implementation Details

- **Authentication**: Clerk is used for user authentication throughout the application
- **File Storage**: AWS S3 is used to store the uploaded PDFs
- **Vector Database**: Pinecone is used to store embeddings of the PDF content for semantic search
- **Database**: A database (likely PostgreSQL with DrizzleORM) stores chat metadata
- **Frontend State Management**: React Query is used for mutation state management
