import { v4 as uuidv4 } from 'uuid';

// Generate unique instance ID at startup (first 8 chars of UUID)
export const INSTANCE_ID = uuidv4().slice(0, 8);
