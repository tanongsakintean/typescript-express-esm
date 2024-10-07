import fsync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const databasePrefix = 'data';

export interface DatabaseOptions<Entity> {
  defaultData: Entity[];
}

export class Database<Entity extends object & { id: string }> {
  // Entity ต้องเป็น object และ ต้องมี id:string
  private databasePath: string;

  constructor(
    collectionName: string,
    protected options?: DatabaseOptions<Entity>
  ) {
    this.databasePath = path.join(databasePrefix, collectionName + '.json');
  }

  async init() {
    const defaluData = this.options?.defaultData ?? []; /// if defaultData == null | undifind must = []
    if (!fsync.existsSync(this.databasePath)) {
      await fs.mkdir(databasePrefix, { recursive: true });
      await fs.writeFile(
        this.databasePath,
        JSON.stringify(defaluData, null, 2),
        'utf-8'
      );
    }
    return this;
  }

  async readAll() {
    await this.init();
    const data = await fs.readFile(this.databasePath, 'utf-8');
    return JSON.parse(data) as Entity[]; /// ใช้ as เมื่อเราแน่ๆว่า data เป็น type นี้
  }

  async read(id: string) {
    const data = await this.readAll();
    return data.find((it) => it.id === id);
  }

  async update(input: Entity): Promise<Entity> {
    const data = await this.readAll();
    const index = data.findIndex((item) => item.id === input.id);
    data[index] = {
      ...data[index],
      ...input,
    } as Entity;

    await fs.writeFile(this.databasePath, JSON.stringify(data, null, 2));
    return data[index];
  }

  async delete(id: string) {
    const data = await this.readAll();
    const index = data.findIndex((item) => item.id === id);
    data.splice(index, 1);
    await fs.writeFile(this.databasePath, JSON.stringify(data, null, 2));
  }

  async insert(input: Entity): Promise<Entity> {
    const data = await this.readAll();
    const newData = {
      ...input,
      id: uuidv4(),
    } satisfies Entity;
    // add a new change
    data.push(newData);
    await fs.writeFile(this.databasePath, JSON.stringify(data, null, 2));
    return newData;
  }
}
