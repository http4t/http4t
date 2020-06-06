export interface IdGenerator {
  generate(): string;
}

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return (Math.random()*100000000000000000).toString().slice(0, 7);
  }
}

export class FixedIdGenerator implements IdGenerator {
  generate(): string {
    return "id";
  }
}
