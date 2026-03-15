import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger/swagger-setup';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:["http://localhost:3000"]
}))
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));


export default app;