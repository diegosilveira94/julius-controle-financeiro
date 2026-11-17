export default {
  openapi: "3.0.0",
  info: {
    title: "Personal Expenses",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3000/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "auth/login": {
      post: {
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { descripton: "Token JWT" },
          401: { description: "Invalid" },
        },
      },
    },
    "/expenses": {
      get: {
        summary: "List the authenticated user's expenses (supports filters)",
        parameters: [
          {
            name: "hasAttachment",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Filter expenses with or without attachments",
          },
        ],
        responses: {
          200: {
            description: "List of expenses, each with attachmentsCount",
          },
        },
      },
    },
    "/expenses/{id}/attachments": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "List the attachments of an expense",
        responses: {
          200: { description: "List of attachments" },
          404: { description: "Expense not found" },
        },
      },
      post: {
        summary: "Upload receipts (PDF, JPG, PNG or WEBP, up to 5 MB, max 3)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Created attachments" },
          400: { description: "Invalid type, size or count" },
          404: { description: "Expense not found" },
        },
      },
    },
    "/attachments/{id}/file": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Stream the attachment file (?download=1 to download)",
        responses: {
          200: { description: "File content" },
          404: { description: "Attachment not found" },
        },
      },
    },
    "/attachments/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      delete: {
        summary: "Delete an attachment and its file",
        responses: {
          204: { description: "Deleted" },
          404: { description: "Attachment not found" },
        },
      },
    },
  },
};
