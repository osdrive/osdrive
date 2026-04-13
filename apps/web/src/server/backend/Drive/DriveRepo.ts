// import { Context, Effect, Layer } from "effect";
// import { Drive, DriveId } from "~/server/domain/Drive";

// export class DriveRepo extends Context.Service<DriveRepo>()("DriveRepo", {
//   make: Effect.succeed({
//     findById: (id: DriveId) =>
//       Effect.succeed(new Drive({ id, name: "Alice", createdAt: new Date() })),
//     list: () =>
//       Effect.succeed([
//         new Drive({ id: DriveId.make("1"), name: "Alice", createdAt: new Date() }),
//         new Drive({ id: DriveId.make("2"), name: "Bob", createdAt: new Date() })
//       ])
//   })
// }) {
//   static readonly Test = Layer.effect(DriveRepo, this.make)
// }

// const program = Effect.gen(function*() {
//   const repo = yield* DriveRepo;
//   const user = yield* repo.findById(DriveId.make("1"))
//   const users = yield* repo.list()
//   return { user, users }
// }).pipe(
//   Effect.provide(DriveRepo.Test)
// )
