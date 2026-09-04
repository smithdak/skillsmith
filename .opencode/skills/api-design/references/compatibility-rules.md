# Compatibility rules by format

Classify each proposed change here before deciding whether it ships
additively or needs a deprecation window. "Breaking" means a correctly
written consumer stops working or silently misbehaves; "safe" assumes
the tolerant-reader rule (ignore unknown fields, tolerate unknown enum
values) — state that rule in the contract, and treat "safe" additions
as breaking for any consumer that does not follow it.

## REST / JSON

| Change | Effect |
|---|---|
| Add an optional request field or query parameter | safe |
| Add a field to a response | safe |
| Add a new operation or path | safe |
| Add a new enum value in a response | safe only if the contract told clients to tolerate unknown values |
| Add an optional field with a default the server now applies | safe if the default preserves old behavior |
| Add a required request field | breaking |
| Remove or rename any field, parameter, path, or header | breaking |
| Change a field's type, format, or nullability | breaking |
| Narrow the values accepted or widen the values returned | breaking |
| Change a status code for an existing condition | breaking |
| Change the error envelope or an error code's meaning | breaking |
| Change default sort order or default page size | breaking (consumers depend on it silently) |
| Tighten validation on an existing field | breaking |
| Change authentication or authorization requirements | breaking |
| Lower a rate limit or timeout | breaking in practice; announce like a deprecation |

## GraphQL

| Change | Effect |
|---|---|
| Add a type, field, query, mutation, or optional argument | safe |
| Add a value to an enum used only in outputs | safe only if clients tolerate unknown values |
| Add a value to an enum used in inputs | safe |
| Make a nullable output field non-null | safe |
| Make a non-null output field nullable | breaking |
| Make an optional argument required, or add a required argument | breaking |
| Remove or rename a type, field, argument, or enum value | breaking |
| Change a field's return type or an argument's input type | breaking |
| Change a union's or interface's members | breaking for clients with exhaustive fragments |
| Change a directive's or field's default value | breaking |

Use `@deprecated(reason:)` on the old field; the schema is the
signalling channel. Removal follows the window below.

## Protobuf / gRPC

| Change | Effect |
|---|---|
| Add a field with a new field number | safe |
| Add a new message, RPC, or service | safe |
| Add an enum value | safe (proto3 enums are open) |
| Rename a field (field number unchanged) | safe on the wire, breaking for JSON mapping and generated code |
| Remove a field and `reserve` its number and name | safe on the wire once no sender sets it |
| Reuse a field number | breaking and silent; never do it |
| Change a field's type (except documented compatible pairs) | breaking |
| Change a field's number | breaking |
| Move a field into or out of a `oneof` | breaking |
| Change an RPC's request or response message type | breaking |
| Change an RPC from unary to streaming or back | breaking |
| Change a package name or service name | breaking |

Mark the old element with `[deprecated = true]` and the RPC or message
option `deprecated`; generated code surfaces the warning.

## Typed library or SDK surface

| Change | Effect |
|---|---|
| Add an exported function, type, method, or optional parameter | safe |
| Add an optional field to an options object | safe |
| Add a member to an exported interface consumers only *consume* | safe |
| Add a member to an exported interface consumers *implement* | breaking |
| Add a variant to a union or enum consumers match exhaustively | breaking |
| Widen a parameter type or narrow a return type | safe |
| Narrow a parameter type or widen a return type | breaking |
| Change a default parameter value | breaking |
| Remove, rename, or move an export | breaking |
| Change thrown error types or when they are thrown | breaking |
| Change ordering, timing, or side-effect guarantees documented in the interface | breaking |
| Raise the minimum runtime or peer-dependency version | breaking; a major bump |

Mark with the language's deprecation attribute or `@deprecated`
doc-tag so it shows at the call site, and export the replacement
before deprecating the original.

## Event schemas

Consumers are decoupled in time — a message written today may be read
by a consumer deployed next year — so every rule above is stricter: a
published field is never removed, only ignored; the envelope carries an
explicit schema version; producers upgrade first and consumers tolerate
every version still in flight.

## Deprecation window

1. **Announce** the removal date and the replacement at the moment the
   deprecation ships, in the contract and in the changelog.
2. **Signal in-band** on every response or generated-code path so the
   consumer's tooling, not just their reading, notices: a
   `Deprecation` and `Sunset` header, a `@deprecated` directive or
   tag, a proto option, a runtime warning once per process.
3. **Measure** who still calls the old element; do not remove on the
   calendar alone.
4. **Window length** scales with the consumer's release cadence, not
   yours: internal services that deploy daily can tolerate weeks;
   external integrators and mobile clients need months and often a
   whole major version; a published SDK follows its major-version
   cycle.
5. **Remove** only when telemetry shows zero traffic or every
   remaining caller has been contacted, and record the removal in the
   changelog with the original announcement date.

A breaking change with no window is an outage the consumer discovers
in production.
