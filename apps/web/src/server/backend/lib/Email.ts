import { Context, Data, Effect, Layer, Schema } from "effect";

export class EmailError extends Data.TaggedError("EmailError")<{
  readonly reason: "InvalidAddress" | "ProviderFailure";
  readonly cause?: unknown;
}> {}

export class EmailAddress extends Schema.Class<EmailAddress>("EmailAddress")({
  value: Schema.String, // TODO: Branded types
}) {}

// TODO: Do this
// export const SendEmailInput = Schema.Struct({
//   to: EmailAddress,
//   subject: Schema.String,
//   body: Schema.String
// })

export class SendEmailInput extends Schema.Class<SendEmailInput>("SendEmailInput")({
  to: EmailAddress,
  subject: Schema.String,
  body: Schema.String,
}) {}

export class EmailService extends Context.Service<
  EmailService,
  {
    readonly send: (input: SendEmailInput) => Effect.Effect<void, EmailError>;
  }
>()("app/EmailService") {}

export const EmailServiceLive = Layer.succeed(
  EmailService,
  EmailService.of({
    send: Effect.fn("EmailService.send")(function* (input) {
      yield* Effect.logInfo(`Sending email to ${input.to.value}`);
      const ok = true;
      if (!ok) {
        return yield* Effect.fail(
          new EmailError({
            reason: "ProviderFailure",
          }),
        );
      }
    }),
  }),
);
