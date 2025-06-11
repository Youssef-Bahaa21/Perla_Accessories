// src/swaggerConfig.ts

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Express } from 'express';

const swaggerDocument = YAML.load(path.resolve(__dirname, '../../swagger.yaml'));

export default function setupSwagger(app: Express): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
