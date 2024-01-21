import { rm } from 'fs/promises';
import { join } from 'path';

// This will run before every e2e test
global.beforeEach(async () => {
  try {
    // Delete the test db
    await rm(join(__dirname, '../test-db.sqlite'));
  } catch (err) {}
});
