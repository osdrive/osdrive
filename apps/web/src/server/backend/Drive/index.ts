import { Context, Effect, Layer } from "effect";
import { Drive, DriveId } from "~/server/domain/Drive";

export class DriveRepo extends Context.Service<DriveRepo>()("DriveRepo", {
  make: Effect.succeed({
    findById: (id: DriveId) =>
      Effect.succeed(new Drive({ id, name: "Alice", createdAt: new Date() })),
    list: () =>
      Effect.succeed([
        new Drive({ id: DriveId.make("1"), name: "Alice", createdAt: new Date() }),
        new Drive({ id: DriveId.make("2"), name: "Bob", createdAt: new Date() })
      ])
  })
}) {
  static readonly Test = Layer.effect(DriveRepo, this.make)
}

const program = Effect.gen(function*() {
  const repo = yield* DriveRepo;
  const user = yield* repo.findById(DriveId.make("1"))
  const users = yield* repo.list()
  return { user, users }
}).pipe(
  Effect.provide(DriveRepo.Test)
)


// import { Effect, Layer, ServiceMap } from "effect"

// // Define a User type
// interface User {
//   readonly id: number
//   readonly name: string
//   readonly email: string
// }

// // Create the UserRepository service
// export class UserRepository extends ServiceMap.Service<UserRepository, {
//   findById(id: number): Effect.Effect<User, UserNotFoundError | DatabaseError>
//   list(): Effect.Effect<Array<User>, DatabaseError>
// }>()("quickstart/UserRepository") {
//   // Define the service implementation as a Layer
//   static readonly layer = Layer.effect(
//     UserRepository,
//     Effect.gen(function*() {
//       // Simulate a database with in-memory data
//       const users: Map<number, User> = new Map([
//         [1, { id: 1, name: "Alice", email: "alice@example.com" }],
//         [2, { id: 2, name: "Bob", email: "bob@example.com" }],
//         [3, { id: 3, name: "Charlie", email: "charlie@example.com" }]
//       ])

//       // Implement the findById method
//       const findById = Effect.fn("UserRepository.findById")(
//         function*(id: number): Effect.fn.Return<User, UserNotFoundError | DatabaseError> {
//           yield* Effect.log("Looking up user", id)

//           const user = users.get(id)
//           if (!user) {
//             return yield* new UserNotFoundError({ userId: id })
//           }

//           return user
//         }
//       )

//       // Implement the list method
//       const list = Effect.fn("UserRepository.list")(
//         function*(): Effect.fn.Return<Array<User>, DatabaseError> {
//           yield* Effect.log("Fetching all users")
//           return Array.from(users.values())
//         }
//       )

//       // Return the service implementation
//       return UserRepository.of({ findById, list })
//     })
//   )
// }
