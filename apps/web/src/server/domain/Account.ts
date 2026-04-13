import { type Brand, Schema } from "effect";
import { HttpApiGroup } from "effect/unstable/httpapi";

export type AccountId = string & Brand.Brand<"AccountId">;
export const AccountId = Schema.String.pipe(Schema.brand("AccountId"));

export class Account extends Schema.Class<Account>("Account")(
  Schema.Struct({
    id: AccountId,
    name: Schema.String,
    createdAt: Schema.Date,
  }),
) {}

export class AccountNotFoundError extends Schema.TaggedErrorClass<AccountNotFoundError>()(
  "AccountNotFoundError",
  {
    id: AccountId,
  },
  { httpApiStatus: 404 },
) {}

export const accountEndpoints = HttpApiGroup.make("Account");
