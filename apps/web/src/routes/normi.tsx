import { Context, Effect, Layer, Schema } from "effect";
import {
  IndexedDb,
  IndexedDbDatabase,
  IndexedDbTable,
  IndexedDbVersion,
} from "@effect/platform-browser";

// TODO: Crawl relations and if they are optional we can skip them.

// TODO: Making this work
// const PersonList = Schema.Array(User);
// TODO: Crawl schema structs???

// TODO: Implement Effect annotation for easily marking models
// TODO: Abstract IndexedDB so it's general for a library.

const normi_save = Symbol();

export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  createdAt: Schema.Date,
}) {
  // TODO: Make this all an Effect annotation?
  _db_id = () => this.id;

  // TODO: Using symbols
  [normi_save]() {
    console.log(
      "SAVE",
      this._db_id(),
      this,
      // Schema.toCodecJson(new User({ id: "5", name: "Oscar" })),
    );
    return Effect.flatMap(Effect.service(UserStore), (store) => store.save(this));
  }
}

const UserTable = IndexedDbTable.make({
  name: "users",
  schema: User,
  keyPath: "id",
  indexes: {
    email: "email",
  },
});

class V1 extends IndexedDbVersion.make(UserTable) {}

class AppDb extends IndexedDbDatabase.make(V1, (api) =>
  Effect.gen(function* () {
    yield* api.createObjectStore("users");
    yield* api.createIndex("users", "email");
  }),
) {}

class UserStore extends Context.Service<
  UserStore,
  {
    readonly save: (user: User) => Effect.Effect<IDBValidKey, unknown, never>;
    readonly load: (id: number) => Effect.Effect<User | undefined, unknown, never>;
  }
>()("UserStore") {}

const UserStoreLive = Layer.effect(
  UserStore,
  Effect.gen(function* () {
    const api = yield* AppDb.getQueryBuilder;
    return UserStore.of({
      save: (user) => Effect.fromYieldable(api.from("users").upsert(user)),
      load: (id) =>
        Effect.gen(function* () {
          const rows = yield* api.from("users").select().equals(id);
          return rows[0];
        }),
    });
  }),
);

const DbLayer = AppDb.layer("normi-dev").pipe(Layer.provide(IndexedDb.layerWindow));
const AppLayer = Layer.merge(DbLayer, UserStoreLive.pipe(Layer.provide(DbLayer)));

export default function Page() {
  const program = Effect.gen(function* () {
    const user = new User({
      id: 1,
      name: "Ada",
      email: "ada@example.com",
      createdAt: Schema.Date.make(new Date()),
    });
    console.log(user);
    yield* user[normi_save]();
  });

  Effect.runPromise(program.pipe(Effect.provide(AppLayer)));

  // test(new Person({ id: "5", name: "Oscar" }));

  // TODO: Restore from normalised cache (entity, vs list, how to determine scope?)
  // TODO: Reactive queries to the normalised cache

  return (
    <div>
      <p>Hello World!</p>

      {/*<button onClick={() => test(new Person({ id: "5", name: "Oscar" }))}>A</button>*/}
    </div>
  );
}
