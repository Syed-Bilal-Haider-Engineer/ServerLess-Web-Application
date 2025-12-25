const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  ScanCommand ,
  QueryCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const BUCKET_NAME = process.env.BUCKET_NAME; 

const s3Client = new S3Client({});
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TableName = "users";

const sendResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.signUp = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.password) throw new Error("Missing email (id) or password");

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = {
      id: crypto.randomUUID(),
      ...body,
      password: hashedPassword,
    };

    await docClient.send(new PutCommand({ TableName, Item: newUser }));

    delete newUser.password;
    return sendResponse(201, { message: "Created", user: newUser });
  } catch (error) {
    return sendResponse(400, { error: error.message });
  }
};

exports.login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || "{}");
    if (!email || !password) {
      return sendResponse(400, { message: "Email and password are required" });
    }
    const result = await docClient.send(new QueryCommand({
      TableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    }));

    const user = result?.Items[0];

    if (!user) {
      return sendResponse(404, { message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendResponse(401, { message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return sendResponse(200, { 
      token, 
      user: { id: user?.id, email: user?.email, name: user?.name } 
    });

  } catch (error) {
    return sendResponse(400, { error: error.message });
  }
};

exports.getOne = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await docClient.send(new GetCommand({ TableName, Key: { id } }));
    if (!result.Item) return sendResponse(404, { message: "Not Found" });
    return sendResponse(200, result.Item);
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};

exports.getAll = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName }));
    return sendResponse(200, result.Items);
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};

exports.delete = async (event) => {
  try {
    const { id } = event.pathParameters;
    await docClient.send(new DeleteCommand({ TableName, Key: { id } }));
    return sendResponse(200, { message: "Deleted" });
  } catch (error) {
    return sendResponse(500, { error: error.message });
  }
};

exports.uploadImage = async (event) => {
  try {
    const { email, imageBase64, fileName } = JSON.parse(event.body);

    const userLookup = await docClient.send(new QueryCommand({
      TableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }));

    const user = userLookup.Items?.[0];
    if (!user) {
      return sendResponse(404, { error: "User record not found in database" });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const key = `profiles/${email}/${Date.now()}-${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg', 
      ACL: 'public-read' 
    }));

    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    await docClient.send(new UpdateCommand({
      TableName,
      Key: { id: user.id }, 
      UpdateExpression: "SET gallery = list_append(if_not_exists(gallery, :empty_list), :new_image)",
      ExpressionAttributeValues: {
        ":new_image": [{ 
          url: imageUrl, 
          fileName: fileName, 
          uploadedAt: new Date().toISOString() 
        }],
        ":empty_list": []
      }
    }));

    return sendResponse(200, { 
      message: "Upload and DB Sync successful", 
      url: imageUrl 
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return sendResponse(500, { error: error.message });
  }
};

exports.getGallery = async (event) => {
  try {
    const { email } = event.pathParameters;
    
    const result = await docClient.send(new QueryCommand({
      TableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }));

    const user = result.Items && result.Items[0];
    
    if (!user) {
      console.log("User not found for email:", email);
      return sendResponse(404, { message: "User not found" });
    }

    const rawGallery = user?.gallery || [];
    console.log("Fetched gallery for email:", email, rawGallery);
    return sendResponse(200, rawGallery, result);
  } catch (error) {
    console.error("Gallery Fetch Error:", error);
    return sendResponse(500, { error: error.message });
  }
};